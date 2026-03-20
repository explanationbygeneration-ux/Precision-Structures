const { app } = require('@azure/functions');
const { getCollection, saveCollection, findById, generateId } = require('../shared/db');
const { requireRole } = require('../shared/auth');
const { logAction } = require('../shared/audit');

// Valid page/area combinations
const VALID_AREAS = {
    'index.html': ['hero', 'testimonials'],
    'about.html': ['main-content'],
    'services.html': ['services'],
    'gallery.html': ['gallery-items'],
    'contact.html': ['contact-info']
};

function validatePageArea(page, area) {
    const areas = VALID_AREAS[page];
    if (!areas) {
        return { valid: false, error: `Invalid page: ${page}` };
    }
    if (!areas.includes(area)) {
        return { valid: false, error: `Invalid area "${area}" for page "${page}"` };
    }
    return { valid: true };
}

function getClientIp(request) {
    return request.headers.get('x-forwarded-for')
        || request.headers.get('x-real-ip')
        || 'unknown';
}

/**
 * Returns the current published snapshot for a page/area,
 * or null if nothing has been published yet.
 */
function getPublishedContent(page, area) {
    const snapshots = getCollection('snapshots');
    const published = snapshots
        .filter(s => s.page === page && s.area === area && s.status === 'published')
        .sort((a, b) => new Date(b.published_at || b.updated_at) - new Date(a.published_at || a.updated_at));
    return published.length > 0 ? published[0] : null;
}

// GET /api/content/{page}/{area}
app.http('content-get', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'content/{page}/{area}',
    handler: async (request, context) => {
        try {
            const auth = requireRole(request, 'editor');
            if (auth.error) {
                return { status: auth.status, jsonBody: { error: auth.error } };
            }

            const page = request.params.page;
            const area = request.params.area;

            const validation = validatePageArea(page, area);
            if (!validation.valid) {
                return { status: 400, jsonBody: { error: validation.error } };
            }

            const published = getPublishedContent(page, area);
            if (published) {
                return {
                    status: 200,
                    jsonBody: {
                        page,
                        area,
                        source: 'published',
                        snapshot: published
                    }
                };
            }

            // No published content — return a placeholder indicating defaults are in use
            return {
                status: 200,
                jsonBody: {
                    page,
                    area,
                    source: 'default',
                    snapshot: null,
                    message: 'No published content. The website is using its hardcoded defaults.'
                }
            };
        } catch (err) {
            context.error('Content get error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});

// PUT /api/content/{page}/{area}
app.http('content-put', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'content/{page}/{area}',
    handler: async (request, context) => {
        try {
            const auth = requireRole(request, 'editor');
            if (auth.error) {
                return { status: auth.status, jsonBody: { error: auth.error } };
            }

            const page = request.params.page;
            const area = request.params.area;

            const validation = validatePageArea(page, area);
            if (!validation.valid) {
                return { status: 400, jsonBody: { error: validation.error } };
            }

            const body = await request.json();
            const { field_values, notes } = body;

            if (!field_values || typeof field_values !== 'object') {
                return {
                    status: 400,
                    jsonBody: { error: 'field_values object is required' }
                };
            }

            const snapshots = getCollection('snapshots');
            const snapshot = {
                id: generateId(),
                page,
                area,
                field_values,
                notes: notes || null,
                status: 'pending',
                created_by: auth.user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            snapshots.push(snapshot);
            saveCollection('snapshots', snapshots);

            await logAction(
                auth.user.id,
                'content.edit',
                `${page}/${area}`,
                notes || null,
                getClientIp(request)
            );

            return { status: 201, jsonBody: snapshot };
        } catch (err) {
            context.error('Content put error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});

// GET /api/content/{page}/{area}/history
app.http('content-history', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'content/{page}/{area}/history',
    handler: async (request, context) => {
        try {
            const auth = requireRole(request, 'editor');
            if (auth.error) {
                return { status: auth.status, jsonBody: { error: auth.error } };
            }

            const page = request.params.page;
            const area = request.params.area;

            const validation = validatePageArea(page, area);
            if (!validation.valid) {
                return { status: 400, jsonBody: { error: validation.error } };
            }

            const snapshots = getCollection('snapshots');
            const history = snapshots
                .filter(s => s.page === page && s.area === area)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            return { status: 200, jsonBody: history };
        } catch (err) {
            context.error('Content history error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});

// POST /api/content/{page}/{area}/submit/{id}
app.http('content-submit', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'content/{page}/{area}/submit/{id}',
    handler: async (request, context) => {
        try {
            const auth = requireRole(request, 'editor');
            if (auth.error) {
                return { status: auth.status, jsonBody: { error: auth.error } };
            }

            const page = request.params.page;
            const area = request.params.area;
            const id = request.params.id;

            const validation = validatePageArea(page, area);
            if (!validation.valid) {
                return { status: 400, jsonBody: { error: validation.error } };
            }

            const snapshots = getCollection('snapshots');
            const snapshot = findById(snapshots, id);

            if (!snapshot || snapshot.page !== page || snapshot.area !== area) {
                return { status: 404, jsonBody: { error: 'Snapshot not found' } };
            }

            if (snapshot.status !== 'pending') {
                return {
                    status: 400,
                    jsonBody: { error: `Cannot submit a snapshot with status "${snapshot.status}". Only pending snapshots can be submitted.` }
                };
            }

            snapshot.status = 'submitted';
            snapshot.submitted_by = auth.user.id;
            snapshot.submitted_at = new Date().toISOString();
            snapshot.updated_at = new Date().toISOString();

            saveCollection('snapshots', snapshots);

            await logAction(
                auth.user.id,
                'content.submit',
                `${page}/${area}:${id}`,
                null,
                getClientIp(request)
            );

            return { status: 200, jsonBody: snapshot };
        } catch (err) {
            context.error('Content submit error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});

// POST /api/content/{page}/{area}/approve/{id}
app.http('content-approve', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'content/{page}/{area}/approve/{id}',
    handler: async (request, context) => {
        try {
            const auth = requireRole(request, 'admin');
            if (auth.error) {
                return { status: auth.status, jsonBody: { error: auth.error } };
            }

            const page = request.params.page;
            const area = request.params.area;
            const id = request.params.id;

            const validation = validatePageArea(page, area);
            if (!validation.valid) {
                return { status: 400, jsonBody: { error: validation.error } };
            }

            const snapshots = getCollection('snapshots');
            const snapshot = findById(snapshots, id);

            if (!snapshot || snapshot.page !== page || snapshot.area !== area) {
                return { status: 404, jsonBody: { error: 'Snapshot not found' } };
            }

            if (snapshot.status !== 'submitted') {
                return {
                    status: 400,
                    jsonBody: { error: `Cannot approve a snapshot with status "${snapshot.status}". Only submitted snapshots can be approved.` }
                };
            }

            // Unpublish any previously published snapshot for this page/area
            snapshots.forEach(s => {
                if (s.page === page && s.area === area && s.status === 'published' && s.id !== id) {
                    s.status = 'archived';
                    s.updated_at = new Date().toISOString();
                }
            });

            snapshot.status = 'published';
            snapshot.approved_by = auth.user.id;
            snapshot.approved_at = new Date().toISOString();
            snapshot.published_at = new Date().toISOString();
            snapshot.updated_at = new Date().toISOString();

            saveCollection('snapshots', snapshots);

            await logAction(
                auth.user.id,
                'content.approve',
                `${page}/${area}:${id}`,
                null,
                getClientIp(request)
            );

            return { status: 200, jsonBody: snapshot };
        } catch (err) {
            context.error('Content approve error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});

// POST /api/content/{page}/{area}/reject/{id}
app.http('content-reject', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'content/{page}/{area}/reject/{id}',
    handler: async (request, context) => {
        try {
            const auth = requireRole(request, 'admin');
            if (auth.error) {
                return { status: auth.status, jsonBody: { error: auth.error } };
            }

            const page = request.params.page;
            const area = request.params.area;
            const id = request.params.id;

            const validation = validatePageArea(page, area);
            if (!validation.valid) {
                return { status: 400, jsonBody: { error: validation.error } };
            }

            let notes = null;
            try {
                const body = await request.json();
                notes = body.notes || null;
            } catch (e) {
                // No body is acceptable
            }

            const snapshots = getCollection('snapshots');
            const snapshot = findById(snapshots, id);

            if (!snapshot || snapshot.page !== page || snapshot.area !== area) {
                return { status: 404, jsonBody: { error: 'Snapshot not found' } };
            }

            if (snapshot.status !== 'submitted') {
                return {
                    status: 400,
                    jsonBody: { error: `Cannot reject a snapshot with status "${snapshot.status}". Only submitted snapshots can be rejected.` }
                };
            }

            snapshot.status = 'rejected';
            snapshot.rejected_by = auth.user.id;
            snapshot.rejected_at = new Date().toISOString();
            snapshot.rejection_notes = notes;
            snapshot.updated_at = new Date().toISOString();

            saveCollection('snapshots', snapshots);

            await logAction(
                auth.user.id,
                'content.reject',
                `${page}/${area}:${id}`,
                notes,
                getClientIp(request)
            );

            return { status: 200, jsonBody: snapshot };
        } catch (err) {
            context.error('Content reject error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});

// GET /api/content/pending
app.http('content-pending', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'content/pending',
    handler: async (request, context) => {
        try {
            const auth = requireRole(request, 'admin');
            if (auth.error) {
                return { status: auth.status, jsonBody: { error: auth.error } };
            }

            const snapshots = getCollection('snapshots');
            const pending = snapshots
                .filter(s => s.status === 'submitted')
                .sort((a, b) => new Date(b.submitted_at || b.created_at) - new Date(a.submitted_at || a.created_at));

            return { status: 200, jsonBody: pending };
        } catch (err) {
            context.error('Content pending error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});
