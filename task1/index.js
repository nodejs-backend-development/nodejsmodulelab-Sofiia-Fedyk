// ЗАВДАННЯ 1: HTTP-сервер з авторизацією через Bearer token

const http = require('http');

// Визначаємо очікуваний токен
const EXPECTED_TOKEN =
    'Bearer ekV5Rk4wMlgvYVpCbmp5WUh5bHVPMktwMzktY01QeDRjT3FlWlNiUTJhbVpraHc5d3Y5a3YtU2pM';

const server = http.createServer((request, response) => {
    // Отримуємо Authorization header
    const authHeader = request.headers.authorization;

    // Перевіряємо, чи існує заголовок і чи він дорівнює очікуваному значенню
    if (authHeader === EXPECTED_TOKEN) {
        // Клієнт аутентифікований успішно
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.end(
            JSON.stringify({
                message: 'Authorization successful',
                status: 'authenticated',
            }),
        );
    } else {
        // Клієнт не аутентифікований або заголовок відсутній
        response.statusCode = 401;
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.end(
            JSON.stringify({
                message: 'Unauthorized',
                status: 'unauthenticated',
            }),
        );
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Auth server is running on http://localhost:${PORT}`);
});

/*
ТЕСТУВАННЯ

# Запуск сервера
node task1/index.js

# Тест БЕЗ токена (повинен повернути 401)
curl -v http://localhost:3000

# Тест З ПРАВИЛЬНИМ токеном (повинен повернути 200)
curl -v -H "Authorization: Bearer ekV5Rk4wMlgvYVpCbmp5WUh5bHVPMktwMzktY01QeDRjT3FlWlNiUTJhbVpraHc5d3Y5a3YtU2pM" http://localhost:3000

# Тест З НЕПРАВИЛЬНИМ токеном (повинен повернути 401)
curl -v -H "Authorization: Bearer wrong_token" http://localhost:3000
*/
