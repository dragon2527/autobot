const { TempMail } = require("1secmail-api");

function generateRandomId() {
  const length = 6;
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomId = '';

  for (let i = 0; i < length; i++) {
    randomId += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return randomId;
}

module.exports.config = {
  name: 'tempmail',
  aliases: ["temp"],
  version: '2.1.0',
  credits: "Deku",
  role: 0,
  hasPrefix: false,
  description: 'Generate temporary email (auto get inbox)',
 cooldown: 20,
  usages: '[tempmail]',
};

module.exports.run = async function ({ api, event }) {
  const reply = (msg) => api.sendMessage(msg, event.threadID, event.messageID);

  try {
    const mail = new TempMail(generateRandomId());
    mail.autoFetch();

    if (mail) reply("Your temporary email: " + mail.address);

    const fetch = () => {
      mail.getMail().then((mails) => {
        if (!mails[0]) {
          return;
        } else {
          const b = mails[0];
          const msg = `You have a message!\n\nFrom: ${b.from}\n\nSubject: ${b.subject}\n\nMessage: ${b.textBody}\nDate: ${b.date}`;
          reply(msg + `\n\nOnce the email and message are received, they will be automatically deleted.`);
          return mail.deleteMail();
        }
      });
    };

    fetch();
    setInterval(fetch, 3 * 1000);
  } catch (err) {
    console.error(err);
    return reply(err.message);
  }
};