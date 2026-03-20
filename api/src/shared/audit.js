const { getCollection, saveCollection, generateId } = require('./db');

/**
 * Append an audit log entry.
 *
 * Valid actions:
 *   auth.login, auth.logout,
 *   content.edit, content.submit, content.approve, content.reject, content.rollback,
 *   media.upload, media.delete,
 *   user.create, user.update, user.delete
 */
async function logAction(userId, action, target, details, ipAddress) {
    const audit = getCollection('audit');
    const entry = {
        id: generateId(),
        userId,
        action,
        target,
        details: details || null,
        ipAddress: ipAddress || null,
        timestamp: new Date().toISOString()
    };
    audit.push(entry);
    saveCollection('audit', audit);
    return entry;
}

module.exports = { logAction };
