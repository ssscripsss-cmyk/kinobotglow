const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

// Bot tokeni (xavfsizlik uchun alohida .env da saqlash tavsiya etiladi, ammo hozir oson bo'lishi uchun shu yerda yozamiz)
const BOT_TOKEN = '8966917946:AAFGRS9_ZObIhuMAjGrJKBLNc6atp14Somk';
const WEB_APP_URL = 'https://kino-glow-app.com'; // Buni keyinrok ngrok orqali almashtiramiz
const PORT = 3000;

// Express va Botni ishga tushiramiz
const app = express();
const bot = new Telegraf(BOT_TOKEN);

app.use(cors());
app.use(express.json());
// Frontend fayllarini (HTML, CSS) public papkasidan uzatish
app.use(express.static(path.join(__dirname, 'public'))); 

// 1. Ma'lumotlar bazasini yaratish va sozlash (SQLite)
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error("Bazaga ulanishda xato:", err.message);
    } else {
        console.log("Ma'lumotlar bazasi ishga tushdi.");
        // Jadvallarni yaratish
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            telegram_id TEXT UNIQUE,
            username TEXT,
            vip_until DATETIME
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT, -- 'kino', 'serial', yoki 'musiqa'
            title TEXT,
            url TEXT,
            image_url TEXT,
            is_vip BOOLEAN DEFAULT 0
        )`);
    }
});

// 2. Telegram Bot funksiyalari
bot.start((ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;

    // Foydalanuvchini bazaga saqlash
    db.run(`INSERT OR IGNORE INTO users (telegram_id, username) VALUES (?, ?)`, [userId, username]);

    // O'yin/Ilova tugmasini ko'rsatish
    ctx.reply(
        `✨ Salom ${username}! Kino Glow ga xush kelibsiz.\n\n👇 Quyidagi tugma orqali ilovaga kiring va VIP kinolardan bahramand bo'ling!`,
        Markup.inlineKeyboard([
            // Bu tugma orqali bizning Express serverimizdagi webapp ochiladi
            // Hozircha lokal ishlayotgani uchun ngrok link kerak bo'ladi, buni keyin sozlaymiz.
            Markup.button.webApp("🎬 Kino Glow-ni ochish", "https://kinobotglow.onrender.com") // Placeholder link
        ])
    );
});

// Telegram Stars orqali to'lov varaqasini (Invoice) yaratish API si
app.post('/api/create-invoice', async (req, res) => {
    const { telegramId, packageType } = req.body;
    let title, description, priceAmount;

    // Paketlarni belgilash
    if (packageType === '1_month') {
        title = "1 Oylik VIP Obuna";
        description = "1 oy davomida barcha kino va seriallarni cheklovsiz ko'rish";
        priceAmount = 100;
    } else if (packageType === '3_months') {
        title = "3 Oylik VIP Obuna";
        description = "3 oy davomida barcha kino va seriallarni cheklovsiz ko'rish";
        priceAmount = 200;
    } else if (packageType === '6_months') {
        title = "6 Oylik VIP Obuna";
        description = "6 oy davomida barcha kino va seriallarni cheklovsiz ko'rish";
        priceAmount = 350;
    } else if (packageType === '1_year') {
        title = "1 Yillik VIP Obuna";
        description = "1 yil davomida barcha kino va seriallarni cheklovsiz ko'rish";
        priceAmount = 500;
    } else {
        return res.status(400).json({ error: "Noto'g'ri paket" });
    }

    try {
        // Telegram API orqali To'lov havolasini (Invoice Link) yaratish
        const invoiceLink = await bot.telegram.createInvoiceLink({
            title: title,
            description: description,
            payload: `vip_${packageType}_${telegramId}`, // To'lovdan keyin kim va nimaga to'laganini bilish uchun
            provider_token: "", // Stars uchun provayder token bo'sh qoldiriladi
            currency: "XTR", // Telegram Stars valyutasi
            prices: [{ label: title, amount: priceAmount }]
        });

        res.json({ success: true, invoiceLink });
    } catch (error) {
        console.error("To'lov yaratishda xato:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Bot to'lovdan oldin tekshiruv (pre_checkout_query)
bot.on('pre_checkout_query', (ctx) => {
    ctx.answerPreCheckoutQuery(true).catch(console.error);
});

// Bot to'lov muvaffaqiyatli bo'lganda (successful_payment)
bot.on('successful_payment', (ctx) => {
    const payment = ctx.message.successful_payment;
    const payload = payment.invoice_payload;
    const telegramId = ctx.from.id;

    console.log("Muvaffaqiyatli to'lov!", payload);

    let monthsToAdd = 0;
    if (payload.includes('1_month')) monthsToAdd = 1;
    if (payload.includes('3_months')) monthsToAdd = 3;
    if (payload.includes('6_months')) monthsToAdd = 6;
    if (payload.includes('1_year')) monthsToAdd = 12;

    // Bazada foydalanuvchining VIP vaqtini uzaytirish
    const date = new Date();
    date.setMonth(date.getMonth() + monthsToAdd);
    const newVipDate = date.toISOString();

    db.run(`UPDATE users SET vip_until = ? WHERE telegram_id = ?`, [newVipDate, telegramId], (err) => {
        if (!err) {
            ctx.reply(`🎉 Tabriklaymiz! Sizning VIP obunangiz ${monthsToAdd} oyga uzaytirildi. Ilovaga kirib bahramand bo'lishingiz mumkin!`);
        }
    });
});

// 3. Express server API (Frontend uchun ma'lumotlar)
app.get('/api/content', (req, res) => {
    const type = req.query.type || 'kino';
    db.all(`SELECT * FROM content WHERE type = ?`, [type], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

// 4. Serverni ishga tushirish
app.listen(PORT, () => {
   console.log("Web server ishga tushdi");
    bot.launch().then(() => {
        console.log("Telegram bot ishga tushdi!");
    });
});

// Botni to'xtatish uchu xavfsizlik (Ctrl+C bosilganda)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
