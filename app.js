
const readline = require('readline');
const { program } = require('commander');
const figlet = require("figlet");

program
  .option('-c, --count <num>', 'number of words');

program.parse();

const options = program.opts();
readKeys(options.count ? options.count : null);

async function readKeys(count = null) {
    const words = [
        "apple",
        "balloon",
        "cat",
        "dog",
        "elephant",
        "flower",
        "guitar",
        "house",
        "ice",
        "jelly",
        "kite",
        "lemon",
        "monkey",
        "notebook",
        "orange",
        "piano",
        "queen",
        "rabbit",
        "snake",
        "tree",
        "umbrella",
        "violin",
        "water",
        "xylophone",
        "yellow",
        "zebra",
        "acrobat",
        "bridge",
        "castle",
        "dolphin",
        "eagle",
        "forest",
        "garden",
        "hat",
        "island",
        "jacket",
        "key",
        "lantern",
        "mountain",
        "night",
        "ocean",
        "parrot",
        "quilt",
        "river",
        "star",
        "tower",
        "universe",
        "vacation",
        "whale",
        "x-ray",
        "yarn",
        "zoo",
        "airplane",
        "basket",
        "chocolate",
        "dragon",
        "envelope",
        "fire",
        "guitar",
        "hill",
        "ink",
        "jungle",
        "kite",
        "ladder",
        "map",
        "notebook",
        "orange",
        "pumpkin",
        "question",
        "rainbow",
        "sun",
        "treehouse",
        "umbrella",
        "vase",
        "window",
        "xylophone",
        "yogurt",
        "zebra",
        "astronaut",
        "bubble",
        "cupcake",
        "dinosaur",
        "echo",
        "feather",
        "guitar",
        "hammock",
        "igloo",
        "jaguar",
        "kaleidoscope",
        "lamp",
        "moon",
        "napkin",
        "octopus",
        "pancake",
        "quilt",
        "robot",
        "snowflake",
        "telescope",
        "unicorn",
        "volcano"
    ];
    let sampleString = "";
    let wordCount = (count ? count : 10);
    for(let i = 0; i < wordCount; i++) {
        if(sampleString !== "")
            sampleString += " ";
        sampleString += words[Math.floor(Math.random() * words.length)];
    }
    let userInp = "";
    let startTime = null;
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', async (str, key) => {
        if(startTime === null)
            startTime = new Date();
        if (key.ctrl && key.name === 'c') {
            process.exit();
        } else {
            if(str === "\b" && userInp.length > 0) {
                userInp = userInp.substring(0,userInp.length - 1);
            } else {
                userInp = userInp + str;
            }
            resString = "";
            for(let i = 0,  j = 0; j < sampleString.length;) {
                if(userInp.length === 0) {
                    resString = sampleString;
                    break;
                }
                if(sampleString[j] === userInp[i]) {
                    resString += "\x1b[32m" + userInp[i] + "\x1b[0m";
                } else {
                    resString += "\x1b[31m" + userInp[i] + "\x1b[0m";
                }
                i++;
                j++;
                if(i === userInp.length) {
                    resString += sampleString.substring(j);
                    break;
                }
            }
            if(userInp === sampleString) {
                console.clear();
                console.log('grats you passed');
                const timeDiff = (new Date().getTime() - startTime)/1000;
                console.log(`Time: ${(Math.round(timeDiff * 100) / 100)} seconds`);
                console.log(`Speed: ${Math.floor((wordCount/timeDiff)*60)} WPM`);
                process.exit();
            } else {
                console.clear();
                const d = await figlet('Test');
                console.log(d);
                // console.log(sampleString);
                console.log(resString);
            }
            // console.log(`You pressed the "${str}" key`);
            // console.log();
            // console.log(key);
            // console.log();
            // console.log("\x1b[32m Output with green text \x1b[0m \x1b[34m Output with green text \x1b[0m");

        }
    });
    console.clear();
    const d = await figlet('Test');
    console.log(d);
    console.log(sampleString);
}