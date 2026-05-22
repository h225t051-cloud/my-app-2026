let allTrips = [];
let currentTrip = null;
let currentDay = 1;

function init() {
    allTrips = Storage.loadAll();
    showDashboard();

    document.addEventListener('dayChange', (e) => {
        currentDay = e.detail;
        updateTripUI();
    });

    document.addEventListener('openTrip', (e) => {
        openTrip(e.detail);
    });

    document.getElementById('logo').addEventListener('click', showDashboard);
    document.getElementById('back-to-home').addEventListener('click', showDashboard);

    document.getElementById('trip-notes').addEventListener('input', (e) => {
        if (currentTrip) {
            currentTrip.notes = e.target.value;
            Storage.saveTrip(currentTrip);
        }
    });

    document.getElementById('add-recom-btn').addEventListener('click', () => {
        const title = prompt('スポット名や店名を入力してください');
        if (title) {
            const url = prompt('URLがあれば入力してください', 'https://');
            currentTrip.recommendations.push({ title, url: url === 'https://' ? '' : url });
            Storage.saveTrip(currentTrip);
            UI.renderRecommendations(currentTrip.recommendations);
        }
    });

    document.getElementById('add-trip-btn').addEventListener('click', () => {
        const title = prompt('旅行のタイトルを入力してください');
        if (title) {
            const startDate = prompt('開始日を入力してください (YYYY-MM-DD)', '2026-06-01');
            const endDate = prompt('終了日を入力してください (YYYY-MM-DD)', '2026-06-05');
            const newTrip = {
                id: Date.now().toString(),
                title: title,
                startDate: startDate || '2026-06-01',
                endDate: endDate || '2026-06-05',
                budget: 100000,
                notes: '',
                recommendations: [],
                itinerary: []
            };
            
            const start = new Date(newTrip.startDate);
            const end = new Date(newTrip.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            for (let i = 1; i <= diffDays; i++) {
                newTrip.itinerary.push({ day: i, activities: [] });
            }

            allTrips.push(newTrip);
            Storage.saveAll(allTrips);
            showDashboard();
        }
    });

    document.getElementById('add-activity-btn').addEventListener('click', () => {
        const title = prompt('予定のタイトルを入力してください');
        if (title) {
            const time = prompt('時間を入力してください (例: 10:00)', '10:00');
            const cost = prompt('予想費用を入力してください (円)', '0');
            const url = prompt('参考URLがあれば入力してください', 'https://');
            
            const dayData = currentTrip.itinerary.find(d => d.day === currentDay);
            const newId = Date.now().toString();
            dayData.activities.push({
                id: newId,
                title: title,
                time: time || '00:00',
                description: '',
                cost: parseInt(cost) || 0,
                url: url === 'https://' ? '' : url
            });
            dayData.activities.sort((a, b) => a.time.localeCompare(b.time));
            Storage.saveTrip(currentTrip);
            updateTripUI();
        }
    });

    document.getElementById('total-budget').addEventListener('click', () => {
        const newBudget = prompt('予算を入力してください', currentTrip.budget);
        if (newBudget && !isNaN(newBudget)) {
            currentTrip.budget = parseInt(newBudget);
            Storage.saveTrip(currentTrip);
            updateTripUI();
        }
    });
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

window.deleteTrip = function(event, id) {
    event.stopPropagation();
    if (confirm('この旅行計画を削除しますか？')) {
        Storage.deleteTrip(id);
        showDashboard();
    }
};

window.deleteRecom = function(index) {
    currentTrip.recommendations.splice(index, 1);
    Storage.saveTrip(currentTrip);
    UI.renderRecommendations(currentTrip.recommendations);
};

window.deleteActivity = function(id) {
    if (confirm('この予定を削除しますか？')) {
        const dayData = currentTrip.itinerary.find(d => d.day === currentDay);
        dayData.activities = dayData.activities.filter(a => a.id !== id);
        Storage.saveTrip(currentTrip);
        updateTripUI();
    }
};

window.editActivity = function(id) {
    const dayData = currentTrip.itinerary.find(d => d.day === currentDay);
    const act = dayData.activities.find(a => a.id === id);
    const newTitle = prompt('タイトルを入力してください', act.title);
    if (newTitle) {
        act.title = newTitle;
        const newCost = prompt('費用を入力してください', act.cost);
        act.cost = parseInt(newCost) || 0;
        Storage.saveTrip(currentTrip);
        updateTripUI();
    }
};

document.addEventListener('DOMContentLoaded', init);
