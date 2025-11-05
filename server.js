const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const app = express();
const PORT = 3000;

// Middleware для парсинга URL-encoded данных
app.use(express.urlencoded({ extended: true }));

// Подключение к базе данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ChatBotTests'
});

// Проверка подключения к БД
db.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err);
        return;
    }
    console.log('✅ Успешное подключение к MySQL');
});

// Маршрут для получения всех items
app.get('/getAllItems', (req, res) => {
    const query = 'SELECT * FROM Items';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Ошибка при получении данных:', err);
            return res.json(null);
        }

        res.json(results);
    });
});

// Маршрут для добавления нового item (POST)
app.post('/addItem', (req, res) => {
    const { name, desc } = req.query;

    // Проверка входных параметров
    if (!name || !desc) {
        return res.json(null);
    }

    const query = 'INSERT INTO Items (name, `desc`) VALUES (?, ?)';

    db.query(query, [name, desc], (err, results) => {
        if (err) {
            console.error('Ошибка при добавлении:', err);
            return res.json(null);
        }

        // Возвращаем добавленный объект
        const selectQuery = 'SELECT * FROM Items WHERE id = ?';
        db.query(selectQuery, [results.insertId], (err, newItem) => {
            if (err) {
                console.error('Ошибка при получении добавленного элемента:', err);
                return res.json(null);
            }

            res.json(newItem[0] || {});
        });
    });
});

// Маршрут для удаления item (POST)
app.post('/deleteItem', (req, res) => {
    const { id } = req.query;

    // Проверка входных параметров
    if (!id || isNaN(id)) {
        return res.json(null);
    }

    // Сначала получим объект для возврата
    const selectQuery = 'SELECT * FROM Items WHERE id = ?';

    db.query(selectQuery, [id], (err, results) => {
        if (err) {
            console.error('Ошибка при поиске элемента:', err);
            return res.json(null);
        }

        if (results.length === 0) {
            return res.json({}); // Пустой объект, если не нашли
        }

        const itemToDelete = results[0];

        // Теперь удаляем
        const deleteQuery = 'DELETE FROM Items WHERE id = ?';

        db.query(deleteQuery, [id], (err, results) => {
            if (err) {
                console.error('Ошибка при удалении:', err);
                return res.json(null);
            }

            // Возвращаем удаленный объект
            res.json(itemToDelete);
        });
    });
});

// Маршрут для обновления item (POST)
app.post('/updateItem', (req, res) => {
    const { id, name, desc } = req.query;

    // Проверка входных параметров
    if (!id || isNaN(id) || !name || !desc) {
        return res.json(null);
    }

    const query = 'UPDATE Items SET name = ?, `desc` = ? WHERE id = ?';

    db.query(query, [name, desc, id], (err, results) => {
        if (err) {
            console.error('Ошибка при обновлении:', err);
            return res.json(null);
        }

        if (results.affectedRows === 0) {
            return res.json({}); // Пустой объект, если не нашли для обновления
        }

        // Возвращаем обновленный объект
        const selectQuery = 'SELECT * FROM Items WHERE id = ?';
        db.query(selectQuery, [id], (err, updatedItem) => {
            if (err) {
                console.error('Ошибка при получении обновленного элемента:', err);
                return res.json(null);
            }

            res.json(updatedItem[0] || {});
        });
    });
});

// Старые маршруты 
app.get('/', (req, res) => {
    res.send('<h1>Привет, Октагон!</h1>');
});

app.get('/static', (req, res) => {
    res.json({
        header: "Hello",
        body: "Octagon NodeJS Test"
    });
});

app.get('/dynamic', (req, res) => {
    try {
        const a = parseFloat(req.query.a);
        const b = parseFloat(req.query.b);
        const c = parseFloat(req.query.c);

        if (isNaN(a) || isNaN(b) || isNaN(c)) {
            return res.json({
                header: "Error"
            });
        }

        const result = (a * b * c) / 3;
        res.json({
            header: "Calculated",
            body: result.toString()
        });

    } catch (error) {
        res.json({
            header: "Error"
        });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log('📊 MySQL маршруты:');
    console.log('  GET  /getAllItems - Получить все элементы');
    console.log('  POST /addItem?name=NAME&desc=DESC - Добавить элемент');
    console.log('  POST /deleteItem?id=ID - Удалить элемент');
    console.log('  POST /updateItem?id=ID&name=NAME&desc=DESC - Обновить элемент');
    // Запускаем бота после старта сервера
    require('./bot.js');
});