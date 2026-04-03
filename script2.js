// ===== LOADING SCREEN =====
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    const colors = ['#3b82f6', '#60a5fa', '#22d3ee', '#a78bfa', '#93c5fd'];
    
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 4 + 's';
        particle.style.animationDuration = (3 + Math.random() * 3) + 's';
        particle.style.width = (2 + Math.random() * 3) + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        container.appendChild(particle);
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const app = document.getElementById('app');
    
    if (loadingScreen && app) {
        loadingScreen.classList.add('fade-out');
        app.classList.remove('hidden');
        app.classList.add('visible');
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// ===== STATUS HELPER =====
function setStatus(text, type) {
    const status = document.getElementById('status');
    if (!status) return;
    
    status.className = 'status-message';
    status.textContent = text;
    
    if (type) {
        status.classList.add(type);
    }
    
    if (type === 'success') {
        setTimeout(() => {
            status.textContent = '';
            status.className = 'status-message';
        }, 3000);
    }
}

// ===== MODE =====
const isDev = true;

// ===== LOAD DATA =====
async function loadData() {
    let user = localStorage.getItem('user');
    
    if (!user) {
        if (isDev) {
            console.warn('Mode DEV: user dummy dipakai');
            user = 'team1';
        } else {
            setStatus('⚠️ Belum login', 'warning');
            return;
        }
    }
    
    setStatus('⏳ Memuat data...', 'loading');
    
    try {
        const res = await fetch('https://n8n-wyv7h4exvgre.jkt1.sumopod.my.id/webhook/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user })
        });
        
        const text = await res.text();
        console.log('RAW RESPONSE:', text);
        
        const json = text ? JSON.parse(text) : {};
        
        if (!json.success || !json.data) {
            setStatus('⚠️ Data tidak ditemukan', 'warning');
            return;
        }
        
        const d = json.data;
        
        document.getElementById('prompt').value = d.prompt || '';
        document.getElementById('img1').value = d.img1 || '';
        document.getElementById('cap1').value = d.cap1 || '';
        document.getElementById('img2').value = d.img2 || '';
        document.getElementById('cap2').value = d.cap2 || '';
        document.getElementById('img3').value = d.img3 || '';
        document.getElementById('cap3').value = d.cap3 || '';
        document.getElementById('img4').value = d.img4 || '';
        document.getElementById('cap4').value = d.cap4 || '';
        document.getElementById('img5').value = d.img5 || '';
        document.getElementById('cap5').value = d.cap5 || '';
        document.getElementById('freecap').value = d.freecap || '';
        
        setStatus('✅ Data berhasil dimuat', 'success');
        
    } catch (err) {
        console.error('ERROR LOAD:', err);
        setStatus('❌ Gagal memuat data', 'error');
    }
}

// ===== SAVE DATA =====
async function save() {
    const btn = document.getElementById('btn-save');
    let user = localStorage.getItem('user');
    
    if (!user) {
        if (isDev) {
            user = 'team1';
        } else {
            setStatus('⚠️ User tidak ditemukan', 'warning');
            return;
        }
    }
    
    const data = {
        user: user,
        prompt: document.getElementById('prompt').value,
        img1: document.getElementById('img1').value,
        cap1: document.getElementById('cap1').value,
        img2: document.getElementById('img2').value,
        cap2: document.getElementById('cap2').value,
        img3: document.getElementById('img3').value,
        cap3: document.getElementById('cap3').value,
        img4: document.getElementById('img4').value,
        cap4: document.getElementById('cap4').value,
        img5: document.getElementById('img5').value,
        cap5: document.getElementById('cap5').value,
        freecap: document.getElementById('freecap').value
    };
    
    setStatus('⏳ Menyimpan data...', 'loading');
    if (btn) btn.classList.add('saving');
    
    try {
        const res = await fetch('https://n8n-wyv7h4exvgre.jkt1.sumopod.my.id/webhook/input', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        await res.text();
        
        setStatus('✅ Data berhasil disimpan', 'success');
        
    } catch (error) {
        console.error('ERROR SAVE:', error);
        setStatus('❌ Gagal menyimpan data', 'error');
    } finally {
        if (btn) btn.classList.remove('saving');
    }
}

// Make save globally accessible
window.save = save;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    
    // Show loading briefly then reveal app
    setTimeout(() => {
        hideLoadingScreen();
    }, 500);
    
    // Load data after app is visible
    setTimeout(() => {
        loadData();
    }, 1000);
});