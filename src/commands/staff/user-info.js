import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getUserTransactions } from '../../database/transactions.js';
import { getCustomer } from '../../database/customers.js';
import { isStaff } from '../../utils/validators.js';
import { createErrorEmbed } from '../../utils/embeds.js';

export const data = new SlashCommandBuilder()
    .setName('user-info')
    .setDescription('View customer information (Staff only)')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user to look up')
            .setRequired(true)
    )
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
        const targetUser = interaction.options.getUser('user');

        const customer = await getCustomer(targetUser.id, interaction.guildId);
        const transactions = await getUserTransactions(targetUser.id, interaction.guildId);

        if (!customer) {
            await interaction.editReply({
                embeds: [{
                    title: '📋 Customer Information',
                    description: `**User:** ${targetUser}\n\nNo purchase history found.`,
                    color: 0x95A5A6,
                }],
                ephemeral: true,
            });
            return;
        }

        const transactionList = transactions.slice(0, 5).map((t, i) =>
            `${i + 1}. **${t.payment_method}** - $${t.amount} - ${t.status} - <t:${Math.floor(new Date(t.created_at).getTime() / 1000)}:R>`
        ).join('\n') || 'No transactions';

        await interaction.editReply({
            embeds: [{
                title: '📋 Customer Information',
                description: `**User:** ${targetUser}\n**User ID:** ${targetUser.id}`,
                fields: [
                    {
                        name: '🛒 Total Purchases',
                        value: customer.total_purchases.toString(),
                        inline: true,
                    },
                    {
                        name: '💰 Total Spent',
                        value: `$${parseFloat(customer.total_spent || 0).toFixed(2)}`,
                        inline: true,
                    },
                    {
                        name: '⭐ VIP Access',
                        value: customer.vip_access ? '✅ Yes' : '❌ No',
                        inline: true,
                    },
                    {
                        name: '📅 First Purchase',
                        value: customer.first_purchase_at
                            ? `<t:${Math.floor(new Date(customer.first_purchase_at).getTime() / 1000)}:F>`
                            : 'N/A',
                        inline: true,
                    },
                    {
                        name: '🕐 Last Purchase',
                        value: customer.last_purchase_at
                            ? `<t:${Math.floor(new Date(customer.last_purchase_at).getTime() / 1000)}:R>`
                            : 'N/A',
                        inline: true,
                    },
                    {
                        name: '📜 Recent Transactions',
                        value: transactionList,
                        inline: false,
                    },
                ],
                color: 0x3498DB,
                timestamp: new Date(),
            }],
            ephemeral: true,
        });
    } catch (error) {
        await interaction.editReply({
            embeds: [createErrorEmbed('Error', 'Failed to fetch user information.').embeds[0]],
            ephemeral: true,
        });
    }
}
