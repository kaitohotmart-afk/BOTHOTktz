import { AttachmentBuilder } from 'discord.js';
import { getTicketFromChannel } from '../services/ticket-service.js';
import { createProofEmbed, createSuccessEmbed } from '../utils/embeds.js';
import { validateFileUpload, isTicketChannel } from '../utils/validators.js';
import { isRateLimited } from '../utils/rate-limiter.js';
import logger from '../utils/logger.js';

export const name = 'messageCreate';

const FILE_UPLOAD_LIMIT = 5; // 5 files per 10 minutes
const FILE_UPLOAD_WINDOW = 10 * 60 * 1000; // 10 minutes

export async function execute(message) {
    // Ignore bot messages
    if (message.author.bot) return;

    // Check if message is in a ticket channel
    if (!isTicketChannel(message.channel.name)) return;

    // Check if message has attachments
    if (message.attachments.size === 0) return;

    try {
        // Check rate limit for file uploads
        if (isRateLimited(message.author.id, 'file_upload', FILE_UPLOAD_LIMIT, FILE_UPLOAD_WINDOW)) {
            await message.reply({
                embeds: [createSuccessEmbed('Rate Limit', 'Please wait before uploading more files. Maximum 5 files per 10 minutes.').embeds[0]],
            });
            return;
        }

        // Get ticket from database
        const ticket = await getTicketFromChannel(message.channel);
        if (!ticket) {
            logger.warn(`File uploaded in channel ${message.channel.name} but no ticket found in database`);
            return;
        }

        // Process attachments
        for (const attachment of message.attachments.values()) {
            // Validate file
            const validation = validateFileUpload(attachment);
            if (!validation.valid) {
                await message.reply({
                    content: `❌ ${validation.error}`,
                });
                continue;
            }

            // Send confirmation to user
            await message.react('✅');

            // Forward to proofs channel
            const proofsChannel = message.guild.channels.cache.find(c => c.name === 'proofs');
            if (proofsChannel) {
                const proofEmbed = createProofEmbed(
                    message.author,
                    message.channel,
                    ticket.payment_method,
                    attachment
                );

                await proofsChannel.send({
                    content: `<@&${process.env.STAFF_ROLE_ID || ''}>`,
                    ...proofEmbed,
                });

                logger.info(`Payment proof forwarded to #proofs for ticket: ${ticket.ticket_id}`);
            }
        }

        // Send confirmation message
        await message.reply({
            embeds: [createSuccessEmbed(
                'Payment Proof  Received',
                '✅ Your payment proof has been submitted!\n\n' +
                'Staff will verify it shortly.\n' +
                '⏰ Average verification time: 5-30 minutes'
            ).embeds[0]],
        });

    } catch (error) {
        logger.error('Error processing file upload:', error);
        await message.reply('❌ An error occurred while processing your file. Please try again.');
    }
}
