import TelegramBot from "node-telegram-bot-api";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// ========== CONFIG ==========
const TOKEN = process.env.BOT_TOKEN;
const CHANNELS = process.env.CHANNELS.split(",");
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
// ============================

// MongoDB Connect
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ Mongo Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  userId: Number,
  name: String,
  balance: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  lastOrder: { type: String, default: "🛒 None" },
  joinedAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", userSchema);

// Express for uptime ping
const app = express();
app.get("/", (req, res) => res.send("✅ Rabbitsmmmini Bot running!"));
app.listen(PORT, () => console.log("🌐 Server active on port", PORT));

// Telegram Bot
const bot = new TelegramBot(TOKEN, { polling: true });

// ====== MAIN MENU ======
const mainMenu = {
  reply_markup: {
    keyboard: [
      ["Create Order"],
      ["Dashboard"],
      ["Deposit"],
      ["Referals"],
      ["Info and FAQs"],
      ["Support"]
    ],
    resize_keyboard: true,
  },
};

// ====== JOIN MESSAGE ======
function getJoinMessage() {
  const chans = CHANNELS.map(c => `👉 ${c}`).join("\n");
  return (
    "𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 𝐑𝐚𝐛𝐛𝐢𝐭𝐬𝐦𝐦 𝐦𝐢𝐧𝐢 💯\n\n" +
    "✋ 𝐓𝐎 𝐒𝐓𝐀𝐑𝐓 𝐓𝐇𝐄 𝐁𝐎𝐓 , 𝐘𝐎𝐔 𝐍𝐄𝐄𝐃 𝐓𝐎 𝐉𝐎𝐈𝐍 𝐎𝐔𝐑 𝐂𝐇𝐀𝐍𝐍𝐄𝐋𝐒..\n\n" +
    `${chans}\n\n✅ 𝐀𝐅𝐓𝐄𝐑 𝐉𝐎𝐈𝐍𝐈𝐍𝐆, 𝐂𝐋𝐈𝐂𝐊 𝐓𝐇𝐄 𝐁𝐔𝐓𝐓𝐎𝐍 𝐁𝐄𝐋𝐎𝐖.`
  );
}

// ====== /start ======
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  // Check if user exists
  let user = await User.findOne({ userId: msg.from.id });
  if (!user) {
    user = await User.create({
      userId: msg.from.id,
      name: msg.from.first_name || "Unknown"
    });
  }

  const opts = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "✅ Joined", callback_data: "check_join" }]
      ],
    },
  };

  await bot.sendMessage(chatId, getJoinMessage(), opts);
});

// ====== JOIN CHECK ======
bot.on("callback_query", async (query) => {
  const userId = query.from.id;
  const chatId = query.message.chat.id;

  if (query.data === "check_join") {
    const notJoined = [];

    for (const ch of CHANNELS) {
      try {
        const member = await bot.getChatMember(ch.trim(), userId);
        if (member.status === "left" || member.status === "kicked") {
          notJoined.push(ch);
        }
      } catch (err) {
        notJoined.push(ch);
      }
    }

    if (notJoined.length > 0) {
      await bot.sendMessage(chatId, `⚠️ এখনো join করো:\n${notJoined.join("\n")}`);
    } else {
      await bot.sendMessage(
        chatId,
        "👋 Hello, Welcome To @Rabbitsmmmini_bot\n\n💸 Deposit Now To Get Started",
        mainMenu
      );
    }

    await bot.answerCallbackQuery(query.id);
  }

  // Deposit & Order from dashboard buttons
  if (query.data === "deposit") {
    await bot.sendMessage(chatId, "💰 Deposit system শীঘ্রই আসছে!");
  }

  if (query.data === "new_order") {
    await bot.sendMessage(chatId, "🛒 এখানে নতুন অর্ডার প্লেস করা যাবে।");
  }
});

// ====== BUTTON ACTIONS ======
bot.on("message", async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;

  // CREATE ORDER
  if (text === "Create Order") {
    await bot.sendMessage(chatId, "🛒 Order system আসছে...");
  }

  // DASHBOARD
  else if (text === "Dashboard") {
    const user = await User.findOne({ userId: msg.from.id });
    const photoUrl = "https://www.rabbit.zone.id/g9affy.jpg";

    const caption = `
📊 *Dashboard*
━━━━━━━━━━━━━━━━━━━━━━
👤 *User:* ${user.name}
💰 *Balance:* ₹${user.balance}
🛒 *Total Orders:* ${user.totalOrders}
📦 *Last Order:* ${user.lastOrder}

📢 *Update:* নতুন সার্ভিস ও দ্রুততর ডেলিভারি এখন লাইভ! ⚡
🔁 এখনই চেক করুন — আরও স্মার্ট, আরও ফাস্ট 💥
━━━━━━━━━━━━━━━━━━━━━━
    `;

    const buttons = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "💸 Deposit", callback_data: "deposit" },
            { text: "🛒 New Order", callback_data: "new_order" }
          ]
        ]
      },
      parse_mode: "Markdown"
    };

    await bot.sendPhoto(chatId, photoUrl, { caption, ...buttons });
  }

  // DEPOSIT
  else if (text === "Deposit") {
    await bot.sendMessage(chatId, "💳 Deposit সিস্টেম শীঘ্রই যুক্ত হবে।");
  }

  // REFERRALS
  else if (text === "Referals") {
    const refLink = `https://t.me/${(await bot.getMe()).username}?start=${msg.from.id}`;
    await bot.sendMessage(chatId, `🔗 আপনার রেফার লিংক:\n${refLink}`);
  }

  // INFO
  else if (text === "Info and FAQs") {
    await bot.sendMessage(chatId, "ℹ️ এখানে বট ব্যবহারের নিয়মাবলী আসবে।");
  }

  // SUPPORT
  else if (text === "Support") {
    await bot.sendMessage(chatId, "💬 যোগাযোগ করুন: @rabbitsupport");
  }
});
