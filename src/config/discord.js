import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits, Partials } from 'discord.js';

// Create Discord client with necessary intents
export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel, Partials.Message],
});

// Export configuration
export const config = {
    token: process.env.DISCORD_BOT_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    guildId: process.env.GUILD_ID,
    publicKey: process.env.DISCORD_PUBLIC_KEY,
};

// Validate required environment variables
export function validateConfig() {
    const required = ['DISCORD_BOT_TOKEN', 'DISCORD_CLIENT_ID', 'GUILD_ID'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    return true;
}
