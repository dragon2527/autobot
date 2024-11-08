const axios = require("axios");
const fs = require("fs");

module.exports.config = {
  name: "fuck",
  version: "1.0",
  role: 0,
  credits: "Kaizenji",
  description: "fvck members in gc",
  cooldown: 20,
  hasPrefix: true,
  usage: "[reply/@mention/uid]",
};

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

module.exports.run = async function ({ api, event, args }) {
  let tid = event.threadID;
  let mid = event.messageID;
  let targetID;

  if (args.join().indexOf("@") !== -1) {
    targetID = Object.keys(event.mentions)[0];
  } else if (event.type === "message_reply") {
    targetID = event.messageReply.senderID;
  } else if (args[0]) {
    targetID = args[0];
  } else {
    return api.sendMessage(formatFont("❌ | Please reply to target, mention, or provide a uid."), tid, (err, info) => {
      setTimeout(() => api.unsendMessage(info.messageID), 3000);
    }, mid);
  }

  const userID = event.senderID;
  const outputPath = __dirname + `/cache/fvck_${userID}_${targetID}.png`;

  try {
    const data1 = await api.getUserInfo(userID);
    const name1 = data1[userID].name;

    const data2 = await api.getUserInfo(targetID);
    const name2 = data2[targetID].name;

    let fvckURL = `https://api-canvass.vercel.app/fuck?one=${userID}&two=${targetID}`;

    const response = await axios({
      method: "GET",
      url: fvckURL,
      responseType: "stream",
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: formatFont(`Oh no!! ${name1} just did something nasty to ${name2}! 😳`),
        attachment: fs.createReadStream(outputPath),
      }, tid, () => fs.unlinkSync(outputPath), mid);
    });

    writer.on("error", err => {
      throw new Error("Failed to save image.");
    });

  } catch (err) {
    api.sendMessage(formatFont(`Error: ${err.message}`), tid, mid);
  }
};