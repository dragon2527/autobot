module.exports.config = {
  name: "pending",
  version: "1.0.5",
  credits: "Kaizenji",
  role: 2,
  hasPrefix: false,
  description: "Manage bot's pending thread approvals",
  cooldown: 5
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

module.exports.run = async ({ api, event, args, admin }) => {
        const senderID = event.senderID.toString();
        if (!admin.includes(senderID)) {
          return api.sendMessage("𝖸𝗈𝗎 𝖽𝗈𝗇'𝗍 𝗁𝖺𝗏𝖾 𝗉𝖾𝗋𝗆𝗂𝗌𝗌𝗂𝗈𝗇 𝗍𝗈 𝗎𝗌𝖾 𝗍𝗁𝗂𝗌 𝖼𝗈𝗆𝗆𝖺𝗇𝖽.", event.threadID, event.messageID);
        }
  const { threadID, messageID } = event;

  if (!args.length) {
    return api.sendMessage(
      formatFont(`Usage:\n- pending list: Show list of pending threads\n- pending approve <threadID>: Approve the pending thread\n- pending cancel <threadID>: Cancel the pending thread`),
      threadID,
      messageID
    );
  }

  if (args[0] === "list") {
    let msg = "", index = 1;

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
      const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

      for (const single of list) {
        msg += `${index++}. ${single.name} (${single.threadID})\n`;
      }

      if (list.length !== 0) {
        return api.sendMessage(
          formatFont(`»「PENDING」❮ Total threads to approve: ${list.length} ❯\n\n${msg}\nTo approve, use: pending approve <threadID>\nTo cancel, use: pending cancel <threadID>`),
          threadID,
          messageID
        );
      } else {
        return api.sendMessage(formatFont("「PENDING」No threads in the pending list."), threadID, messageID);
      }
    } catch (e) {
      return api.sendMessage(formatFont("Error retrieving the pending list."), threadID, messageID);
    }
  }

  if (args[0] === "approve" && args.length > 1) {
    const threadIDs = args.slice(1);
    let approvedCount = 0;

    for (const id of threadIDs) {
      try {
        await api.addUserToGroup(api.getCurrentUserID(), id);
        api.sendMessage(
          formatFont(`「APPROVED」\n\n• This thread has been officially approved by the admin. Please enjoy using the bot and avoid spamming. ♡\n— [も.kaizenji]`),
          id
        );
        approvedCount++;
      } catch (e) {
        return api.sendMessage(formatFont(`Failed to approve thread ${id}.`), threadID, messageID);
      }
    }

    return api.sendMessage(formatFont(`Successfully approved ${approvedCount} thread(s)!`), threadID, messageID);
  }

  if (args[0] === "cancel" && args.length > 1) {
    const threadIDs = args.slice(1);
    let canceledCount = 0;

    for (const id of threadIDs) {
      try {
        await api.removeUserFromGroup(api.getCurrentUserID(), id);
        canceledCount++;
      } catch (e) {
        return api.sendMessage(formatFont(`Failed to cancel thread ${id}.`), threadID, messageID);
      }
    }

    return api.sendMessage(formatFont(`Successfully canceled ${canceledCount} thread(s)!`), threadID, messageID);
  }

  return api.sendMessage(
    formatFont(`Invalid command.\nUsage:\n- pending list: Show list of pending threads\n- pending approve <threadID>: Approve a pending thread\n- pending cancel <threadID>: Cancel a pending thread`),
    threadID,
    messageID
  );
};