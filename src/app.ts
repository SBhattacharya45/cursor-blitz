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

interface letterArr {
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
            let resArr: letterArr[][] = [[]]; 
            let wIndex = 0;
        
            let cursorSet: boolean = false;
            for (let i: number = 0; i < sampleWords.length; i++) {
                if (i > userInp.length - 1) {
                    if (!cursorSet) {
                        cursorSet = true;
                        resString += "|";
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
                                    resString += "\x1b[32m" + userInp[i][j] + "\x1b[0m";
                                    resArr[wIndex].push({chr: userInp[i][j], code: 'grn'});
                                } else {
                                    resString += "\x1b[31m" + sampleWords[i][j] + "\x1b[0m";
                                    resArr[wIndex].push({chr: sampleWords[i][j], code: 'red'});
                                }
                            } else {
                                resString += "\x1b[35m" + userInp[i][j] + "\x1b[0m";
                                resArr[wIndex].push({chr: userInp[i][j], code: 'mgn'});
                            }
                        }
                        if (!cursorSet && i === userInp.length - 1 && i === curWordIndex) {
                            cursorSet = true;
                            resString += "|";
                            resArr[wIndex].push({chr: "|", code: 'nil'});
                        }
                    } else {
                        for (let j: number = 0; j < sampleWords[i].length; j++) {
                            if (j < userInp[i].length) {
                                if (sampleWords[i][j] === userInp[i][j]) {
                                    resString += "\x1b[32m" + sampleWords[i][j] + "\x1b[0m";
                                    resArr[wIndex].push({chr: sampleWords[i][j], code: 'grn'});
                                } else {
                                    resString += "\x1b[31m" + sampleWords[i][j] + "\x1b[0m";
                                    resArr[wIndex].push({chr: sampleWords[i][j], code: 'red'});
                                }
                            } else {
                                if (!cursorSet && i === curWordIndex) {
                                    cursorSet = true;
                                    resString += "|";
                                    resArr[wIndex].push({chr: "|", code: 'nil'});
                                }
                                if (i < curWordIndex) {
                                    resString += "\x1b[2m" + sampleWords[i][j] + "\x1b[0m";
                                    resArr[wIndex].push({chr: sampleWords[i][j], code: 'gry'});
                                } else {
                                    resString += sampleWords[i][j];
                                    resArr[wIndex].push({chr: sampleWords[i][j], code: 'nil'});
                                }
                            }
                        }
                    }
                }

                if (i < sampleWords.length - 1) {
                    resString = resString + " ";
                    resArr.push([]);
                    wIndex++;
                }
            }

            if (userInp.length === sampleWords.length && sampleWords[wordCount - 1] === userInp[wordCount - 1]) {
                console.clear();
                console.log('grats you passed');

                const timeDiff: number = (new Date().getTime() - startTime) / 1000;
                console.log(`Time: ${(Math.round(timeDiff * 100) / 100)} seconds`);
                console.log(`Speed: ${Math.floor((wordCount / timeDiff) * 60)} WPM`);
                process.exit();
            } else {
                console.clear();
                const d: string = await figlet('Cursor Blitz');
                console.log(d);
                console.log(resString);
                drawBoxFromArray(resArr);
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

function drawBox(text: string, width: number = 80) {
    // const boxTop: string = "╭" + "─".repeat(width-2) + "╮";
    // const boxBottom: string = "╰" + "─".repeat(width-2) + "╯";
    // let boxContent: string = "";
    // const reqdTxt: string = text.replace(ansiRegex, '');

    // const lineLength = (width - 4);

    // if(reqdTxt.length > lineLength) {
    //     const lineCount = Math.ceil(reqdTxt.length % lineLength);
    //     for(let i: number = 0; i < lineCount; i++) {
    //         console.log("hi");
    //     }
    // } else {
    //     boxContent = '';
    // }

    //  return boxContent;
}

function drawBoxFromArray(textArr: letterArr[][], width: number = 80) {
    const boxTop: string = "╭" + "─".repeat(width-2) + "╮";
    const boxBottom: string = "╰" + "─".repeat(width-2) + "╯";

    const lineLength = (width - 4);

    let resString: string[] = [""];
    let resIndex: number = 0;

    let letterCount = 0;
    for(const t of textArr) {
        if(letterCount + t.length + 1 > lineLength) {
            resIndex++;
            resString[resIndex] = "";
            letterCount = 0;
        }

        if(resString[resIndex] !== ""){
            resString[resIndex] += " ";
            letterCount++;
        }
        for(const k of t) {
            resString[resIndex] += ansiMap[k.code] + k.chr + ansiMap['nil'];
            letterCount++;
        }
    }
    console.log(boxTop);
    for(const r of resString) {
        // let k = r;
        // k.replace(ansiRegex, "");
        console.log("│ " + r + " ".repeat(width - 4 - r.replace(ansiRegex, "").length) + " │");
        // console.log(r.replace(ansiRegex, "").length, r);
    }
    console.log(boxBottom);

    // for(const [index, b] of boxContent.entries()) {
    //     if(index === cursorLine)
    //         console.log("| "+b+" |");
    //     else
    //         console.log("| "+b+"  |");
    // }
}