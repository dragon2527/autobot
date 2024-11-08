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
  name: "mlbbinfo",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["ml"],
  credits: "Kaizenji",
  description: "Fetch Mobile Legends hero information.",
  usages: "mlbbinfo [hero name]",
  cooldown: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require('axios');
  const fs = require('fs-extra');

  try {
    const { threadID, messageID } = event;
    const query = args.join(" ");
    const time = new Date();
    const timestamp = time.toISOString().replace(/[:.]/g, "-");
    const path = __dirname + '/cache/' + `${timestamp}_mlbb_hero.png`;

    if (!query) {
      api.sendMessage(formatFont("❌ | Please provide a hero name."), threadID, (err, info) => {
        setTimeout(() => api.unsendMessage(info.messageID), 3000);
      }, messageID);
      return;
    }

    api.sendMessage(formatFont(`🔍 | Fetching info for: "${query}"`), threadID, (err, info) => {
      setTimeout(() => api.unsendMessage(info.messageID), 3000);
    }, messageID);

    const response = await axios.get(`https://deku-rest-apis.ooguy.com/api/mlhero?q=${encodeURIComponent(query)}`);
    const heroData = response.data.result;

    const heroInfo = `
      Alias: ${heroData.story_info_list.Alias}
      Gender: ${heroData.story_info_list.Gender}
      Role: ${heroData.role}
      Specialty: ${heroData.specialty}
      Lane: ${heroData.lane}
      Offense: ${heroData.gameplay_info.offense}
      Release Date: ${heroData.release_date}
    `;

    api.sendMessage(formatFont(heroInfo.trim()), threadID, messageID);

    const imageResponse = await axios.get(heroData.hero_img, { responseType: 'arraybuffer' });
    fs.writeFileSync(path, Buffer.from(imageResponse.data, 'binary'));

    setTimeout(function () {
      api.sendMessage({
        body: formatFont("🖼️ | Hero image:"),
        attachment: fs.createReadStream(path)
      }, threadID, () => fs.unlinkSync(path));
    }, 3000);

  } catch (error) {
    api.sendMessage(formatFont(`❌ | Error: ${error.message}`), threadID, messageID);
  }
};