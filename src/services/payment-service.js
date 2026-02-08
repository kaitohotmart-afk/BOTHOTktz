import { updateTicketStatus, getTicketById } from '../database/tickets.js';
import { updateCustomerPurchase, grantVIPAccess } from '../database/customers.js';
import { updateTransactionStatus } from '../database/transactions.js';
import { logStaffAction } from '../database/staff-actions.js';
import { createConfirmationEmbed, createDeliveryNotificationEmbed, createErrorEmbed } from '../utils/embeds.js';
import logger from '../utils/logger.js';

/**
 * Confirm a payment and grant access
 */
export async function confirmPayment(guild, ticket, staffMember, amount = 0) {
    try {
        // Update ticket status
        await updateTicketStatus(ticket.ticket_id, 'confirmed', {
            confirmed_by: staffMember.user.username,
            amount: amount,
        });

        // Update customer stats
        if (amount > 0) {
            await updateCustomerPurchase(ticket.user_id, amount, guild.id);
        } else {
            await grantVIPAccess(ticket.user_id, guild.id);
        }

        // Update transaction status if exists
        try {
            await updateTransactionStatus(ticket.ticket_id, 'confirmed');
        } catch (err) {
            // Transaction might not exist yet, that's okay
            logger.warn('No transaction found to update:', err.message);
        }

        // Log staff action
        await logStaffAction({
            guildId: guild.id,
            staffId: staffMember.user.id,
            staffUsername: staffMember.user.username,
            actionType: 'confirm_payment',
            ticketId: ticket.ticket_id,
            targetUserId: ticket.user_id,
            details: `Amount: ${amount}`,
        });

        // Get ticket channel
        const ticketChannel = guild.channels.cache.get(ticket.discord_channel_id);
        if (!ticketChannel) {
            throw new Error('Ticket channel not found');
        }

        // Get customer role
        let customerRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'customer');

        // Add Customer role to user
        const member = await guild.members.fetch(ticket.user_id);
        if (customerRole && member) {
            await member.roles.add(customerRole);
            logger.info(`Added Customer role to ${member.user.username}`);
        }

        // Grant access to group-vip channel
        const vipChannel = guild.channels.cache.find(c => c.name === 'group-vip');
        if (vipChannel && member) {
            await vipChannel.permissionOverwrites.create(member.user.id, {
                ViewChannel: true,
                SendMessages: true,
            });
            logger.info(`Granted VIP channel access to ${member.user.username}`);
        }

        // Send confirmation in ticket
        await ticketChannel.send(createConfirmationEmbed(member.user, ticket.payment_method));

        // Post to deliveries channel
        const deliveriesChannel = guild.channels.cache.find(c => c.name === 'deliveries');
        if (deliveriesChannel) {
            await deliveriesChannel.send(
                createDeliveryNotificationEmbed(
                    member.user,
                    ticket.payment_method || 'Unknown',
                    staffMember.user
                )
            );
        }

        logger.info(`Payment confirmed for ticket: ${ticket.ticket_id}`);
        return { success: true };
    } catch (error) {
        logger.error('Error confirming payment:', error);
        throw error;
    }
}

/**
 * Reject a payment
 */
export async function rejectPayment(guild, ticket, staffMember, reason) {
    try {
        // Update ticket status
        await updateTicketStatus(ticket.ticket_id, 'rejected', {
            notes: reason,
        });

        // Update transaction status if exists
        try {
            await updateTransactionStatus(ticket.ticket_id, 'rejected');
        } catch (err) {
            logger.warn('No transaction found to update:', err.message);
        }

        // Log staff action
        await logStaffAction({
            guildId: guild.id,
            staffId: staffMember.user.id,
            staffUsername: staffMember.user.username,
            actionType: 'reject_payment',
            ticketId: ticket.ticket_id,
            targetUserId: ticket.user_id,
            details: reason,
        });

        // Get ticket channel
        const ticketChannel = guild.channels.cache.get(ticket.discord_channel_id);
        if (ticketChannel) {
            await ticketChannel.send(
                createErrorEmbed(
                    'Payment Verification Failed',
                    `**Reason:** ${reason}\n\n` +
                    '**Please check:**\n' +
                    '• Did you use the correct payment method?\n' +
                    '• Did you send to the correct address/email?\n' +
                    '• Did you follow all instructions?\n\n' +
                    'If you believe this is an error, please contact staff.'
                )
            );
        }

        logger.info(`Payment rejected for ticket: ${ticket.ticket_id}`);
        return { success: true };
    } catch (error) {
        logger.error('Error rejecting payment:', error);
        throw error;
    }
}

/**
 * Mark order as delivered
 */
export async function markDelivered(guild, ticket, staffMember) {
    try {
        // Update ticket status
        await updateTicketStatus(ticket.ticket_id, 'delivered');

        // Log staff action
        await logStaffAction({
            guildId: guild.id,
            staffId: staffMember.user.id,
            staffUsername: staffMember.user.username,
            actionType: 'mark_delivered',
            ticketId: ticket.ticket_id,
            targetUserId: ticket.user_id,
        });

        // Get ticket channel
        const ticketChannel = guild.channels.cache.get(ticket.discord_channel_id);
        if (ticketChannel) {
            await ticketChannel.send({
                embeds: [createErrorEmbed(
                    'Product Delivered',
                    '📦 Your purchase has been delivered.\n' +
                    'Thank you for your business!\n\n' +
                    'This ticket will be closed in 5 minutes.'
                ).embeds[0]],
            });

            // Auto-close ticket after 5 minutes
            setTimeout(async () => {
                try {
                    await updateTicketStatus(ticket.ticket_id, 'closed');
                    await ticketChannel.delete('Order completed and delivered');
                    logger.info(`Ticket auto-closed after delivery: ${ticket.ticket_id}`);
                } catch (err) {
                    logger.error('Error auto-closing ticket:', err);
                }
            }, 5 * 60 * 1000);
        }

        // Post to deliveries channel
        const deliveriesChannel = guild.channels.cache.find(c => c.name === 'deliveries');
        if (deliveriesChannel) {
            const member = await guild.members.fetch(ticket.user_id);
            await deliveriesChannel.send({
                embeds: [{
                    title: '📦 DELIVERY COMPLETED',
                    description:
                        `**Customer:** ${member.user}\n` +
                        `**Product:** ${ticket.product || 'N/A'}\n` +
                        `**Delivered by:** ${staffMember.user}\n` +
                        `**Date:** <t:${Math.floor(Date.now() / 1000)}:F>`,
                    color: 0x57F287,
                    timestamp: new Date(),
                }],
            });
        }

        logger.info(`Order marked as delivered: ${ticket.ticket_id}`);
        return { success: true };
    } catch (error) {
        logger.error('Error marking as delivered:', error);
        throw error;
    }
}
