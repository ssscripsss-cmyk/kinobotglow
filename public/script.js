const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const mainContent = document.getElementById('main-content');
const navItems = document.querySelectorAll('.nav-item');

const user = tg.initDataUnsafe?.user || {
    id: 123456789,
    first_name: "Test Foydalanuvchi",
    username: "testuser"
};

const ADMIN_ID = user.id;
document.getElementById('admin-btn').style.display = 'block';

let currentLang = 'uz';
const dict = {
    uz: {
        kino: "🎬 Kino", serial: "📺 Serial", musiqa: "🎵 Musiqa", saq: "❤️ Saqlanganlar", vip: "⭐ VIP", profil: "👤 Profil",
        latest_movies: "Eng so'nggi kinolar", popular_series: "Ommabop Seriallar",
        music: "Musiqalar", nothing: "Hozircha hech narsa yo'q.",
        admin_panel: "⚙️ Admin Panel",
        vip_title: "⭐ VIP Obuna Xarid Qilish",
        vip_desc: "Telegram yulduzchalari orqali VIP obuna sotib oling!",
        m_1: "1 Oylik VIP", m_3: "3 Oylik VIP", m_6: "6 Oylik VIP", y_1: "1 Yillik VIP",
        cat_uz: "O'zbekcha", cat_ru: "Ruscha", cat_tr: "Turkcha", cat_all: "Barchasi"
    },
    ru: {
        kino: "🎬 Кино", serial: "📺 Сериалы", musiqa: "🎵 Музыка", saq: "❤️ Сохраненные", vip: "⭐ VIP", profil: "👤 Профиль",
        latest_movies: "Последние фильмы", popular_series: "Популярные сериалы",
        music: "Музыка", nothing: "Пока ничего нет.",
        admin_panel: "⚙️ Админ Панель",
        vip_title: "⭐ Купить VIP подписку",
        vip_desc: "Купите VIP подписку за Telegram Звезды!",
        m_1: "1 Месяц VIP", m_3: "3 Месяца VIP", m_6: "6 Месяцев VIP", y_1: "1 Год VIP",
        cat_uz: "Узбекская", cat_ru: "Русская", cat_tr: "Турецкая", cat_all: "Все"
    },
    kk: {
        kino: "🎬 Кино", serial: "📺 Сериалдар", musiqa: "🎵 Музыка", saq: "❤️ Сақталғандар", vip: "⭐ VIP", profil: "👤 Профиль",
        latest_movies: "Ең соңғы фильмдер", popular_series: "Танымал сериалдар",
        music: "Музыка", nothing: "Әзірге ештеңе жоқ.",
        admin_panel: "⚙️ Админ панелі",
        vip_title: "⭐ VIP Жазылым Сатып Алу",
        vip_desc: "Telegram Жұлдыздары арқылы VIP жазылым сатып алыңыз!",
        m_1: "1 Айлық VIP", m_3: "3 Айлық VIP", m_6: "6 Айлық VIP", y_1: "1 Жылдық VIP",
        cat_uz: "Өзбекше", cat_ru: "Орысша", cat_tr: "Түрікше", cat_all: "Барлығы"
    }
};

function t(key) { return dict[currentLang][key]; }

function applyLanguage() {
    document.getElementById('nav-kino').innerText = t('kino');
    document.getElementById('nav-serial').innerText = t('serial');
    document.getElementById('nav-musiqa').innerText = t('musiqa');
    document.getElementById('nav-saq').innerText = t('saq');
    document.getElementById('nav-vip').innerText = t('vip');
    document.getElementById('nav-profil').innerText = t('profil');
    document.getElementById('admin-btn').innerText = t('admin_panel');
}

function createMeteors() {
    const space = document.getElementById('space-background');
    for(let i=0; i<3; i++) {
        let m = document.createElement('div');
        m.className = 'meteor';
        m.style.top = Math.random() * 50 + '%';
        m.style.left = Math.random() * 100 + '%';
        m.style.animationDelay = Math.random() * 5 + 's';
        space.appendChild(m);
    }
}
createMeteors();

let bookmarks = JSON.parse(localStorage.getItem('kg_bookmarks') || '[]');
let bookmarkItems = JSON.parse(localStorage.getItem('kg_bookmark_items') || '[]');

function loadBookmarks() {
    bookmarks = JSON.parse(localStorage.getItem('kg_bookmarks') || '[]');
    bookmarkItems = JSON.parse(localStorage.getItem('kg_bookmark_items') || '[]');
    switchTab('kino');
}
loadBookmarks();

function toggleBookmark(event, id, itemData) {
    event.stopPropagation();
    const btn = document.getElementById('bm-' + id);
    if(bookmarks.includes(id)) {
        bookmarks = bookmarks.filter(bid => bid !== id);
        bookmarkItems = bookmarkItems.filter(item => item.id !== id);
        if(btn) { btn.classList.remove('saved'); btn.innerText = '🤍'; }
    } else {
        bookmarks.push(id);
        if(itemData) bookmarkItems.push(itemData);
        if(btn) { btn.classList.add('saved'); btn.innerText = '❤️'; }
    }
    localStorage.setItem('kg_bookmarks', JSON.stringify(bookmarks));
    localStorage.setItem('kg_bookmark_items', JSON.stringify(bookmarkItems));
}

function switchTab(tabName) {
    navItems.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById('nav-' + (tabName === 'saqlanganlar' ? 'saq' : tabName));
    if (activeBtn) activeBtn.classList.add('active');
    applyLanguage();
    if (tabName === 'kino') fetchAndRenderContent('kino', 'var(--neon-orange)', t('latest_movies'));
    else if (tabName === 'serial') fetchAndRenderContent('serial', 'var(--neon-violet)', t('popular_series'));
    else if (tabName === 'musiqa') renderMusiqa('all');
    else if (tabName === 'saqlanganlar') renderBookmarks();
    else if (tabName === 'vip') renderVip();
    else if (tabName === 'profil') renderProfil();
    else if (tabName === 'admin') renderAdmin();
}

function getPlayer(item) {
    const isGDrive = item.url && item.url.includes('drive.google.com');
    return isGDrive
        ? `<iframe src="${item.url}" width="100%" height="80" frameborder="0" allow="autoplay" style="border-radius:8px; margin-top:5px;"></iframe>`
        : `<audio controls style="width:100%; height:30px; margin-top:5px;"><source src="${item.url}" type="audio/mpeg"></audio>`;
}

function fetchAndRenderContent(type, titleColor, titleText) {
    mainContent.innerHTML = `<h2 style="margin-bottom:15px;color:${titleColor};">${titleText}</h2><p>Yuklanmoqda...</p>`;
    fetch(`/api/content?type=${type}&order=desc`)
    .then(res => res.json())
    .then(data => {
        if (data.length === 0) {
            mainContent.innerHTML = `<h2 style="margin-bottom:15px;color:${titleColor};">${titleText}</h2><p>${t('nothing')}</p>`;
            return;
        }
        let html = `<h2 style="margin-bottom:15px;color:${titleColor};">${titleText}</h2><div class="card-grid">`;
        data.forEach(item => {
            const isBookmarked = bookmarks.includes(item.id);
            const heart = isBookmarked ? '❤️' : '🤍';
            const heartClass = isBookmarked ? 'saved' : '';
            const itemJson = JSON.stringify(item).replace(/'/g, "&apos;");
            html += `
                <div class="card" onclick="openContent('${item.url}')">
                    <div id="bm-${item.id}" class="bookmark-btn ${heartClass}" onclick="toggleBookmark(event,${item.id},${itemJson})">${heart}</div>
                    ${item.is_vip ? '<div class="vip-badge">VIP</div>' : ''}
                    <img src="${item.image_url}" alt="${item.title}">
                    <div class="card-info"><div class="card-title">${item.title}</div></div>
                </div>`;
        });
        html += `</div>`;
        mainContent.innerHTML = html;
    })
    .catch(err => mainContent.innerHTML = `<p>Xatolik: ${err}</p>`);
}

function renderMusiqa(cat) {
    mainContent.innerHTML = `
        <h2 style="margin-bottom:15px;color:#fff;">${t('music')}</h2>
        <div class="lang-tabs">
            <div class="lang-tab ${cat==='all'?'active':''}" onclick="renderMusiqa('all')">${t('cat_all')}</div>
            <div class="lang-tab ${cat==='uz'?'active':''}" onclick="renderMusiqa('uz')">${t('cat_uz')}</div>
            <div class="lang-tab ${cat==='ru'?'active':''}" onclick="renderMusiqa('ru')">${t('cat_ru')}</div>
            <div class="lang-tab ${cat==='tr'?'active':''}" onclick="renderMusiqa('tr')">${t('cat_tr')}</div>
        </div>
        <div id="music-list">Yuklanmoqda...</div>`;
    let url = `/api/content?type=musiqa`;
    if(cat !== 'all') url += `&category=${cat}`;
    fetch(url).then(res => res.json()).then(data => {
        let mHtml = data.length === 0 ? `<p>${t('nothing')}</p>` : '';
        data.forEach(item => {
            const isBookmarked = bookmarks.includes(item.id);
            const heart = isBookmarked ? '❤️' : '🤍';
            const heartClass = isBookmarked ? 'saved' : '';
            const itemJson = JSON.stringify(item).replace(/'/g, "&apos;");
            mHtml += `
                <div style="background:rgba(255,255,255,0.1);padding:15px;border-radius:10px;margin-bottom:10px;position:relative;">
                    <div id="bm-${item.id}" class="bookmark-btn ${heartClass}" style="right:10px;left:auto;top:10px;" onclick="toggleBookmark(event,${item.id},${itemJson})">${heart}</div>
                    <p style="margin-bottom:5px;padding-right:40px;">${item.title}</p>
                    ${item.is_vip ? '<div class="vip-badge" style="position:static;display:inline-block;margin-bottom:5px;">VIP</div>' : ''}
                    ${getPlayer(item)}
                </div>`;
        });
        document.getElementById('music-list').innerHTML = mHtml;
    });
}

function renderBookmarks() {
    const data = bookmarkItems;
    if (data.length === 0) {
        mainContent.innerHTML = `<h2 style="margin-bottom:15px;color:#ff3b30;">${t('saq')}</h2><p>${t('nothing')}</p>`;
        return;
    }
    let html = `<h2 style="margin-bottom:15px;color:#ff3b30;">${t('saq')}</h2><div class="card-grid">`;
    data.forEach(item => {
        if(item.type === 'musiqa') {
            html += `
            <div style="background:rgba(255,255,255,0.1);padding:15px;border-radius:10px;margin-bottom:10px;position:relative;grid-column:span 2;">
                <div id="bm-${item.id}" class="bookmark-btn saved" style="right:10px;left:auto;top:10px;" onclick="toggleBookmark(event,${item.id});setTimeout(renderBookmarks,100);">❤️</div>
                <p style="margin-bottom:5px;padding-right:40px;">${item.title}</p>
                ${getPlayer(item)}
            </div>`;
        } else {
            html += `
            <div class="card" onclick="openContent('${item.url}')">
                <div id="bm-${item.id}" class="bookmark-btn saved" onclick="event.stopPropagation();toggleBookmark(event,${item.id});setTimeout(renderBookmarks,100);">❤️</div>
                ${item.is_vip ? '<div class="vip-badge">VIP</div>' : ''}
                <img src="${item.image_url}" alt="${item.title}">
                <div class="card-info"><div class="card-title">${item.title}</div></div>
            </div>`;
        }
    });
    html += `</div>`;
    mainContent.innerHTML = html;
}

function openContent(url) { window.open(url, '_blank'); }

function renderVip() {
    mainContent.innerHTML = `
        <h2 style="margin-bottom:15px;text-align:center;color:var(--neon-violet);">${t('vip_title')}</h2>
        <p style="text-align:center;font-size:14px;margin-bottom:20px;color:#ccc;">${t('vip_desc')}</p>
        <div class="vip-packages">
            <div class="vip-plan"><div class="plan-info"><h3>${t('m_1')}</h3></div><button class="buy-btn" onclick="buyPackage('1_month')">100 ⭐</button></div>
            <div class="vip-plan"><div class="plan-info"><h3>${t('m_3')}</h3></div><button class="buy-btn" onclick="buyPackage('3_months')">200 ⭐</button></div>
            <div class="vip-plan"><div class="plan-info"><h3>${t('m_6')}</h3></div><button class="buy-btn" onclick="buyPackage('6_months')">350 ⭐</button></div>
            <div class="vip-plan"><div class="plan-info"><h3>${t('y_1')}</h3></div><button class="buy-btn" onclick="buyPackage('1_year')">500 ⭐</button></div>
        </div>`;
}

function renderProfil() {
    mainContent.innerHTML = `
        <div class="profile-container">
            <div class="avatar">👤</div>
            <h2>${user.first_name}</h2>
            <p style="color:#aaa;margin-bottom:20px;">@${user.username || 'username'}</p>
            <h3 style="margin-top:20px;color:var(--neon-orange);">Tilni o'zgartirish</h3>
            <div class="lang-tabs" style="margin-top:10px;">
                <div class="lang-tab ${currentLang==='uz'?'active':''}" onclick="setLang('uz')">O'zbek</div>
                <div class="lang-tab ${currentLang==='ru'?'active':''}" onclick="setLang('ru')">Русский</div>
                <div class="lang-tab ${currentLang==='kk'?'active':''}" onclick="setLang('kk')">Қазақ</div>
            </div>
        </div>`;
}

function setLang(l) { currentLang = l; applyLanguage(); renderProfil(); }

function renderAdmin() {
    mainContent.innerHTML = `
        <h2 style="color:var(--neon-orange);margin-bottom:15px;">Admin Panel</h2>
        <div style="background:rgba(0,0,0,0.6);padding:15px;border-radius:10px;">
            <label>Turi:</label>
            <select id="a-type" onchange="toggleCat()">
                <option value="kino">Kino</option>
                <option value="serial">Serial</option>
                <option value="musiqa">Musiqa</option>
            </select>
            <div id="cat-box" style="display:none;">
                <label>Musiqa Tili:</label>
                <select id="a-cat">
                    <option value="uz">O'zbekcha</option>
                    <option value="ru">Ruscha</option>
                    <option value="tr">Turkcha</option>
                </select>
            </div>
            <input type="text" id="a-title" placeholder="Nomi (masalan: Deadpool)">
            <input type="text" id="a-url" placeholder="Video/Audio havolasi">
            <input type="text" id="a-img" placeholder="Rasm havolasi (kinolar uchun)">
            <label style="display:block;margin-bottom:15px;color:white;">
                <input type="checkbox" id="a-vip" style="width:auto;display:inline-block;"> VIP kontentmi?
            </label>
            <button class="buy-btn" onclick="addContent()" style="width:100%;">Bazaga qo'shish</button>
            <p id="a-msg" style="color:lime;margin-top:10px;"></p> <h3 style="color:#fff;margin-top:20px;margin-bottom:10px;">
            Barcha kontentlar:</h3><div id="content-list">Yuklanmoqda...</div>
        </div>`;
        // Kontentlar ro'yxatini yuklash
    setTimeout(loadAdminList, 100);
}

function loadAdminList() {
    const listDiv = document.getElementById('content-list');
    if (!listDiv) return;
    fetch('/api/content?type=kino').then(r=>r.json()).then(k => {
    fetch('/api/content?type=serial').then(r=>r.json()).then(s => {
    fetch('/api/content?type=musiqa').then(r=>r.json()).then(m => {
        const all = [...k, ...s, ...m];
        if(all.length === 0) { listDiv.innerHTML = '<p>Hech narsa yo\'q</p>'; return; }
        let html = '';
        all.forEach(item => {
            html += `
            <div style="background:rgba(255,255,255,0.1);padding:10px;border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:13px;">${item.type === 'musiqa' ? '🎵' : item.type === 'serial' ? '📺' : '🎬'} ${item.title}</span>
                <button onclick="deleteContent(${item.id})" style="background:#ff3b30;border:none;color:white;padding:5px 12px;border-radius:15px;cursor:pointer;font-size:12px;">🗑 O'chir</button>
            </div>`;
        });
        listDiv.innerHTML = html;
    });});});
}

function deleteContent(id) {
    if(!confirm("Haqiqatan o'chirasizmi?")) return;
    fetch('/api/content/' + id, { method: 'DELETE' })
    .then(r => r.json())
    .then(data => {
        if(data.success) { loadAdminList(); }
        else alert("Xatolik!");
    });
}
}

function toggleCat() {
    document.getElementById('cat-box').style.display = document.getElementById('a-type').value === 'musiqa' ? 'block' : 'none';
}

function addContent() {
    const type = document.getElementById('a-type').value;
    const title = document.getElementById('a-title').value;
    const url = document.getElementById('a-url').value;
    const image_url = document.getElementById('a-img').value;
    const is_vip = document.getElementById('a-vip').checked;
    const category = type === 'musiqa' ? document.getElementById('a-cat').value : '';
    if (!title || !url) return alert("Nomi va havola kiritilishi shart!");
    fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, url, image_url, is_vip, category })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('a-msg').innerText = data.success ? "Muvaffaqiyatli qo'shildi!" : "Xatolik yuz berdi.";
        if(data.success) {
            document.getElementById('a-title').value = '';
            document.getElementById('a-url').value = '';
            document.getElementById('a-img').value = '';
        }
    })
    .catch(err => alert("Xato: " + err));
}

function buyPackage(packageType) {
    tg.MainButton.text = "To'lovni tayyorlash...";
    tg.MainButton.show();
    tg.MainButton.showProgress();
    fetch('/api/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: user.id, packageType })
    })
    .then(res => res.json())
    .then(data => {
        tg.MainButton.hide();
        if (data.success && data.invoiceLink) {
            tg.openInvoice(data.invoiceLink, status => {
                if (status === 'paid') tg.showAlert("To'lov muvaffaqiyatli!");
            });
        } else tg.showAlert("Xatolik yuz berdi.");
    }).catch(() => { tg.MainButton.hide(); tg.showAlert("Server xatosi."); });
}
