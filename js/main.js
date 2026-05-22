let allTrips = [];
let currentTrip = null;
let currentDay = 1;
let editingActivityId = null;

function init() {
    allTrips = Storage.loadAll();
    showDashboard();

    // Custom Event Listeners
    document.addEventListener('dayChange', (e) => {
        currentDay = e.detail;
        updateTripUI();
    });

    document.addEventListener('openTrip', (e) => {
        openTrip(e.detail);
    });

    // Navigation
    document.getElementById('logo').addEventListener('click', showDashboard);
    document.getElementById('back-to-home').addEventListener('click', showDashboard);

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
            try {
                const trip = JSON.parse(atob(code));
                trip.id = Date.now().toString(); // New ID for imported trip
                allTrips.push(trip);
                Storage.saveAll(allTrips);
                showDashboard();
                alert('旅行プランを読み込みました！');
            } catch (e) {
                alert('無効な共有コードです。');
            }
        }
    });

    // Trip View Actions
    document.getElementById('trip-notes').addEventListener('input', (e) => {
        if (currentTrip) {
            currentTrip.notes = e.target.value;
            Storage.saveTrip(currentTrip);
        }
    });

    document.getElementById('share-trip-btn').addEventListener('click', () => {
        const code = btoa(JSON.stringify(currentTrip));
        document.getElementById('share-code').value = code;
        document.getElementById('share-modal').style.display = 'flex';
    });

    document.getElementById('close-share-modal').addEventListener('click', () => {
        document.getElementById('share-modal').style.display = 'none';
    });

    document.getElementById('copy-share-code').addEventListener('click', () => {
        const el = document.getElementById('share-code');
        el.select();
        document.execCommand('copy');
        alert('共有コードをコピーしました！');
    });

    document.getElementById('add-comment-btn').addEventListener('click', () => {
        const input = document.getElementById('comment-input');
        if (input.value) {
            const newComment = {
                user: 'ゲスト', // Simplified
                text: input.value,
                date: new Date().toISOString().split('T')[0]
            };
            currentTrip.comments.push(newComment);
            Storage.saveTrip(currentTrip);
            UI.renderComments(currentTrip.comments);
            input.value = '';
        }
    });

    document.getElementById('add-activity-btn').addEventListener('click', () => {
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

    document.getElementById('save-activity-btn').addEventListener('click', saveActivity);

    document.getElementById('add-recom-btn').addEventListener('click', () => {
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
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value) {
            const query = searchInput.value;
            window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
            if (confirm(`「${query}」をおすすめリストに追加しますか？`)) {
                currentTrip.recommendations.push({ title: query, url: `https://www.google.com/maps/search/${encodeURIComponent(query)}` });
                Storage.saveTrip(currentTrip);
                UI.renderRecommendations(currentTrip.recommendations);
                searchInput.value = '';
            }
        }
    });
}

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

function openTrip(id) {
    currentTrip = allTrips.find(t => t.id === id);
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
    currentTrip.recommendations.splice(index, 1);
    Storage.saveTrip(currentTrip);
    UI.renderRecommendations(currentTrip.recommendations);
};

window.deleteActivity = (id) => {
    if (confirm('削除しますか？')) {
        const dayData = currentTrip.itinerary.find(d => d.day === currentDay);
        dayData.activities = dayData.activities.filter(a => a.id !== id);
        Storage.saveTrip(currentTrip);
        updateTripUI();
    }
};

document.addEventListener('DOMContentLoaded', init);
