import { supabase } from '../config/supabase.js';
import logger from '../utils/logger.js';

/**
 * Ticket database operations
 */

/**
 * Create a new ticket
 */
export async function createTicket(ticketData) {
    try {
        const { data, error } = await supabase
            .from('tickets')
            .insert([{
                ticket_id: ticketData.ticketId,
                guild_id: ticketData.guildId,
                user_id: ticketData.userId,
                username: ticketData.username,
                discord_channel_id: ticketData.channelId,
                status: 'pending',
                payment_method: ticketData.paymentMethod || null,
                amount: ticketData.amount || null,
                product: ticketData.product || null,
            }])
            .select()
            .single();

        if (error) {
            logger.error('Error creating ticket in database:', error);
            throw error;
        }

        logger.info(`Ticket created in database: ${ticketData.ticketId}`);
        return data;
    } catch (error) {
        logger.error('Failed to create ticket:', error);
        throw error;
    }
}

/**
 * Get ticket by ticket ID
 */
export async function getTicketById(ticketId) {
    try {
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('ticket_id', ticketId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            logger.error('Error fetching ticket:', error);
            throw error;
        }

        return data;
    } catch (error) {
        logger.error('Failed to get ticket:', error);
        return null;
    }
}

/**
 * Get active tickets for a user
 */
export async function getUserActiveTickets(userId, guildId) {
    try {
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_id', userId)
            .eq('guild_id', guildId)
            .in('status', ['pending', 'confirmed'])
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('Error fetching user tickets:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        logger.error('Failed to get user tickets:', error);
        return [];
    }
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(ticketId, status, additionalData = {}) {
    try {
        const updateData = {
            status,
            ...additionalData,
        };

        // Add timestamp fields based on status
        if (status === 'confirmed') {
            updateData.confirmed_at = new Date().toISOString();
        } else if (status === 'delivered') {
            updateData.delivered_at = new Date().toISOString();
        } else if (status === 'closed') {
            updateData.closed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('tickets')
            .update(updateData)
            .eq('ticket_id', ticketId)
            .select()
            .single();

        if (error) {
            logger.error('Error updating ticket status:', error);
            throw error;
        }

        logger.info(`Ticket ${ticketId} status updated to: ${status}`);
        return data;
    } catch (error) {
        logger.error('Failed to update ticket status:', error);
        throw error;
    }
}

/**
 * Update ticket payment method and amount
 */
export async function updateTicketPayment(ticketId, paymentMethod, amount) {
    try {
        const { data, error } = await supabase
            .from('tickets')
            .update({
                payment_method: paymentMethod,
                amount: amount,
            })
            .eq('ticket_id', ticketId)
            .select()
            .single();

        if (error) {
            logger.error('Error updating ticket payment:', error);
            throw error;
        }

        return data;
    } catch (error) {
        logger.error('Failed to update ticket payment:', error);
        throw error;
    }
}

/**
 * Get ticket count by user
 */
export async function getUserTicketCount(userId, guildId) {
    try {
        const { count, error } = await supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('guild_id', guildId)
            .in('status', ['pending', 'pending', 'confirmed']);

        if (error) {
            logger.error('Error counting user tickets:', error);
            return 0;
        }

        return count || 0;
    } catch (error) {
        logger.error('Failed to count user tickets:', error);
        return 0;
    }
}

/**
 * Get all pending tickets
 */
export async function getPendingTickets(guildId) {
    try {
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('guild_id', guildId)
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (error) {
            logger.error('Error fetching pending tickets:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        logger.error('Failed to get pending tickets:', error);
        return [];
    }
}

/**
 * Delete ticket
 */
export async function deleteTicket(ticketId) {
    try {
        const { error } = await supabase
            .from('tickets')
            .delete()
            .eq('ticket_id', ticketId);

        if (error) {
            logger.error('Error deleting ticket:', error);
            throw error;
        }

        logger.info(`Ticket deleted: ${ticketId}`);
        return true;
    } catch (error) {
        logger.error('Failed to delete ticket:', error);
        return false;
    }
}
