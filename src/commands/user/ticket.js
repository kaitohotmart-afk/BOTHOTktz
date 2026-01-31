import { SlashCommandBuilder } from 'discord.js';
import { createUserTicket } from '../../services/ticket-service.js';
import { createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export const data = new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create a new purchase ticket');

export async function execute(interaction) {


    try {
        const result = await createUserTicket(interaction.guild, interaction.user);

        await interaction.editReply({
            embeds: [{
                title: '✅ Ticket Created',
                description: `Your purchase ticket has been created: ${result.channel}`,
                color: 0x57F287,
            }],
            ephemeral: true,
        });

        logger.info(`Ticket created via command by ${interaction.user.username}`);
    } catch (error) {
        await interaction.editReply({
            embeds: [createErrorEmbed('Error', error.message).embeds[0]],
            ephemeral: true,
        });
    }
}
