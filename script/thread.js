module.exports.config = {
  name: "thread",
  version: "2.0",
  credits: "Developer",
  cooldown: 5,
  role: 0,
  hasPrefix: false,
  aliases: ["join", "lb"],
  description: "Join the group that bot is in",
  usage: "{p}thread list {p}thread join number/userid",
};

module.exports.run = async function({ api, event, args, prefix }) {
  try {
    if (args[0] === "list") {
      const groupList = await api.getThreadList(10, null, ['INBOX']);
      const filteredList = groupList.filter(group => group.threadName !== null);

      if (filteredList.length === 0) {
        return api.sendMessage('No group chats found.', event.threadID);
      }

      const formattedList = filteredList.map((group, index) =>
        `│${index + 1}. ${group.threadName}\n│𝐓𝐈𝐃: ${group.threadID}\n│𝐓𝐨𝐭𝐚𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬: ${group.participantIDs.length}\n│`
      );

      const message = `╭─╮\n│𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n${formattedList.join("\n")}\n╰───────────ꔪ\n𝐌𝐚𝐱𝐢𝐦𝐮𝐦 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 = 250\n𝖴𝗌𝖾: ${prefix}𝗍𝗁𝗋𝖾𝖺𝖽 𝗃𝗈𝗂𝗇 [𝗀𝗋𝗈𝗎𝗉 𝗇𝗎𝗆𝖻𝖾𝗋] 𝗈𝗋 ${prefix}𝗍𝗁𝗋𝖾𝖺𝖽 𝗃𝗈𝗂𝗇 [𝗀𝗋𝗈𝗎𝗉 𝖳𝖨𝖣]`;
      return await api.sendMessage(message, event.threadID);
    }
    else if (args[0] === "join") {
      if (!args[1]) {
        return api.sendMessage('𝖯𝗅𝖾𝖺𝗌𝖾 𝗉𝗋𝗈𝗏𝗂𝖽𝖾 𝖺 𝗀𝗋𝗈𝗎𝗉 𝗇𝗎𝗆𝖻𝖾𝗋 𝗈𝗋 𝖳𝖨𝖣 𝗍𝗈 𝗃𝗈𝗂𝗇.', event.threadID);
      }

      const groupIdentifier = args[1];
      const groupList = await api.getThreadList(25, null, ['INBOX']);
      const filteredList = groupList.filter(group => group.threadName !== null);

      let selectedGroup;

      if (!isNaN(groupIdentifier)) {
        const groupIndex = parseInt(groupIdentifier);

        if (groupIndex <= 0 || groupIndex > filteredList.length) {
          return api.sendMessage('𝖨𝗇𝗏𝖺𝗅𝗂𝖽 𝗀𝗋𝗈𝗎𝗉 𝗇𝗎𝗆𝖻𝖾𝗋. 𝖯𝗅𝖾𝖺𝗌𝖾 𝖼𝗁𝗈𝗈𝗌𝖾 𝖺 𝗏𝖺𝗅𝗂𝖽 𝗀𝗋𝗈𝗎𝗉.', event.threadID);
        }

        selectedGroup = filteredList[groupIndex - 1];
      }
      else {
        selectedGroup = filteredList.find(group => group.threadID === groupIdentifier);

        if (!selectedGroup) {
          return api.sendMessage('𝖨𝗇𝗏𝖺𝗅𝗂𝖽 𝗀𝗋𝗈𝗎𝗉 𝖳𝖨𝖣. 𝖯𝗅𝖾𝖺𝗌𝖾 𝗉𝗋𝗈𝗏𝗂𝖽𝖾 𝖺 𝗏𝖺𝗅𝗂𝖽 𝗀𝗋𝗈𝗎𝗉 𝖳𝖨𝖣.', event.threadID);
        }
      }

      const groupID = selectedGroup.threadID;
      const memberList = await api.getThreadInfo(groupID);

      if (memberList.participantIDs.includes(event.senderID)) {
        return api.sendMessage(`𝖸𝗈𝗎'𝗋𝖾 𝖺𝗅𝗋𝖾𝖺𝖽𝗒 𝗂𝗇 𝗍𝗁𝖾 𝗀𝗋𝗈𝗎𝗉 𝖼𝗁𝖺𝗍: ${selectedGroup.threadName}`, event.threadID);
      }

      if (memberList.participantIDs.length >= 250) {
        return api.sendMessage(`𝖳𝗁𝖾 𝗀𝗋𝗈𝗎𝗉 𝖼𝗁𝖺𝗍 𝗂𝗌 𝖿𝗎𝗅𝗅: ${selectedGroup.threadName}`, event.threadID);
      }

      await api.addUserToGroup(event.senderID, groupID);
      return api.sendMessage(`𝖸𝗈𝗎 𝗁𝖺𝗏𝖾 𝗃𝗈𝗂𝗇𝖾𝖽 𝗍𝗁𝖾 𝗀𝗋𝗈𝗎𝗉 𝖼𝗁𝖺𝗍: ${selectedGroup.threadName}`, event.threadID);
    }
  } catch (error) {
    return api.sendMessage('𝖠𝗇 𝖾𝗋𝗋𝗈𝗋 𝗈𝖼𝖼𝗎𝗋𝗋𝖾𝖽. 𝖯𝗅𝖾𝖺𝗌𝖾 𝗍𝗋𝗒 𝖺𝗀𝖺𝗂𝗇 𝗅𝖺𝗍𝖾𝗋.', event.threadID);
  }
};