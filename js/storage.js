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
                comments: [],
                ...trip,
                itinerary: trip.itinerary.map(day => ({
                    ...day,
                    activities: day.activities.map(act => ({
                        cost: 0,
                        url: '',
                        description: '',
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
            trip.comments = [];
            trip.itinerary = trip.itinerary.map(day => ({
                ...day,
                activities: day.activities.map(act => ({ cost: 0, url: '', description: '', ...act }))
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

    loadExplore() {
        return [
            {
                id: 'exp-1',
                author: '旅好き太郎',
                title: '冬の京都・静寂の寺院巡り',
                startDate: '2026-01-10',
                endDate: '2026-01-12',
                budget: 50000,
                notes: '冬の京都は底冷えするのでカイロ必須！',
                recommendations: [
                    { title: '南禅寺', url: 'https://www.nanzenji.or.jp/' },
                    { title: '湯豆腐 嵯峨野', url: 'http://www.kyoto-sagano.jp/' }
                ],
                comments: [{ user: 'ガイドさん', text: '朝一番の清水寺は空いていて最高ですよ。', date: '2026-01-05' }],
                itinerary: [
                    { day: 1, activities: [{ time: '10:00', title: '京都駅 到着', cost: 0, description: 'ここから旅がスタート！' }] },
                    { day: 2, activities: [] },
                    { day: 3, activities: [] }
                ]
            },
            {
                id: 'exp-2',
                author: '温泉マニア',
                title: '箱根 1泊2日 癒やしの温泉旅',
                startDate: '2026-02-15',
                endDate: '2026-02-16',
                budget: 35000,
                notes: 'ロマンスカーの展望席は早めの予約を。',
                recommendations: [
                    { title: '彫刻の森美術館', url: 'https://www.hakone-oam.or.jp/' }
                ],
                comments: [],
                itinerary: [
                    { day: 1, activities: [] },
                    { day: 2, activities: [] }
                ]
            }
        ];
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
                { title: '富良野バーガー', url: 'https://example.com' },
                { title: '四季彩の丘', url: 'https://example.com' }
            ],
            comments: [
                { user: 'TripExpert', text: '富良野バーガーは11時開店ですが、15分前には並ぶのが吉です！', date: '2026-05-20' },
                { user: 'Locals', text: '青い池の近くの白ひげの滝もおすすめですよ。', date: '2026-05-21' }
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
