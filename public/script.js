const tg = window.Telegram.WebApp;
tg.expand(); // Ilovani to'liq ekranga ochish
tg.ready();

// Tema ranglarini Telegram orqali olish (ixtiyoriy)
// Hozir biz o'zimizning neon dizayndan foydalanamiz, shuning uchun bunga ko'p e'tibor qaratmaymiz.

const mainContent = document.getElementById('main-content');
const navItems = document.querySelectorAll('.nav-item');

// Foydalanuvchi ma'lumotlari
const user = tg.initDataUnsafe?.user || {
    id: 123456789,
    first_name: "Test Foydalanuvchi",
    username: "testuser"
};

// Adminlarni belgilash (O'zingizning Telegram ID'ingizni shu yerga qo'shishingiz kerak)
// Siz bot tokenini yuborgan bo'lsangiz ham, o'z idingizni bilish kerak. Hozircha barcha uchun ochiq, lekin keyin o'zgartiramiz.
const ADMIN_ID = 'Sizning_ID_raqamingiz_shu_yerda'; 

// Dastlabki sahifani ochish
switchTab('kino');

function switchTab(tabName) {
    // Navbatdagi tugmani faollashtirish
    navItems.forEach(btn => btn.classList.remove('active'));
    // Tugmani topib active qilish (admin tugmasidan tashqari)
    const activeBtn = Array.from(navItems).find(btn => btn.textContent.toLowerCase().includes(tabName.toLowerCase()));
    if (activeBtn) activeBtn.classList.add('active');

    if (tabName === 'kino') renderKino();
    else if (tabName === 'serial') renderSerial();
    else if (tabName === 'musiqa') renderMusiqa();
    else if (tabName === 'vip') renderVip();
    else if (tabName === 'profil') renderProfil();
    else if (tabName === 'admin') renderAdmin();
}

function renderKino() {
    // API dan ma'lumot olmagunimizcha mock data ko'rsatamiz
    mainContent.innerHTML = `
        <h2 style="margin-bottom: 15px; color: var(--neon-orange);">Eng so'nggi kinolar</h2>
        <div class="card-grid">
            <div class="card">
                <div class="vip-badge">VIP</div>
                <img src="https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg" alt="Deadpool">
                <div class="card-info">
                    <div class="card-title">Deadpool va Wolverine</div>
                </div>
            </div>
            <div class="card">
                <img src="https://image.tmdb.org/t/p/w500/A4j8S6moJS2zNtRR8oWF08gRnL5.jpg" alt="Dune">
                <div class="card-info">
                    <div class="card-title">Dune 2</div>
                </div>
            </div>
            <div class="card">
                <div class="vip-badge">VIP</div>
                <img src="https://image.tmdb.org/t/p/w500/fdZpvZCGvVKGpiUG1OefH41BGlX.jpg" alt="Oppenheimer">
                <div class="card-info">
                    <div class="card-title">Oppenheimer</div>
                </div>
            </div>
            <div class="card">
                <img src="https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzRx5xUGlsz.jpg" alt="Barbie">
                <div class="card-info">
                    <div class="card-title">Barbie</div>
                </div>
            </div>
        </div>
    `;
}

function renderSerial() {
    mainContent.innerHTML = `
        <h2 style="margin-bottom: 15px; color: var(--neon-violet);">Ommabop Seriallar</h2>
        <div class="card-grid">
            <div class="card">
                <div class="vip-badge">VIP</div>
                <img src="https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizXCJo.jpg" alt="Breaking Bad">
                <div class="card-info">
                    <div class="card-title">Breaking Bad</div>
                </div>
            </div>
            <div class="card">
                <img src="https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg" alt="Game of Thrones">
                <div class="card-info">
                    <div class="card-title">Game of Thrones</div>
                </div>
            </div>
        </div>
    `;
}

function renderMusiqa() {
    mainContent.innerHTML = `
        <h2 style="margin-bottom: 15px; color: #fff;">Musiqalar</h2>
        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 10px;">
            <p style="margin-bottom: 5px;">Miyagi - I Got Love</p>
            <audio controls style="width: 100%; height: 30px;">
                <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg">
            </audio>
        </div>
        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 10px;">
            <p style="margin-bottom: 5px;">Xcho - Ты и я (VIP)</p>
            <div class="vip-badge" style="position: static; display: inline-block; margin-bottom: 5px;">VIP</div>
            <audio controls style="width: 100%; height: 30px;">
                <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" type="audio/mpeg">
            </audio>
        </div>
    `;
}

function renderVip() {
    mainContent.innerHTML = `
        <h2 style="margin-bottom: 15px; text-align: center; color: var(--neon-violet);">⭐ VIP Obuna Xarid Qilish</h2>
        <p style="text-align: center; font-size: 14px; margin-bottom: 20px; color: #ccc;">Telegram yulduzchalari (Stars) orqali VIP obuna sotib oling va barcha kino, seriallarni cheklovsiz tomosha qiling!</p>
        
        <div class="vip-packages">
            <div class="vip-plan">
                <div class="plan-info">
                    <h3>1 Oylik VIP</h3>
                    <p>Barcha kinolarga kirish</p>
                </div>
                <button class="buy-btn" onclick="buyPackage('1_month')">100 ⭐</button>
            </div>
            <div class="vip-plan">
                <div class="plan-info">
                    <h3>3 Oylik VIP</h3>
                    <p>3 oy davomida bemalol tomosha</p>
                </div>
                <button class="buy-btn" onclick="buyPackage('3_months')">200 ⭐</button>
            </div>
            <div class="vip-plan">
                <div class="plan-info">
                    <h3>6 Oylik VIP</h3>
                    <p>Chegirmali obuna</p>
                </div>
                <button class="buy-btn" onclick="buyPackage('6_months')">350 ⭐</button>
            </div>
            <div class="vip-plan">
                <div class="plan-info">
                    <h3>1 Yillik VIP</h3>
                    <p>Eng katta foyda!</p>
                </div>
                <button class="buy-btn" onclick="buyPackage('1_year')">500 ⭐</button>
            </div>
        </div>
    `;
}

function renderProfil() {
    mainContent.innerHTML = `
        <div class="profile-container">
            <div class="avatar">👤</div>
            <h2>${user.first_name}</h2>
            <p style="color: #aaa; margin-bottom: 20px;">@${user.username || 'username'}</p>
            
            <div style="background: rgba(0,0,0,0.5); padding: 20px; border-radius: 15px; border: 1px solid var(--neon-orange);">
                <h3>Sizning Obunangiz</h3>
                <p style="font-size: 20px; font-weight: bold; margin-top: 10px; color: var(--neon-orange);">Oddiy (Free)</p>
                <button class="buy-btn" style="margin-top: 15px;" onclick="switchTab('vip')">VIP ga o'tish</button>
            </div>
        </div>
    `;
}

// Telegram Stars orqali to'lovni boshlash
function buyPackage(packageType) {
    tg.MainButton.text = "To'lovni tayyorlash...";
    tg.MainButton.show();
    tg.MainButton.showProgress();

    // Backendimizga to'lov havolasini so'rash uchun request yuboramiz
    fetch('/api/create-invoice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            telegramId: user.id,
            packageType: packageType
        })
    })
    .then(res => res.json())
    .then(data => {
        tg.MainButton.hide();
        if (data.success && data.invoiceLink) {
            // Telegram to'lov oynasini ochamiz
            tg.openInvoice(data.invoiceLink, function(status) {
                if (status === 'paid') {
                    tg.showAlert("Tabriklaymiz! To'lov muvaffaqiyatli amalga oshirildi. VIP obunangiz faollashdi.");
                    // Qayta profilni render qilishimiz mumkin
                } else if (status === 'failed') {
                    tg.showAlert("To'lov bekor qilindi yoki xato yuz berdi.");
                }
            });
        } else {
            tg.showAlert("Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
        }
    })
    .catch(err => {
        tg.MainButton.hide();
        tg.showAlert("Server bilan bog'lanishda xato: " + err);
    });
}
