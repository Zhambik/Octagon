const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const TOKEN = "8214242551:AAGGlU4Ku5Q2j4Ux4cogbXpjbCQwbJJWGo4";
const bot = new TelegramBot(TOKEN, { polling: true });

// Данные создателя
const CREATOR_INFO = {
    name: "Аюров Жамбал",
};

// Настройки бота
const BOT_COMMANDS = [
    { command: 'start', description: 'Начать работу с ботом' },
    { command: 'help', description: 'Показать справку по командам' },
    { command: 'site', description: 'Получить ссылку на сайт Октагона' },
    { command: 'creator', description: 'Информация о создателе бота' }
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
            `/creator - о создателе`
        );
    });

    // /help
    bot.onText(/\/help/, (msg) => {
        const chatId = msg.chat.id;

        const commandsList = BOT_COMMANDS.map(cmd =>
            `/${cmd.command} - ${cmd.description}`
        ).join('\n');

        bot.sendMessage(chatId,
            `*Доступные команды:*\n\n${commandsList}\n\n` +
            `_Просто введите команду для выполнения_`,
            { parse_mode: 'Markdown' }
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
            `*Официальный сайт Октагона*\n\n` +
            `Нажмите кнопку ниже чтобы перейти на сайт:`,
            {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            }
        );
    });

    // /creator
    bot.onText(/\/creator/, (msg) => {
        const chatId = msg.chat.id;

        bot.sendMessage(chatId,
            `*Создатель бота:*\n\n` +
            `*ФИО:* ${CREATOR_INFO.name}\n` +
            `_Бот создан в рамках учебного задания_`,
            { parse_mode: 'Markdown' }
        );
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