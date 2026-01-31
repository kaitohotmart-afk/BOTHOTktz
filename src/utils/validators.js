/**
 * Input validators for security and data integrity
 */

const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.pdf'];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

/**
 * Validate file upload
 * @param {Object} attachment - Discord attachment object
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validateFileUpload(attachment) {
    if (!attachment) {
        return { valid: false, error: 'No file attached' };
    }

    // Check file size
    if (attachment.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
        };
    }

    // Check file extension
    const extension = attachment.name.toLowerCase().slice(attachment.name.lastIndexOf('.'));
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`
        };
    }

    return { valid: true, error: null };
}

/**
 * Check if user has required role
 * @param {GuildMember} member - Discord guild member
 * @param {string} requiredRoleName - Role name to check
 * @returns {boolean}
 */
export function hasRole(member, requiredRoleName) {
    if (!member || !member.roles) {
        return false;
    }

    return member.roles.cache.some(role =>
        role.name.toLowerCase() === requiredRoleName.toLowerCase()
    );
}

/**
 * Check if user is staff (Admin or Staff role)
 * @param {GuildMember} member - Discord guild member
 * @returns {boolean}
 */
export function isStaff(member) {
    if (!member) return false;

    return hasRole(member, 'Staff') ||
        hasRole(member, 'Admin') ||
        member.permissions.has('Administrator');
}

/**
 * Sanitize user input to prevent injection
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return '';
    }

    // Remove potentially dangerous characters
    return input
        .replace(/[<>]/g, '') // Remove HTML tags
        .trim()
        .slice(0, 2000); // Limit length
}

/**
 * Validate ticket channel name
 * @param {string} channelName - Channel name
 * @returns {boolean}
 */
export function isTicketChannel(channelName) {
    return channelName && channelName.startsWith('ticket-');
}

/**
 * Extract ticket ID from channel name
 * @param {string} channelName - Channel name
 * @returns {string|null}
 */
export function extractTicketId(channelName) {
    if (!isTicketChannel(channelName)) {
        return null;
    }

    return channelName; // The full channel name is the ticket ID
}

/**
 * Validate payment amount
 * @param {number|string} amount - Payment amount
 * @returns {Object} { valid: boolean, error: string|null, value: number }
 */
export function validateAmount(amount) {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount)) {
        return { valid: false, error: 'Invalid amount format', value: 0 };
    }

    if (numAmount <= 0) {
        return { valid: false, error: 'Amount must be greater than 0', value: 0 };
    }

    if (numAmount > 1000000) {
        return { valid: false, error: 'Amount too large', value: 0 };
    }

    return { valid: true, error: null, value: numAmount };
}
