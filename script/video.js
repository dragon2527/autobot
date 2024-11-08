const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "video",
  aliases: ["ytvideo"],
  version: "1.0.1",
  role: 0,
  description: "Search and download YouTube videos.",
  credits: "Kaizenji",
  cooldown: 10,
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

module.exports.run = async function({ api, event, args }) {
  try {
    const searchQuery = args.join(" ");
    if (!searchQuery) {
      return api.sendMessage(formatFont("Usage: video <search text>"), event.threadID, (err, info) => {
        setTimeout(() => api.unsendMessage(info.messageID), 3000);
      }, event.messageID);
    }

    api.sendMessage(formatFont("⏱️ | Searching, please wait..."), event.threadID, (err, info) => {
      setTimeout(() => api.unsendMessage(info.messageID), 3000);
    }, event.messageID);

    const response = await axios.get(`https://kaiz-ytdlsearch-api.vercel.app/yts?q=${encodeURIComponent(searchQuery)}`);
    const videoData = response.data;

    if (!videoData || !videoData.url) {
      return api.sendMessage(formatFont("No video found for the given search query."), event.threadID);
    }

    const message = `𝐓𝐢𝐭𝐥𝐞: ${videoData.title}\n𝐕𝐢𝐞𝐰𝐬: ${videoData.views}\n𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${videoData.duration}\n𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧: ${videoData.description}`;

    const filePath = path.join(__dirname, `/cache/video.mp4`);
    const writer = fs.createWriteStream(filePath);

    const videoResponse = await axios({
      method: 'get',
      url: videoData.url,
      responseType: 'stream'
    });

    videoResponse.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage(
        { body: formatFont(message), attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => fs.unlinkSync(filePath)
      );
    });

    writer.on('error', (err) => {
      console.error('Error writing file:', err);
      api.sendMessage(formatFont("An error occurred while downloading the video."), event.threadID);
    });

  } catch (error) {
    console.error('Error:', error);
    api.sendMessage(formatFont("An error occurred while processing the request."), event.threadID);
  }
};