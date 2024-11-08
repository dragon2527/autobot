let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝗒", Z: "𝖹"
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
  name: "adduser",
  version: "1.0.1",
  role: 0,
  credits: "cliff",
  description: "Add user to group by id",
  hasPrefix: false,
  usage: "[args]",
  cooldown: 5,
  aliases: ["add"],
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const botID = api.getCurrentUserID();
  const out = msg => api.sendMessage(formatFont(msg), threadID, messageID);
  var { participantIDs, approvalMode, adminIDs } = await api.getThreadInfo(threadID);
  var participantIDs = participantIDs.map(e => parseInt(e));
  if (!args[0]) return out("Please enter an id/link profile user to add.");
  if (!isNaN(args[0])) return adduser(args[0], undefined);
  else {
    try {
      var [id, name, fail] = await getUID(args[0], api);
      if (fail == true && id != null) return out(id);
      else if (fail == true && id == null) return out("User ID not found.");
      else {
        await adduser(id, name || "Facebook users");
      }
    } catch (e) {
      return out(`${e.name}: ${e.message}.`);
    }
  }

  async function adduser(id, name) {
    id = parseInt(id);
    if (participantIDs.includes(id)) return out(`${name ? name : "Member"} is already in the group.`);
    else {
      var admins = adminIDs.map(e => parseInt(e.id));
      try {
        await api.addUserToGroup(id, threadID);
      }
      catch {
        return out(`Can't add ${name ? name : "user"} in group.`);
      }
      if (approvalMode === true && !admins.includes(botID)) return out(`Added ${name ? name : "member"} to the approved list !`);
      else return out(`Added ${name ? name : "member"} to the group !`);
    }
  }
};