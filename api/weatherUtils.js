// Fallback presets in case API fails
const weatherPresets = ['맑은', '쌀쌀한', '포근한', '후덥지근한', '보슬비 오는', '서늘한'];
const randomPick = (list) => list[Math.floor(Math.random() * list.length)];

const sanitizeLocation = (location) => {
    if (!location) return 'Busan';

    // "서면/전포" -> "서면"
    let clean = location.split('/')[0].trim();
    // Remove special chars but keep Korean and English
    clean = clean.replace(/[^\w\s가-힣]/g, '');
    return clean || 'Busan';
};

export const fetchWeather = async (location) => {
    const queryLocation = sanitizeLocation(location);
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;

    if (!apiKey) {
        console.warn('OPENWEATHERMAP_API_KEY is missing');
        return `${randomPick(weatherPresets)} 날씨 (API키 미설정)`;
    }

    const performFetch = async (loc) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout is usually enough for OWM
        try {
            // OpenWeatherMap API call
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(loc)}&appid=${apiKey}&units=metric&lang=kr`,
                { signal: controller.signal }
            );
            clearTimeout(timeoutId);

            if (!res.ok) {
                // 404 means city not found
                if (res.status === 404) throw new Error('City not found');
                throw new Error(`Status ${res.status}`);
            }
            return await res.json();
        } catch (e) {
            clearTimeout(timeoutId);
            throw e;
        }
    };

    try {
        let data;
        try {
            data = await performFetch(queryLocation);
        } catch (e) {
            // If specific location fails, try Busan as fallback
            if (queryLocation.toLowerCase() !== 'busan') {
                console.warn(`Weather fetch failed for ${queryLocation}, trying Busan...`);
                data = await performFetch('Busan');
            } else {
                throw e;
            }
        }

        // OpenWeatherMap response structure
        // weather: [{ description: '맑음', ... }]
        // main: { temp: 20.5, ... }
        const weatherDesc = data.weather[0].description; // Korean description from lang=kr
        const temp = Math.round(data.main.temp * 10) / 10; // Round to 1 decimal

        return `${weatherDesc}, ${temp}도`;
    } catch (error) {
        console.warn('Weather fetch failed completely:', error.message);
        return `${randomPick(weatherPresets)} 날씨 (API 연동 실패)`;
    }
};
