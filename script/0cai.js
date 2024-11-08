let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝗑", Y: "𝖸", Z: "𝖹"
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
  name: 'cai',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['characterai'],
  description: "Converse with AI characters like Gojo, Sukuna, etc.",
  usages: "cai [character] [query]",
  credits: 'Kaizenji',
  cooldown: 0,
  dependencies: {
    "axios": ""
  }
};

const characters = {
  gojo: "pai/gojo",
  sukuna: "pai/sukuna",
  rimuru: "pai/rimuru",
  cid: "pai/cid",
  luffy: "pai/luffy",
  rudeus: "pai/rudeus",
  ichigo: "pai/ichigo",
  naruto: "pai/naruto",
  boruto: "pai/boruto",
  deku: "pai/deku"
};

module.exports.run = async function({ api, event, args }) {
  const uid = event.senderID;
  const [character, ...queryArr] = args;
  const query = queryArr.join(' ');

  if (!character || !query) {
    const usageMessage = `Usage:\n${Object.keys(characters).map(c => `cai ${c} <query>`).join('\n')}`;
    return api.sendMessage(formatFont(usageMessage), event.threadID, event.messageID);
  }

  if (!characters[character]) {
    return api.sendMessage(formatFont('❌ | Invalid character! Use one of the following:\n' + Object.keys(characters).join(', ')), event.threadID, event.messageID);
  }

  try {
    const endpoint = `https://deku-rest-apis.ooguy.com/${characters[character]}?q=${encodeURIComponent(query)}&uid=${uid}`;
    const { data } = await axios.get(endpoint);

    api.sendMessage(formatFont(`${data.result}`), event.threadID, event.messageID);

  } catch (error) {
    api.sendMessage(formatFont('An error occurred while processing your request.'), event.threadID, event.messageID);
  }
};