import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getCustomerStats } from '../../database/customers.js';
import { getPendingTickets } from '../../database/tickets.js';
import { isStaff } from '../../utils/validators.js';
import { createErrorEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View sales statistics (Staff only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction) {
    if (!isStaff(interaction.member)) {
        await interaction.editReply({
            embeds: [createErrorEmbed('Permission Denied', 'This command is only available to staff members.').embeds[0]],
            ephemeral: true,
        });
        return;
    }



    try {
        const stats = await getCustomerStats(interaction.guildId);
        const pendingTickets = await getPendingTickets(interaction.guildId);

        await interaction.editReply({
            embeds: [{
                title: '📊 Sales Statistics',
                fields: [
                    {
                        name: '👥 Total Customers',
                        value: stats.totalCustomers.toString(),
                        inline: true,
                    },
                    {
                        name: '🛒 Total Purchases',
                        value: stats.totalPurchases.toString(),
                        inline: true,
                    },
                    {
                        name: '💰 Total Revenue',
                        value: `$${stats.totalRevenue.toFixed(2)}`,
                        inline: true,
                    },
                    {
                        name: '⏳ Pending Tickets',
                        value: pendingTickets.length.toString(),
                        inline: true,
                    },
                ],
                color: 0x3498DB,
                timestamp: new Date(),
                footer: { text: 'Sales Bot Statistics' },
            }],
            ephemeral: true,
        });
    } catch (error) {
        await interaction.editReply({
            embeds: [createErrorEmbed('Error', 'Failed to fetch statistics.').embeds[0]],
            ephemeral: true,
        });
    }
}
