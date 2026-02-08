import { supabase } from '../config/supabase.js';
import logger from '../utils/logger.js';

/**
 * Staff actions database operations (audit log)
 */

/**
 * Log a staff action
 */
export async function logStaffAction(actionData) {
    try {
        const { data, error } = await supabase
            .from('staff_actions')
            .insert([{
                guild_id: actionData.guildId,
                staff_id: actionData.staffId,
                staff_username: actionData.staffUsername,
                action_type: actionData.actionType,
                ticket_id: actionData.ticketId || null,
                target_user_id: actionData.targetUserId || null,
                details: actionData.details || null,
            }])
            .select()
            .single();

        if (error) {
            logger.error('Error logging staff action:', error);
            throw error;
        }

        logger.info(`Staff action logged: ${actionData.actionType} by ${actionData.staffUsername}`);
        return data;
    } catch (error) {
        logger.error('Failed to log staff action:', error);
        throw error;
    }
}

/**
 * Get staff actions by ticket
 */
export async function getTicketStaffActions(ticketId) {
    try {
        const { data, error } = await supabase
            .from('staff_actions')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('timestamp', { ascending: false });

        if (error) {
            logger.error('Error fetching staff actions:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        logger.error('Failed to get staff actions:', error);
        return [];
    }
}

/**
 * Get recent staff actions
 */
export async function getRecentStaffActions(guildId, limit = 50) {
    try {
        const { data, error } = await supabase
            .from('staff_actions')
            .select('*')
            .eq('guild_id', guildId)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) {
            logger.error('Error fetching recent staff actions:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        logger.error('Failed to get recent staff actions:', error);
        return [];
    }
}
