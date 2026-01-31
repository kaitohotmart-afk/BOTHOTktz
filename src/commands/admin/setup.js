import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { createMegaMenuEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export const data = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Set up server channels and roles (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {


    const guild = interaction.guild;
    let setupLog = '**🔧 Server Setup Started**\n\n';

    try {
        // Create roles
        logger.info('Creating roles...');
        setupLog += '**Roles:**\n';

        const roles = {
            Staff: { color: 0xE74C3C, permissions: ['ManageMessages', 'ManageChannels'] },
            Customer: { color: 0x3498DB, permissions: [] },
            Support: { color: 0x2ECC71, permissions: [] },
        };

        for (const [roleName, roleConfig] of Object.entries(roles)) {
            let role = guild.roles.cache.find(r => r.name === roleName);
            if (!role) {
                role = await guild.roles.create({
                    name: roleName,
                    color: roleConfig.color,
                    reason: 'Sales bot setup',
                });
                setupLog += `✅ Created role: ${roleName}\n`;
            } else {
                setupLog += `⚠️ Role already exists: ${roleName}\n`;
            }
        }

        setupLog += '\n**Categories and Channels:**\n';

        // Create PURCHASES category
        let purchasesCategory = guild.channels.cache.find(c => c.name === 'PURCHASES' && c.type === ChannelType.GuildCategory);
        if (!purchasesCategory) {
            purchasesCategory = await guild.channels.create({
                name: 'PURCHASES',
                type: ChannelType.GuildCategory,
            });
            setupLog += '✅ Created category: PURCHASES\n';
        } else {
            setupLog += '⚠️ Category already exists: PURCHASES\n';
        }

        // Create mega-menu channel
        let megaMenuChannel = guild.channels.cache.find(c => c.name === 'mega-menu');
        if (!megaMenuChannel) {
            megaMenuChannel = await guild.channels.create({
                name: 'mega-menu',
                type: ChannelType.GuildText,
                parent: purchasesCategory.id,
            });
            setupLog += '✅ Created channel: #mega-menu\n';

            // Send mega menu
            await megaMenuChannel.send(createMegaMenuEmbed());
        } else {
            setupLog += '⚠️ Channel already exists: #mega-menu\n';
        }

        // Create group-vip channel
        const customerRole = guild.roles.cache.find(r => r.name === 'Customer');
        let groupVipChannel = guild.channels.cache.find(c => c.name === 'group-vip');
        if (!groupVipChannel) {
            groupVipChannel = await guild.channels.create({
                name: 'group-vip',
                type: ChannelType.GuildText,
                parent: purchasesCategory.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    ...(customerRole ? [{
                        id: customerRole.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    }] : []),
                ],
            });
            setupLog += '✅ Created channel: #group-vip\n';
        } else {
            setupLog += '⚠️ Channel already exists: #group-vip\n';
        }

        // Create PREVIEWS category
        let previewsCategory = guild.channels.cache.find(c => c.name === 'PREVIEWS' && c.type === ChannelType.GuildCategory);
        if (!previewsCategory) {
            previewsCategory = await guild.channels.create({
                name: 'PREVIEWS',
                type: ChannelType.GuildCategory,
            });
            setupLog += '✅ Created category: PREVIEWS\n';
        } else {
            setupLog += '⚠️ Category already exists: PREVIEWS\n';
        }

        // Create preview channels
        const previewChannels = ['previews', 'my-sites', 'files'];
        for (const channelName of previewChannels) {
            let channel = guild.channels.cache.find(c => c.name === channelName);
            if (!channel) {
                channel = await guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: previewsCategory.id,
                });
                setupLog += `✅ Created channel: #${channelName}\n`;

                // Send welcome messages
                if (channelName === 'my-sites') {
                    await channel.send({
                        embeds: [{
                            title: '🔗 USEFUL LINKS',
                            description:
                                '**Official Website:** https://incest.gt.tc/?i=1\n' +
                                '**Support Portal:** https://t.me/Chedrice\n' +
                                '**Support 2:** https://t.me/buyherenz',
                            color: 0x3498DB,
                        }],
                    });
                } else if (channelName === 'files') {
                    await channel.send({
                        embeds: [{
                            title: '📁 DOWNLOADABLE FILES',
                            description: 'Available files and resources will be posted here.\nCheck back regularly for updates!',
                            color: 0x3498DB,
                        }],
                    });
                } else if (channelName === 'previews') {
                    await channel.send({
                        embeds: [{
                            title: '👀 PRODUCT PREVIEWS',
                            description: 'Check out samples and previews of our products.\nNew previews added regularly!',
                            color: 0x3498DB,
                        }],
                    });
                }
            } else {
                setupLog += `⚠️ Channel already exists: #${channelName}\n`;
            }
        }

        // Create PAYMENTS category
        const staffRole = guild.roles.cache.find(r => r.name === 'Staff');
        let paymentsCategory = guild.channels.cache.find(c => c.name === 'PAYMENTS' && c.type === ChannelType.GuildCategory);
        if (!paymentsCategory) {
            paymentsCategory = await guild.channels.create({
                name: 'PAYMENTS',
                type: ChannelType.GuildCategory,
            });
            setupLog += '✅ Created category: PAYMENTS\n';
        } else {
            setupLog += '⚠️ Category already exists: PAYMENTS\n';
        }

        // Create payment channels (staff only)
        const paymentChannels = ['proofs', 'deliveries', 'telegram'];
        for (const channelName of paymentChannels) {
            let channel = guild.channels.cache.find(c => c.name === channelName);

            const isPublic = channelName === 'telegram';

            if (!channel) {
                channel = await guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: paymentsCategory.id,
                    permissionOverwrites: isPublic ? [] : [
                        {
                            id: guild.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        ...(staffRole ? [{
                            id: staffRole.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                        }] : []),
                    ],
                });
                setupLog += `✅ Created channel: #${channelName}\n`;

                // Send welcome message to telegram
                if (channelName === 'telegram') {
                    await channel.send({
                        embeds: [{
                            title: '📱 TELEGRAM CONTACT',
                            description:
                                'For faster support, join our Telegram:\n' +
                                'https://t.me/Chedrice and https://t.me/buyherenz\n\n' +
                                'Available 24/7 for urgent inquiries.',
                            color: 0x0088CC,
                        }],
                    });
                }
            } else {
                setupLog += `⚠️ Channel already exists: #${channelName}\n`;
            }
        }

        setupLog += '\n✅ **Setup completed successfully!**';
        logger.info('Server setup completed');

        await interaction.editReply({
            content: setupLog,
            ephemeral: true,
        });

    } catch (error) {
        logger.error('Error during setup:', error);
        await interaction.editReply({
            content: `❌ Error during setup: ${error.message}`,
            ephemeral: true,
        });
    }
}
