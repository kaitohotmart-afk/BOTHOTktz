import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

/**
 * Reusable embed templates for consistency
 */

const COLORS = {
    PRIMARY: 0x5865F2,
    SUCCESS: 0x57F287,
    WARNING: 0xFEE75C,
    DANGER: 0xED4245,
    INFO: 0x3498DB,
};

/**
 * Create mega menu embed for main purchase interface
 */
export function createMegaMenuEmbed() {
    const embed = new EmbedBuilder()
        .setTitle('🛒 SALES MENU')
        .setDescription(
            '**Welcome to our automated sales system!**\n\n' +
            'Click the button below to start your purchase:\n\n' +
            '✅ **Quick & Easy Process**\n' +
            '💳 **Multiple Payment Methods**\n' +
            '🔒 **Secure Transactions**\n' +
            '⚡ **Fast Delivery**\n\n' +
            '_Average response time: 5-30 minutes_'
        )
        .setColor(COLORS.PRIMARY)
        .setTimestamp()
        .setFooter({ text: 'Secure Payment System' });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('start_purchase')
                .setLabel('🎫 Start Purchase')
                .setStyle(ButtonStyle.Success)
        );

    return { embeds: [embed], components: [row] };
}

/**
 * Create ticket welcome embed
 */
export function createTicketWelcomeEmbed(user) {
    const embed = new EmbedBuilder()
        .setTitle('🎫 PURCHASE TICKET')
        .setDescription(
            `Hello ${user}! Welcome to your private purchase channel.\n\n` +
            '**Please follow these steps:**\n\n' +
            '1️⃣ Choose your payment method using the buttons below\n' +
            '2️⃣ Follow the instructions provided for your chosen method\n' +
            '3️⃣ Upload payment proof/screenshot in this channel\n' +
            '4️⃣ Wait for staff confirmation\n' +
            '5️⃣ Receive your product after verification\n\n' +
            '⏰ Average response time: 5-30 minutes'
        )
        .setColor(COLORS.INFO)
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('payment_paypal')
                .setLabel('💳 PayPal')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('payment_bitcoin')
                .setLabel('₿ Bitcoin')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('payment_giftcard')
                .setLabel('🎁 Gift Card')
                .setStyle(ButtonStyle.Primary)
        );

    return { embeds: [embed], components: [row] };
}

/**
 * Create PayPal payment instructions embed
 */
export function createPayPalInstructionsEmbed() {
    const paypalEmail = process.env.PAYPAL_EMAIL;

    const embed = new EmbedBuilder()
        .setTitle('💳 PAYPAL PAYMENT INSTRUCTIONS')
        .setDescription(
            `📧 **PayPal Email:** \`${paypalEmail}\`\n\n` +
            '⚠️ **IMPORTANT - READ CAREFULLY:**\n\n' +
            '**Step 1:** Send payment to the email above\n' +
            '**Step 2:** You MUST select "Friends & Family" option\n' +
            '**Step 3:** DO NOT use "Goods & Services" - payments sent this way will be REJECTED and refunded\n' +
            '**Step 4:** After sending, take a screenshot of the payment confirmation\n' +
            '**Step 5:** Upload the screenshot in this channel\n' +
            '**Step 6:** Wait for staff verification\n\n' +
            '✅ **Required in screenshot:**\n' +
            '• Transaction ID\n' +
            '• Amount sent\n' +
            `• Recipient email (${paypalEmail})\n` +
            '• "Friends & Family" confirmation\n\n' +
            '⏳ Please wait for staff confirmation after uploading proof.'
        )
        .setColor(COLORS.PRIMARY)
        .setTimestamp();

    return { embeds: [embed] };
}

/**
 * Create Bitcoin payment instructions embed
 */
export function createBitcoinInstructionsEmbed() {
    const btcWallet = process.env.BTC_WALLET;

    const embed = new EmbedBuilder()
        .setTitle('₿ BITCOIN PAYMENT INSTRUCTIONS')
        .setDescription(
            `🔐 **BTC Wallet Address:**\n\`${btcWallet}\`\n\n` +
            '🌐 **Network:** Bitcoin (BTC) - Native SegWit\n\n' +
            '⚠️ **IMPORTANT - READ CAREFULLY:**\n\n' +
            '**Step 1:** Copy the wallet address above OR scan the QR code\n' +
            '**Step 2:** VERIFY you are using Bitcoin (BTC) network\n' +
            '**Step 3:** Send the EXACT amount for your purchase\n' +
            '**Step 4:** Wait for blockchain confirmation (usually 10-30 minutes)\n' +
            '**Step 5:** Take a screenshot showing:\n' +
            '   • Transaction hash (TXID)\n' +
            '   • Amount sent\n' +
            '   • Confirmation status\n' +
            '   • Destination address\n' +
            '**Step 6:** Upload the screenshot in this channel\n' +
            '**Step 7:** Wait for staff verification\n\n' +
            '⚠️ **WARNING:**\n' +
            '• Double-check the address before sending\n' +
            '• Sending to wrong address = LOST FUNDS\n' +
            '• Make sure network is BTC (not BEP20, ERC20, etc.)\n\n' +
            '⏳ Blockchain confirmations may take 10-60 minutes'
        )
        .setColor(0xF7931A) // Bitcoin orange
        .setTimestamp();

    return { embeds: [embed] };
}

/**
 * Create Gift Card payment instructions embed
 */
export function createGiftCardInstructionsEmbed() {
    const giftCardUrl = process.env.GIFTCARD_URL;

    const embed = new EmbedBuilder()
        .setTitle('🎁 BINANCE GIFT CARD PAYMENT INSTRUCTIONS')
        .setDescription(
            `🌐 **Purchase Website:**\n${giftCardUrl}\n\n` +
            '⚠️ **IMPORTANT - READ CAREFULLY:**\n\n' +
            '**Step 1:** Click the link above to access G2A\n' +
            '**Step 2:** Search for "Binance Gift Card GLOBAL"\n' +
            '**Step 3:** ⚠️ MUST be GLOBAL gift card (not regional)\n' +
            '**Step 4:** Purchase a gift card matching your product\'s price\n' +
            '**Step 5:** After purchase, you will receive a code (format: XXXX-XXXX-XXXX-XXXX)\n' +
            '**Step 6:** Copy the COMPLETE gift card code\n' +
            '**Step 7:** Paste the code in this channel OR upload a screenshot\n' +
            '**Step 8:** Wait for staff to redeem and verify\n\n' +
            '✅ **Accepted Gift Cards:**\n' +
            '• Binance Gift Card GLOBAL only\n' +
            '• Must match the purchase amount\n' +
            '• Code must be unused/unredeemed\n\n' +
            '❌ **NOT Accepted:**\n' +
            '• Regional gift cards\n' +
            '• Partially used codes\n' +
            '• Expired codes\n\n' +
            '⏳ Verification time: 5-15 minutes after code submission'
        )
        .setColor(COLORS.WARNING)
        .setTimestamp();

    return { embeds: [embed] };
}

/**
 * Create staff control panel  buttons
 */
export function createStaffControlsRow() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('staff_confirm')
                .setLabel('✅ Confirm Payment')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('staff_reject')
                .setLabel('❌ Reject Payment')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('staff_deliver')
                .setLabel('📦 Mark Delivered')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('staff_close')
                .setLabel('🔒 Close Ticket')
                .setStyle(ButtonStyle.Secondary)
        );
}

/**
 * Create payment proof embed for #proofs channel
 */
export function createProofEmbed(user, ticketChannel, paymentMethod, attachment) {
    const embed = new EmbedBuilder()
        .setTitle('📸 NEW PAYMENT PROOF SUBMITTED')
        .setDescription(
            `**User:** ${user} (ID: ${user.id})\n` +
            `**Ticket:** ${ticketChannel}\n` +
            `**Payment Method:** ${paymentMethod || 'Not specified'}\n` +
            `**Status:** ⏳ Pending Verification`
        )
        .setColor(COLORS.WARNING)
        .setTimestamp()
        .setFooter({ text: 'Payment Proof System' });

    if (attachment) {
        embed.setImage(attachment.url);
    }

    return { embeds: [embed] };
}

/**
 * Create payment confirmation embed
 */
export function createConfirmationEmbed(user, paymentMethod) {
    const embed = new EmbedBuilder()
        .setTitle('✅ PAYMENT CONFIRMED!')
        .setDescription(
            `Thank you for your purchase, ${user}! Your payment has been verified.\n\n` +
            '**You now have access to:**\n' +
            '• #group-vip channel\n' +
            '• Exclusive content and updates\n\n' +
            'Your product will be delivered shortly.\n' +
            'Please wait in this channel for delivery.'
        )
        .setColor(COLORS.SUCCESS)
        .setTimestamp();

    return { embeds: [embed] };
}

/**
 * Create delivery confirmation embed for #deliveries channel
 */
export function createDeliveryNotificationEmbed(customer, paymentMethod, confirmedBy) {
    const embed = new EmbedBuilder()
        .setTitle('✅ NEW CONFIRMED PURCHASE')
        .setDescription(
            `**Customer:** ${customer}\n` +
            `**Payment Method:** ${paymentMethod}\n` +
            `**Confirmed by:** ${confirmedBy}\n` +
            `**Date:** <t:${Math.floor(Date.now() / 1000)}:F>`
        )
        .setColor(COLORS.SUCCESS)
        .setTimestamp();

    return { embeds: [embed] };
}

/**
 * Create error embed
 */
export function createErrorEmbed(title, message) {
    const embed = new EmbedBuilder()
        .setTitle(`❌ ${title}`)
        .setDescription(message)
        .setColor(COLORS.DANGER)
        .setTimestamp();

    return { embeds: [embed] };
}

/**
 * Create success embed
 */
export function createSuccessEmbed(title, message) {
    const embed = new EmbedBuilder()
        .setTitle(`✅ ${title}`)
        .setDescription(message)
        .setColor(COLORS.SUCCESS)
        .setTimestamp();

    return { embeds: [embed] };
}

export { COLORS };
