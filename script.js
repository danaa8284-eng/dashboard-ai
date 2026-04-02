// ===== CONFIGURATION =====
const LOCAL_STORAGE_KEY = 'n8n_waha_base_url';

function getBaseUrl() {
    return (document.getElementById('baseUrl').value || '').replace(/\/+$/, '');
}

function saveBaseUrl() {
    const url = getBaseUrl();
    if (!url) {
        showNotification('Masukkan Base URL terlebih dahulu!', 'error');
        return;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, url);
    showNotification('Base URL berhasil disimpan!', 'success');
    // Auto-load settings after saving URL
    loadSettings();
}

// ===== NOTIFICATION SYSTEM =====
let notifTimeout = null;

function showNotification(message, type) {
    const el = document.getElementById('notification');
    el.textContent = message;
    el.className = 'notification show ' + type;

    if (notifTimeout) clearTimeout(notifTimeout);
    notifTimeout = setTimeout(() => {
        el.className = 'notification hidden';
    }, 4000);
}

// ===== BUTTON LOADING STATE =====
function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (loading) {
        btn.classList.add('loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// ===== HELPER: POST REQUEST =====
async function postData(endpoint, data, btnId) {
    const base = getBaseUrl();
    if (!base) {
        showNotification('⚠️ Atur Base URL n8n terlebih dahulu!', 'error');
        return false;
    }

    const url = base + endpoint;
    setLoading(btnId, true);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showNotification('✅ Data berhasil disimpan ke ' + endpoint, 'success');
            return true;
        } else {
            showNotification('❌ Gagal menyimpan! Status: ' + response.status, 'error');
            return false;
        }
    } catch (err) {
        showNotification('❌ Gagal menghubungi server: ' + err.message, 'error');
        return false;
    } finally {
        setLoading(btnId, false);
    }
}

// ===== 1. SIMPAN PROMPT =====
async function simpanPrompt() {
    const prompt = document.getElementById('promptText').value.trim();
    if (!prompt) {
        showNotification('⚠️ Prompt tidak boleh kosong!', 'error');
        return;
    }
    await postData('/webhook/prompt', { prompt: prompt }, 'btnPrompt');
}

// ===== 2. SIMPAN GAMBAR =====
async function simpanGambar() {
    const image1 = document.getElementById('image1').value.trim();
    const image2 = document.getElementById('image2').value.trim();
    const image3 = document.getElementById('image3').value.trim();
    const image4 = document.getElementById('image4').value.trim();
    const image5 = document.getElementById('image5').value.trim();

    if (!image1 && !image2 && !image3 && !image4 && !image5) {
        showNotification('⚠️ Isi minimal 1 URL gambar!', 'error');
        return;
    }

    await postData('/webhook/image', {
        image1: image1,
        image2: image2,
        image3: image3,
        image4: image4,
        image5: image5
    }, 'btnGambar');
}

// ===== 3. SIMPAN CAPTION =====
async function simpanCaption() {
    const caption = document.getElementById('captionText').value.trim();
    if (!caption) {
        showNotification('⚠️ Caption tidak boleh kosong!', 'error');
        return;
    }
    await postData('/webhook/caption', { caption: caption }, 'btnCaption');
}

// ===== 4. SIMPAN FOLLOW-UP =====
async function simpanFollowup() {
    const followup = document.getElementById('followupText').value.trim();
    if (!followup) {
        showNotification('⚠️ Teks follow-up tidak boleh kosong!', 'error');
        return;
    }
    await postData('/webhook/followup', { followup: followup }, 'btnFollowup');
}

// ===== PREVIEW GAMBAR =====
function previewGambar() {
    const container = document.getElementById('imagePreviewRow');
    container.innerHTML = '';

    const ids = ['image1', 'image2', 'image3', 'image4', 'image5'];
    let hasAny = false;

    ids.forEach((id, index) => {
        const url = document.getElementById(id).value.trim();
        if (url) {
            hasAny = true;
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Gambar ' + (index + 1);
            img.title = 'Gambar ' + (index + 1) + ': ' + url;
            img.onerror = function () {
                const errDiv = document.createElement('div');
                errDiv.className = 'img-error';
                errDiv.textContent = 'Gagal load #' + (index + 1);
                this.replaceWith(errDiv);
            };
            container.appendChild(img);
        }
    });

    if (!hasAny) {
        showNotification('⚠️ Tidak ada URL gambar untuk di-preview', 'info');
    }
}

// ===== 4. LOAD DATA AWAL =====
async function loadSettings() {
    const base = getBaseUrl();
    if (!base) {
        showNotification('ℹ️ Masukkan Base URL n8n untuk memuat data setting', 'info');
        return;
    }

    const url = base + '/webhook/get-setting';
    showNotification('⏳ Memuat data setting...', 'info');

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            showNotification('⚠️ Gagal memuat setting. Status: ' + response.status, 'error');
            return;
        }

        const data = await response.json();

        // Isi prompt
        if (data.prompt) {
            document.getElementById('promptText').value = data.prompt;
        }

        // Isi caption
        if (data.caption) {
            document.getElementById('captionText').value = data.caption;
        }

        // Isi follow-up text
        if (data.followup) {
            document.getElementById('followupText').value = data.followup;
        }

        // Isi image URLs
        if (data.image1) document.getElementById('image1').value = data.image1;
        if (data.image2) document.getElementById('image2').value = data.image2;
        if (data.image3) document.getElementById('image3').value = data.image3;
        if (data.image4) document.getElementById('image4').value = data.image4;
        if (data.image5) document.getElementById('image5').value = data.image5;

        showNotification('✅ Data setting berhasil dimuat!', 'success');

        // Auto preview images if any
        const hasImages = data.image1 || data.image2 || data.image3 || data.image4 || data.image5;
        if (hasImages) {
            previewGambar();
        }

    } catch (err) {
        showNotification('⚠️ Tidak dapat memuat setting: ' + err.message, 'error');
    }
}

// ===== INIT ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', function () {
    // Restore saved base URL
    const savedUrl = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedUrl) {
        document.getElementById('baseUrl').value = savedUrl;
        // Auto-load settings
        loadSettings();
    }
});