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
  name: "setavt",
  aliases: ["changeavt", "setavatar"],
  version: "2.0.0",
  role: 2,
  description: "Change bot avatar.",
  credits: "Developer",
  cooldown: 5
};

module.exports.run = async ({ api, event, args, admin, message }) => {
  const eventSenderID = event.senderID.toString();
  
  if (!admin.includes(eventSenderID)) {
    return api.sendMessage(formatFont("You don't have permission to use this command."), event.threadID, event.messageID);
  }

  const imageURL = (args[0] || "").startsWith("http") ? args.shift() : event.attachments[0]?.url || event.messageReply?.attachments[0]?.url;
  const expirationAfter = !isNaN(args[args.length - 1]) ? args.pop() : null;
  const caption = args.join(" ");

  if (!imageURL) return api.sendMessage(formatFont("Please provide an image URL or reply to a message with an image."), event.threadID, event.messageID);

  try {
    const response = await axios.get(imageURL, { responseType: "stream" });
    
    if (!response.headers["content-type"].includes("image")) {
      return api.sendMessage(formatFont("Invalid image format."), event.threadID, event.messageID);
    }

    response.data.path = "avatar.jpg";

    api.changeAvatar(response.data, caption, expirationAfter ? expirationAfter * 1000 : null, (err) => {
      if (err) return api.sendMessage(formatFont(`Error: ${err}`), event.threadID, event.messageID);
      return api.sendMessage(formatFont("Changed bot avatar successfully."), event.threadID, event.messageID);
    });
  } catch (err) {
    return api.sendMessage(formatFont("An error occurred while querying the image URL."), event.threadID, event.messageID);
  }
};