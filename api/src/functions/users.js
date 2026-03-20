const { app } = require('@azure/functions');
const { getCollection, saveCollection, findById, generateId } = require('../shared/db');
const { requireRole, hashPassword } = require('../shared/auth');
const { logAction } = require('../shared/audit');

function getClientIp(request) {
    return request.headers.get('x-forwarded-for')
        || request.headers.get('x-real-ip')
        || 'unknown';
}

/**
 * Strip sensitive fields from a user object before returning it.
 */
function sanitizeUser(user) {
    const { password_hash, ...safe } = user;
    return safe;
}

// GET /api/users
app.http('users-list', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'users',
    handler: async (request, context) => {
        try {
            const auth = requireRole(request, 'admin');
            if (auth.error) {
                return { status: auth.status, jsonBody: { error: auth.error } };
            }

            const users = getCollection('users');
            return {
                status: 200,
                jsonBody: users.map(sanitizeUser)
            };
        } catch (err) {
            context.error('Users list error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});

// POST /api/users
app.http('users-create', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'users',
    handler: async (request, context) => {
        try {
            const auth = requireRole(request, 'admin');
            if (auth.error) {
                return { status: auth.status, jsonBody: { error: auth.error } };
            }

            const body = await request.json();
            const { email, password, name, role } = body;

            if (!email || !password || !name || !role) {
                return {
                    status: 400,
                    jsonBody: { error: 'email, password, name, and role are required' }
                };
            }

            const validRoles = ['viewer', 'editor', 'admin'];
            if (!validRoles.includes(role)) {
                return {
                    status: 400,
                    jsonBody: { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }
                };
            }

            const users = getCollection('users');

            if (users.find(u => u.email === email)) {
                return {
                    status: 400,
                    jsonBody: { error: 'A user with this email already exists' }
                };
            }

            const password_hash = await hashPassword(password);
            const newUser = {
                id: generateId(),
                email,
                name,
                role,
                password_hash,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            users.push(newUser);
            saveCollection('users', users);

            await logAction(
                auth.user.id,
                'user.create',
                `user:${newUser.id}`,
                `Created user ${email} with role ${role}`,
                getClientIp(request)
            );

            return { status: 201, jsonBody: sanitizeUser(newUser) };
        } catch (err) {
            context.error('Users create error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});

// PUT /api/users/{id}
app.http('users-update', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'users/{id}',
    handler: async (request, context) => {
        try {
            const auth = requireRole(request, 'admin');
            if (auth.error) {
                return { status: auth.status, jsonBody: { error: auth.error } };
            }

            const id = request.params.id;
            const users = getCollection('users');
            const user = findById(users, id);

            if (!user) {
                return { status: 404, jsonBody: { error: 'User not found' } };
            }

            const body = await request.json();
            const { role, is_active } = body;
            const changes = [];

            if (role !== undefined) {
                const validRoles = ['viewer', 'editor', 'admin'];
                if (!validRoles.includes(role)) {
                    return {
                        status: 400,
                        jsonBody: { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }
                    };
                }
                user.role = role;
                changes.push(`role=${role}`);
            }

            if (is_active !== undefined) {
                user.is_active = Boolean(is_active);
                changes.push(`is_active=${user.is_active}`);
            }

            user.updated_at = new Date().toISOString();
            saveCollection('users', users);

            await logAction(
                auth.user.id,
                'user.update',
                `user:${id}`,
                `Updated: ${changes.join(', ')}`,
                getClientIp(request)
            );

            return { status: 200, jsonBody: sanitizeUser(user) };
        } catch (err) {
            context.error('Users update error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});

// DELETE /api/users/{id}
app.http('users-delete', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'users/{id}',
    handler: async (request, context) => {
        try {
            const auth = requireRole(request, 'admin');
            if (auth.error) {
                return { status: auth.status, jsonBody: { error: auth.error } };
            }

            const id = request.params.id;
            const users = getCollection('users');
            const user = findById(users, id);

            if (!user) {
                return { status: 404, jsonBody: { error: 'User not found' } };
            }

            // Prevent self-deletion
            if (auth.user.id === id) {
                return {
                    status: 400,
                    jsonBody: { error: 'Cannot deactivate your own account' }
                };
            }

            // Soft delete
            user.is_active = false;
            user.updated_at = new Date().toISOString();
            saveCollection('users', users);

            await logAction(
                auth.user.id,
                'user.delete',
                `user:${id}`,
                `Deactivated user ${user.email}`,
                getClientIp(request)
            );

            return {
                status: 200,
                jsonBody: { message: 'User deactivated', user: sanitizeUser(user) }
            };
        } catch (err) {
            context.error('Users delete error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});
