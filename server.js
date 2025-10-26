const express = require('express');
const app = express();
const PORT = 3000;

// Маршрут для статического JSON
app.get('/static', (req, res) => {
    res.json({
        header: "Hello",
        body: "Octagon NodeJS Test"
    });
});

// Маршрут для динамических вычислений
app.get('/dynamic', (req, res) => {
    try {
        // Получаем параметры из query string
        const a = parseFloat(req.query.a);
        const b = parseFloat(req.query.b);
        const c = parseFloat(req.query.c);

        // Проверяем, что все параметры есть и это числа
        if (isNaN(a) || isNaN(b) || isNaN(c)) {
            return res.json({
                header: "Error"
            });
        }

        // Вычисляем результат по формуле: (a*b*c) / 3
        const result = (a * b * c) / 3;

        // Возвращаем успешный ответ
        res.json({
            header: "Calculated",
            body: result.toString()
        });

    } catch (error) {
        // В случае любой ошибки возвращаем Error
        res.json({
            header: "Error"
        });
    }
});

// Старый маршрут (оставляем для обратной совместимости)
app.get('/', (req, res) => {
    res.send('<h1>Привет, Октагон!</h1>');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log('Доступные маршруты:');
    console.log('  GET / - Главная страница');
    console.log('  GET /static - Статический JSON');
    console.log('  GET /dynamic?a=1&b=2&c=3 - Динамические вычисления');
});