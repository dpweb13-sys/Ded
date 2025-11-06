import TelegramBot from "node-telegram-bot-api";
import express from "express";

// ====== CONFIG ======
const TOKEN = process.env.BOT_TOKEN || "YOUR_BOT_TOKEN";
const CHANNELS = (process.env.CHANNELS || "@yourchannel,@yoursecond").split(",");
const PORT = process.env.PORT || 5000;
// ====================

// Telegram Bot (polling)
const bot = new TelegramBot(TOKEN, { polling: true });

// Express for uptime ping
const app = express();
app.get("/", (req, res) => res.send("✅ Rabbitsmmmini Bot is alive!"));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ====== MAIN MENU KEYBOARD ======
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
  const chanList = CHANNELS.map(c => `👉 ${c.trim()}`).join("\n");
  return (
    "𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 𝐑𝐚𝐛𝐛𝐢𝐭𝐬𝐦𝐦 𝐦𝐢𝐧𝐢 💯\n\n" +
    "✋ 𝐓𝐎 𝐒𝐓𝐀𝐑𝐓 𝐓𝐇𝐄 𝐁𝐎𝐓 , 𝐘𝐎𝐔 𝐍𝐄𝐄𝐃 𝐓𝐎 𝐉𝐎𝐈𝐍 𝐎𝐔𝐑 𝐂𝐇𝐀𝐍𝐍𝐄𝐋𝐒..\n\n" +
    `${chanList}\n\n✅ 𝐀𝐅𝐓𝐄𝐑 𝐉𝐎𝐈𝐍𝐈𝐍𝐆, 𝐂𝐋𝐈𝐂𝐊 𝐓𝐇𝐄 𝐁𝐔𝐓𝐓𝐎𝐍 𝐁𝐄𝐋𝐎𝐖.`
  );
}

// ====== /start ======
bot.onText(/\/start/, async (msg) => {
  const joinMsg = getJoinMessage();
  const opts = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "✅ Joined", callback_data: "check_join" }],
      ],
    },
  };
  await bot.sendMessage(msg.chat.id, joinMsg, opts);
});

// ====== JOIN CHECK BUTTON ======
bot.on("callback_query", async (query) => {
  if (query.data === "check_join") {
    const userId = query.from.id;
    const notJoined = [];

    for (const ch of CHANNELS) {
      try {
        const member = await bot.getChatMember(ch.trim(), userId);
        const status = member.status;
        if (status === "left" || status === "kicked") {
          notJoined.push(ch);
        }
      } catch (e) {
        notJoined.push(ch);
      }
    }

    if (notJoined.length > 0) {
      const text =
        "⚠️ আপনি এখনো নিচের চ্যানেল(গুলো)-এ join করেননি:\n" +
        notJoined.join("\n") +
        "\n\nঅনুগ্রহ করে join করে আবার '✅ Joined' চাপুন।";
      await bot.sendMessage(query.message.chat.id, text);
    } else {
      await bot.sendMessage(
        query.message.chat.id,
        "👋 Hello, Welcome To @Rabbitsmmmini_bot\n\n💸 Deposit Now To Get Started",
        mainMenu
      );
    }

    await bot.answerCallbackQuery(query.id);
  }
});

// ====== BUTTON ACTIONS ======
bot.on("message", async (msg) => {
  const text = msg.text;

  if (text === "Create Order") {
    await bot.sendMessage(msg.chat.id, "📦 Order system coming soon...");
  } else if (text === "Dashboard") {
    await bot.sendMessage(msg.chat.id, "📊 Dashboard — balance & history feature soon!");
  } else if (text === "Deposit") {
    await bot.sendMessage(msg.chat.id, "💰 Deposit instructions will appear here.");
  } else if (text === "Referals") {
    await bot.sendMessage(
      msg.chat.id,
      `🔗 Your referral link:\nhttps://t.me/${(await bot.getMe()).username}?start=${msg.from.id}`
    );
  } else if (text === "Info and FAQs") {
    await bot.sendMessage(msg.chat.id, "ℹ️ Info & FAQs — এখানে রুলস/FAQ যুক্ত হবে।");
  } else if (text === "Support") {
    await bot.sendMessage(msg.chat.id, "💬 Support — @rabbitsupport");
  }
});
