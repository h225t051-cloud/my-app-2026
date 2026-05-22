const STORAGE_KEY = 'tabiplan_data';

const Storage = {
    save(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    load() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : this.getDefaultData();
    },

    getDefaultData() {
        return {
            title: '新しい旅行',
            startDate: '2026-06-01',
            endDate: '2026-06-05',
            budget: 150000,
            itinerary: [
                {
                    day: 1,
                    activities: [
                        { id: 1, time: '09:00', title: '出発', description: '旅の始まり！' }
                    ]
                },
                { day: 2, activities: [] },
                { day: 3, activities: [] },
                { day: 4, activities: [] },
                { day: 5, activities: [] }
            ]
        };
    }
};
