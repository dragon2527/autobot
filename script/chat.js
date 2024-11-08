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

async function getUserName(api, senderID) {
    try {
        const userInfo = await api.getUserInfo(senderID);
        return userInfo[senderID]?.name || "User";
    } catch (error) {
        console.log(error);
        return "User";
    }
}

var chat = {};

module.exports.config = {
    name: "chat",
    role: 2,
    version: "1.0.0",
    credits: "Jonell",
    description: "remove user from the group if chat off",
    hasPrefix: true,
    usages: "[on/off]",
    cooldown: 5,
};

module.exports.handleEvent = async function({ api, event }) {
    if (!Object.keys(chat).includes(String(event.threadID))) return;

    const botID = api.getCurrentUserID();
    if (event.senderID === botID) return;

    const threadInfo = await api.getThreadInfo(event.threadID);
    const isAdmin = threadInfo.adminIDs.some(adminInfo => adminInfo.id === event.senderID);
    const isBotAdmin = threadInfo.adminIDs.some(adminInfo => adminInfo.id === botID);

    if (chat[String(event.threadID)] && !isAdmin && isBotAdmin) {
        api.removeUserFromGroup(event.senderID, event.threadID);
        api.sendMessage(formatFont(`${await getUserName(api, event.senderID)} has been removed from the group due to chat off being activated by the group administrator.`), event.threadID, event.messageID);
    }
};

module.exports.run = async function({ api, event, args }) {
    const { writeFileSync } = require("fs");
    const path = __dirname + "/cache/chat.json";

    if (!(String(event.threadID) in chat)) chat[String(event.threadID)] = false;

    const threadInfo = await api.getThreadInfo(event.threadID);
    const isAdmin = threadInfo.adminIDs.some(adminInfo => adminInfo.id === event.senderID);
    const isUserAdmin = (await api.getThreadInfo(event.threadID)).adminIDs.some(idInfo => idInfo.id === event.senderID);

    if (!isAdmin || !isUserAdmin) {
        return api.sendMessage(formatFont("🛡️ | You're not able to use chat off or on commands because you are not an admin in this group chat"), event.threadID, event.messageID);
    }

    if (isAdmin) {
        if (args[0] === "off") { 
            chat[String(event.threadID)] = true;
            writeFileSync(path, JSON.stringify(chat), 'utf-8');
            return api.sendMessage(formatFont(`🛡️ | Chat off has been activated. The bot will now remove non-admin members from the group when they chat.`), event.threadID);
        } else if (args[0] === "on") { 
            chat[String(event.threadID)] = false;
            writeFileSync(path, JSON.stringify(chat), 'utf-8');
            return api.sendMessage(formatFont(`✅  | Chat off has been deactivated. The bot will no longer remove members when they chat.`), event.threadID);
        } else {
            return api.sendMessage(formatFont('Use the command "chat on" to enable or "chat off" to disable chat.'), event.threadID);
        }
    } else {
        return api.sendMessage(formatFont("Admin privilege is required to change chat settings."), event.threadID);
    }
};