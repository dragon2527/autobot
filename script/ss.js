const axios = require("axios");
const fs = require("fs");

module.exports.config = {
  name: "ss",
  version: "1.0.0",
  role: 0,
  credits: "Kaizenji",
  description: "Generate a screenshot from a URL.",
  cooldown: 5,
  hasPrefix: false,
  usage: "[url]",
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
    return api.sendMessage(applyFontMapping("❌ | Please provide a URL."), tid, (err, info) => {
      setTimeout(() => api.unsendMessage(info.messageID), 3000);
    }, mid);
  }

  const url = args.join(" ");

  const loadingMessage = await api.sendMessage(applyFontMapping(`✨ | Taking screenshot for ${url}...`), tid);

  try {
    const response = await axios.get(`https://image.thum.io/get/width/1920/crop/400/fullpage/noanimate/${url}`, { responseType: "arraybuffer" });
    const screenshotBuffer = response.data;

    const outputPath = __dirname + `/cache/screenshot_${tid}_${mid}.png`;
    fs.writeFileSync(outputPath, Buffer.from(screenshotBuffer));

    await api.unsendMessage(loadingMessage.messageID);
    api.sendMessage({
      body: applyFontMapping(`📸 | Here's your screenshot of ${url}`),
      attachment: fs.createReadStream(outputPath),
    }, tid, () => {
      fs.unlinkSync(outputPath);
    }, mid);

  } catch (error) {
    await api.unsendMessage(loadingMessage.messageID);
    api.sendMessage(applyFontMapping(`❌ | Failed to take screenshot: ${error.message}`), tid, mid);
  }
};