const { app } = require('@azure/functions');
const { getCollection } = require('../shared/db');
const { requireRole } = require('../shared/auth');

// GET /api/audit
app.http('audit-list', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'audit',
    handler: async (request, context) => {
        try {
            const auth = requireRole(request, 'admin');
            if (auth.error) {
                return { status: auth.status, jsonBody: { error: auth.error } };
            }

            const limitParam = request.query.get('limit');
            const offsetParam = request.query.get('offset');

            const limit = Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 500);
            const offset = Math.max(parseInt(offsetParam, 10) || 0, 0);

            const audit = getCollection('audit');
            const sorted = audit.sort(
                (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            );

            const page = sorted.slice(offset, offset + limit);

            return {
                status: 200,
                jsonBody: {
                    total: audit.length,
                    limit,
                    offset,
                    entries: page
                }
            };
        } catch (err) {
            context.error('Audit list error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});
