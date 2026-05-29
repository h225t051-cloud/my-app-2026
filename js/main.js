let allTrips = [];
let exploreTrips = [];
let currentTrip = null;
let currentDay = 1;
let editingActivityId = null;

function init() {
    allTrips = Storage.loadAll();
    exploreTrips = Storage.loadExplore();
    loadProfile();
    showDashboard();

    // Custom Event Listeners
    document.addEventListener('dayChange', (e) => {
        currentDay = e.detail;
        updateTripUI();
    });

    document.addEventListener('openTrip', (e) => {
        openTrip(e.detail, e.isExplore);
    });

    // Tab Switching
    document.getElementById('tab-my-trips').addEventListener('click', () => {
        document.getElementById('tab-my-trips').classList.add('active');
        document.getElementById('tab-explore').classList.remove('active');
        document.getElementById('my-trips-section').style.display = 'block';
        document.getElementById('explore-section').style.display = 'none';
        showDashboard();
    });

    document.getElementById('tab-explore').addEventListener('click', () => {
        document.getElementById('tab-explore').classList.add('active');
        document.getElementById('tab-my-trips').classList.remove('active');
        document.getElementById('explore-section').style.display = 'block';
        document.getElementById('my-trips-section').style.display = 'none';
        UI.renderExplore(exploreTrips);
    });

    // Navigation
    document.getElementById('logo').addEventListener('click', showDashboard);
    document.getElementById('back-to-home').addEventListener('click', showDashboard);
    document.getElementById('my-page-btn').addEventListener('click', () => UI.showView('mypage'));

    // Profile Actions
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('edit-usericon').value = btn.textContent;
        });
    });

    document.getElementById('save-profile-btn').addEventListener('click', saveProfile);

    // Dashboard Actions
    document.getElementById('add-trip-btn').addEventListener('click', () => {
        document.getElementById('modal-trip-title').value = '';
        document.getElementById('trip-modal').style.display = 'flex';
    });

    document.getElementById('close-trip-modal').addEventListener('click', () => {
        document.getElementById('trip-modal').style.display = 'none';
    });

    document.getElementById('create-trip-btn').addEventListener('click', () => {
        const title = document.getElementById('modal-trip-title').value;
        if (!title) return alert('タイトルを入力してください');
        
        const startDate = document.getElementById('modal-trip-start').value;
        const endDate = document.getElementById('modal-trip-end').value;
        const budget = parseInt(document.getElementById('modal-trip-budget').value) || 0;

        const newTrip = {
            id: Date.now().toString(),
            title: title,
            startDate: startDate,
            endDate: endDate,
            budget: budget,
            notes: '',
            recommendations: [],
            comments: [],
            itinerary: []
        };
        const start = new Date(newTrip.startDate);
        const end = new Date(newTrip.endDate);
        const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
        for (let i = 1; i <= diffDays; i++) newTrip.itinerary.push({ day: i, activities: [] });
        allTrips.push(newTrip);
        Storage.saveAll(allTrips);
        showDashboard();
        document.getElementById('trip-modal').style.display = 'none';
    });

    document.getElementById('import-trip-btn').addEventListener('click', () => {
        const code = prompt('共有コードを貼り付けてください');
        if (code) {
            importTrip(code);
        }
    });

    // Trip View Actions
    document.getElementById('trip-notes').addEventListener('input', (e) => {
        if (currentTrip && !currentTrip.isExplore) {
            currentTrip.notes = e.target.value;
            Storage.saveTrip(currentTrip);
        }
    });

    document.getElementById('share-trip-btn').addEventListener('click', () => {
        if (!currentTrip) return;
        try {
            const jsonStr = JSON.stringify(currentTrip);
            const code = btoa(unescape(encodeURIComponent(jsonStr)));
            document.getElementById('share-code').value = code;
            document.getElementById('share-modal').style.display = 'flex';
        } catch (e) {
            console.error('Encoding error:', e);
            alert('共有コードの作成に失敗しました。');
        }
    });

    document.getElementById('close-share-modal').addEventListener('click', () => {
        document.getElementById('share-modal').style.display = 'none';
    });

    document.getElementById('copy-share-code').addEventListener('click', () => {
        const el = document.getElementById('share-code');
        const code = el.value;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(() => {
                alert('共有コードをコピーしました！');
            }).catch(err => {
                console.error('Copy failed:', err);
                // Fallback
                el.select();
                document.execCommand('copy');
                alert('共有コードをコピーしました！');
            });
        } else {
            el.select();
            document.execCommand('copy');
            alert('共有コードをコピーしました！');
        }
    });

    document.getElementById('add-comment-btn').addEventListener('click', () => {
        const input = document.getElementById('comment-input');
        if (input.value && currentTrip && !currentTrip.isExplore) {
            const newComment = {
                user: 'ゲスト', 
                text: input.value,
                date: new Date().toISOString().split('T')[0]
            };
            currentTrip.comments.push(newComment);
            Storage.saveTrip(currentTrip);
            UI.renderComments(currentTrip.comments);
            input.value = '';
        } else if (currentTrip.isExplore) {
            alert('見本プランにはコメントできません。自分のプランにコピーしてからお試しください。');
        }
    });

    document.getElementById('add-activity-btn').addEventListener('click', () => {
        if (currentTrip.isExplore) return alert('見本プランは編集できません。コピーしてからお試しください。');
        editingActivityId = null;
        document.getElementById('modal-title').textContent = '予定の追加';
        document.getElementById('modal-activity-title').value = '';
        document.getElementById('modal-activity-time').value = '10:00';
        document.getElementById('modal-activity-cost').value = '';
        document.getElementById('modal-activity-url').value = '';
        document.getElementById('modal-activity-desc').value = '';
        document.getElementById('activity-modal').style.display = 'flex';
    });

    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('activity-modal').style.display = 'none';
    });

    document.getElementById('modal-search-map-btn').addEventListener('click', () => {
        const title = document.getElementById('modal-activity-title').value;
        if (title) {
            window.open(`https://www.google.com/maps/search/${encodeURIComponent(title)}`, '_blank');
        } else {
            alert('場所の名前を入力してから検索してください');
        }
    });

    document.getElementById('save-activity-btn').addEventListener('click', saveActivity);

    document.getElementById('add-recom-btn').addEventListener('click', () => {
        if (currentTrip.isExplore) return alert('見本プランは編集できません。');
        const title = prompt('スポット名や店名を入力してください');
        if (title) {
            const url = prompt('URLがあれば入力してください', 'https://');
            currentTrip.recommendations.push({ title, url: url === 'https://' ? '' : url });
            Storage.saveTrip(currentTrip);
            UI.renderRecommendations(currentTrip.recommendations);
        }
    });

    // Search
    const searchInput = document.getElementById('pac-input');
    const searchBtn = document.getElementById('search-go-btn');
    
    const performSearch = () => {
        const query = searchInput.value;
        if (query) {
            window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
            if (currentTrip && !currentTrip.isExplore && confirm(`「${query}」をおすすめリストに追加しますか？`)) {
                currentTrip.recommendations = currentTrip.recommendations || [];
                currentTrip.recommendations.push({ title: query, url: `https://www.google.com/maps/search/${encodeURIComponent(query)}` });
                Storage.saveTrip(currentTrip);
                UI.renderRecommendations(currentTrip.recommendations);
                searchInput.value = '';
            }
        }
    };

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    searchBtn.addEventListener('click', performSearch);
}

function loadProfile() {
    const profile = Storage.loadProfile();
    document.getElementById('profile-name-display').textContent = profile.name;
    document.getElementById('profile-icon-display').textContent = profile.icon;
    document.getElementById('profile-bio-display').textContent = profile.bio;
    
    document.getElementById('edit-username').value = profile.name;
    document.getElementById('edit-userbio').value = profile.bio;
    document.getElementById('edit-usericon').value = profile.icon;
    
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        if (btn.textContent === profile.icon) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function saveProfile() {
    const profile = {
        name: document.getElementById('edit-username').value || 'ゲスト',
        icon: document.getElementById('edit-usericon').value,
        bio: document.getElementById('edit-userbio').value
    };
    Storage.saveProfile(profile);
    loadProfile();
    alert('プロフィールを保存しました！');
    showDashboard();
}

function importTrip(code) {
    try {
        const jsonStr = decodeURIComponent(escape(atob(code)));
        const trip = JSON.parse(jsonStr);
        trip.id = Date.now().toString(); 
        allTrips.push(trip);
        Storage.saveAll(allTrips);
        showDashboard();
        alert('旅行プランを読み込みました！「マイ・プラン」を確認してください。');
        
        // Switch back to my trips tab
        document.getElementById('tab-my-trips').click();
    } catch (e) {
        console.error('Import error:', e);
        alert('無効な共有コードです。');
    }
}

window.importFromExplore = (event, code) => {
    event.stopPropagation();
    importTrip(code);
};

function saveActivity() {
    const title = document.getElementById('modal-activity-title').value;
    if (!title) return alert('タイトルを入力してください');
    
    const time = document.getElementById('modal-activity-time').value;
    const cost = parseInt(document.getElementById('modal-activity-cost').value) || 0;
    const url = document.getElementById('modal-activity-url').value;
    const desc = document.getElementById('modal-activity-desc').value;
    
    const dayData = currentTrip.itinerary.find(d => d.day === currentDay);
    
    if (editingActivityId) {
        const act = dayData.activities.find(a => a.id === editingActivityId);
        Object.assign(act, { title, time, cost, url, description: desc });
    } else {
        dayData.activities.push({
            id: Date.now().toString(),
            title, time, cost, url, description: desc
        });
    }
    
    dayData.activities.sort((a, b) => a.time.localeCompare(b.time));
    Storage.saveTrip(currentTrip);
    updateTripUI();
    document.getElementById('activity-modal').style.display = 'none';
}

function showDashboard() {
    allTrips = Storage.loadAll();
    UI.showView('dashboard');
    UI.renderDashboard(allTrips);
}

function openTrip(id, isExplore = false) {
    if (isExplore) {
        currentTrip = exploreTrips.find(t => t.id === id);
        currentTrip.isExplore = true;
    } else {
        currentTrip = allTrips.find(t => t.id === id);
        currentTrip.isExplore = false;
    }
    currentDay = 1;
    UI.showView('trip');
    updateTripUI();
}

function updateTripUI() {
    UI.renderTripHeader(currentTrip);
    UI.renderDaysNav(currentTrip.itinerary, currentDay);
    const dayData = currentTrip.itinerary.find(d => d.day === currentDay);
    UI.renderActivities(dayData ? dayData.activities : []);
}

window.openEditModal = function(id) {
    if (currentTrip.isExplore) return alert('見本プランは編集できません。');
    editingActivityId = id;
    const dayData = currentTrip.itinerary.find(d => d.day === currentDay);
    const act = dayData.activities.find(a => a.id === id);
    
    document.getElementById('modal-title').textContent = '予定の編集';
    document.getElementById('modal-activity-title').value = act.title;
    document.getElementById('modal-activity-time').value = act.time;
    document.getElementById('modal-activity-cost').value = act.cost;
    document.getElementById('modal-activity-url').value = act.url;
    document.getElementById('modal-activity-desc').value = act.description || '';
    document.getElementById('activity-modal').style.display = 'flex';
};

window.deleteTrip = (e, id) => {
    e.stopPropagation();
    if (confirm('削除しますか？')) { Storage.deleteTrip(id); showDashboard(); }
};

window.deleteRecom = (index) => {
    if (currentTrip.isExplore) return;
    currentTrip.recommendations.splice(index, 1);
    Storage.saveTrip(currentTrip);
    UI.renderRecommendations(currentTrip.recommendations);
};

window.deleteActivity = (id) => {
    if (currentTrip.isExplore) return;
    if (confirm('削除しますか？')) {
        const dayData = currentTrip.itinerary.find(d => d.day === currentDay);
        dayData.activities = dayData.activities.filter(a => a.id !== id);
        Storage.saveTrip(currentTrip);
        updateTripUI();
    }
};

document.addEventListener('DOMContentLoaded', init);
