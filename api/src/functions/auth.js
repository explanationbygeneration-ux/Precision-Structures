const { app } = require('@azure/functions');
const { getCollection, findById } = require('../shared/db');
const {
    hashPassword,
    comparePassword,
    generateToken,
    generateRefreshToken,
    verifyToken,
    authenticateRequest
} = require('../shared/auth');
const { logAction } = require('../shared/audit');

// Simple in-memory rate limiting by IP
const loginAttempts = new Map();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip) {
    const now = Date.now();
    const record = loginAttempts.get(ip);
    if (!record || (now - record.lastAttempt) > WINDOW_MS) {
        loginAttempts.set(ip, { count: 1, lastAttempt: now });
        return true;
    }
    if (record.count >= MAX_ATTEMPTS) {
        return false;
    }
    record.count++;
    record.lastAttempt = now;
    return true;
}

function getClientIp(request) {
    return request.headers.get('x-forwarded-for')
        || request.headers.get('x-real-ip')
        || 'unknown';
}

// POST /api/auth/login
app.http('auth-login', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'auth/login',
    handler: async (request, context) => {
        try {
            const ip = getClientIp(request);

            if (!checkRateLimit(ip)) {
                return {
                    status: 429,
                    jsonBody: { error: 'Too many login attempts. Please try again later.' }
                };
            }

            const body = await request.json();
            const { email, password } = body;

            if (!email || !password) {
                return {
                    status: 400,
                    jsonBody: { error: 'Email and password are required' }
                };
            }

            const users = getCollection('users');
            const user = users.find(u => u.email === email);

            if (!user) {
                return {
                    status: 401,
                    jsonBody: { error: 'Invalid email or password' }
                };
            }

            if (user.is_active === false) {
                return {
                    status: 401,
                    jsonBody: { error: 'Account is deactivated' }
                };
            }

            const passwordValid = await comparePassword(password, user.password_hash);
            if (!passwordValid) {
                return {
                    status: 401,
                    jsonBody: { error: 'Invalid email or password' }
                };
            }

            const token = generateToken(user);
            const refreshToken = generateRefreshToken(user);

            // Reset rate limit on successful login
            loginAttempts.delete(ip);

            await logAction(user.id, 'auth.login', `user:${user.id}`, null, ip);

            return {
                status: 200,
                jsonBody: {
                    token,
                    refreshToken,
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        name: user.name
                    }
                }
            };
        } catch (err) {
            context.error('Login error:', err);
            return {
                status: 500,
                jsonBody: { error: 'Internal server error' }
            };
        }
    }
});

// POST /api/auth/refresh
app.http('auth-refresh', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'auth/refresh',
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const { refreshToken } = body;

            if (!refreshToken) {
                return {
                    status: 400,
                    jsonBody: { error: 'Refresh token is required' }
                };
            }

            const decoded = verifyToken(refreshToken);
            if (!decoded || decoded.type !== 'refresh') {
                return {
                    status: 401,
                    jsonBody: { error: 'Invalid or expired refresh token' }
                };
            }

            const users = getCollection('users');
            const user = findById(users, decoded.id);

            if (!user || user.is_active === false) {
                return {
                    status: 401,
                    jsonBody: { error: 'User not found or deactivated' }
                };
            }

            const token = generateToken(user);

            return {
                status: 200,
                jsonBody: { token }
            };
        } catch (err) {
            context.error('Refresh error:', err);
            return {
                status: 500,
                jsonBody: { error: 'Internal server error' }
            };
        }
    }
});

// POST /api/auth/me
app.http('auth-me', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'auth/me',
    handler: async (request, context) => {
        try {
            const payload = authenticateRequest(request);
            if (!payload) {
                return {
                    status: 401,
                    jsonBody: { error: 'Authentication required' }
                };
            }

            const users = getCollection('users');
            const user = findById(users, payload.id);

            if (!user || user.is_active === false) {
                return {
                    status: 404,
                    jsonBody: { error: 'User not found' }
                };
            }

            return {
                status: 200,
                jsonBody: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    created_at: user.created_at
                }
            };
        } catch (err) {
            context.error('Auth me error:', err);
            return {
                status: 500,
                jsonBody: { error: 'Internal server error' }
            };
        }
    }
});
