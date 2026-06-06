const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

// Bot tokeni
const BOT_TOKEN = '8966917946:AAFGRS9_ZObIhuMAjGrJKBLNc6atp14Somk';
const WEB_APP_URL = 'https://kinobotglow.onrender.com';
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
            vip_until DATETIME,
            language TEXT DEFAULT 'uz'
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT, -- 'kino', 'serial', yoki 'musiqa'
            title TEXT,
            url TEXT,
            image_url TEXT,
            is_vip BOOLEAN DEFAULT 0,
            category TEXT -- 'uz', 'ru', 'tr'
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id TEXT,
            content_id INTEGER,
            UNIQUE(telegram_id, content_id)
        )`);
        
        // Agar ustunlar yo'q bo'lsa (oldin yaratilgan bo'lsa) xato bermasligi uchun try-catch
        db.run(`ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'uz'`, (err) => {});
        db.run(`ALTER TABLE content ADD COLUMN category TEXT`, (err) => {});
    }
});

// 2. Telegram Bot funksiyalari
bot.start((ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;

    // Foydalanuvchini bazaga saqlash
    db.run(`INSERT OR IGNORE INTO users (telegram_id, username) VALUES (?, ?)`, [userId, username], function() {
        db.get(`SELECT language FROM users WHERE telegram_id = ?`, [userId], (err, row) => {
            const lang = row ? row.language : 'uz';
            
            let text = `✨ Salom ${username}! Kino Glow ga xush kelibsiz.\n\n👇 Quyidagi tugma orqali ilovaga kiring va VIP kinolardan bahramand bo'ling!`;
            let btnText = "🎬 Kino Glow-ni ochish";
            
            if (lang === 'ru') {
                text = `✨ Привет ${username}! Добро пожаловать в Kino Glow.\n\n👇 Нажмите кнопку ниже, чтобы войти в приложение!`;
                btnText = "🎬 Открыть Kino Glow";
            } else if (lang === 'kk') {
                text = `✨ Сәлем ${username}! Kino Glow-ға қош келдіңіз.\n\n👇 Қосымшаға кіру үшін төмендегі түймені басыңыз!`;
                btnText = "🎬 Kino Glow ашу";
            }

            ctx.reply(text, Markup.inlineKeyboard([
                [Markup.button.webApp(btnText, WEB_APP_URL)],
                [
                    Markup.button.callback("🇺🇿 O'zbek", "lang_uz"),
                    Markup.button.callback("🇷🇺 Русский", "lang_ru"),
                    Markup.button.callback("🇰🇿 Қазақ", "lang_kk")
                ]
            ]));
        });
    });
});

// Tilni o'zgartirish handlerlari
bot.action('lang_uz', ctx => changeLanguage(ctx, 'uz', "Til O'zbek tiliga o'zgartirildi!"));
bot.action('lang_ru', ctx => changeLanguage(ctx, 'ru', "Язык изменен на русский!"));
bot.action('lang_kk', ctx => changeLanguage(ctx, 'kk', "Тіл қазақ тіліне өзгертілді!"));

function changeLanguage(ctx, langCode, msg) {
    db.run(`UPDATE users SET language = ? WHERE telegram_id = ?`, [langCode, ctx.from.id], () => {
        ctx.answerCbQuery(msg).catch(()=>console.log);
        ctx.reply(msg);
    });
}

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
    const category = req.query.category;
    
    let query = `SELECT * FROM content WHERE type = ?`;
    let params = [type];
    
    if (category && category !== 'all') {
        query += ` AND category = ?`;
        params.push(category);
    }
    
    query += ` ORDER BY id DESC`;

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

app.post('/api/content', (req, res) => {
    const { type, title, url, image_url, is_vip, category } = req.body;
    db.run(
        `INSERT INTO content (type, title, url, image_url, is_vip, category) VALUES (?, ?, ?, ?, ?, ?)`,
        [type, title, url, image_url, is_vip ? 1 : 0, category || ''],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});

// Bookmarks API
app.get('/api/bookmarks', (req, res) => {
    const telegramId = req.query.telegramId;
    if (!telegramId) return res.status(400).json({error: "telegramId kerak"});
    
    db.all(`
        SELECT c.* FROM content c
        JOIN bookmarks b ON c.id = b.content_id
        WHERE b.telegram_id = ?
        ORDER BY b.id DESC
    `, [telegramId], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

app.post('/api/bookmarks', (req, res) => {
    const { telegramId, contentId } = req.body;
    if (!telegramId || !contentId) return res.status(400).json({error: "telegramId va contentId kerak"});
    
    db.get(`SELECT id FROM bookmarks WHERE telegram_id = ? AND content_id = ?`, [telegramId, contentId], (err, row) => {
        if (row) {
            // Agar bor bo'lsa, o'chirish (toggle)
            db.run(`DELETE FROM bookmarks WHERE id = ?`, [row.id], () => res.json({ bookmarked: false }));
        } else {
            // Agar yo'q bo'lsa, qo'shish
            db.run(`INSERT INTO bookmarks (telegram_id, content_id) VALUES (?, ?)`, [telegramId, contentId], () => res.json({ bookmarked: true }));
        }
    });
});

// 4. Serverni ishga tushirish
// Kontentni o'chirish API
app.delete('/api/content/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM content WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});
app.listen(PORT, () => {
    console.log("Web server ishga tushdi");
    bot.launch().then(() => {
        console.log("Telegram bot ishga tushdi!");
    });
});

// Botni to'xtatish uchu xavfsizlik (Ctrl+C bosilganda)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
