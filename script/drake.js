const axios = require("axios");
const fs = require("fs");

module.exports.config = {
  name: "drake",
  version: "1.0",
  role: 0,
  credits: "Kaizenji",
  description: "Generate a Drake meme using two texts.",
  cooldown: 5,
  hasPrefix: true,
  usage: "drake text1 | text2",
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

  if (args.length === 0 || !args.join(" ").includes("|")) {
    return api.sendMessage(applyFontMapping("Usage: drake text1 | text2"), tid, (err, info) => {
      setTimeout(() => api.unsendMessage(info.messageID), 3000);
    }, mid);
  }

  const input = args.join(" ").split("|").map(t => t.trim());
  const text1 = input[0];
  const text2 = input[1];

  const outputPath = __dirname + `/cache/drake_${tid}_${mid}.png`;

  try {
    const apiUrl = `https://api-canvass.vercel.app/drake?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;
    const response = await axios({
      method: 'get',
      url: apiUrl,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        attachment: fs.createReadStream(outputPath),
      }, tid, () => {
        fs.unlinkSync(outputPath);
      }, mid);
    });

    writer.on("error", err => {
      api.sendMessage(applyFontMapping(`Error while saving meme: ${err.message}`), tid, mid);
    });
  } catch (error) {
    api.sendMessage(applyFontMapping(`Failed to generate meme: ${error.message}`), tid, mid);
  }
};