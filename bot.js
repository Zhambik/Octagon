const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2');
require('dotenv').config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

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
    console.log('Успешное подключение к MySQL');
});

// Данные создателя
const CREATOR_INFO = {
    name: "Аюров Жамбал",
};

// Настройки бота
const BOT_COMMANDS = [
    { command: 'start', description: 'Начать работу с ботом' },
    { command: 'help', description: 'Показать справку по командам' },
    { command: 'site', description: 'Получить ссылку на сайт Октагона' },
    { command: 'creator', description: 'Информация о создателе бота' },
    { command: 'randomitem', description: 'Получить случайный предмет из БД' },
    { command: 'deleteitem', description: 'Удалить предмет по ID' },
    { command: 'getitembyid', description: 'Найти предмет по ID' }
];

// Инициализация бота
const initializeBot = async () => {
    try {
        await bot.setMyCommands(BOT_COMMANDS);
        console.log('Бот инициализирован с командами:', BOT_COMMANDS.map(cmd => cmd.command));
    } catch (error) {
        console.error('Ошибка инициализации бота:', error);
    }
};

// Функция для получения случайного предмета
const getRandomItem = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM Items ORDER BY RAND() LIMIT 1';
        db.query(query, (err, results) => {
            if (err) {
                reject('Ошибка при получении случайного предмета');
                return;
            }

            if (results.length === 0) {
                resolve('В базе данных нет предметов');
                return;
            }

            const item = results[0];
            resolve(`Случайный предмет:\n\n(${item.id}) - ${item.name}: ${item.desc}`);
        });
    });
};

// Функция для удаления предмета по ID
const deleteItemById = (itemId) => {
    return new Promise((resolve, reject) => {
        // Сначала проверяем существование
        const checkQuery = 'SELECT * FROM Items WHERE id = ?';

        db.query(checkQuery, [itemId], (err, results) => {
            if (err) {
                reject('Ошибка при проверке предмета');
                return;
            }

            if (results.length === 0) {
                reject('Предмет с таким ID не найден');
                return;
            }

            const itemToDelete = results[0];

            // Удаляем
            const deleteQuery = 'DELETE FROM Items WHERE id = ?';

            db.query(deleteQuery, [itemId], (err, results) => {
                if (err) {
                    reject('Ошибка при удалении предмета');
                    return;
                }

                resolve(`Удачно: предмет удален\n\n(${itemToDelete.id}) - ${itemToDelete.name}: ${itemToDelete.desc}`);
            });
        });
    });
};

// Функция для получения предмета по ID
const getItemById = (itemId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM Items WHERE id = ?';

        db.query(query, [itemId], (err, results) => {
            if (err) {
                reject('Ошибка при поиске предмета');
                return;
            }

            if (results.length === 0) {
                resolve(`Предмет с ID ${itemId} не найден`);
                return;
            }

            const item = results[0];
            resolve(`Найден предмет:\n\n(${item.id}) - ${item.name}: ${item.desc}`);
        });
    });
};

// Обработчики команд
const setupCommandHandlers = () => {
    // /start
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const userName = msg.from.first_name;

        bot.sendMessage(chatId,
            `Привет, ${userName}! Добро пожаловать в бот Октагона!\n\n` +
            `Используй команды ниже для навигации:\n` +
            `/help - все команды\n` +
            `/site - сайт компании\n` +
            `/creator - о создателе\n` +
            `/randomitem - случайный предмет из БД\n` +
            `/deleteitem [id] - удалить предмет\n` +
            `/getitembyid [id] - найти предмет по ID`
        );
    });

    // /help
    bot.onText(/\/help/, (msg) => {
        const chatId = msg.chat.id;

        const commandsList = BOT_COMMANDS.map(cmd =>
            `/${cmd.command} - ${cmd.description}`
        ).join('\n');

        bot.sendMessage(chatId,
            `Доступные команды:\n\n${commandsList}\n\n` +
            `Примеры использования:\n` +
            `/deleteitem 5 - удалить предмет с ID=5\n` +
            `/getitembyid 3 - найти предмет с ID=3\n` +
            `/randomitem - получить случайный предмет`
        );
    });

    // /site
    bot.onText(/\/site/, (msg) => {
        const chatId = msg.chat.id;

        const keyboard = {
            inline_keyboard: [[
                {
                    text: 'Перейти на сайт Октагона',
                    url: 'https://octagon-students.ru/'
                }
            ]]
        };

        bot.sendMessage(chatId,
            `Официальный сайт Октагона\n\n` +
            `Нажмите кнопку ниже чтобы перейти на сайт:`,
            {
                reply_markup: keyboard
            }
        );
    });

    // /creator
    bot.onText(/\/creator/, (msg) => {
        const chatId = msg.chat.id;

        bot.sendMessage(chatId,
            `Создатель бота:\n\n` +
            `ФИО: ${CREATOR_INFO.name}\n` +
            `Бот создан в рамках учебного задания`
        );
    });

    // /randomitem - возвращает случайный предмет
    bot.onText(/\/randomitem/, async (msg) => {
        const chatId = msg.chat.id;

        try {
            const response = await getRandomItem();
            bot.sendMessage(chatId, response);
        } catch (error) {
            bot.sendMessage(chatId, `Ошибка: ${error}`);
        }
    });

    // /deleteitem - удаляет предмет по ID
    bot.onText(/\/deleteitem (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const itemId = match[1];

        if (isNaN(itemId)) {
            bot.sendMessage(chatId, 'Ошибка: ID должен быть числом\nИспользование: /deleteitem [id]');
            return;
        }

        try {
            const response = await deleteItemById(itemId);
            bot.sendMessage(chatId, response);
        } catch (error) {
            bot.sendMessage(chatId, `Ошибка: ${error}`);
        }
    });

    // Обработчик для /deleteitem без параметров
    bot.onText(/\/deleteitem$/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'Использование: /deleteitem [id]\nНапример: /deleteitem 5');
    });

    // /getitembyid - возвращает предмет по ID
    bot.onText(/\/getitembyid (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const itemId = match[1];

        if (isNaN(itemId)) {
            bot.sendMessage(chatId, 'Ошибка: ID должен быть числом\nИспользование: /getitembyid [id]');
            return;
        }

        try {
            const response = await getItemById(itemId);
            bot.sendMessage(chatId, response);
        } catch (error) {
            bot.sendMessage(chatId, `Ошибка: ${error}`);
        }
    });

    // Обработчик для /getitembyid без параметров
    bot.onText(/\/getitembyid$/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'Использование: /getitembyid [id]\nНапример: /getitembyid 3');
    });

    // Обработка неизвестных команд
    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (text.startsWith('/') && !BOT_COMMANDS.some(cmd => text.startsWith(`/${cmd.command}`))) {
            bot.sendMessage(chatId,
                `Неизвестная команда: ${text}\n\n` +
                `Используйте /help для просмотра доступных команд.`
            );
        }
    });
};

// Запуск бота
const startBot = async () => {
    await initializeBot();
    setupCommandHandlers();

    console.log('Бот запущен и готов к работе!');
    console.log('Зарегистрированные команды:');
    BOT_COMMANDS.forEach(cmd => {
        console.log(`   /${cmd.command} - ${cmd.description}`);
    });
};

startBot().catch(console.error);