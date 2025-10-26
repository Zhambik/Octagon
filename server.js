const express = require('express');
const app = express();
const PORT = 3000;

// Обработка корневого маршрута
app.get('/', (req, res) => {
    res.send('<h1>Привет, Октагон!</h1>');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});