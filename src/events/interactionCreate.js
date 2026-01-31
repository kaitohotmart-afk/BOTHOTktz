import { createUserTicket, getTicketFromChannel } from '../services/ticket-service.js';
import { confirmPayment, rejectPayment, markDelivered } from '../services/payment-service.js';
import { closeTicket } from '../services/ticket-service.js';
import {
    createPayPalInstructionsEmbed,
    createBitcoinInstructionsEmbed,
    createGiftCardInstructionsEmbed,
    createErrorEmbed,
    createStaffControlsRow
} from '../utils/embeds.js';
import { generateBitcoinQR } from '../utils/qr-generator.js';
import { isStaff } from '../utils/validators.js';
import { updateTicketPayment } from '../database/tickets.js';
import logger from '../utils/logger.js';

export const name = 'interactionCreate';

export async function execute(interaction) {
    try {
        console.log(`[DEBUG] Interaction received: ${interaction.type} (ID: ${interaction.id})`);

        // Handle button interactions
        if (interaction.isButton()) {
            console.log(`[DEBUG] Button clicked: ${interaction.customId}`);
            // ✅ IMMEDIATE ACKNOWLEDGMENT
            await interaction.deferReply({ ephemeral: true });

            await handleButtonInteraction(interaction);
        }

        // Handle slash commands
        if (interaction.isCommand()) {
            // Note: Command execution handled in index.js
            console.log(`[DEBUG] Command execution: ${interaction.commandName}`);
            await handleCommandInteraction(interaction);
        }
    } catch (error) {
        logger.error('Error handling interaction:', error);

        const errorResponse = {
            embeds: [createErrorEmbed('Error', error.message || 'An error occurred').embeds[0]],
            ephemeral: true,
        };

        // Always editReply since we deferred
        await interaction.editReply(errorResponse).catch(err => {
            // Fallback if editReply fails
            logger.error('Failed to send error response:', err);
        });
    }
}

async function handleButtonInteraction(interaction) {
    const { customId, guild, member, channel } = interaction;

    // Start Purchase button
    if (customId === 'start_purchase') {
        // deferReply handled globally

        try {
            const result = await createUserTicket(guild, interaction.user);
            await interaction.editReply({
                embeds: [createErrorEmbed('Ticket Created', `✅ Your purchase ticket has been created: ${result.channel}`).embeds[0]],
                ephemeral: true,
            });
        } catch (error) {
            await interaction.editReply({
                embeds: [createErrorEmbed('Error', error.message).embeds[0]],
                ephemeral: true,
            });
        }
        return;
    }

    // Payment method buttons
    if (customId.startsWith('payment_')) {
        // deferReply handled globally

        const paymentMethod = customId.replace('payment_', '');

        // Update ticket payment method
        const ticket = await getTicketFromChannel(channel);
        if (ticket) {
            await updateTicketPayment(ticket.ticket_id, paymentMethod, null);
        }

        if (paymentMethod === 'paypal') {
            await interaction.editReply(createPayPalInstructionsEmbed());
        } else if (paymentMethod === 'bitcoin') {
            const btcWallet = process.env.BTC_WALLET;
            const qrBuffer = await generateBitcoinQR(btcWallet);

            await interaction.editReply({
                ...createBitcoinInstructionsEmbed(),
                files: [{
                    attachment: qrBuffer,
                    name: 'bitcoin-qr.png',
                    description: 'Bitcoin QR Code'
                }],
            });
        } else if (paymentMethod === 'giftcard') {
            await interaction.editReply(createGiftCardInstructionsEmbed());
        }

        // Add staff controls if they don't exist
        setTimeout(async () => {
            try {
                await channel.send({
                    content: '**🛠️ STAFF CONTROLS**',
                    components: [createStaffControlsRow()],
                });
            } catch (err) {
                logger.error('Error sending staff controls:', err);
            }
        }, 2000);

        return;
    }

    // Staff control buttons
    if (customId.startsWith('staff_')) {
        // Check if user is staff
        if (!isStaff(member)) {
            await interaction.editReply({
                embeds: [createErrorEmbed('Permission Denied', 'Only staff members can use this button.').embeds[0]],
                ephemeral: true,
            });
            return;
        }

        const ticket = await getTicketFromChannel(channel);
        if (!ticket) {
            await interaction.editReply({
                embeds: [createErrorEmbed('Error', 'This is not a valid ticket channel.').embeds[0]],
                ephemeral: true,
            });
            return;
        }

        if (customId === 'staff_confirm') {
            // deferReply handled globally

            try {
                await confirmPayment(guild, ticket, member, ticket.amount || 0);
                await interaction.editReply({
                    embeds: [createErrorEmbed('Success', '✅ Payment confirmed successfully!').embeds[0]],
                    ephemeral: true,
                });
            } catch (error) {
                await interaction.editReply({
                    embeds: [createErrorEmbed('Error', error.message).embeds[0]],
                    ephemeral: true,
                });
            }
        } else if (customId === 'staff_reject') {
            // rejection logic requires further input
            await interaction.editReply({
                content: 'Please provide a reason for rejection (type in chat):',
                ephemeral: true,
            });

            // Wait for staff response (simple implementation)
            // In production, you might want to use a modal instead
            const filter = m => m.author.id === member.user.id;
            const collected = await channel.awaitMessages({ filter, max: 1, time: 60000 });

            if (collected.size > 0) {
                const reason = collected.first().content;
                await rejectPayment(guild, ticket, member, reason);
                await collected.first().delete();
            }
        } else if (customId === 'staff_deliver') {
            // deferReply handled globally

            try {
                await markDelivered(guild, ticket, member);
                await interaction.editReply({
                    embeds: [createErrorEmbed('Success', '✅ Order marked as delivered!').embeds[0]],
                    ephemeral: true,
                });
            } catch (error) {
                await interaction.editReply({
                    embeds: [createErrorEmbed('Error', error.message).embeds[0]],
                    ephemeral: true,
                });
            }
        } else if (customId === 'staff_close') {
            // deferReply handled globally

            try {
                await closeTicket(channel, `Closed by ${member.user.username}`);
                await interaction.editReply({
                    embeds: [createErrorEmbed('Success', '✅ Ticket closed!').embeds[0]],
                    ephemeral: true,
                });
            } catch (error) {
                await interaction.editReply({
                    embeds: [createErrorEmbed('Error', error.message).embeds[0]],
                    ephemeral: true,
                });
            }
        }

        return;
    }
}

async function handleCommandInteraction(interaction) {
    // Command handling will be implemented in command files
    logger.info(`Command received: ${interaction.commandName}`);
}
