const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'precision-portal-dev-secret-change-in-production';

const ROLE_HIERARCHY = {
    viewer: 1,
    editor: 2,
    admin: 3
};

/**
 * Hash a password with bcrypt (12 rounds).
 */
async function hashPassword(password) {
    return bcrypt.hash(password, 12);
}

/**
 * Compare a plain-text password against a bcrypt hash.
 */
async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

/**
 * Generate an access token (15 min expiry).
 */
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '15m' }
    );
}

/**
 * Generate a refresh token (7 day expiry).
 */
function generateRefreshToken(user) {
    return jwt.sign(
        { id: user.id, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

/**
 * Verify a JWT and return the decoded payload, or null on failure.
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

/**
 * Extract Bearer token from the Authorization header, verify it,
 * and return the user payload or null.
 */
function authenticateRequest(request) {
    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.slice(7);
    return verifyToken(token);
}

/**
 * Check that the authenticated user has at least the minimum required role.
 * Returns { user } on success, or { error, status } on failure.
 */
function requireRole(request, minRole) {
    const user = authenticateRequest(request);
    if (!user) {
        return { error: 'Authentication required', status: 401 };
    }
    const userLevel = ROLE_HIERARCHY[user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;
    if (userLevel < requiredLevel) {
        return { error: 'Insufficient permissions', status: 403 };
    }
    return { user };
}

module.exports = {
    JWT_SECRET,
    hashPassword,
    comparePassword,
    generateToken,
    generateRefreshToken,
    verifyToken,
    authenticateRequest,
    requireRole
};
