#!/usr/bin/env node
import { Key } from "readline";

const readline = require('readline');
const { program, Option, Argument } = require('commander');
const figlet = require("figlet");
const enData: string[] = require('./words/english').data;

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

interface statObj {
    time: number,
    gwpm: number,
    nwpm: number,
    accuracy: number,
}

program.name('blitz');
program.command('time')
    .description('Time limited blitz')
    // .addOption(new Option('-t, --time <num>', 'time in seconds for time mode').default('30', '30 seconds'))
    .addArgument(new Argument('[time]', 'time in seconds').default(30, '30 seconds'))
    .action((options) => {
        startBlitz('time', options);
    });
program.command('count')
    .description('Word limited blitz')
    // .addOption(new Option('-c, --count <num>', 'word limit for word mode').default('20', '20 Words'))
    .addArgument(new Argument('[count]', 'number of words').default(20, '20 words'))
    .action((options) => {
        startBlitz('count', options);
    });
program.parse();

function startBlitz(mode, arg) {
    switch (mode) {
        case "time":
            timeMode(arg);
            break;
        case "count":
            countMode(arg);
            break;
        default:
            countMode(arg);
    }
}

async function timeMode(time: number) {
    let sampleWords: string[] = [];
    let wordCount: number = 30;
    let userInp: string[] = [];
    let startTime: number = null;
    let curWordIndex: number = 0;
    let backLimit: number = 0;

    if (time > 120 || time < 10) {
        logError("Please enter valid time limit[10-120]");
        process.exit();
    }

    for (let i: number = 0; i < wordCount; i++) {
        sampleWords.push(enData[Math.floor(Math.random() * enData.length)]);
    }
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
    } else {
        logError("The input device is not a TTY");
        process.exit();
    }
    process.stdin.on('keypress', async (str: string, key: Key) => {
        if (startTime === null) {
            startTime = new Date().getTime();
            setTimeout(() => {
                let resArr: charArr[][] = evaluateInp(sampleWords, userInp, curWordIndex);
                const endTime: number = new Date().getTime();
                const stats: statObj = calcStats(resArr, startTime, endTime);
                endBlitz(stats);
            }, time * 1000)
        }
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
            } else if (str === "\b" || (key && key.name === "backspace")) {
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
            } else if (str && /^[a-zA-Z0-9_]*$/.test(str)) {
                userInp[curWordIndex] = (userInp[curWordIndex] ? userInp[curWordIndex] + str : str);
            }

            let resArr: charArr[][] = evaluateInp(sampleWords, userInp, curWordIndex);

            console.clear();
            const d: string = await figlet('Cursor Blitz');
            console.log(d);
            logInBox(["You have " + (time - Math.round((new Date().getTime() - startTime)/1000)) + " seconds left. Timer updates as you type."]);
            const formattedArr: string[] = formatCharArr(resArr);
            logInBox(formattedArr);

            if (userInp.length > sampleWords.length - 10) {
                for (let i: number = 0; i < 10; i++) {
                    sampleWords.push(enData[Math.floor(Math.random() * enData.length)]);
                }
            }
        }
    });

    let resArr: charArr[][] = evaluateInp(sampleWords, [], 0);
    console.clear();
    const d: string = await figlet('Cursor Blitz');
    console.log(d);
    logInBox(["Timer starts when you start typing. You have " + time + " seconds."]);
    const formattedArr: string[] = formatCharArr(resArr);
    logInBox(formattedArr);
}

async function countMode(count: number = null) {
    let sampleWords: string[] = [];
    let wordCount: number = (count ? count : 10);
    let userInp: string[] = [];
    let startTime: number = null;
    let curWordIndex: number = 0;
    let backLimit: number = 0;

    if (wordCount > 100 || wordCount < 1) {
        logError("Please enter valid word count[1-100]");
        process.exit();
    }
    
    for (let i: number = 0; i < wordCount; i++) {
        sampleWords.push(enData[Math.floor(Math.random() * enData.length)]);
    }
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
            } else if (str === "\b" || (key && key.name === "backspace")) {
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
            } else if (str && /^[a-zA-Z0-9_]*$/.test(str)) {
                userInp[curWordIndex] = (userInp[curWordIndex] ? userInp[curWordIndex] + str : str);
            }

            let resArr: charArr[][] = evaluateInp(sampleWords, userInp, curWordIndex);

            console.clear();
            const d: string = await figlet('Cursor Blitz');
            console.log(d);
            logInBox(["Type " + wordCount + " words to finish blitz.", "Last word has to be correct to complete the test."]);
            const formattedArr: string[] = formatCharArr(resArr);
            logInBox(formattedArr);

            if (userInp.length === sampleWords.length && sampleWords[wordCount - 1] === userInp[wordCount - 1]) {
                const endTime: number = new Date().getTime();
                const stats: statObj = calcStats(resArr, startTime, endTime);
                endBlitz(stats);
            }
        }
    });
    let resArr: charArr[][] = evaluateInp(sampleWords, [], 0);
    console.clear();
    const d: string = await figlet('Cursor Blitz');
    console.log(d);
    logInBox(["Type " + wordCount + " words to finish blitz.", "Last word has to be correct to complete the test."]);
    const formattedArr: string[] = formatCharArr(resArr);
    logInBox(formattedArr);
}

function evaluateInp(sampleWords: string[], userInp: string[], curWordIndex: number) {
    let resArr: charArr[][] = [[]];
    let wIndex = 0;

    let cursorSet: boolean = false;
    for (let i: number = 0; i < sampleWords.length; i++) {
        if (i > userInp.length - 1) {
            if (!cursorSet) {
                cursorSet = true;
                resArr[wIndex].push({ chr: "|", code: 'nil' });
            }
            for (const n of sampleWords[i]) {
                resArr[wIndex].push({ chr: n, code: 'nil' });
            };
        } else {
            if (userInp[i].length >= sampleWords[i].length) {
                for (let j = 0; j < userInp[i].length; j++) {
                    if (j < sampleWords[i].length) {
                        if (sampleWords[i][j] === userInp[i][j]) {
                            resArr[wIndex].push({ chr: userInp[i][j], code: 'grn' });
                        } else {
                            resArr[wIndex].push({ chr: sampleWords[i][j], code: 'red' });
                        }
                    } else {
                        resArr[wIndex].push({ chr: userInp[i][j], code: 'mgn' });
                    }
                }
                if (!cursorSet && i === userInp.length - 1 && i === curWordIndex) {
                    cursorSet = true;
                    resArr[wIndex].push({ chr: "|", code: 'nil' });
                }
            } else {
                for (let j: number = 0; j < sampleWords[i].length; j++) {
                    if (j < userInp[i].length) {
                        if (sampleWords[i][j] === userInp[i][j]) {
                            resArr[wIndex].push({ chr: sampleWords[i][j], code: 'grn' });
                        } else {
                            resArr[wIndex].push({ chr: sampleWords[i][j], code: 'red' });
                        }
                    } else {
                        if (!cursorSet && i === curWordIndex) {
                            cursorSet = true;
                            resArr[wIndex].push({ chr: "|", code: 'nil' });
                        }
                        if (i < curWordIndex) {
                            resArr[wIndex].push({ chr: sampleWords[i][j], code: 'gry' });
                        } else {
                            resArr[wIndex].push({ chr: sampleWords[i][j], code: 'nil' });
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

    return resArr;
}

function calcStats(resArr: charArr[][], startTime: number, endTime: number) {
    const c =  getStatCount(resArr);

    const tsec: number = (endTime - startTime) / 1000;
    const tmin: number = tsec / 60;

    const gwpm = Math.floor(((c.correctCount + c.wrongCount)/5) / tmin);
    const nwpm = Math.floor(((c.correctCount)/5) / tmin);
    const accuracy = Math.floor((c.correctCount/(c.correctCount + c.wrongCount)) * 100);

    const res: statObj = {
        time: tsec,
        gwpm,
        nwpm,
        accuracy
    }

    return res;
}

function getStatCount(resArr: charArr[][]) {
    let correctCount = 0;
    let wrongCount = 0;
    let extraCount = 0;

    for(let i: number = 0; i < resArr.length; i++) {
        for(let j: number = 0; j < resArr[i].length; j++) {
            const r = resArr[i][j];
            if(r.chr === "|") {
                return {correctCount, wrongCount, extraCount};
            }
            if(r.code === "grn")
                correctCount++;
            else if(r.code === "red")
                wrongCount++;
            else if(r.code === "mgn")
                extraCount++;
        }
        correctCount++;
    }

    return {correctCount, wrongCount, extraCount};
}

function endBlitz(stats: statObj) {
    printEndScreen(stats);
    process.exit();
}

function printEndScreen(stats: statObj) {
    let result: string[] = [];

    result.push('Congrats, you\'ve completed the blitz.');
    result.push(`Time: ${Math.floor(stats.time)} seconds`);
    result.push(`WPM: ${stats.nwpm}`);
    result.push(`Gross WPM: ${stats.gwpm}`);
    result.push(`Accuracy: ${stats.accuracy}%`);

    logInBox(result);
}

function formatCharArr(textArr: charArr[][]) {
    const lineLength = (boxWidth - 4);

    let resString: string[] = [""];
    let resIndex: number = 0;

    let charCount = 0;
    for (const t of textArr) {
        if (charCount + t.length + 1 > lineLength) {
            resIndex++;
            resString[resIndex] = "";
            charCount = 0;
        }

        if (resString[resIndex] !== "") {
            resString[resIndex] += " ";
            charCount++;
        }
        for (const k of t) {
            resString[resIndex] += ansiMap[k.code] + k.chr + ansiMap['nil'];
            charCount++;
        }
    }

    return resString;
}

function logInBox(a: string[]) {
    const boxTop: string = "╭" + "─".repeat(boxWidth - 2) + "╮";
    const boxBottom: string = "╰" + "─".repeat(boxWidth - 2) + "╯";

    console.log(boxTop);
    for (const r of a) {
        console.log("│ " + r + " ".repeat(boxWidth - 4 - r.replace(ansiRegex, "").length) + " │");
    }
    console.log(boxBottom);
}

function logError(err: string) {
    console.log(`\x1b[31mERROR: ${err}\x1b[0m`);
}