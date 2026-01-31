import dotenv from 'dotenv';
dotenv.config();

import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { client, validateConfig } from './config/discord.js';
import { Collection } from 'discord.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate environment configuration
try {
    validateConfig();
    logger.info('✅ Environment configuration validated');
} catch (error) {
    logger.error('❌ Configuration error:', error);
    process.exit(1);
}

// Initialize commands collection
client.commands = new Collection();

// Load command files
async function loadCommands() {
    const commandFolders = ['user', 'staff', 'admin'];

    for (const folder of commandFolders) {
        const commandsPath = join(__dirname, 'commands', folder);
        try {
            const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = join(commandsPath, file);
                const command = await import(`file://${filePath}`);

                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    logger.info(`Loaded command: ${command.data.name}`);
                } else {
                    logger.warn(`Command at ${filePath} is missing required "data" or "execute" property`);
                }
            }
        } catch (error) {
            logger.error(`Error loading commands from ${folder}:`, error);
        }
    }
}

// Load event files
async function loadEvents() {
    const eventsPath = join(__dirname, 'events');
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = join(eventsPath, file);
        const event = await import(`file://${filePath}`);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }

        logger.info(`Loaded event: ${event.name}`);
    }
}

// Handle slash commands in interactionCreate
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        logger.warn(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        // ✅ DEFER IMMEDIATELY to prevent "Application did not respond"
        await interaction.deferReply({ ephemeral: true });

        await command.execute(interaction);
    } catch (error) {
        logger.error(`Error executing command ${interaction.commandName}:`, error);

        const errorResponse = {
            content: '❌ There was an error while executing this command!',
            ephemeral: true,
        };

        // Since we deferred at the start, we always use editReply
        await interaction.editReply(errorResponse).catch(err => {
            // Fallback if editReply fails (e.g. interaction invalid)
            logger.error('Failed to send error response:', err);
        });
    }
});

// Error handling
process.on('unhandledRejection', error => {
    logger.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    logger.error('Uncaught exception:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

// Initialize and start bot
async function start() {
    try {
        logger.info('🚀 Starting Discord Sales Bot...');

        // Load commands and events
        await loadCommands();
        await loadEvents();

        // Login to Discord
        await client.login(process.env.DISCORD_BOT_TOKEN);
    } catch (error) {
        logger.error('Failed to start bot:', error);
        process.exit(1);
    }
}

start();
