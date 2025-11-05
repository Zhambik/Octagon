const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Токен бота (лучше хранить в переменных окружения)
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8214242551:AAGGlU4Ku5Q2j4Ux4cogbXpjbCQwbJJWGo4';

// Создаем экземпляр бота
const bot = new TelegramBot(TOKEN, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name;

    bot.sendMessage(chatId, `Привет, ${userName}! Октагон! 👋`);
});

// Обработчик обычных сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Игнорируем команды (они начинаются с /)
    if (!text.startsWith('/')) {
        bot.sendMessage(chatId, 'Я пока умею только приветствовать! Напиши /start');
    }
});

console.log('🤖 Telegram бот запущен и готов к работе...');