const { app } = require('@azure/functions');
const { getCollection, saveCollection, generateId } = require('../shared/db');
const { hashPassword, generateToken } = require('../shared/auth');

// GET /api/setup — check if setup is needed
app.http('setup-check', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'setup',
    handler: async (request, context) => {
        try {
            const users = getCollection('users');
            return {
                status: 200,
                jsonBody: { needsSetup: users.length === 0 }
            };
        } catch (err) {
            context.error('Setup check error:', err);
            return { status: 200, jsonBody: { needsSetup: true } };
        }
    }
});

// POST /api/setup — create first admin
app.http('setup', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'setup',
    handler: async (request, context) => {
        try {
            const users = getCollection('users');

            if (users.length > 0) {
                return {
                    status: 400,
                    jsonBody: { error: 'Setup has already been completed. Users already exist.' }
                };
            }

            const body = await request.json();
            const { email, password, name } = body;

            if (!email || !password || !name) {
                return {
                    status: 400,
                    jsonBody: { error: 'email, password, and name are required' }
                };
            }

            if (password.length < 8) {
                return {
                    status: 400,
                    jsonBody: { error: 'Password must be at least 8 characters' }
                };
            }

            const password_hash = await hashPassword(password);
            const adminUser = {
                id: generateId(),
                email,
                name,
                role: 'admin',
                password_hash,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            users.push(adminUser);
            saveCollection('users', users);

            const token = generateToken(adminUser);

            return {
                status: 201,
                jsonBody: {
                    message: 'Admin user created successfully',
                    token: token,
                    user: {
                        id: adminUser.id,
                        email: adminUser.email,
                        name: adminUser.name,
                        role: adminUser.role,
                        created_at: adminUser.created_at
                    }
                }
            };
        } catch (err) {
            context.error('Setup error:', err);
            return { status: 500, jsonBody: { error: 'Internal server error' } };
        }
    }
});
