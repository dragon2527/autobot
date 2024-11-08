const fs = require("fs");
const axios = require("axios");
const request = require("request");

module.exports.config = {
  name: "shoticron",
  credits: "cliff",
  version: "2.0.0",
  cooldown: 0,
  role: 2,
  description: "Autosend random girl",
  hasPrefix: false,
  usages: "&shoticronv2 {p} <setinterval> <time> <hour> <minutes><seconds>",
  aliases: [],
};

module.exports.run = async ({ api, event, args, admin }) => {
        const senderID = event.senderID.toString();
        if (!admin.includes(senderID)) {
          return api.sendMessage("𝖸𝗈𝗎 𝖽𝗈𝗇'𝗍 𝗁𝖺𝗏𝖾 𝗉𝖾𝗋𝗆𝗂𝗌𝗌𝗂𝗈𝗇 𝗍𝗈 𝗎𝗌𝖾 𝗍𝗁𝗂𝗌 𝖼𝗈𝗆𝗆𝖺𝗇𝖽.", event.threadID, event.messageID);
        }
  const threadID = event.threadID;
  const commandArgs = event.body.toLowerCase().split(' ');

  if (commandArgs[1] === 'setinterval') {
    const newIntervalValue = parseFloat(commandArgs[2]);
    const newIntervalUnit = commandArgs[3]?.toLowerCase();

    if (!isNaN(newIntervalValue) && newIntervalValue > 0) {
      let newInterval;

      if (newIntervalUnit === 'hour' || newIntervalUnit === 'hours') {
        newInterval = newIntervalValue * 60 * 60 * 1000;
        const unit = newIntervalValue === 1 ? 'hour' : 'hours';
        api.sendMessage(`🚀 |•Interval time set to ${newIntervalValue} ${unit}.`, threadID);
      } else if (newIntervalUnit === 'minute' || newIntervalUnit === 'minutes') {
        newInterval = newIntervalValue * 60 * 1000;
        const unit = newIntervalValue === 1 ? 'minute' : 'minutes';
        api.sendMessage(`🚀 |•Interval time set to ${newIntervalValue} ${unit}.`, threadID);
      } else {
        api.sendMessage('🚀 |•Invalid unit. Please use "minutes" or "hours".', threadID);
        return;
      }

      shotiAutoInterval[threadID] = newInterval;
    } else {
      api.sendMessage('🚀 |•Invalid interval time. Please provide a valid positive number.', threadID);
    }
    return;
  } else if (commandArgs[1] === 'interval') {
    const currentInterval = shotiAutoInterval[threadID] || defaultInterval;
    const unit = currentInterval === 60 * 60 * 1000 ? 'hour' : 'minute';
    api.sendMessage(`🚀 |•Current interval time is set to ${currentInterval / (unit === 'hour' ? 60 * 60 * 1000 : 60 * 1000)} ${unit}.`, threadID);
    return;
  } else if (commandArgs[1] === 'on') {
    if (!shotiAutoState[threadID]) {
      shotiAutoState[threadID] = true;
      const intervalUnit = shotiAutoInterval[threadID] ? (shotiAutoInterval[threadID] === 60 * 60 * 1000 ? 'hour' : 'minute') : 'hour';
      const intervalValue = shotiAutoInterval[threadID] ? shotiAutoInterval[threadID] / (intervalUnit === 'hour' ? 60 * 60 * 1000 : 60 * 1000) : 1;
      const intervalMessage = `will send video every ${intervalValue} ${intervalUnit}${intervalValue === 1 ? '' : 's'}`;

      api.sendMessage(`🚀 |•Command feature is turned on, ${intervalMessage}.`, threadID);

      shoticron(api, event, threadID);

      setInterval(() => {
        if (shotiAutoState[threadID]) {
          shoticron(api, event, threadID);
        }
      }, shotiAutoInterval[threadID] || defaultInterval);
    } else {
      api.sendMessage('🚀 |•Command feature is already turned on', threadID);
    }
    return;
  } else if (commandArgs[1] === 'off') {
    shotiAutoState[threadID] = false;
    api.sendMessage('🚀|•Command feature is turned off', threadID);
    return;
  } else if (commandArgs[1] === 'status') {
    const statusMessage = shotiAutoState[threadID] ? 'on' : 'off';
    const intervalMessage = shotiAutoInterval[threadID] ? `Interval time set to ${shotiAutoInterval[threadID] / (shotiAutoInterval[threadID] === 60 * 60 * 1000 ? 60 : 1000)} minutes.` : 'Interval time not set. Using the default 1-hour interval.';
    const errorMessage = lastVideoError[threadID] ? `Last video error: ${lastVideoError[threadID]}` : '';

    api.sendMessage(`🚀|•Command feature is currently ${statusMessage}.\n🚀|•Total videos sent: ${videoCounter}\n🚀|•Total error videos: ${errorVideoCounter}\n${errorMessage}`, threadID);
    return;
  } else if (commandArgs[1] === 'resetcount') {
    videoCounter = 0;
    errorVideoCounter = 0;
    api.sendMessage('🚀 |•Video counts have been reset.', threadID);
    return;
  }

  api.sendMessage('🔴🟡🟢\n\n╭─❍\n➠•Invalid command.\n╰───────────⟡\n╭─❍\n➠•"shoticron on", "shoticron off" - to turn ON or turn OFF.\n╰───────────⟡\n╭─❍\n➠•"shoticron setinterval <minutes/hours>" - set the timer for video\n╰───────────⟡\n╭─❍\n➠•"shoticron interval" - check the interval\n╰───────────⟡\n╭─❍\n➠•"shoticron status" - check the status off command\n╰───────────⟡\n', threadID);
};

const moment = require('moment-timezone');
const targetTimeZone = 'Asia/Manila';
const now = moment().tz(targetTimeZone);
const currentDate = now.format('YYYY-MM-DD');
const currentTime = now.format('HH:mm:ss');

const shotiAutoState = {};
const shotiAutoInterval = {};
let videoCounter = 0;
let errorVideoCounter = 0;
const lastVideoError = {};
const defaultInterval = 60 * 60 * 1000;

const shoticron = async (api, event, threadID) => {
  try {
    const response = await axios.get('https://betadash-shoti-yazky.vercel.app/shotizxx?apikey=shipazu');
    const data = response.data;

    videoCounter++;

    const path = __dirname + '/cache/shoti.mp4';
    const file = fs.createWriteStream(path);
    const rqs = request(encodeURI(data.shotiurl));
    rqs.pipe(file);

    file.on('finish', () => {
      api.sendMessage({
        body: `𝖠𝖴𝖳𝖮 𝖲𝖤𝖭𝖣 𝖱𝖠𝖭𝖣𝖮𝖬 𝖲𝖧𝖮𝖳𝖨\n\n🚀 |•𝖳𝖨𝖳𝖫𝖤: ${data.title}\n🚀 |•𝖴𝖲𝖤𝖱𝖭𝖠𝖬𝖤: @${data.username}\n🚀 |•𝖭𝖨𝖢𝖪𝖭𝖠𝖬𝖤: ${data.nickname}\n🚀 |•𝖣𝖴𝖱𝖠𝖳𝖨𝖮𝖭: ${data.duration} seconds\n🚀 |•𝖱𝖤𝖦𝖨𝖮𝖭: ${data.region}\n\n𝖣𝖺𝗍𝖾 & 𝗍𝗂𝗆𝖾: ${currentDate} || ${currentTime}`,
        attachment: fs.createReadStream(path),
      }, threadID, () => {
        fs.unlinkSync(path);
      });
    });
  } catch (error) {
    console.error('Error fetching or sending the video:', error);
    lastVideoError[threadID] = error.message;
    videoCounter++;
    errorVideoCounter++;
  }
};