const axios = require("axios");
const fs = require("fs");
const path = require("path");

let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };

  let formattedText = "";
  for (const char of text) {
    if (fontEnabled && char in fontMapping) {
      formattedText += fontMapping[char];
    } else {
      formattedText += char;
    }
  }

  return formattedText;
}

module.exports.config = {
    name: "remini",
    version: "1.0.0",
    role: 0,
    credits: "Kaizenji",
    description: "Enhance an image",
    hasPrefix: false,
    aliases: ["4k"],
    usage: "[remini]",
    cooldown: 20,
};

module.exports.run = async function({ api, event }) {
    try {
        if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
            return api.sendMessage(formatFont("Please reply to an image with this command to enhance it."), event.threadID);
        }

        const attachment = event.messageReply.attachments[0];

        if (attachment.type !== 'photo') {
            return api.sendMessage(formatFont("Please reply to a valid image to enhance."), event.threadID);
        }

        const imageUrl = attachment.url;
        const apiUrl = `https://jonellprojectccapisexplorer.onrender.com/api/remini?imageUrl=${encodeURIComponent(imageUrl)}`;

        api.sendMessage(formatFont("Enhancing the image, please wait..."), event.threadID);

        const response = await axios.get(apiUrl);
        const enhancedImagePath = path.join(__dirname, "cache", "enhancedImage.png");

        const imageResponse = await axios.get(response.data.image_data, { responseType: 'arraybuffer' });
        fs.writeFileSync(enhancedImagePath, imageResponse.data);

        api.sendMessage({
            body: formatFont("Here is your enhanced image:"),
            attachment: fs.createReadStream(enhancedImagePath)
        }, event.threadID, () => {
            fs.unlinkSync(enhancedImagePath);
        });

    } catch (error) {
        api.sendMessage(formatFont("An error occurred while processing the request."), event.threadID);
    }
};