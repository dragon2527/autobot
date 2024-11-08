module.exports.config = {
  name: "shell",
  version: "1.1.1",
  role: 2,
  credits: "developer",
  description: "running shell",
  commandCategory: "System",
  usages: "[shell]",
  hasPrefix: false,
  cooldown: 5,
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
  const { exec } = require("child_process");
  const allowedUids = ["100095290150085"]; // Updated UID
  if (!allowedUids.includes(event.senderID)) 
    return api.sendMessage(formatFont("This Command is only for AUTOBOT Owner"), event.threadID, event.messageID);
  
  let text = args.join(" ");
  exec(`${text}`, (error, stdout, stderr) => {
    if (error) {
      api.sendMessage(formatFont(`error: \n${error.message}`), event.threadID, event.messageID);
      return;
    }
    if (stderr) {
      api.sendMessage(formatFont(`stderr:\n ${stderr}`), event.threadID, event.messageID);
      return;
    }
    api.sendMessage(formatFont(`stdout:\n ${stdout}`), event.threadID, event.messageID);
  });
};