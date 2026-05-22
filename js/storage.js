const STORAGE_KEY = 'tabiplan_trips';

const Storage = {
    saveAll(trips) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    },

    loadAll() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const trips = JSON.parse(data);
            // Ensure compatibility with new features
            return trips.map(trip => ({
                recommendations: [],
                notes: '',
                ...trip,
                itinerary: trip.itinerary.map(day => ({
                    ...day,
                    activities: day.activities.map(act => ({
                        cost: 0,
                        url: '',
                        ...act
                    }))
                }))
            }));
        }
        
        // Migrate old data if exists
        const oldData = localStorage.getItem('tabiplan_data');
        if (oldData) {
            const trip = JSON.parse(oldData);
            trip.id = Date.now().toString();
            trip.recommendations = [];
            trip.notes = '';
            trip.itinerary = trip.itinerary.map(day => ({
                ...day,
                activities: day.activities.map(act => ({ cost: 0, url: '', ...act }))
            }));
            const trips = [trip];
            this.saveAll(trips);
            localStorage.removeItem('tabiplan_data');
            return trips;
        }

        return [this.getDefaultTrip()];
    },

    saveTrip(trip) {
        const trips = this.loadAll();
        const index = trips.findIndex(t => t.id === trip.id);
        if (index !== -1) {
            trips[index] = trip;
        } else {
            trips.push(trip);
        }
        this.saveAll(trips);
    },

    deleteTrip(id) {
        const trips = this.loadAll().filter(t => t.id !== id);
        this.saveAll(trips);
    },

    getDefaultTrip() {
        return {
            id: 'default-1',
            title: '初夏の北海道・美瑛と富良野を巡る旅',
            startDate: '2026-06-15',
            endDate: '2026-06-19',
            budget: 200000,
            notes: 'SNSで見た「青い池」のライトアップは時期的にやっていないかも。',
            recommendations: [
                { title: '富良野バーガー', type: 'food', url: 'https://example.com' },
                { title: '四季彩の丘', type: 'spot', url: 'https://example.com' }
            ],
            itinerary: [
                {
                    day: 1,
                    activities: [
                        { id: 1, time: '09:30', title: '新千歳空港 到着', description: 'レンタカーの受付へ。', cost: 5000, url: '' },
                        { id: 2, time: '12:00', title: '札幌でスープカレー', description: '有名店「GARAKU」でランチ。', cost: 2000, url: 'https://www.soup-curry-garaku.com/' },
                        { id: 3, time: '15:00', title: '大通公園 散策', description: 'テレビ塔をバックに記念撮影。', cost: 0, url: '' }
                    ]
                },
                {
                    day: 2,
                    activities: [
                        { id: 4, time: '09:00', title: '旭山動物園', description: 'ペンギンの散歩やアザラシを観察。', cost: 1000, url: 'https://www.city.asahikawa.hokkaido.jp/asahiyamazoo/' },
                        { id: 5, time: '14:00', title: '青い池', description: '幻想的なコバルトブルーの景色。', cost: 0, url: '' }
                    ]
                },
                { day: 3, activities: [] },
                { day: 4, activities: [] },
                { day: 5, activities: [] }
            ]
        };
    }
};
