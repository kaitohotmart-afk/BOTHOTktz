import { supabase } from '../config/supabase.js';
import logger from '../utils/logger.js';

/**
 * Check if a guild is whitelisted and active
 */
export async function isGuildWhitelisted(guildId) {
    try {
        const { data, error } = await supabase
            .from('guild_whitelist')
            .select('is_active, expires_at')
            .eq('guild_id', guildId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return false; // Not in whitelist
            }
            logger.error('Error checking guild whitelist:', error);
            return false;
        }

        if (!data.is_active) return false;

        // Check expiration if set
        if (data.expires_at) {
            const expiresAt = new Date(data.expires_at);
            if (expiresAt < new Date()) return false;
        }

        return true;
    } catch (error) {
        logger.error('Failed to check guild whitelist:', error);
        return false;
    }
}

/**
 * Add a guild to the whitelist
 */
export async function addGuildToWhitelist(guildId, ownerId = null, durationDays = null) {
    try {
        let expiresAt = null;
        if (durationDays) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + durationDays);
        }

        const { data, error } = await supabase
            .from('guild_whitelist')
            .upsert([{
                guild_id: guildId,
                owner_id: ownerId,
                is_active: true,
                expires_at: expiresAt ? expiresAt.toISOString() : null,
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            logger.error('Error adding guild to whitelist:', error);
            throw error;
        }

        return data;
    } catch (error) {
        logger.error('Failed to add guild to whitelist:', error);
        throw error;
    }
}
