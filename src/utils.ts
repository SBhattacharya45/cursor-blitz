import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
const engDb = require('better-sqlite3')(path.join(__dirname, '../data/eng.db'));
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

export function loadWordsFromCsv(filePath: string): string[] {
  if (!filePath.endsWith('.csv')) {
    logError('Only CSV files are allowed.');
    process.exit();
  }
  if (!fs.existsSync(filePath)) {
    logError(`File not found at ${filePath}`);
    process.exit();
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  const records = parse(content, {
    columns: true,       // first row is header
    skip_empty_lines: true,
    trim: true
  }) as Array<Record<string, any>>;

  if (!records[0] || !('word' in records[0])) {
    logError('CSV must have a "word" column.');
    process.exit();
  }

  const words: string[] = records.map((row: any) => row.word);

  return words;
}

export function fetchWord() {
  try {
    let row = engDb.prepare('SELECT word FROM words ORDER BY RANDOM() LIMIT 1').get();
    return row?.word || '';
  } catch (err) {
    logError('Database error: ' + err.message);
    process.exit();
  }
}

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