import { Key } from "readline";

const readline = require('readline');
const { program } = require('commander');
const figlet = require("figlet");
const enData: string[] = require('./words/english.ts').data;

const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
const ansiMap = {
    grn: '\x1b[32m',
    red: '\x1b[31m',
    mgn: '\x1b[35m',
    gry: '\x1b[2m',
    nil: '\x1b[0m'
}
const boxWidth = 80;

interface charArr {
    chr: string,
    code: string
}

program
    .option('-c, --count <num>', 'number of words');

program.parse();

const options = program.opts();
readKeys(options.count ? options.count : null);
// console.log(drawBox("Sample text"));

async function readKeys(count: string = null) {
    let sampleWords: string[] = [];
    let wordCount: number = (count ? parseInt(count) : 10);
    if(wordCount > 100 || wordCount < 1) {
        console.log('\x1b[31mPlease enter valid word count[1-100]\x1b[0m');
        process.exit();
    }
    // let wordCount = 3;
    let userInp: string[] = [];
    let startTime: number = null;

    let curWordIndex: number = 0;
    let backLimit: number = 0;

    for (let i: number = 0; i < wordCount; i++) {
        sampleWords.push(enData[Math.floor(Math.random() * enData.length)]);
    }
    // sampleWords = ['apple', 'ball', 'cat'];
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', async (str: string, key: Key) => {
        if (startTime === null)
            startTime = new Date().getTime();
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
            } else if(/^[a-zA-Z0-9_]*$/.test(str)) {
                userInp[curWordIndex] = (userInp[curWordIndex] ? userInp[curWordIndex] + str : str);
            }

            let resString: string = "";
            let resArr: charArr[][] = [[]]; 
            let wIndex = 0;
        
            let cursorSet: boolean = false;
            for (let i: number = 0; i < sampleWords.length; i++) {
                if (i > userInp.length - 1) {
                    if (!cursorSet) {
                        cursorSet = true;
                        resArr[wIndex].push({chr: "|", code: 'nil'});
                    }
                    resString = resString + sampleWords[i];
                    for(const n of sampleWords[i]) {
                        resArr[wIndex].push({chr: n, code: 'nil'});
                    };
                } else {
                    if (userInp[i].length >= sampleWords[i].length) {
                        for (let j = 0; j < userInp[i].length; j++) {
                            if (j < sampleWords[i].length) {
                                if (sampleWords[i][j] === userInp[i][j]) {
                                    resArr[wIndex].push({chr: userInp[i][j], code: 'grn'});
                                } else {
                                    resArr[wIndex].push({chr: sampleWords[i][j], code: 'red'});
                                }
                            } else {
                                resArr[wIndex].push({chr: userInp[i][j], code: 'mgn'});
                            }
                        }
                        if (!cursorSet && i === userInp.length - 1 && i === curWordIndex) {
                            cursorSet = true;
                            resArr[wIndex].push({chr: "|", code: 'nil'});
                        }
                    } else {
                        for (let j: number = 0; j < sampleWords[i].length; j++) {
                            if (j < userInp[i].length) {
                                if (sampleWords[i][j] === userInp[i][j]) {
                                    resArr[wIndex].push({chr: sampleWords[i][j], code: 'grn'});
                                } else {
                                    resArr[wIndex].push({chr: sampleWords[i][j], code: 'red'});
                                }
                            } else {
                                if (!cursorSet && i === curWordIndex) {
                                    cursorSet = true;
                                    resArr[wIndex].push({chr: "|", code: 'nil'});
                                }
                                if (i < curWordIndex) {
                                    resArr[wIndex].push({chr: sampleWords[i][j], code: 'gry'});
                                } else {
                                    resArr[wIndex].push({chr: sampleWords[i][j], code: 'nil'});
                                }
                            }
                        }
                    }
                }

                if (i < sampleWords.length - 1) {
                    resArr.push([]);
                    wIndex++;
                }
            }
            console.clear();
            const d: string = await figlet('Cursor Blitz');
            console.log(d);
            const formattedArr: string[] = formatCharArr(resArr);
            logInBox(formattedArr);

            if (userInp.length === sampleWords.length && sampleWords[wordCount - 1] === userInp[wordCount - 1]) {
                const endTime: number = new Date().getTime();
                printEndScreen(startTime, endTime, wordCount);
                process.exit();
            }
        }
    });
    let resString: string = "|";
    for (let i: number = 0; i < sampleWords.length; i++) {
        resString = resString + sampleWords[i];
        if (i < sampleWords.length - 1)
            resString = resString + " ";
    }
    console.clear();
    const d: string = await figlet('Cursor Blitz');
    console.log(d);
    console.log(resString);
}

function printEndScreen(startTime: number, endTime: number, wordCount: number) {
    let result: string[] = [];
    const timeDiff: number = (endTime - startTime) / 1000;

    result.push('Congrats, you\'ve completed the blitz');
    result.push(`Time: ${(Math.round(timeDiff * 100) / 100)} seconds`);
    result.push(`Speed: ${Math.floor((wordCount / timeDiff) * 60)} WPM`);

    logInBox(result);
}

function formatCharArr(textArr: charArr[][]) {
    const lineLength = (boxWidth - 4);

    let resString: string[] = [""];
    let resIndex: number = 0;

    let charCount = 0;
    for(const t of textArr) {
        if(charCount + t.length + 1 > lineLength) {
            resIndex++;
            resString[resIndex] = "";
            charCount = 0;
        }

        if(resString[resIndex] !== ""){
            resString[resIndex] += " ";
            charCount++;
        }
        for(const k of t) {
            resString[resIndex] += ansiMap[k.code] + k.chr + ansiMap['nil'];
            charCount++;
        }
    }

    return resString;
}

function logInBox(a: string[]) {
    const boxTop: string = "╭" + "─".repeat(boxWidth-2) + "╮";
    const boxBottom: string = "╰" + "─".repeat(boxWidth-2) + "╯";

    console.log(boxTop);
    for(const r of a) {
        console.log("│ " + r + " ".repeat(boxWidth - 4 - r.replace(ansiRegex, "").length) + " │");
    }
    console.log(boxBottom);
}