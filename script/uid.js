const cheerio = require('cheerio');
const axios = require('axios');
const regExCheckURL = /https:\/\/www\.facebook\.com\/[a-zA-Z0-9\.]+/;

async function findUid(link) {
  try {
    const response = await axios.post(
      'https://seomagnifier.com/fbid',
      new URLSearchParams({
        'facebook': '1',
        'sitelink': link
      }),
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': 'PHPSESSID=0d8feddd151431cf35ccb0522b056dc6'
        }
      }
    );
    const id = response.data;
    if (isNaN(id)) {
      const html = await axios.get(link);
      const $ = cheerio.load(html.data);
      const el = $('meta[property="al:android:url"]').attr('content');
      if (!el) {
        throw new Error('UID not found');
      }
      const number = el.split('/').pop();
      return number;
    }
    return id;
  } catch (error) {
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

module.exports.config = {
  name: "uid",
  role: 0,
  credits: "developer",
  description: "Get the user's Facebook UID.",
  hasPrefix: true,
  usages: "{p}uid {p}uid @mention {p}uid fblink",
  cooldown: 0,
  aliases: ["id"],
};

module.exports.run = async function({ api, event, args }) {
  if (event.messageReply) {
    return api.sendMessage(event.messageReply.senderID, event.threadID);
  }

  if (!args[0]) {
    return api.sendMessage(event.senderID, event.threadID);
  }

  if (args[0].match(regExCheckURL)) {
    let msg = '';
    for (const link of args) {
      try {
        const uid = await findUid(link);
        msg += `${link} => ${uid}\n`;
      } catch (error) {
        msg += `${link} (ERROR) => ${error.message}\n`;
      }
    }
    return api.sendMessage(msg.trim(), event.threadID);
  }

  const { mentions } = event;
  if (Object.keys(mentions).length > 0) {
    let msg = '';
    for (const mentionID in mentions) {
      const name = mentions[mentionID].replace("@", "");
      msg += `${name}: ${mentionID}\n`;
    }
    return api.sendMessage(msg.trim(), event.threadID);
  }

  return api.sendMessage("𝖯𝗅𝖾𝖺𝗌𝖾 𝗍𝖺𝗀 𝗌𝗈𝗆𝖾𝗈𝗇𝖾 𝗈𝗋 𝗉𝗋𝗈𝗏𝗂𝖽𝖾 𝖺 𝗉𝗋𝗈𝖿𝗂𝗅𝖾 𝗅𝗂𝗇𝗄.", event.threadID);
};