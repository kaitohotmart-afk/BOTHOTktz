# Discord Sales Bot

An automated Discord sales bot with payment processing, ticket system, file uploads, and customer management.

## 🚀 Features

- **Automated Ticket System** - Private purchase channels for each customer
- **Multiple Payment Methods** - PayPal, Bitcoin (BTC), and Gift Cards
- **Payment Proof Uploads** - Secure file upload and verification system
- **Staff Admin Panel** - Confirm, reject, and deliver orders with one click
- **Customer Management** - Automatic VIP role assignment and access control
- **Database Integration** - Supabase PostgreSQL for data persistence
- **Comprehensive Logging** - Winston-based logging system
- **Anti-Spam Protection** - Rate limiting and cooldown mechanisms
- **Slash Commands** - User-friendly command interface

## 📋 Requirements

- Node.js 18.0.0 or higher
- Discord Bot Account
- Supabase Account
- Payment accounts (PayPal, Bitcoin wallet, G2A)

## 🔧 Installation

### 1. Clone or Extract the Project

```bash
cd "d:\SAAS\BOT DE VENDAS"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values. The file already contains your credentials, but you may need to update role IDs after setup.

### 4. Set Up Database

The database tables have already been created via Supabase MCP. You can verify with:

```bash
npm run setup-db
```

### 5. Register Slash Commands

```bash
npm run register-commands
```

### 6. Start the Bot

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

## 🤖 Bot Setup in Discord Server

### 1. Add Bot to Your Server

Use this URL (replace CLIENT_ID with your bot's client ID):
```
https://discord.com/api/oauth2/authorize?client_id=1467076058569248841&permissions=8&scope=bot%20applications.commands
```

### 2. Run Server Setup

Once the bot is online, run the setup command:

```
/setup
```

This will automatically create:
- **PURCHASES** category: `mega-menu`, `group-vip`
- **PREVIEWS** category: `previews`, `my-sites`, `files`
- **PAYMENTS** category: `proofs`, `deliveries`, `telegram`
- Roles: `Staff`, `Customer`, `Support`

### 3. Update Role IDs (Optional)

After roles are created, you can update `.env` with the role IDs for better permission management:

```env
STAFF_ROLE_ID=your_staff_role_id
CUSTOMER_ROLE_ID=your_customer_role_id
SUPPORT_ROLE_ID=your_support_role_id
```

## 📚 Usage

### For Customers

1. **Start a Purchase**
   - Go to `#mega-menu`
   - Click "🎫 Start Purchase" button
   - A private ticket channel will be created

2. **Choose Payment Method**
   - Click your preferred payment button (PayPal, Bitcoin, or Gift Card)
   - Follow the instructions provided

3. **Submit Proof**
   - Upload your payment screenshot/proof in the ticket channel
   - Wait for staff verification

4. **Receive Product**
   - Staff will confirm your payment
   - You'll get VIP access and product delivery

### Slash Commands (Users)

- `/ticket` - Create a new purchase ticket
- `/status` - Check your active tickets
- `/help` - Show help and FAQ

### For Staff

**Staff Control Buttons** (appear in each ticket):
- ✅ **Confirm Payment** - Verify payment and grant access
- ❌ **Reject Payment** - Reject with reason
- 📦 **Mark Delivered** - Mark order as delivered
- 🔒 **Close Ticket** - Close the ticket channel

### Slash Commands (Staff)

- `/stats` - View sales statistics
- `/user-info @user` - View customer purchase history
- `/setup` - Re-run server setup (Admin only)

## 💳 Payment Methods

### PayPal
- **Email:** erikamachava517@gmail.com
- **Method:** Friends & Family ONLY
- **Required:** Transaction ID, amount, screenshot

### Bitcoin (BTC)
- **Wallet:** bc1qt03z0756r5vmq5xh76dzx9svnkan964l3q6txy
- **Network:** Native SegWit (BTC)
- **Required:** TXID, amount, confirmation screenshot

### Gift Card
- **URL:** https://www.g2a.com/category/gift-cards-c6?f%5Bregions%5D%5B0%5D=8355&query=gift%20card%20binance
- **Type:** Binance Gift Card GLOBAL only
- **Required:** Complete gift card code

## 📁 Project Structure

```
d:/SAAS/BOT DE VENDAS/
├── src/
│   ├── index.js              # Main bot entry point
│   ├── config/  
│   │   ├── discord.js        # Discord client setup
│   │   └── supabase.js       # Supabase client setup
│   ├── commands/             # Slash commands
│   │   ├── user/             # User commands
│   │   ├── staff/            # Staff commands
│   │   └── admin/            # Admin commands
│   ├── events/               # Discord event handlers
│   │   ├── ready.js
│   │   ├── interactionCreate.js
│   │   └── messageCreate.js
│   ├── services/             # Business logic
│   │   ├── ticket-service.js
│   │   └── payment-service.js
│   ├── database/             # Database operations
│   │   ├── tickets.js
│   │   ├── customers.js
│   │   ├── transactions.js
│   │   └── staff-actions.js
│   └── utils/                # Utilities
│       ├── embeds.js
│       ├── logger.js
│       ├── qr-generator.js
│       ├── rate-limiter.js
│       └── validators.js
├── scripts/                  # Utility scripts
│   ├── register-commands.js
│   └── setup-database.js
├── logs/                     # Log files
├── .env                      # Environment variables
├── package.json
└── README.md
```

## 🗄️ Database Schema

### Tables

- **tickets** - Purchase tickets
- **customers** - Customer profiles
- **transactions** - Payment transactions
- **staff_actions** - Staff action audit log

See the Supabase dashboard for detailed schema.

## 🔒 Security Notes

**IMPORTANT:**
- Never commit the `.env` file to Git
- Rotate Discord bot token and Supabase keys after this project
- Only grant Staff role to trusted members
- Regularly review `staff_actions` table for auditing

## 🐛 Troubleshooting

### Bot doesn't respond to commands
1. Check if commands are registered: `npm run register-commands`
2. Verify bot has proper permissions in server
3. Check console logs for errors

### Database connection errors
1. Verify Supabase credentials in `.env`
2. Check Supabase project status in dashboard
3. Run `npm run setup-db` to test connection

### Files not uploading
1. Check file size (max 8MB)
2. Verify file type (PNG, JPG, JPEG, PDF only)
3. Check rate limits (5 files per 10 minutes)

### Mega menu not sending
1. Make sure `#mega-menu` channel exists
2. Restart the bot
3. Manually send with `/setup` command

## 📞 Support

For issues or questions:
- Telegram: https://t.me/Chedrice
- Telegram: https://t.me/buyherenz

## 📝 License

ISC

## 🚀 Deployment to Vercel (Optional)

**Note:** This bot uses Discord Gateway which requires a persistent connection. Vercel serverless functions are not ideal for this. Consider using:
- Railway (recommended)
- Heroku
- DigitalOcean App Platform
- Any VPS with Node.js

If you still want Vercel, you'll need to switch to HTTP interactions only.

---

**Made with ❤️ for automated sales**
