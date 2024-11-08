const fs = require("fs");
const axios = require("axios");
const request = require("request");
const path = require("path");

let fontEnabled = true;
let NSFW = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };

  return text.split('').map(char => fontEnabled && char in fontMapping ? fontMapping[char] : char).join('');
}

module.exports.config = {
  name: "nsfw",
  version: "1.0.0",
  role: 0,
  description: "Get NSFW content.",
  cooldown: 5,
  hasPrefix: true,
  credits: "Kaizenji"
};

module.exports.run = async ({ api, event, args, admin }) => {
  const senderID = event.senderID.toString();
  if (!admin.includes(senderID)) {
    return api.sendMessage("𝖸𝗈𝗎 𝖽𝗈𝗇'𝗍 𝗁𝖺𝗏𝖾 𝗉𝖾𝗋𝗆𝗂𝗌𝗌𝗂𝗈𝗇 𝗍𝗈 𝗎𝗌𝖾 𝗍𝗁𝗂𝗌 𝖼𝗈𝗆𝗆𝖺𝗇𝖽.", event.threadID, event.messageID);
  }

  if (args.length === 0) {
    return api.sendMessage(formatFont("Usage:\n• nsfw hentaivid\n• nsfw cosplay\n• nsfw 4chan"), event.threadID, event.messageID);
  }

  const { messageID, threadID } = event;

  const fetchNSFWContent = async (type) => {
    let downloadMessage = await api.sendMessage(formatFont(`Fetching nsfw ${type}...`), threadID);
    try {
      let response;
      let data;

      switch (type) {
        case "hentaivid":
          response = await axios.get(`https://deku-rest-apis.ooguy.com/api/randhntai`);
          data = response.data.result[0];
          const videoPath = __dirname + `/cache/random_hentai.mp4`;
          const videoStream = fs.createWriteStream(videoPath);
          request(encodeURI(data.video_1)).pipe(videoStream);

          videoStream.on('finish', () => {
            setTimeout(() => {
              api.sendMessage({
                body: formatFont(`Title: ${data.title}\nCategory: ${data.category}`),
                attachment: fs.createReadStream(videoPath)
              }, threadID, (err, messageInfo) => {
                if (!err) {
                  setTimeout(() => {
                    fs.unlinkSync(videoPath);
                  }, 5000);
                }
              });
              api.unsendMessage(downloadMessage.messageID);
            }, 5000);
          });
          break;

        case "cosplay":
          let cosplayPaths = [];
          
          // Define the random cosplay categories
          const cosplayCategories = [
            "genshin impact",
            "raiden shogun",
            "naruto",
            "demon slayer",
            "attack on titan",
            "sailor moon",
            "my hero academia"
          ];

          // Randomly select a cosplay category
          const randomCategory = cosplayCategories[Math.floor(Math.random() * cosplayCategories.length)];

          response = await axios.get(`https://rest-api-production-5054.up.railway.app/cosplay?query=${encodeURIComponent(randomCategory)}&filter=true`);
          const cosplayImages = response.data.multi_img;

          if (!cosplayImages || cosplayImages.length < 4) {
            return api.sendMessage(formatFont("Not enough images found. Please try again later."), threadID, messageID);
          }

          for (let i = 0; i < 4; i++) {
            const path = __dirname + `/cache/cosplay_image_${i}.webp`;
            cosplayPaths.push(path);
            const imageResponse = await axios.get(cosplayImages[i], { responseType: "stream" });
            await new Promise((resolve, reject) => {
              const stream = fs.createWriteStream(path);
              imageResponse.data.pipe(stream);
              imageResponse.data.on("end", resolve);
              imageResponse.data.on("error", reject);
            });
          }

          const cosplayAttachments = cosplayPaths.map(path => fs.createReadStream(path));
          api.sendMessage({ attachment: cosplayAttachments, body: formatFont(`Here's your ${randomCategory} cosplayer! 🤤`) }, threadID, () => {
            api.unsendMessage(downloadMessage.messageID);
            cosplayPaths.forEach(path => fs.unlinkSync(path));
          });
          break;

        case "4chan":
          response = await axios.get('https://civitai.com/api/v1/images', { params: { nsfw: NSFW } });
          const mediaItems = response.data.items;

          if (mediaItems && mediaItems.length > 0) {
            const randIndex = Math.floor(Math.random() * mediaItems.length);
            const mediaItem = mediaItems[randIndex];
            const mediaUrl = mediaItem.url;

            const downloadedMedia = await downloadAndSaveMedia(mediaUrl, threadID);
            if (downloadedMedia) {
              const messageBody = formatFont(`Here's a random NSFW content from 4chan! ⚠️`);
              api.sendMessage({
                body: messageBody,
                attachment: downloadedMedia.stream
              }, threadID, (err) => {
                if (!err) {
                  fs.unlinkSync(downloadedMedia.path);
                }
              });
            } else {
              api.sendMessage(formatFont("Error downloading media from 4chan."), threadID, messageID);
            }
          } else {
            api.sendMessage(formatFont("No NSFW content found on 4chan."), threadID, messageID);
          }
          break;

        default:
          return api.sendMessage(formatFont("Invalid type!"), threadID, messageID);
      }
    } catch (err) {
      api.sendMessage(formatFont(`Error: ${err.message}`), threadID, messageID);
    }
  };

  await fetchNSFWContent(args[0]);
};

const getFileExtension = contentType => {
  const extensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mp4',
  };
  return extensions[contentType] || 'unknown';
};

const downloadAndSaveMedia = async (mediaUrl, threadID) => {
  try {
    const response = await axios.get(mediaUrl, { responseType: 'stream' });
    const contentType = response.headers['content-type'];
    const contentExtension = getFileExtension(contentType);
    const mediaPath = path.join(__dirname, `/cache/media_${Date.now()}.${contentExtension}`);
    const fileStream = fs.createWriteStream(mediaPath);

    response.data.pipe(fileStream);

    return new Promise((resolve, reject) => {
      fileStream.on('finish', () => resolve({ stream: fs.createReadStream(mediaPath), contentType, path: mediaPath }));
      fileStream.on('error', reject);
    });
  } catch (error) {
    console.error("Error downloading and saving media:", error);
    return null;
  }
};