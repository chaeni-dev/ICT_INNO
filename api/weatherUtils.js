// Fallback presets in case API fails
const weatherPresets = ['맑은', '쌀쌀한', '포근한', '후덥지근한', '보슬비 오는', '서늘한'];
const randomPick = (list) => list[Math.floor(Math.random() * list.length)];

const sanitizeLocation = (location) => {
    if (!location) return 'Busan';

    // "서면/전포" -> "서면"
    let clean = location.split('/')[0].trim();
    // Remove special chars
    clean = clean.replace(/[^\w\s가-힣]/g, '');
    return clean || 'Busan';
};

export const fetchWeather = async (location) => {
    const queryLocation = sanitizeLocation(location);

    const performFetch = async (loc) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout per attempt
        try {
            const res = await fetch(`https://wttr.in/${encodeURIComponent(loc)}?format=j1&lang=ko`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error(`Status ${res.status}`);
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
            if (queryLocation.toLowerCase() !== 'busan') {
                console.warn(`Weather fetch failed for ${queryLocation}, trying Busan...`);
                data = await performFetch('Busan');
            } else {
                throw e; // Already tried Busan, rethrow
            }
        }

        const current = data.current_condition[0];
        const weatherDesc = translateWeather(current.weatherDesc[0].value);
        const temp = current.temp_C;

        return `${weatherDesc}, ${temp}도`;
    } catch (error) {
        console.warn('Weather fetch failed completely:', error.message);
        return `${randomPick(weatherPresets)} 날씨 (API 연동 실패)`;
    }
};

const translateWeather = (desc) => {
    const lower = desc.toLowerCase();

    if (lower.includes('sunny') || lower.includes('clear')) return '맑음';
    if (lower.includes('partly cloudy')) return '구름 조금';
    if (lower.includes('cloud')) return '흐림';
    if (lower.includes('overcast')) return '잔뜩 흐림';
    if (lower.includes('light rain') || lower.includes('patchy rain')) return '보슬비';
    if (lower.includes('rain') || lower.includes('shower')) return '비';
    if (lower.includes('snow') || lower.includes('blizzard')) return '눈';
    if (lower.includes('fog') || lower.includes('mist')) return '안개';
    if (lower.includes('thunder')) return '천둥번개';

    return '대체로 맑음';
};
