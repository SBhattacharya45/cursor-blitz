# Cursor Blitz

![cursor-blitz](https://i.ibb.co/L1yGYfC/a.png)

Test your typing skills directly in the CLI. Challenge your speed and accuracy with simple typing exercises — all within your terminal.

---

## Install

You can use **Cursor Blitz** in two ways:

### 1. Global Install (recommended)

Install with npm and run directly using the `blitz` command:

```sh
npm i -g cursor-blitz
```

Now you can run:

```sh
blitz <command> [options]
```

---

### 2. Local Clone + NPX

Clone and build the repo, then run via `npx`:

```sh
git clone https://github.com/SBhattacharya45/cursor-blitz.git
cd cursor-blitz
npm i
npm run build
```

Run with:

```sh
npx blitz <command> [options]
```

---

## Usage

```sh
blitz <command> [options]
```

See all commands and options:

```sh
blitz --help
```

---

## Commands

### Time Mode

Type as many words as you can within a set time limit.

```sh
blitz time [time] -w <csv>
```

* **time** *(optional)*: Time in seconds (default: 30, min: 10, max: 120)

  * Values outside this range will be clamped.
* **-w, --words \<csv>**: Path to a custom CSV file with a `word` column

**Examples:**

```sh
blitz time          # default 30s
blitz time 60 -w ./test.csv
```

---

### Count Mode

Type a fixed number of words as fast as possible.

```sh
blitz count [count] -w <csv>
```

* **count** *(optional)*: Number of words (default: 20, min: 1, max: 100)
* **-w, --words \<csv>**: Path to a custom CSV file with a `word` column

**Examples:**

```sh
blitz count         # default 20 words
blitz count 50 -w ./test.csv
```

---

## Custom Word List

You can provide your own list of words in CSV format. The file **must** include a header row with a `word` column:

```csv
word
example
typing
blitz
challenge
```

---

## Generate Word Lists with AI

You can generate a CSV with ChatGPT (or any LLM) using a prompt like:

```
Generate a CSV file with a header "word" and one name per row. 
Create 20 rows using words in the theme of '<insert theme here>'.
```
