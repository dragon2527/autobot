const fs = require('fs');
const path = require('path');

let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };

  return text.split('').map(char => fontEnabled && char in fontMapping ? fontMapping[char] : char).join('');
}

module.exports.config = {
  name: "kick",
  version: "1.0.0",
  role: 2,
  hasPrefix: false,
  description: "Kick mentioned users from the group chat",
  usages: "kick @mention1 @mention2 ...",
  credits: "chilli",
  cooldowns: 0
};

module.exports.run = async ({ api, event, admin }) => {
  const eventSenderID = event.senderID.toString();
  
  if (!admin.includes(eventSenderID)) {
    return api.sendMessage(formatFont("𝖸𝗈𝗎 𝖽𝗈𝗇'𝗍 𝗁𝖺𝗏𝖾 𝗉𝖾𝗋𝗆𝗂𝗌𝗌𝗂𝗈𝗇 𝗍𝗈 𝗎𝗌𝖾 𝗍𝗁𝗂𝗌 𝖼𝗈𝗆𝗆𝖺𝗇𝖽."), event.threadID, event.messageID);
  }

  try {
    const botID = api.getCurrentUserID();
    const threadInfo = await api.getThreadInfo(event.threadID);

    if (!threadInfo.adminIDs.some(admin => admin.id === botID)) {
      return api.sendMessage(formatFont("I need to be an admin to kick users. Please make me an admin first."), event.threadID, event.messageID);
    }

    const mentions = event.mentions;
    let usersToKick = [];

    if (event.messageReply) {
      usersToKick.push(event.messageReply.senderID);
    } else if (Object.keys(mentions).length > 0) {
      usersToKick = Object.keys(mentions);
    } else {
      return api.sendMessage(formatFont("Please mention the users you want to kick or reply to their message."), event.threadID, event.messageID);
    }

    let message = formatFont("Kicked the following users:\n\n");
    
    for (const userID of usersToKick) {
      try {
        await api.removeUserFromGroup(userID, event.threadID);
        message += `${userID}\n`;
      } catch (error) {
        message += formatFont(`Failed to kick user: ${userID}\n`);
      }
    }

    api.sendMessage(message, event.threadID);
  } catch (error) {
    api.sendMessage(formatFont(`Error: ${error.message}`), event.threadID, event.messageID);
  }
};