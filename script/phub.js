const axios = require("axios");
const fs = require("fs");

module.exports.config = {
  name: "phub",
  version: "1.0",
  role: 0,
  credits: "Kaizenji",
  description: "Generate a PHub meme.",
  cooldown: 5,
  hasPrefix: true,
  usage: "phub <text> | phub <uid> <text> | phub @mention <text>",
};

function applyFontMapping(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };
  
  return text.split('').map(char => fontMapping[char] || char).join('');
}

module.exports.run = async function ({ api, event, args }) {
  const tid = event.threadID;
  const mid = event.messageID;

  let targetID = event.senderID;
  let text = "";

  if (args.length > 0) {
    if (args[0].startsWith('@')) {
      targetID = Object.keys(event.mentions)[0];
      text = args.slice(1).join(" ");
    } else if (args[0].match(/^\d+$/)) {
      targetID = args[0].trim();
      text = args.slice(1).join(" ");
    } else {
      text = args.join(" ");
    }
  }

  if (!text) {
    return api.sendMessage(applyFontMapping("❌ | Please provide text to generate the meme!"), tid, (err, info) => {
      setTimeout(() => api.unsendMessage(info.messageID), 3000);
    }, mid);
  }

  let userName = "";
  try {
    const userInfo = await api.getUserInfo(targetID);
    userName = userInfo[targetID].name;
  } catch (error) {
    return api.sendMessage(applyFontMapping(`❌ | Failed to fetch user information: ${error.message}`), tid, mid);
  }

  const outputPath = __dirname + `/cache/phub_${tid}_${mid}.png`;

  try {
    const apiUrl = `https://api-canvass.vercel.app/phub?text=${encodeURIComponent(text)}&name=${encodeURIComponent(userName)}&id=${targetID}`;
    
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