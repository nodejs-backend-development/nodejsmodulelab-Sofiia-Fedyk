// ЗАВДАННЯ 6: CustomStreams — обробка тексту з консолі

const { Transform } = require('stream');
const readline = require('readline');

// UpperCaseStream — перетворює літери на великі, числа не чіпає
class UpperCaseStream extends Transform {
    _transform(chunk, encoding, callback) {
        const result = chunk
            .toString()
            .replace(/[a-zA-Zа-яА-ЯіІїЇєЄґҐ]/g, char => char.toUpperCase());
        this.push(result);
        callback();
    }
}

// HighlightStream — підсвічує ключові слова ANSI-кольорами
const ANSI = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
};

const KEYWORDS = {
    error: 'red',
    success: 'green',
    warning: 'magenta',
    Node: 'cyan',
    stream: 'blue',
};

class HighlightStream extends Transform {
    constructor(options, keywords = {}) {
        super(options);
        this.keywords = keywords;
    }

    _transform(chunk, encoding, callback) {
        let text = chunk.toString();

        text = text.replace(/\b\d+(\.\d+)?\b/g, num => `${ANSI.yellow}${num}${ANSI.reset}`);

        Object.entries(this.keywords).forEach(([word, colorName]) => {
            const color = ANSI[colorName] || ANSI.reset;
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            text = text.replace(regex, `${color}$&${ANSI.reset}`);
        });

        this.push(text);
        callback();
    }
}

// WordCountStream — рахує слова і символи
class WordCountStream extends Transform {
    constructor(options) {
        super(options);
        this.totalChars = 0;
        this.totalWords = 0;
    }

    _transform(chunk, encoding, callback) {
        const text = chunk.toString();
        this.totalChars += text.replace(/\n/g, '').length;
        this.totalWords += text
            .trim()
            .split(/\s+/)
            .filter(w => w.length > 0).length;
        this.push(chunk);
        callback();
    }

    getStats() {
        return { words: this.totalWords, chars: this.totalChars };
    }
}

// ЗАПУСК

const upper = new UpperCaseStream();
const highlight = new HighlightStream(undefined, KEYWORDS);
const counter = new WordCountStream();

console.log('Введіть текст (Ctrl+Z + Enter для завершення):\n');

const rl = readline.createInterface({ input: process.stdin });

rl.on('line', line => {
    if (line.trim() === '/stats') {
        const { words, chars } = counter.getStats();
        console.log(`Статистика: слів = ${words}, символів = ${chars}`);
        return;
    }
    upper.write(`${line}\n`);
});

upper.pipe(counter).pipe(highlight);

highlight.on('data', chunk => process.stdout.write(chunk));

rl.on('close', () => {
    upper.end();
    counter.once('finish', () => {
        const { words, chars } = counter.getStats();
        console.log(`Статистика: слів = ${words}, символів = ${chars}`);
    });
});
