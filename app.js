
const readline = require('readline');
const { program } = require('commander');
const figlet = require("figlet");
const enData = require('./words/english.js').data;

program
    .option('-c, --count <num>', 'number of words');

const enRegex = /^[a-zA-Z]+$/;
program.parse();

const options = program.opts();
readKeys(options.count ? options.count : null);

async function readKeys(count = null) {
    let sampleWords = [];
    let wordCount = (count ? parseInt(count) : 10);
    // let wordCount = 3;
    let userInp = [];
    let startTime = null;

    let curWordIndex = 0;
    let backLimit = 0;

    for (let i = 0; i < wordCount; i++) {
        sampleWords.push(enData[Math.floor(Math.random() * enData.length)]);
    }
    // sampleWords = ['apple', 'ball', 'cat'];
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', async (str, key) => {
        if (startTime === null)
            startTime = new Date();
        if (key.ctrl && key.name === 'c') {
            process.exit();
        } else {
            if (str === " ") {
                if (userInp.length === 0) {
                    return;
                } else {
                    if (curWordIndex === backLimit && userInp[curWordIndex] === sampleWords[curWordIndex])
                        backLimit++;
                    curWordIndex++;
                    userInp[curWordIndex] = "";
                }
            } else if (str === "\b") {
                if (userInp.length === 0) {
                    return;
                } else {
                    if (userInp[curWordIndex].length === 0) {
                        if (curWordIndex === backLimit) {
                            return;
                        } else {
                            userInp.splice(curWordIndex, 1);
                            curWordIndex--;
                        }
                    } else {
                        userInp[curWordIndex] = (userInp[curWordIndex] ? userInp[curWordIndex].slice(0, -1) : str);
                    }
                }
            } else {
                userInp[curWordIndex] = (userInp[curWordIndex] ? userInp[curWordIndex] + str : str);
            }

            let resString = "";
            let cursorSet = false;
            for (let i = 0; i < sampleWords.length; i++) {
                if (i > userInp.length - 1) {
                    if (!cursorSet) {
                        cursorSet = true;
                        resString += "|";
                    }
                    resString = resString + sampleWords[i];
                } else {
                    if (userInp[i].length >= sampleWords[i].length) {
                        for (let j = 0; j < userInp[i].length; j++) {
                            if (j < sampleWords[i].length) {
                                if (sampleWords[i][j] === userInp[i][j]) {
                                    resString += "\x1b[32m" + userInp[i][j] + "\x1b[0m";
                                } else {
                                    resString += "\x1b[31m" + sampleWords[i][j] + "\x1b[0m";
                                }
                            } else {
                                resString += "\x1b[35m" + userInp[i][j] + "\x1b[0m";
                            }
                        }
                        if (!cursorSet && i === userInp.length - 1 && i === curWordIndex) {
                            cursorSet = true;
                            resString += "|";
                        }
                    } else {
                        for (let j = 0; j < sampleWords[i].length; j++) {
                            if (j < userInp[i].length) {
                                if (sampleWords[i][j] === userInp[i][j]) {
                                    resString += "\x1b[32m" + sampleWords[i][j] + "\x1b[0m";
                                } else {
                                    resString += "\x1b[31m" + sampleWords[i][j] + "\x1b[0m";
                                }
                            } else {
                                if (!cursorSet && i === curWordIndex) {
                                    cursorSet = true;
                                    resString += "|";
                                }
                                if (i < curWordIndex) {
                                    resString += "\x1b[2m" + sampleWords[i][j] + "\x1b[0m";
                                } else {
                                    resString += sampleWords[i][j];
                                }
                            }
                        }
                    }
                }

                if (i < sampleWords.length - 1)
                    resString = resString + " ";
            }

            if (userInp.length === sampleWords.length && sampleWords[wordCount - 1] === userInp[wordCount - 1]) {
                console.clear();
                console.log('grats you passed');

                const timeDiff = (new Date().getTime() - startTime) / 1000;
                console.log(`Time: ${(Math.round(timeDiff * 100) / 100)} seconds`);
                console.log(`Speed: ${Math.floor((wordCount / timeDiff) * 60)} WPM`);
                process.exit();
            } else {
                console.clear();
                const d = await figlet('Test');
                console.log(d);
                console.log(resString);
            }
        }
    });
    let resString = "|";
    for (let i = 0; i < sampleWords.length; i++) {
        resString = resString + sampleWords[i];
        if (i < sampleWords.length - 1)
            resString = resString + " ";
    }
    console.clear();
    const d = await figlet('Test');
    console.log(d);
    console.log(resString);
}