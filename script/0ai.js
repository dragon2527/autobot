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

const axios = require('axios');

module.exports.config = {
  name: 'ai',
  version: '1.2.0',
  role: 0,
  hasPrefix: false,
  aliases: ['openai'],
  description: "An AI command powered by multiple APIs.",
  usages: "ai [query]",
  credits: 'Kaizenji',
  cooldown: 0,
  dependencies: {
    "axios": ""
  }
};

module.exports.run = async function({ api, event, args }) {
  const input = args.join(' ');

  if (!input) {
    api.sendMessage(formatFont(`❌ | Please provide a question first!`), event.threadID, (err, info) => {
      setTimeout(() => api.unsendMessage(info.messageID), 3000);
    }, event.messageID);
    return;
  }

  try {
    const { data } = await axios.get(`https://deku-rest-apis.ooguy.com/api/gemma-7b?q=${encodeURIComponent(input)}`);
    api.sendMessage(formatFont(`${data.result}`), event.threadID, event.messageID);

  } catch (err) {
    try {
      const response = await axios.get(`https://rest-api-production-5054.up.railway.app/gemini?prompt=${encodeURIComponent(input)}`);
      api.sendMessage(formatFont(`${response.data.message}`), event.threadID, event.messageID);

    } catch (error) {
      try {
        const mixtralResponse = await axios.get(`https://deku-rest-apis.ooguy.com/api/mixtral-8b?q=${encodeURIComponent(input)}`);
        api.sendMessage(formatFont(`${mixtralResponse.data.result}`), event.threadID, event.messageID);
      } catch (finalError) {
        try {
          const vertearthResponse = await axios.get(`https://www.vertearth.cloud/api/gpt4?prompt=${encodeURIComponent(input)}`);
          api.sendMessage(formatFont(`${vertearthResponse.data.response.answer}`), event.threadID, event.messageID);
        } catch (lastResortError) {
          api.sendMessage(formatFont('All APIs failed to respond.'), event.threadID, event.messageID);
        }
      }
    }
  }
};