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

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json"
  );
  return base.data.api;
};

module.exports.config = {
  name: "fbcover",
  version: "6.9",
  role: 0,
  credits: "kaizenji",
  description: "Generate a Facebook cover with customizable details",
  cooldown: 10,
  hasPrefix: true,
};

module.exports.run = async function({ api, event, args, prefix }) {
  const input = args.join(" ");
  let id = Object.keys(event.mentions)[0] || event.senderID;

  if (!input) {
    return api.sendMessage(
      formatFont(`❌| Invalid input \nTry: ${prefix}fbcover v1/v2/v3 - name - title - address - email - phone - color (default = white)`),
      event.threadID,
      event.messageID
    );
  }

  const msg = input.split("-");
  const version = msg[0]?.trim() || "v1";
  const name = msg[1]?.trim() || " ";
  const subname = msg[2]?.trim() || " ";
  const address = msg[3]?.trim() || " ";
  const email = msg[4]?.trim() || " ";
  const phone = msg[5]?.trim() || " ";
  const color = msg[6]?.trim() || "white";

  api.sendMessage(
    formatFont(`✨ | Processing your cover, please wait...`),
    event.threadID,
    (err, info) =>
      setTimeout(() => {
        api.unsendMessage(info.messageID);
      }, 4000)
  );

  const img = `${await baseApiUrl()}/cover/${version}?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&number=${encodeURIComponent(phone)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&colour=${encodeURIComponent(color)}&uid=${id}`;

  try {
    const response = await axios.get(img, { responseType: "stream" });
    const attachment = response.data;

    api.sendMessage(
      {
        body: formatFont(`𝗙𝗜𝗥𝗦𝗧 𝗡𝗔𝗠𝗘: ${name}\n𝗦𝗘𝗖𝗢𝗡𝗗 𝗡𝗔𝗠𝗘: ${subname}\n𝗔𝗗𝗗𝗥𝗘𝗦𝗦: ${address}\n𝗠𝗔𝗜𝗟: ${email}\n𝗣𝗛𝗢𝗡𝗘 𝗡𝗢.: ${phone}\n𝗖𝗢𝗟𝗢𝗥: ${color}\n𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : ${version}`),
        attachment,
      },
      event.threadID,
      event.messageID
    );
  } catch (error) {
    console.error(error);
    api.sendMessage(formatFont("An error occurred while generating the FB cover."), event.threadID);
  }
};