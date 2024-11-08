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
  name: "weather",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["wthr", "forecast"],
  credits: "Kaizenji",
  description: "Fetch current weather information for a specific location.",
  usages: "weather [location]",
  cooldown: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require('axios');

  try {
    const { threadID, messageID } = event;
    const location = args.join(" ");
    
    if (!location) {
      api.sendMessage(formatFont("❌ | Please provide a location to get the weather info."), threadID, (err, info) => {
        setTimeout(() => api.unsendMessage(info.messageID), 3000);
      }, messageID);
      return;
    }

    api.sendMessage(formatFont(`🔍 | Fetching weather info for: "${location}"`), threadID, (err, info) => {
      setTimeout(() => api.unsendMessage(info.messageID), 3000);
    }, messageID);

    const response = await axios.get(`https://api.popcat.xyz/weather?q=${encodeURIComponent(location)}`);
    const weatherData = response.data[0];

    const weatherInfo = `
      📍 Location: ${weatherData.location.name}
      🌡️ Temperature: ${weatherData.current.temperature}°${weatherData.location.degreetype}
      🌤️ Sky: ${weatherData.current.skytext}
      💧 Humidity: ${weatherData.current.humidity}%
      🌬️ Wind: ${weatherData.current.windspeed}
      🌡️ Feels Like: ${weatherData.current.feelslike}°${weatherData.location.degreetype}
      📅 Date: ${weatherData.current.date}
      ⏰ Observation Time: ${weatherData.current.observationtime}
    `;

    api.sendMessage(formatFont(weatherInfo.trim()), threadID, messageID);

  } catch (error) {
    api.sendMessage(formatFont(`❌ | Error: ${error.message}`), threadID, messageID);
  }
};