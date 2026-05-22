let currentData = null;
let currentDay = 1;

function init() {
    currentData = Storage.load();
    updateUI();

    document.addEventListener('dayChange', (e) => {
        currentDay = e.detail;
        updateUI();
    });

    document.getElementById('add-trip-btn').addEventListener('click', () => {
        const title = prompt('旅行のタイトルを入力してください', currentData.title);
        if (title) {
            currentData.title = title;
            Storage.save(currentData);
            updateUI();
        }
    });

    document.getElementById('add-activity-btn').addEventListener('click', () => {
        const title = prompt('予定のタイトルを入力してください');
        if (title) {
            const time = prompt('時間を入力してください (例: 10:00)', '10:00');
            const dayData = currentData.itinerary.find(d => d.day === currentDay);
            const newId = Date.now();
            dayData.activities.push({
                id: newId,
                title: title,
                time: time || '00:00',
                description: ''
            });
            // Sort by time
            dayData.activities.sort((a, b) => a.time.localeCompare(b.time));
            Storage.save(currentData);
            updateUI();
        }
    });

    document.getElementById('total-budget').addEventListener('click', () => {
        const newBudget = prompt('予算を入力してください', currentData.budget);
        if (newBudget && !isNaN(newBudget)) {
            currentData.budget = parseInt(newBudget);
            Storage.save(currentData);
            updateUI();
        }
    });
}

function updateUI() {
    UI.renderTripHeader(currentData);
    UI.renderDaysNav(currentData.itinerary, currentDay);
    
    const dayData = currentData.itinerary.find(d => d.day === currentDay);
    UI.renderActivities(dayData ? dayData.activities : []);
}

// Global functions for inline event handlers
window.deleteActivity = function(id) {
    if (confirm('この予定を削除しますか？')) {
        const dayData = currentData.itinerary.find(d => d.day === currentDay);
        dayData.activities = dayData.activities.filter(a => a.id !== id);
        Storage.save(currentData);
        updateUI();
    }
};

window.editActivity = function(id) {
    const dayData = currentData.itinerary.find(d => d.day === currentDay);
    const act = dayData.activities.find(a => a.id === id);
    const newTitle = prompt('タイトルを入力してください', act.title);
    if (newTitle) {
        act.title = newTitle;
        Storage.save(currentData);
        updateUI();
    }
};

document.addEventListener('DOMContentLoaded', init);
