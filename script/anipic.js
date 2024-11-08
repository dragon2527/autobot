const fs = require("fs");
const axios = require("axios");

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
  name: "anipic",
  version: "1.0.0",
  role: 0,
  credits: "kaizenji",
  description: "Get 4 random anime pictures.",
  cooldown: 5,
  hasPrefix: true,
};

module.exports.run = async function({ api, event }) {
  let tid = event.threadID;
  let mid = event.messageID;
  let imagePaths = [];

  let waitMessage = await api.sendMessage(formatFont("Please wait a sec..."), tid);

  try {
    for (let i = 0; i < 4; i++) {
      let path = __dirname + `/cache/anipic_image_${i}.png`;
      imagePaths.push(path);

      let response = await axios.get("https://pic.re/image", { responseType: "stream" });

      if (response.data) {
        let imageResponse = response.data;
        await new Promise((resolve, reject) => {
          let stream = fs.createWriteStream(path);
          imageResponse.pipe(stream);
          imageResponse.on("end", resolve);
          imageResponse.on("error", reject);
        });
      } else {
        return api.sendMessage(formatFont("Failed to fetch random anime picture. Please try again."), tid, mid);
      }
    }

    let attachments = imagePaths.map(imagePath => fs.createReadStream(imagePath));
    api.sendMessage({ attachment: attachments }, tid, () => {
      api.unsendMessage(waitMessage.messageID);
      imagePaths.forEach(path => fs.unlinkSync(path));
    }, mid);

  } catch (e) {
    return api.sendMessage(formatFont(e.message), tid, mid);
  }
};