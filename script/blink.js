const axios = require("axios");
const fs = require("fs");

module.exports.config = {
  name: "blink",
  version: "1.0",
  role: 0,
  credits: "Kaizenji",
  description: "Generate a Blink meme using a user ID or by mentioning or replying to a user.",
  cooldown: 5,
  hasPrefix: true,
  usage: "blink | blink uid | blink @mentioned | blink reply",
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
  let userId = "";

  if (Object.keys(event.mentions).length > 0) {
    userId = Object.keys(event.mentions)[0];
  } else if (event.messageReply && event.messageReply.senderID) {
    userId = event.messageReply.senderID;
  } else if (args.length > 0) {
    userId = args[0].trim();
  } else {
    userId = event.senderID;
  }

  api.getUserInfo(userId, async (err, result) => {
    if (err) return api.sendMessage(`Failed to retrieve user info: ${err.message}`, tid, mid);

    const userName = result[userId].name || "User";
    const outputPath = __dirname + `/cache/blink_${tid}_${mid}.gif`;

    try {
      const apiUrl = `https://api-canvass.vercel.app/blink?userid=${encodeURIComponent(userId)}`;
      const response = await axios({
        method: 'get',
        url: apiUrl,
        responseType: 'stream',
      });

      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: `${userName} say cheese! 📸`,
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
  });
};