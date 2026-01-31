import { supabase } from '../config/supabase.js';
import logger from '../utils/logger.js';

/**
 * Transaction database operations
 */

/**
 * Create a new transaction
 */
export async function createTransaction(transactionData) {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                ticket_id: transactionData.ticketId,
                user_id: transactionData.userId,
                payment_method: transactionData.paymentMethod,
                amount: transactionData.amount,
                status: 'pending',
                proof_url: transactionData.proofUrl || null,
                transaction_hash: transactionData.transactionHash || null,
            }])
            .select()
            .single();

        if (error) {
            logger.error('Error creating transaction:', error);
            throw error;
        }

        logger.info(`Transaction created for ticket: ${transactionData.ticketId}`);
        return data;
    } catch (error) {
        logger.error('Failed to create transaction:', error);
        throw error;
    }
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(ticketId, status) {
    try {
        const updateData = { status };

        if (status === 'confirmed') {
            updateData.confirmed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('transactions')
            .update(updateData)
            .eq('ticket_id', ticketId)
            .select()
            .single();

        if (error) {
            logger.error('Error updating transaction status:', error);
            throw error;
        }

        logger.info(`Transaction status updated for ticket ${ticketId}: ${status}`);
        return data;
    } catch (error) {
        logger.error('Failed to update transaction status:', error);
        throw error;
    }
}

/**
 * Get transactions by user ID
 */
export async function getUserTransactions(userId) {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('Error fetching user transactions:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        logger.error('Failed to get user transactions:', error);
        return [];
    }
}

/**
 * Get transaction by ticket ID
 */
export async function getTransactionByTicket(ticketId) {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('ticket_id', ticketId)
            .single();

        if (error && error.code !== 'PGRST116') {
            logger.error('Error fetching transaction:', error);
            throw error;
        }

        return data;
    } catch (error) {
        logger.error('Failed to get transaction:', error);
        return null;
    }
}
