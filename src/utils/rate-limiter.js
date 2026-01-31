/**
 * Rate limiter for anti-spam protection
 * Uses in-memory Map for simplicity (consider Redis for production multi-instance deployments)
 */

const rateLimits = new Map();

/**
 * Check if user is rate limited for a specific action
 * @param {string} userId - Discord user ID
 * @param {string} action - Action type (e.g., 'ticket_create', 'file_upload')
 * @param {number} limit - Number of allowed actions
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} true if rate limited, false if allowed
 */
export function isRateLimited(userId, action, limit, windowMs) {
    const key = `${userId}:${action}`;
    const now = Date.now();

    if (!rateLimits.has(key)) {
        rateLimits.set(key, []);
    }

    const timestamps = rateLimits.get(key);

    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);

    // Check if limit is exceeded
    if (validTimestamps.length >= limit) {
        return true; // Rate limited
    }

    // Add current timestamp
    validTimestamps.push(now);
    rateLimits.set(key, validTimestamps);

    return false; // Not rate limited
}

/**
 * Get remaining cooldown time in seconds
 * @param {string} userId - Discord user ID
 * @param {string} action - Action type
 * @param {number} windowMs - Time window in milliseconds
 * @returns {number} Remaining cooldown in seconds
 */
export function getRemainingCooldown(userId, action, windowMs) {
    const key = `${userId}:${action}`;
    const now = Date.now();

    if (!rateLimits.has(key)) {
        return 0;
    }

    const timestamps = rateLimits.get(key);
    if (timestamps.length === 0) {
        return 0;
    }

    const oldestTimestamp = Math.min(...timestamps);
    const elapsed = now - oldestTimestamp;
    const remaining = windowMs - elapsed;

    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Clear rate limit for a user action
 * @param {string} userId - Discord user ID
 * @param {string} action - Action type
 */
export function clearRateLimit(userId, action) {
    const key = `${userId}:${action}`;
    rateLimits.delete(key);
}

/**
 * Cleanup old entries periodically
 */
export function cleanupRateLimits() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, timestamps] of rateLimits.entries()) {
        const validTimestamps = timestamps.filter(ts => now - ts < maxAge);
        if (validTimestamps.length === 0) {
            rateLimits.delete(key);
        } else {
            rateLimits.set(key, validTimestamps);
        }
    }
}

// Run cleanup every hour
setInterval(cleanupRateLimits, 60 * 60 * 1000);
