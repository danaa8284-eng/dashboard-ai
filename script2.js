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

    status.textContent = text;

    // pakai class header, bukan lama
    status.className = 'header-notif';

    if (type === 'success') {
        status.style.color = '#22c55e';
    } else if (type === 'error') {
        status.style.color = '#ef4444';
    } else if (type === 'warning') {
        status.style.color = '#f59e0b';
    } else {
        status.style.color = '#60a5fa';
    }

    // auto hilang
    if (type === 'success') {
        setTimeout(() => {
            status.textContent = '';
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
    
    setTimeout(() => {
        hideLoadingScreen();
    }, 500);
    
    setTimeout(() => {
        if (document.getElementById('prompt')) {
            loadData();
        }
    }, 1000);

}); // ⬅️ INI WAJIB


function showPage(page) {
    const dashboard = document.querySelector(".main-content");
    
    if (page === "dashboard") {
        dashboard.innerHTML = "<h2>Ini Dashboard Chat</h2>";
    }

    if (page === "setting") {
        dashboard.innerHTML = "<h2>Ini Setting AI Agent</h2>";
    }
}






let chart;

const API_LIST = {
  cs1: "https://script.google.com/macros/s/API_CS1/exec",
  cs2: "https://script.google.com/macros/s/API_CS2/exec",
  cs3: "https://script.google.com/macros/s/API_CS3/exec",
  cs4: "https://script.google.com/macros/s/API_CS4/exec"
};

let selectedCS = "cs1"; // default

function formatDateLocal(dateStr) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${year}-${month}-${day}`;
}

async function loadChartData() {

  const loading = document.getElementById("loading");

  if (loading) loading.style.display = "flex";

  try {
   const api = API_LIST[selectedCS];

if (!api) {
  alert("API tidak ditemukan");
  return;
}

const res = await fetch(api);
    const data = await res.json();

   const startEl = document.getElementById("startDate");
const endEl = document.getElementById("endDate");

const start = startEl ? startEl.value : "";
const end = endEl ? endEl.value : "";

    let grouped = {};
    let total = 0;

    const isSingleDay = start && end && start === end;

    data.forEach(item => {
      let date = item.date;
      let time = item.time;

      if (!date) return;

      date = formatDateLocal(date);

      if (start && date < start) return;
      if (end && date > end) return;

      let label;

      if (isSingleDay) {
        if (!time) return;

        let rawTime = String(time).trim().replace(".", ":");
        let parts = rawTime.split(":");
        let hour = parts[0].padStart(2, "0");

        label = hour + ".00";

      } else {
        label = date;
      }

      if (!grouped[label]) grouped[label] = 0;
      grouped[label]++;
      total++;
    });

    document.getElementById("totalChat").innerText = total;

    let labels;

    if (isSingleDay) {
      labels = [];
      for (let i = 0; i < 24; i++) {
        let h = String(i).padStart(2, "0") + ".00";
        labels.push(h);
        if (!grouped[h]) grouped[h] = 0;
      }
    } else {
      labels = Object.keys(grouped).sort();
    }

    const values = labels.map(l => grouped[l]);

    renderChart(labels, values);

  } catch (err) {
    console.error(err);
    alert("Gagal ambil data");
  }

  if (loading) loading.style.display = "none";
}

function renderChart(labels, data) {
  if (chart) chart.destroy();

  const ctx = document.getElementById("chart");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Jumlah Chat",
        data: data,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// auto load aman (hanya kalau halaman ada chart)
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("chart")) {
    loadChartData();
  }
});


document.querySelectorAll(".cs-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cs-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    selectedCS = btn.dataset.cs;
  });
});

function applyCS() {
  setStatus("🔄 Mengganti data CS...", "loading");
  loadChartData();
}



