const UI = {
    renderTripHeader(data) {
        document.getElementById('trip-title').textContent = data.title;
        document.getElementById('trip-dates').innerHTML = `<i data-lucide="calendar"></i> ${data.startDate} - ${data.endDate}`;
        document.getElementById('total-budget').textContent = `¥${data.budget.toLocaleString()}`;
        lucide.createIcons();
    },

    renderDaysNav(itinerary, currentDay) {
        const daysList = document.getElementById('days-list');
        daysList.innerHTML = '';
        itinerary.forEach(day => {
            const li = document.createElement('li');
            li.textContent = `${day.day}日目`;
            if (day.day === currentDay) li.classList.add('active');
            li.addEventListener('click', () => {
                const event = new CustomEvent('dayChange', { detail: day.day });
                document.dispatchEvent(event);
            });
            daysList.appendChild(li);
        });
    },

    renderActivities(activities) {
        const list = document.getElementById('activities-list');
        list.innerHTML = '';
        
        if (activities.length === 0) {
            list.innerHTML = '<p class="text-muted">予定がありません。追加してください。</p>';
            return;
        }

        activities.forEach(act => {
            const card = document.createElement('div');
            card.className = 'activity-card';
            card.innerHTML = `
                <div class="time">${act.time}</div>
                <div class="content">
                    <h4>${act.title}</h4>
                    <p>${act.description}</p>
                </div>
                <div class="actions">
                    <button class="btn-icon" onclick="editActivity(${act.id})"><i data-lucide="edit-2"></i></button>
                    <button class="btn-icon text-danger" onclick="deleteActivity(${act.id})"><i data-lucide="trash-2"></i></button>
                </div>
            `;
            list.appendChild(card);
        });
        lucide.createIcons();
    }
};
