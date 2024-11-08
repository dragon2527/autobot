const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "pixai",
  version: "1.0.0",
  role: 0,
  credits: "Kaizenji",
  description: "Generate AI art from a prompt using PixAI.",
  cooldown: 5,
  aliases: ["pix"],
  hasPrefix: true,
  usage: "pixai [prompt]",
};

function applyFontMapping(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };

  let formattedText = "";
  for (const char of text) {
    formattedText += fontMapping[char] || char;
  }
  return formattedText;
}

module.exports.run = async function ({ api, event, args }) {
  const tid = event.threadID;
  const mid = event.messageID;

  if (args.length === 0) {
    return api.sendMessage(applyFontMapping("❌ | Please provide your prompt."), tid, (err, info) => {
      setTimeout(() => api.unsendMessage(info.messageID), 3000);
    }, mid);
  }

  const prompt = args.join(" ");
  const loadingMessage = await api.sendMessage(applyFontMapping("✨ | Generating AI art, please wait..."), tid);

  try {
    const apiUrl = `https://www.samirxpikachu.run.place/pixai?prompt=${encodeURIComponent(prompt)}`;
    const response = await axios.get(apiUrl);

    const images = response.data.images;

    if (!images || images.length === 0) {
      await api.unsendMessage(loadingMessage.messageID);
      return api.sendMessage(applyFontMapping("❌ | No images were generated. Try again with a different prompt."), tid, mid);
    }

    const imagePaths = await Promise.all(images.map(async (imageUrl, index) => {
      const outputPath = path.join(__dirname, "cache", `pixai_${tid}_${mid}_${index}.png`);
      const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(outputPath, imageResponse.data);
      return outputPath;
    }));

    await api.unsendMessage(loadingMessage.messageID);

    const attachments = imagePaths.map(imagePath => fs.createReadStream(imagePath));

    api.sendMessage({
      body: applyFontMapping(`✨ | Here are your AI-generated images (${images.length} images):`),
      attachment: attachments
    }, tid, () => {
      imagePaths.forEach(imagePath => fs.unlinkSync(imagePath)); // Clean up cache
    }, mid);

  } catch (error) {
    await api.unsendMessage(loadingMessage.messageID);
    api.sendMessage(applyFontMapping(`❌ | Failed to generate images: ${error.message}`), tid, mid);
  }
};