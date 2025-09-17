#!/usr/bin/env node
import { Key } from "readline";
import { charArr, statObj } from './types';
import { fetchWord, formatCharArr, logInBox, logError, loadWordsFromCsv } from './utils';

const readline = require('readline');
const { program, Option, Argument } = require('commander');
const figlet = require("figlet");

try {
    program.name('blitz');
    program.command('time')
        .description('Time limited blitz')
        .addArgument(new Argument('[time]', 'time in seconds').default(30, '30 seconds').argParser((value) => {
            const num = parseInt(value, 10);
            if (isNaN(num)) {
                throw new Error('Time must be a number.');
            }
            return num;
        })
        )
        .addOption(new Option('-w, --words <path>', 'path to custom CSV file for words').default(null))
        .action((time, options) => {
            startBlitz('time', { time, ...options });
        });
    program.command('count')
        .description('Word limited blitz')
        .addArgument(new Argument('[count]', 'number of words').default(20, '20 words').argParser((value) => {
            const num = parseInt(value, 10);
            if (isNaN(num)) {
                throw new Error('Count must be a number.');
            }
            return num;
        }))
        .addOption(new Option('-w, --words <path>', 'path to custom CSV file for words').default(null))
        .action((count, options) => {
            startBlitz('count', { count, ...options });
        });
    program.parse();
} catch(err) {
    logError(err.message);
    process.exit();
}

function startBlitz(mode, arg) {
    switch (mode) {
        case "time":
            timeMode(typeof arg === "object" && "time" in arg ? arg.time : arg, arg.words);
            break;
        case "count":
            countMode(typeof arg === "object" && "count" in arg ? arg.count : arg, arg.words);
            break;
        default:
            countMode(typeof arg === "object" && "count" in arg ? arg.count : arg, arg.words);
    }
}

async function timeMode(time: number, words: string = null) {
    let header: string = "";
    let sampleWords: string[] = [];
    let wordCount: number = 30;
    let userInp: string[] = [];
    let startTime: number = null;
    let curWordIndex: number = 0;
    let backLimit: number = 0;
    let customWords: string[] = [];
    if(words !== null) {
        customWords = loadWordsFromCsv(words);
        if(customWords.length === 0) {
            logError("No words found in the provided CSV file.");
            process.exit();
        }
    }

    if (time > 120 || time < 10) {
        logError("Please enter valid time limit[10-120]");
        process.exit();
    }

    sampleWords = generateWords(customWords, wordCount);
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
            console.log(header);
            logInBox(["You have " + (time - Math.round((new Date().getTime() - startTime)/1000)) + " seconds left. The timer updates as you type."]);
            const formattedArr: string[] = formatCharArr(resArr);
            logInBox(formattedArr);

            if (userInp.length > sampleWords.length - 10) {
                for (let i: number = 0; i < 10; i++) {
                    if(customWords.length > 0) {
                        const randIndex = Math.floor(Math.random() * customWords.length);
                        sampleWords.push(customWords[randIndex]);
                    } else {
                        sampleWords.push(fetchWord());
                    }
                }
            }
        }
    });

    let resArr: charArr[][] = evaluateInp(sampleWords, [], 0);
    console.clear();
    header = await figlet('Cursor Blitz');
    console.log(header);
    logInBox(["Timer starts when you start typing. You have " + time + " seconds."]);
    const formattedArr: string[] = formatCharArr(resArr);
    logInBox(formattedArr);
}

async function countMode(count: number = null, words: string = null) {
    let header: string = "";
    let sampleWords: string[] = [];
    let wordCount: number = (count ? count : 10);
    let userInp: string[] = [];
    let startTime: number = null;
    let curWordIndex: number = 0;
    let backLimit: number = 0;
    let customWords: string[] = [];
    if(words !== null) {
        customWords = loadWordsFromCsv(words);
        if(customWords.length === 0) {
            logError("No words found in the provided CSV file.");
            process.exit();
        }
    }

    if (wordCount > 100 || wordCount < 1) {
        logError("Please enter valid word count[1-100]");
        process.exit();
    }
    
    sampleWords = generateWords(customWords, wordCount);
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
    } else {
        logError("The input device is not a TTY");
        process.exit();
    }
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
            console.log(header);
            logInBox(["Type " + wordCount + " words to finish the blitz.", "The final word must be correct to complete the challenge"]);
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
    header = await figlet('Cursor Blitz');
    console.log(header);
    logInBox(["Type " + wordCount + " words to finish the blitz.", "The final word must be correct to complete the challenge"]);
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

function generateWords(customWords: string[] = [], count: number = 10) {
    let words: string[] = [];
    for (let i: number = 0; i < count; i++) {
        if(customWords.length > 0) {
            const randIndex = Math.floor(Math.random() * customWords.length);
            words.push(customWords[randIndex]);
        } else {
            words.push(fetchWord());
        }
    }
    return words;
}