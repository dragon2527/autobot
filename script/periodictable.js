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
    name: "periodictable",
    version: "1.0.0",
    role: 0,
    hasPrefix: true,
    aliases: ["ptable", "elements"],
    credits: "Kaizenji",
    description: "Fetch information from the periodic table.",
    usages: "periodictable [element name]",
    cooldown: 5,
};

module.exports.run = async ({ api, event, args }) => {
    const axios = require('axios');
    const fs = require('fs-extra');

   const elementList = [
       "Hydrogen", "Helium", "Lithium", "Beryllium", "Boron", "Carbon", "Nitrogen", "Oxygen", "Fluorine", "Neon",
       "Sodium", "Magnesium", "Aluminum", "Silicon", "Phosphorus", "Sulfur", "Chlorine", "Argon", "Potassium", "Calcium",
       "Scandium", "Titanium", "Vanadium", "Chromium", "Manganese", "Iron", "Cobalt", "Nickel", "Copper", "Zinc",
       "Gallium", "Germanium", "Arsenic", "Selenium", "Bromine", "Krypton", "Rubidium", "Strontium", "Yttrium", "Zirconium",
       "Niobium", "Molybdenum", "Technetium", "Ruthenium", "Rhodium", "Palladium", "Silver", "Cadmium", "Indium", "Tin",
       "Antimony", "Tellurium", "Iodine", "Xenon", "Cesium", "Barium", "Lanthanum", "Cerium", "Praseodymium", "Neodymium",
       "Promethium", "Samarium", "Europium", "Gadolinium", "Terbium", "Dysprosium", "Holmium", "Erbium", "Thulium", "Ytterbium",
       "Lutetium", "Hafnium", "Tantalum", "Tungsten", "Rhenium", "Osmium", "Iridium", "Platinum", "Gold", "Mercury",
       "Thallium", "Lead", "Bismuth", "Polonium", "Astatine", "Radon", "Francium", "Radium", "Actinium", "Thorium",
       "Protactinium", "Uranium", "Neptunium", "Plutonium", "Americium", "Curium", "Berkelium", "Californium", "Einsteinium", "Fermium",
       "Mendelevium", "Nobelium", "Lawrencium", "Rutherfordium", "Dubnium", "Seaborgium", "Bohrium", "Hassium", "Meitnerium", "Darmstadtium",
       "Roentgenium", "Copernicium", "Nihonium", "Flerovium", "Moscovium", "Livermorium", "Tennessine", "Oganesson"
   ];
   
    try {
        const { threadID, messageID } = event;
        const query = args.join(" ").toLowerCase();

        if (!query) {
            api.sendMessage(formatFont(`📝 | List of 118 elements in the periodic table:\n${elementList.join(", ")}`), threadID);
            return;
        }

        api.sendMessage(formatFont(`🔍 | Fetching information for: "${query}"`), threadID, (err, info) => {
            setTimeout(() => api.unsendMessage(info.messageID), 3000);
        }, messageID);

        const response = await axios.get(`https://api.popcat.xyz/periodic-table?element=${encodeURIComponent(query)}`);
        const elementData = response.data;

        const elementInfo = `
            Name: ${elementData.name}
            Symbol: ${elementData.symbol}
            Atomic Number: ${elementData.atomic_number}
            Atomic Mass: ${elementData.atomic_mass}
            Period: ${elementData.period}
            Phase: ${elementData.phase}
            Discovered By: ${elementData.discovered_by}
            Summary: ${elementData.summary}
        `;

        api.sendMessage(formatFont(elementInfo.trim()), threadID, messageID);

        const imagePath = __dirname + '/cache/' + `${elementData.atomic_number}_element.png`;
        const imageResponse = await axios.get(elementData.image, { responseType: 'arraybuffer' });
        fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, 'binary'));

        setTimeout(() => {
            api.sendMessage({
                body: formatFont("🖼️ | Element Image:"),
                attachment: fs.createReadStream(imagePath)
            }, threadID, () => fs.unlinkSync(imagePath));
        }, 3000);

    } catch (error) {
        api.sendMessage(formatFont(`❌ | Error: ${error.message}`), threadID, messageID);
    }
};