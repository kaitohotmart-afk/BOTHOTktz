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

    // Send mega menu to #mega-menu channel in all guilds the bot is in
    try {
        client.guilds.cache.forEach(async (guild) => {
            const megaMenuChannel = guild.channels.cache.find(c => c.name === 'mega-menu');
            if (megaMenuChannel) {
                // Delete old messages
                const messages = await megaMenuChannel.messages.fetch({ limit: 10 });
                const oldMessages = messages.filter(m => m.author.id === client.user.id);
                if (oldMessages.size > 0) {
                    await megaMenuChannel.bulkDelete(oldMessages);
                }

                // Send new mega menu
                await megaMenuChannel.send(createMegaMenuEmbed());
                logger.info(`Mega menu sent to #${megaMenuChannel.name} in guild: ${guild.name}`);
            }
        });
    } catch (error) {
        logger.error('Error sending mega menu:', error);
    }
}
