import { testConnection } from '../config/supabase.js';
import { createMegaMenuEmbed } from '../utils/embeds.js';
import logger from '../utils/logger.js';

export const name = 'ready';
export const once = true;

export async function execute(client) {
    logger.info(`✅ Bot logged in as ${client.user.tag}`);

    // Test Supabase connection
    await testConnection();

    // Set bot status
    client.user.setPresence({
        activities: [{ name: 'sales | /help', type: 0 }],
        status: 'online',
    });

    logger.info('🤖 Bot is ready and online!');

    // Send mega menu to mega-menu channel if it exists
    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        if (guild) {
            const megaMenuChannel = guild.channels.cache.find(c => c.name === 'mega-menu');
            if (megaMenuChannel) {
                // Delete old messages
                const messages = await megaMenuChannel.messages.fetch({ limit: 10 });
                await megaMenuChannel.bulkDelete(messages.filter(m => m.author.id === client.user.id));

                // Send new mega menu
                await megaMenuChannel.send(createMegaMenuEmbed());
                logger.info('Mega menu sent to #mega-menu channel');
            }
        }
    } catch (error) {
        logger.error('Error sending mega menu:', error);
    }
}
