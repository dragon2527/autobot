const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "sendnoti",
  version: "1.1.0",
  role: 2,
  description: "Sends a message to all groups and can only be done by the admin.",
  hasPrefix: true,
  aliases: ["noti"],
  usages: "[Text]",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args, admin }) {
  if (!admin.includes(event.senderID))
   return api.sendMessage("𝖳𝗁𝗂𝗌 𝖢𝗈𝗆𝗆𝖺𝗇𝖽 𝗂𝗌 𝗈𝗇𝗅𝗒 𝖿𝗈𝗋 𝖠𝖴𝖳𝖮𝖡𝖮𝖳 𝖠𝖣𝖬𝖨𝖭 𝖮𝖭𝖫𝖸!", event.threadID, event.messageID);
  const threadList = await api.getThreadList(100, null, ["INBOX"]);
  let sentCount = 0;
  const custom = args.join(" ");

  async function sendMessage(thread) {
    try {
      await api.sendMessage(
`╭┈ ❒ 𝗡𝗢𝗧𝗜 𝗙𝗥𝗢𝗠 𝗔𝗗𝗠𝗜𝗡 
│
╰┈➤ ${custom}`,
        thread.threadID
      );
      sentCount++;
    } catch (error) {
      console.error("Error sending a message:", error);
    }
  }

  for (const thread of threadList) {
    if (sentCount >= 20) {
      break;
    }
    if (thread.isGroup && thread.name != thread.threadID && thread.threadID != event.threadID) {
      await sendMessage(thread);
    }
  }

  if (sentCount > 0) {
    api.sendMessage(`› 𝖲𝖾𝗇𝗍 𝗍𝗁𝖾 𝗇𝗈𝗍𝗂𝖿𝗂𝖼𝖺𝗍𝗂𝗈𝗇 𝗌𝗎𝖼𝖼𝖾𝗌𝗌𝖿𝗎𝗅𝗅𝗒.`, event.threadID);
  } else {
    api.sendMessage(
      "› 𝖭𝗈 𝖾𝗅𝗂𝗀𝗂𝖻𝗅𝖾 𝗀𝗋𝗈𝗎𝗉 𝗍𝗁𝗋𝖾𝖺𝖽𝗌 𝖿𝗈𝗎𝗇𝖽 𝗍𝗈 𝗌𝖾𝗇𝖽 𝗍𝗁𝖾 𝗆𝖾𝗌𝗌𝖺𝗀𝖾 𝗍𝗈.",
      event.threadID
    );
  }
};