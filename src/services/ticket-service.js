import { PermissionFlagsBits, ChannelType } from 'discord.js';
import { createTicket, getUserTicketCount } from '../database/tickets.js';
import { getOrCreateCustomer } from '../database/customers.js';
import { createTicketWelcomeEmbed, createErrorEmbed } from '../utils/embeds.js';
import { isRateLimited, getRemainingCooldown } from '../utils/rate-limiter.js';
import logger from '../utils/logger.js';

const MAX_ACTIVE_TICKETS = 3;
const TICKET_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Create a new ticket for a user
 */
export async function createUserTicket(guild, user) {
    try {
        // Check rate limit
        if (isRateLimited(user.id, 'ticket_create', 1, TICKET_COOLDOWN_MS)) {
            const cooldown = getRemainingCooldown(user.id, 'ticket_create', TICKET_COOLDOWN_MS);
            throw new Error(`Please wait ${cooldown} seconds before creating another ticket.`);
        }

        // Check if user has too many active tickets
        const activeTicketCount = await getUserTicketCount(user.id, guild.id);
        if (activeTicketCount >= MAX_ACTIVE_TICKETS) {
            throw new Error(`You already have ${activeTicketCount} active ticket(s). Maximum allowed: ${MAX_ACTIVE_TICKETS}`);
        }

        // Get or create customer record
        await getOrCreateCustomer(user.id, user.username, guild.id);

        // Get next ticket number for this user
        const ticketNumber = activeTicketCount + 1;
        const ticketId = `ticket-${user.username}-${ticketNumber}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

        // Get staff and support roles
        const staffRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'staff');
        const supportRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'support');

        // Create permissions array
        const permissionOverwrites = [
            {
                id: guild.id, // @everyone
                deny: [PermissionFlagsBits.ViewChannel],
            },
            {
                id: user.id, // Ticket creator
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.ReadMessageHistory,
                ],
            },
        ];

        // Add staff role permissions
        if (staffRole) {
            permissionOverwrites.push({
                id: staffRole.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ManageMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                ],
            });
        }

        // Add support role permissions
        if (supportRole) {
            permissionOverwrites.push({
                id: supportRole.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                ],
            });
        }

        // Create the ticket channel
        const channel = await guild.channels.create({
            name: ticketId,
            type: ChannelType.GuildText,
            permissionOverwrites,
            reason: `Purchase ticket for ${user.username}`,
        });

        logger.info(`Ticket channel created: ${ticketId}`);

        // Save ticket to database
        await createTicket({
            ticketId,
            guildId: guild.id,
            userId: user.id,
            username: user.username,
            channelId: channel.id,
        });

        // Send welcome message with payment buttons
        const welcomeMessage = createTicketWelcomeEmbed(user);
        await channel.send(welcomeMessage);

        return { success: true, channel, ticketId };
    } catch (error) {
        logger.error('Error creating ticket:', error);
        throw error;
    }
}

/**
 * Close a ticket
 */
export async function closeTicket(channel, reason = 'Closed by staff') {
    try {
        const ticketId = channel.name;

        // Send closing message
        await channel.send({
            embeds: [createErrorEmbed('Ticket Closed', `🔒 ${reason}\n\nTicket saved for records.\nThank you!`).embeds[0]],
        });

        logger.info(`Closing ticket: ${ticketId}`);

        // Delete channel after a delay
        setTimeout(async () => {
            try {
                await channel.delete(reason);
                logger.info(`Ticket channel deleted: ${ticketId}`);
            } catch (err) {
                logger.error('Error deleting ticket channel:', err);
            }
        }, 10000); // 10 seconds delay

        return true;
    } catch (error) {
        logger.error('Error closing ticket:', error);
        throw error;
    }
}

/**
 * Get ticket info from channel
 */
export async function getTicketFromChannel(channel) {
    try {
        const ticketId = channel.name;

        if (!ticketId.startsWith('ticket-')) {
            return null;
        }

        const { getTicketById } = await import('../database/tickets.js');
        return await getTicketById(ticketId);
    } catch (error) {
        logger.error('Error getting ticket from channel:', error);
        return null;
    }
}
