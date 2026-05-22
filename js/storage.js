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
            title: '初夏の北海道・美瑛と富良野を巡る旅',
            startDate: '2026-06-15',
            endDate: '2026-06-19',
            budget: 200000,
            itinerary: [
                {
                    day: 1,
                    activities: [
                        { id: 1, time: '09:30', title: '新千歳空港 到着', description: 'レンタカーの受付へ。' },
                        { id: 2, time: '12:00', title: '札幌でスープカレー', description: '有名店「GARAKU」でランチ。' },
                        { id: 3, time: '15:00', title: '大通公園 散策', description: 'テレビ塔をバックに記念撮影。' }
                    ]
                },
                {
                    day: 2,
                    activities: [
                        { id: 4, time: '09:00', title: '旭山動物園', description: 'ペンギンの散歩やアザラシを観察。' },
                        { id: 5, time: '14:00', title: '青い池', description: '幻想的なコバルトブルーの景色。' }
                    ]
                },
                {
                    day: 3,
                    activities: [
                        { id: 6, time: '10:00', title: 'ファーム富田', description: '一面のラベンダー畑を満喫。' },
                        { id: 7, time: '13:00', title: 'サンタのヒゲ', description: 'メロンの上にソフトクリームが乗った絶品スイーツ。' }
                    ]
                },
                { day: 4, activities: [] },
                { day: 5, activities: [] }
            ]
        };
    }
};
