import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show help and FAQ');

export async function execute(interaction) {
    await interaction.editReply({
        embeds: [{
            title: '❓ Help & FAQ',
            description:
                '**How to make a purchase:**\n' +
                '1. Go to #mega-menu and click "Start Purchase"\n' +
                '2. A private ticket will be created for you\n' +
                '3. Choose your payment method\n' +
                '4. Follow the instructions\n' +
                '5. Upload payment proof\n' +
                '6. Wait for staff confirmation\n\n' +

                '**Available Commands:**\n' +
                '`/ticket` - Create a new purchase ticket\n' +
                '`/status` - Check your active tickets\n' +
                '`/help` - Show this message\n\n' +

                '**Payment Methods:**\n' +
                '💳 **PayPal** - Friends & Family only\n' +
                '₿ **Bitcoin** - BTC Native SegWit\n' +
                '🎁 **Gift Card** - Binance Gift Card GLOBAL\n\n' +

                '**Support:**\n' +
                'Need help? Contact us on Telegram:\n' +
                '• https://t.me/Chedrice\n' +
                '• https://t.me/buyherenz\n\n' +

                '**Average Response Time:** 5-30 minutes',
            color: 0x3498DB,
            timestamp: new Date(),
        }],
        ephemeral: true,
    });
}
