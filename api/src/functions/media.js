const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');
const { getCollection, upsertItem, findById, generateId, deleteItem } = require('../shared/db');
const { requireRole } = require('../shared/auth');
const { logAction } = require('../shared/audit');

const BLOB_CONNECTION = process.env.BLOB_CONNECTION_STRING;
const BLOB_CONTAINER = process.env.BLOB_CONTAINER || 'gallery';

let containerClient = null;

async function getBlobContainer() {
    if (containerClient) return containerClient;

    if (!BLOB_CONNECTION) {
        throw new Error('Blob Storage not configured. Set BLOB_CONNECTION_STRING environment variable.');
    }

    const blobService = BlobServiceClient.fromConnectionString(BLOB_CONNECTION);
    containerClient = blobService.getContainerClient(BLOB_CONTAINER);
    await containerClient.createIfNotExists({ access: 'blob' }); // public read for images
    return containerClient;
}

function getClientIp(request) {
    return request.headers.get('x-forwarded-for')
        || request.headers.get('x-real-ip')
        || 'unknown';
}

// Allowed image MIME types
const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Parse multipart/form-data from the request.
 * Returns { filename, contentType, buffer } or null.
 */
async function parseFileUpload(request) {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file || typeof file === 'string') return null;

        const buffer = Buffer.from(await file.arrayBuffer());
        return {
            filename: file.name || 'upload',
            contentType: file.type || 'application/octet-stream',
            buffer
        };
    }

    return null;
}

// GET /api/media — list all media items
app.http('media-list', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'media',
    handler: async (request, context) => {
        try {
            const auth = requireRole(request, 'viewer');
            if (auth.error) {
                return { status: auth.status, jsonBody: { error: auth.error } };
            }

            const media = await getCollection('media');
            const items = media
                .filter(m => !m.deleted)
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

            return {
                status: 200,
                jsonBody: { items }
            };
        } catch (err) {
            context.error('Media list error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});

// POST /api/media — upload a new image
app.http('media-upload', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'media',
    handler: async (request, context) => {
        try {
            const auth = requireRole(request, 'editor');
            if (auth.error) {
                return { status: auth.status, jsonBody: { error: auth.error } };
            }

            const upload = await parseFileUpload(request);
            if (!upload) {
                return {
                    status: 400,
                    jsonBody: { error: 'No file provided. Send as multipart/form-data with a "file" field.' }
                };
            }

            if (!ALLOWED_TYPES.includes(upload.contentType)) {
                return {
                    status: 400,
                    jsonBody: { error: `File type "${upload.contentType}" not allowed. Allowed: ${ALLOWED_TYPES.join(', ')}` }
                };
            }

            if (upload.buffer.length > MAX_FILE_SIZE) {
                return {
                    status: 400,
                    jsonBody: { error: 'File too large. Maximum size is 10 MB.' }
                };
            }

            // Generate unique blob name
            const id = generateId();
            const ext = upload.filename.includes('.')
                ? upload.filename.substring(upload.filename.lastIndexOf('.'))
                : '.jpg';
            const blobName = `${id}${ext}`;

            // Upload to Blob Storage
            const container = await getBlobContainer();
            const blockBlob = container.getBlockBlobClient(blobName);
            await blockBlob.upload(upload.buffer, upload.buffer.length, {
                blobHTTPHeaders: {
                    blobContentType: upload.contentType,
                    blobCacheControl: 'public, max-age=31536000'
                }
            });

            // Get the category from form data if provided
            let category = 'roof';
            let title = upload.filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
            try {
                const formData = await request.formData().catch(() => null);
                if (formData) {
                    category = formData.get('category') || 'roof';
                    title = formData.get('title') || title;
                }
            } catch (e) {
                // Form already consumed, use defaults
            }

            // Get current max sort_order
            const media = await getCollection('media');
            const maxOrder = media.reduce((max, m) => Math.max(max, m.sort_order || 0), 0);

            // Save metadata to Cosmos DB
            const mediaItem = {
                id,
                filename: upload.filename,
                blob_name: blobName,
                url: blockBlob.url,
                content_type: upload.contentType,
                size: upload.buffer.length,
                category,
                title,
                alt_text: title,
                sort_order: maxOrder + 1,
                deleted: false,
                uploaded_by: auth.user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await upsertItem('media', mediaItem);

            await logAction(
                auth.user.id,
                'media.upload',
                `media:${id}`,
                `Uploaded ${upload.filename} (${(upload.buffer.length / 1024).toFixed(1)} KB)`,
                getClientIp(request)
            );

            return { status: 201, jsonBody: mediaItem };
        } catch (err) {
            context.error('Media upload error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});

// PUT /api/media/{id} — update media metadata (title, category, alt_text, sort_order)
app.http('media-update', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'media/{id}',
    handler: async (request, context) => {
        try {
            const auth = requireRole(request, 'editor');
            if (auth.error) {
                return { status: auth.status, jsonBody: { error: auth.error } };
            }

            const id = request.params.id;
            const media = await getCollection('media');
            const item = findById(media, id);

            if (!item || item.deleted) {
                return { status: 404, jsonBody: { error: 'Media item not found' } };
            }

            const body = await request.json();
            const { title, category, alt_text, sort_order } = body;

            if (title !== undefined) item.title = title;
            if (category !== undefined) item.category = category;
            if (alt_text !== undefined) item.alt_text = alt_text;
            if (sort_order !== undefined) item.sort_order = sort_order;
            item.updated_at = new Date().toISOString();

            await upsertItem('media', item);

            await logAction(
                auth.user.id,
                'media.update',
                `media:${id}`,
                `Updated metadata for ${item.filename}`,
                getClientIp(request)
            );

            return { status: 200, jsonBody: item };
        } catch (err) {
            context.error('Media update error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});

// DELETE /api/media/{id} — soft delete a media item
app.http('media-delete', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'media/{id}',
    handler: async (request, context) => {
        try {
            const auth = requireRole(request, 'admin');
            if (auth.error) {
                return { status: auth.status, jsonBody: { error: auth.error } };
            }

            const id = request.params.id;
            const media = await getCollection('media');
            const item = findById(media, id);

            if (!item || item.deleted) {
                return { status: 404, jsonBody: { error: 'Media item not found' } };
            }

            // Delete blob from storage
            try {
                const container = await getBlobContainer();
                const blockBlob = container.getBlockBlobClient(item.blob_name);
                await blockBlob.deleteIfExists();
            } catch (blobErr) {
                context.warn('Failed to delete blob:', blobErr.message);
                // Continue with soft delete even if blob deletion fails
            }

            // Soft delete in database
            item.deleted = true;
            item.deleted_by = auth.user.id;
            item.deleted_at = new Date().toISOString();
            item.updated_at = new Date().toISOString();

            await upsertItem('media', item);

            await logAction(
                auth.user.id,
                'media.delete',
                `media:${id}`,
                `Deleted ${item.filename}`,
                getClientIp(request)
            );

            return {
                status: 200,
                jsonBody: { message: 'Media item deleted', id }
            };
        } catch (err) {
            context.error('Media delete error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});

// PUT /api/media/reorder — bulk update sort_order
app.http('media-reorder', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'media/reorder',
    handler: async (request, context) => {
        try {
            const auth = requireRole(request, 'editor');
            if (auth.error) {
                return { status: auth.status, jsonBody: { error: auth.error } };
            }

            const body = await request.json();
            const { order } = body; // Array of { id, sort_order }

            if (!Array.isArray(order)) {
                return {
                    status: 400,
                    jsonBody: { error: 'order must be an array of { id, sort_order }' }
                };
            }

            const media = await getCollection('media');

            for (const entry of order) {
                const item = findById(media, entry.id);
                if (item && !item.deleted) {
                    item.sort_order = entry.sort_order;
                    item.updated_at = new Date().toISOString();
                    await upsertItem('media', item);
                }
            }

            await logAction(
                auth.user.id,
                'media.reorder',
                'media',
                `Reordered ${order.length} items`,
                getClientIp(request)
            );

            return {
                status: 200,
                jsonBody: { message: 'Gallery order updated' }
            };
        } catch (err) {
            context.error('Media reorder error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});

// GET /api/media/public — public endpoint for gallery page (no auth required)
app.http('media-public', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'media/public',
    handler: async (request, context) => {
        try {
            const media = await getCollection('media');
            const items = media
                .filter(m => !m.deleted)
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map(({ id, url, title, alt_text, category, sort_order }) => ({
                    id, url, title, alt_text, category, sort_order
                }));

            return {
                status: 200,
                headers: { 'Cache-Control': 'public, max-age=300' },
                jsonBody: { items }
            };
        } catch (err) {
            context.error('Media public error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});
