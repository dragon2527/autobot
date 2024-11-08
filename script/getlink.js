module.exports.config = {
    name: "getlink",
    version: "1.0",
    credits: "kaizenji",
    cooldown: 5,
    aliases: ["link"],
    role: 0,
    description: "Get the link of an image or video.",
};

module.exports.run = async function ({ api, event, getText }) {
    const { messageReply } = event;

    if (event.type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length !== 1) {
        return api.sendMessage(getText("invalidFormat"), event.threadID, event.messageID);
    }

    return api.sendMessage(messageReply.attachments[0].url, event.threadID, (err, info) => {
    setTimeout(() => api.unsendMessage(info.messageID), 30000);
    }, event.messageID);
};