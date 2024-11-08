const axios = require('axios');

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
    name: "imgur",
    version: "1.0.0",
    role: 0,
    credits: "cliff",
    description: "imgur upload",
    hasPrefix: false,
    usages: "[reply to image]",
    cooldown: 5,
    aliases: ["im"]
};

module.exports.run = async ({ api, event }) => {
    const uid = event.senderID;
    let link2;

    if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
        link2 = event.messageReply.attachments[0].url;
    } else if (event.attachments.length > 0) {
        link2 = event.attachments[0].url;
    } else {
        return api.sendMessage(formatFont('No attachment detected. Please reply to an image.'), event.threadID, event.messageID);
    }

    try {
        const res = await axios.get(`https://betadash-uploader.vercel.app/imgur?link=${encodeURIComponent(link2)}`);
        const link = res.data.uploaded.image;
        return api.sendMessage(`${link}`, event.threadID, event.messageID); 
    } catch (error) {
        console.error("Error uploading image to Imgur:", error);
        return api.sendMessage(formatFont("An error occurred while uploading the image to Imgur."), event.threadID, event.messageID);
    }
};