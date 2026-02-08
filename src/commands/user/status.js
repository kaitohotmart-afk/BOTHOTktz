import { SlashCommandBuilder } from 'discord.js';
import { getUserActiveTickets } from '../../database/tickets.js';
import { createErrorEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check the status of your active tickets');

export async function execute(interaction) {


    try {
        const tickets = await getUserActiveTickets(interaction.user.id, interaction.guildId);

        if (tickets.length === 0) {
            await interaction.editReply({
                embeds: [{
                    title: '📋 Your Tickets',
                    description: 'You don\'t have any active tickets.\n\nUse `/ticket` or click "Start Purchase" in #mega-menu to create one!',
                    color: 0x3498DB,
                }],
                ephemeral: true,
            });
            return;
        }

        const ticketList = tickets.map(t => {
            const statusEmoji = {
                pending: '⏳',
                confirmed: '✅',
                rejected: '❌',
                delivered: '📦',
                closed: '🔒',
            }[t.status] || '❓';

            return `${statusEmoji} <#${t.discord_channel_id}> - Status: **${t.status}**`;
        }).join('\n');

        await interaction.editReply({
            embeds: [{
                title: '📋 Your Active Tickets',
                description: ticketList,
                color: 0x3498DB,
                footer: { text: `Total active tickets: ${tickets.length}` },
            }],
            ephemeral: true,
        });
    } catch (error) {
        await interaction.editReply({
            embeds: [createErrorEmbed('Error', 'Failed to fetch ticket status.').embeds[0]],
            ephemeral: true,
        });
    }
}
