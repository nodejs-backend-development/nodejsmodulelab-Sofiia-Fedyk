// ЗАВДАННЯ 5: CSV-to-JSON веб-сервер

const http = require('http');
const fs = require('fs');
const split2 = require('split2');
const zlib = require('zlib');
const path = require('path');

// Функція для конвертації CSV рядка в об'єкт
function csvLineToObject(headers, line) {
    if (!line || line.trim() === '') return null;

    const values = line.split(',');
    const obj = {};

    headers.forEach((header, index) => {
        obj[header.trim()] = values[index] ? values[index].trim() : '';
    });

    return obj;
}

const server = http.createServer((request, response) => {
    // Визначаємо шлях до CSV файлу — спочатку шукаємо стиснутий, потім звичайний
    const gzPath = path.join(__dirname, 'data.csv.gz');
    const csvPath = path.join(__dirname, 'data.csv');

    const isGzip = fs.existsSync(gzPath);
    const csvFilePath = isGzip ? gzPath : csvPath;

    // Перевіряємо, чи існує файл
    if (!fs.existsSync(csvFilePath)) {
        response.statusCode = 404;
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.end(
            JSON.stringify({
                error: 'CSV file not found',
                expected: [gzPath, csvPath],
            }),
        );
        return;
    }

    let headers = [];
    let isFirstLine = true;
    const result = [];

    // Створюємо потік для читання файлу
    let stream = fs.createReadStream(csvFilePath);

    // Якщо файл стиснутий (.gz), розпаковуємо його
    if (isGzip) {
        stream = stream.pipe(zlib.createGunzip());
    }

    const lines = stream.pipe(split2());

    lines.on('data', line => {
        if (!line || line.trim() === '') return;

        if (isFirstLine) {
            headers = line.split(',').map(h => h.trim());
            isFirstLine = false;
        } else {
            const obj = csvLineToObject(headers, line);
            if (obj) result.push(obj);
        }
    });

    lines.on('error', error => {
        console.error('Stream error:', error);
        response.statusCode = 500;
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.end(
            JSON.stringify({
                error: 'Server error while processing CSV',
                message: error.message,
            }),
        );
    });

    lines.on('end', () => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.end(JSON.stringify(result, null, 2));
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`CSV to JSON server is running on http://localhost:${PORT}`);
    console.log('Place data.csv or data.csv.gz in the task5/ directory');
});

/*
ПРИКЛАД CSV ФАЙЛУ (task5/data.csv)

id,firstName,lastName,email
1,John,Doe,john@example.com
2,Jane,Smith,jane@example.com
3,Bob,Johnson,bob@example.com

ТЕСТУВАННЯ

# 1. Запускаємо сервер
node task5/index.js

# 2. В іншому терміналі отримуємо дані
curl http://localhost:3001
*/
