const axios = require('axios');
const fs = require("fs");

module.exports.config = {
  name: "pinterest",
  aliases: ["pin"],
  version: "1.0.1",
  role: 0,
  credits: "Kaizenji",
  hasPrefix: true,
  description: { en: "search image using pinterest" },
  category: "image",
  cooldown: 20,
};

module.exports.run = async function({ api, event, args }) {
  let text = args.join(" ");
  const search = text.split(">")[0].trim();

  if (!search) {
    return api.sendMessage("🖼 | 𝖧𝗈𝗐 𝗍𝗈 𝗎𝗌𝖾 𝗉𝗂𝗇𝗍𝖾𝗋𝖾𝗌𝗍 𝖼𝗈𝗆𝗆𝖺𝗇𝖽?\n\n𝖤𝗑𝖺𝗆𝗉𝗅𝖾: 𝗉𝗂𝗇𝗍𝖾𝗋𝖾𝗌𝗍 𝖼𝖺𝗍𝗌 -5", event.threadID, event.messageID);
  }

  let count = text.includes("-") ? parseInt(text.split("-")[1].trim()) : 4;
  if (count > 10) count = 10;

  try {
    const response = await axios.get(`https://kaizenji-rest-api.onrender.com/pinterest?search=${search}`);
    const searchMessageID = await api.sendMessage('🖼 | 𝖯𝗂𝗇𝗍𝖾𝗋𝖾𝗌𝗍 𝗂𝗌 𝗌𝖾𝖺𝗋𝖼𝗁𝗂𝗇𝗀, 𝗉𝗅𝖾𝖺𝗌𝖾 𝗐𝖺𝗂𝗍...', event.threadID);
    setTimeout(() => {
      api.unsendMessage(searchMessageID);
    }, 3000);

    const data = response.data;

    if (data.error) {
      return api.sendMessage(data.error, event.threadID);
    } else {
      let attachment = [];
      let storedPath = [];

      for (let i = 0; i < data.count && i < count; i++) {
        let path = __dirname + "/cache/" + Math.floor(Math.random() * 99999999) + ".jpg";
        let pic = await axios.get(data.data[i], { responseType: "arraybuffer" });

        fs.writeFileSync(path, pic.data);
        storedPath.push(path);
        attachment.push(fs.createReadStream(path));
      }

      api.sendMessage({
        body: `🖼 | 𝖯𝗂𝗇𝗍𝖾𝗋𝖾𝗌𝗍 (𝖱𝖾𝗌𝗎𝗅𝗍𝗌)\n\n👁‍🗨 | 𝖯𝗋𝗈𝗆𝗉𝗍: '${search}'\n\n✒ | 𝖢𝗈𝗎𝗇𝗍: ${attachment.length} - ${data.count}`,
        attachment: attachment
      }, event.threadID, () => {

        for (const item of storedPath) {
          fs.unlinkSync(item);
        }
      }, event.messageID);
    }
  } catch (error) {
    console.error(error);
    return api.sendMessage("💀 | API SUCKS BRO.", event.threadID);
  }
};