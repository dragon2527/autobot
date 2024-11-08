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

const path = require("path");
const fs = require("fs");
const axios = require("axios");

module.exports.config = {
    name: "join-leave-noti",
    version: "1.0.0",
};

module.exports.handleEvent = async function({ api, event, prefix }) {
    try {
        if (event.type === "event" && event.logMessageType === "log:subscribe") {
            const threadID = event.threadID;
            const addedParticipants = event.logMessageData.addedParticipants;

            if (addedParticipants.some(participant => participant.userFbId === api.getCurrentUserID())) {
                const botNickname = `〔 ${prefix} 〕 ＡＵＴＯＢＯＴ ♡`;
                await api.changeNickname(botNickname, threadID, api.getCurrentUserID());

                await api.sendMessage(
                    formatFont(`𝗔𝗨𝗧𝗢𝗕𝗢𝗧 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗!\n\n❑ Type 'help' to see all commands!\n❑ Thank you for using this bot, have fun using it.`),
                    threadID,
                );
            } else {
                const newParticipantID = addedParticipants[0].userFbId;
                const threadInfo = await api.getThreadInfo(threadID);
                const userInfo = await api.getUserInfo(newParticipantID);
                const name = userInfo[newParticipantID].name;
                const memberCount = threadInfo.participantIDs.length;

                const welcomeMessage = formatFont(`Hello ${name},\nWelcome to ${threadInfo.threadName}.\nYou are the ${memberCount}th member of our community, please enjoy! 💗🥳`);

                await api.sendMessage(welcomeMessage, threadID);
            }
        }

        if (event.type === "event" && event.logMessageType === "log:unsubscribe") {
            const threadID = event.threadID;
            const leftParticipantID = event.logMessageData.leftParticipantFbId;
            const adminID = event.author;

            const userInfo = await api.getUserInfo(leftParticipantID);
            const userName = userInfo[leftParticipantID]?.name || 'Unknown User';
            const threadInfo = await api.getThreadInfo(threadID);
            const memberCount = threadInfo.participantIDs.length;
            let leaveMessage;

            if (adminID === leftParticipantID) {
              leaveMessage = formatFont(`${userName} has left in ${threadInfo.threadName}. We're now down to ${memberCount} members. Wishing them the best! 🙏`);
            } else {
              leaveMessage = formatFont(`${userName} was removed for violating group rules. We now have ${memberCount} members left. Let's keep it respectful! 😿`);
            }

            api.sendMessage(leaveMessage, threadID);
        }
    } catch (error) {
        console.error("Error in handleEvent: ", error);
    }
};