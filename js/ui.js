const UI = {
    showView(viewId) {
        document.getElementById('dashboard-view').style.display = viewId === 'dashboard' ? 'block' : 'none';
        document.getElementById('trip-view').style.display = viewId === 'trip' ? 'block' : 'none';
        document.getElementById('mypage-view').style.display = viewId === 'mypage' ? 'block' : 'none';
        
        document.querySelector('.tab-nav').style.display = viewId === 'dashboard' ? 'flex' : 'none';
        document.getElementById('back-to-home').style.display = (viewId === 'trip' || viewId === 'mypage') ? 'inline-flex' : 'none';
        document.getElementById('add-trip-btn').style.display = viewId === 'dashboard' ? 'inline-flex' : 'none';
        document.getElementById('import-trip-btn').style.display = viewId === 'dashboard' ? 'inline-flex' : 'none';
        document.getElementById('my-page-btn').style.display = viewId === 'dashboard' ? 'inline-flex' : 'none';

        // FAB visibility
        const fab = document.getElementById('fab-add-activity');
        if (viewId === 'trip') {
            fab.classList.add('visible');
            fab.style.display = 'flex';
        } else {
            fab.classList.remove('visible');
            fab.style.display = 'none';
        }

        // Bottom nav sync
        if (typeof updateBottomNavActive === 'function') {
            if (viewId === 'dashboard') updateBottomNavActive('bottom-home-btn');
            if (viewId === 'mypage') updateBottomNavActive('bottom-mypage-btn');
        }
    },

    renderDashboard(trips) {
        const grid = document.getElementById('trips-grid');
        grid.innerHTML = '';
        
        if (trips.length === 0) {
            grid.innerHTML = '<p class="text-muted">まだ旅行計画がありません。「新しい旅行」から作成しましょう！</p>';
        }

        trips.forEach(trip => {
            const card = document.createElement('div');
            card.className = 'trip-card';
            card.innerHTML = `
                <h3>${trip.title}</h3>
                <div class="trip-meta"><i data-lucide="calendar"></i> ${trip.startDate} - ${trip.endDate}</div>
                <div class="trip-footer">
                    <span class="trip-budget">予算 ¥${trip.budget.toLocaleString()}</span>
                    <button class="btn-icon-delete" onclick="deleteTrip(event, '${trip.id}')"><i data-lucide="trash-2"></i></button>
                </div>
            `;
            card.addEventListener('click', () => {
                const event = new CustomEvent('openTrip', { detail: trip.id });
                document.dispatchEvent(event);
            });
            grid.appendChild(card);
        });
        lucide.createIcons();
    },

    renderExplore(trips) {
        const grid = document.getElementById('explore-grid');
        grid.innerHTML = '';
        
        trips.forEach(trip => {
            const card = document.createElement('div');
            card.className = 'trip-card';
            card.style.borderLeft = '8px solid var(--accent-color)';
            card.innerHTML = `
                <div class="badge" style="background: var(--accent-color); color: var(--text-color); padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 800; width: fit-content; margin-bottom: 8px;">PUBLIC</div>
                <h3>${trip.title}</h3>
                <div class="trip-meta"><i data-lucide="user"></i> ${trip.author || '旅行者さん'}</div>
                <div class="trip-meta"><i data-lucide="calendar"></i> ${trip.startDate} - ${trip.endDate}</div>
                <div class="trip-footer">
                    <button class="btn btn-secondary btn-sm" onclick="importFromExplore(event, '${btoa(unescape(encodeURIComponent(JSON.stringify(trip))))}')"><i data-lucide="download"></i> プランをコピー</button>
                </div>
            `;
            card.addEventListener('click', () => {
                const event = new CustomEvent('openTrip', { detail: trip.id, isExplore: true });
                document.dispatchEvent(event);
            });
            grid.appendChild(card);
        });
        lucide.createIcons();
    },

    renderTripHeader(data) {
        document.getElementById('trip-title').textContent = data.title;
        document.getElementById('trip-dates').innerHTML = `<i data-lucide="calendar"></i> ${data.startDate} - ${data.endDate}`;
        document.getElementById('total-budget').textContent = `¥${data.budget.toLocaleString()}`;
        
        let totalSpent = 0;
        data.itinerary.forEach(day => {
            day.activities.forEach(act => {
                totalSpent += (act.cost || 0);
            });
        });
        
        const spentEl = document.getElementById('total-spent');
        spentEl.textContent = `¥${totalSpent.toLocaleString()}`;
        
        const leftEl = document.getElementById('budget-left');
        const left = data.budget - totalSpent;
        leftEl.textContent = `¥${left.toLocaleString()}`;
        leftEl.className = left < 0 ? 'text-danger' : '';

        document.getElementById('trip-notes').value = data.notes || '';
        
        this.renderRecommendations(data.recommendations || []);
        this.renderComments(data.comments || []);
        lucide.createIcons();
    },

    renderRecommendations(recoms) {
        const list = document.getElementById('recom-list');
        list.innerHTML = '';
        if (recoms.length === 0) {
            list.innerHTML = '<p class="text-muted" style="font-size: 0.8rem;">おすすめ情報がありません</p>';
            return;
        }
        recoms.forEach((re, index) => {
            const div = document.createElement('div');
            div.className = 'recom-item';
            div.innerHTML = `
                <div class="recom-item-info">
                    <span class="recom-item-title">${re.title}</span>
                    ${re.url ? `<a href="${re.url}" target="_blank" class="recom-item-link">リンクを見る</a>` : ''}
                </div>
                <button class="btn-icon-delete" onclick="deleteRecom(${index})"><i data-lucide="x" style="width:14px;height:14px;"></i></button>
            `;
            list.appendChild(div);
        });
    },

    renderComments(comments) {
        const list = document.getElementById('comments-list');
        list.innerHTML = '';
        if (comments.length === 0) {
            list.innerHTML = '<p class="text-muted">コメントはまだありません。</p>';
            return;
        }
        comments.forEach(com => {
            const div = document.createElement('div');
            div.className = 'comment-item';
            div.innerHTML = `
                <div class="comment-header">
                    <span>${com.user}</span>
                    <span>${com.date}</span>
                </div>
                <div class="comment-body">${com.text}</div>
            `;
            list.appendChild(div);
        });
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
                <div class="content" style="width: 100%;">
                    <h4>${act.title}</h4>
                    ${act.description ? `<p class="activity-desc"><i data-lucide="sticky-note" style="width:14px;height:14px;vertical-align:middle;"></i> ${act.description}</p>` : ''}
                    <div class="footer">
                        <span class="cost">費用: ¥${(act.cost || 0).toLocaleString()}</span>
                        ${act.url ? `<a href="${act.url}" target="_blank" class="link"><i data-lucide="external-link"></i> リンク</a>` : ''}
                    </div>
                </div>
                <div class="actions">
                    <button class="btn-icon" onclick="openEditModal('${act.id}')"><i data-lucide="edit-2"></i></button>
                    <button class="btn-icon text-danger" onclick="deleteActivity('${act.id}')"><i data-lucide="trash-2"></i></button>
                </div>
            `;
            list.appendChild(card);
        });
        lucide.createIcons();
    }
};
