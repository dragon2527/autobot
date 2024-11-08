module.exports.config = {
  name: "tag",
  version: "1.1.1",
  role: 0,
  credits: "Developer",
  description: "Tag all members in your group chat",
  cooldown: 30,
  hasPrefix: true,
};

module.exports.run = async function({ api, event, args }) {
  const { participantIDs } = await api.getThreadInfo(event.threadID);
  const mentions = [];
  let body = args.join(" ") || "@all";
  let bodyLength = body.length;
  let i = 0;

  for (const uid of participantIDs) {
    let fromIndex = 0;
    if (bodyLength < participantIDs.length) {
      body += body[bodyLength - 1];
      bodyLength++;
    }
    if (body.slice(0, i).lastIndexOf(body[i]) != -1)
      fromIndex = i;
    mentions.push({
      tag: body[i],
      id: uid,
      fromIndex
    });
    i++;
  }

  api.sendMessage({ body, mentions }, event.threadID, event.messageID);
};