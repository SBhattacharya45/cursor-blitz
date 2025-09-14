import { charArr } from './types';

const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
const ansiMap = {
    grn: '\x1b[32m',
    red: '\x1b[31m',
    mgn: '\x1b[35m',
    gry: '\x1b[2m',
    nil: '\x1b[0m'
}
const boxWidth = 80;

export function formatCharArr(textArr: charArr[][]) {
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

export function logInBox(a: string[]) {
    const boxTop: string = "╭" + "─".repeat(boxWidth - 2) + "╮";
    const boxBottom: string = "╰" + "─".repeat(boxWidth - 2) + "╯";

    console.log(boxTop);
    for (const r of a) {
        console.log("│ " + r + " ".repeat(boxWidth - 4 - r.replace(ansiRegex, "").length) + " │");
    }
    console.log(boxBottom);
}

export function logError(err: string) {
    console.log(`\x1b[31mERROR: ${err}\x1b[0m`);
}