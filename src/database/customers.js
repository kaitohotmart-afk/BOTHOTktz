import { supabase } from '../config/supabase.js';
import logger from '../utils/logger.js';

/**
 * Customer database operations
 */

/**
 * Get or create customer
 */
export async function getOrCreateCustomer(userId, username) {
    try {
        // Try to get existing customer
        let { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // Customer doesn't exist, create new one
            const { data: newCustomer, error: createError } = await supabase
                .from('customers')
                .insert([{
                    user_id: userId,
                    username: username,
                    total_purchases: 0,
                    total_spent: 0,
                    vip_access: false,
                }])
                .select()
                .single();

            if (createError) {
                logger.error('Error creating customer:', createError);
                throw createError;
            }

            logger.info(`New customer created: ${username}`);
            return newCustomer;
        } else if (error) {
            logger.error('Error fetching customer:', error);
            throw error;
        }

        return data;
    } catch (error) {
        logger.error('Failed to get or create customer:', error);
        throw error;
    }
}

/**
 * Update customer purchase stats
 */
export async function updateCustomerPurchase(userId, amount) {
    try {
        const customer = await getOrCreateCustomer(userId, 'Unknown');

        const { data, error } = await supabase
            .from('customers')
            .update({
                total_purchases: customer.total_purchases + 1,
                total_spent: parseFloat(customer.total_spent || 0) + parseFloat(amount),
                last_purchase_at: new Date().toISOString(),
                first_purchase_at: customer.first_purchase_at || new Date().toISOString(),
                vip_access: true, // Grant VIP access on purchase
            })
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            logger.error('Error updating customer purchase:', error);
            throw error;
        }

        logger.info(`Customer ${userId} purchase stats updated`);
        return data;
    } catch (error) {
        logger.error('Failed to update customer purchase:', error);
        throw error;
    }
}

/**
 * Grant VIP access to customer
 */
export async function grantVIPAccess(userId) {
    try {
        const { data, error } = await supabase
            .from('customers')
            .update({ vip_access: true })
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            logger.error('Error granting VIP access:', error);
            throw error;
        }

        logger.info(`VIP access granted to user: ${userId}`);
        return data;
    } catch (error) {
        logger.error('Failed to grant VIP access:', error);
        throw error;
    }
}

/**
 * Get customer by user ID
 */
export async function getCustomer(userId) {
    try {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            logger.error('Error fetching customer:', error);
            throw error;
        }

        return data;
    } catch (error) {
        logger.error('Failed to get customer:', error);
        return null;
    }
}

/**
 * Get all VIP customers
 */
export async function getVIPCustomers() {
    try {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('vip_access', true)
            .order('total_spent', { ascending: false });

        if (error) {
            logger.error('Error fetching VIP customers:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        logger.error('Failed to get VIP customers:', error);
        return [];
    }
}

/**
 * Get customer statistics
 */
export async function getCustomerStats() {
    try {
        const { data, error } = await supabase
            .from('customers')
            .select('total_purchases, total_spent');

        if (error) {
            logger.error('Error fetching customer stats:', error);
            return { totalCustomers: 0, totalPurchases: 0, totalRevenue: 0 };
        }

        const totalCustomers = data.length;
        const totalPurchases = data.reduce((sum, c) => sum + c.total_purchases, 0);
        const totalRevenue = data.reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0);

        return { totalCustomers, totalPurchases, totalRevenue };
    } catch (error) {
        logger.error('Failed to get customer stats:', error);
        return { totalCustomers: 0, totalPurchases: 0, totalRevenue: 0 };
    }
}
