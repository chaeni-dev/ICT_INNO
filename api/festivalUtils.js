import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Location to District Mapping
const LOCATION_MAP = {
    // 1. 수영구 (Suyeong-gu)
    '광안리': '수영구', '광안동': '수영구', '남천동': '수영구', '민락동': '수영구', '망미동': '수영구', '수영동': '수영구',
    '민락수변공원': '수영구', '금련산': '수영구',

    // 2. 해운대구 (Haeundae-gu)
    '해운대': '해운대구', '우동': '해운대구', '좌동': '해운대구', '중동': '해운대구', '송정': '해운대구', '반여동': '해운대구', '재송동': '해운대구',
    '센텀': '해운대구', '센텀시티': '해운대구', '마린시티': '해운대구', '달맞이': '해운대구', '청사포': '해운대구', '해리단길': '해운대구',

    // 3. 부산진구 (Busanjin-gu)
    '서면': '부산진구', '전포': '부산진구', '부전동': '부산진구', '양정': '부산진구', '초읍': '부산진구', '연지동': '부산진구', '가야': '부산진구', '개금': '부산진구', '당감동': '부산진구', '범천동': '부산진구',
    '전포카페거리': '부산진구', '전리단길': '부산진구', '시민공원': '부산진구',

    // 4. 중구 (Jung-gu)
    '남포동': '중구', '광복동': '중구', '중앙동': '중구', '보수동': '중구', '대청동': '중구',
    '자갈치': '중구', '국제시장': '중구', '깡통시장': '중구', '부평동': '중구', '용두산공원': '중구', '보수동책방골목': '중구',

    // 5. 영도구 (Yeongdo-gu)
    '영도': '영도구', '남항동': '영도구', '영선동': '영도구', '봉래동': '영도구', '청학동': '영도구', '동삼동': '영도구',
    '흰여울': '영도구', '흰여울문화마을': '영도구', '태종대': '영도구',

    // 6. 기장군 (Gijang-gun)
    '기장': '기장군', '일광': '기장군', '정관': '기장군', '장안': '기장군', '철마': '기장군',
    '오시리아': '기장군', '동부산': '기장군', '연화리': '기장군', '대변항': '기장군', '아홉산숲': '기장군',

    // 7. 사하구 (Saha-gu)
    '사하': '사하구', '하단': '사하구', '당리': '사하구', '괴정': '사하구', '다대포': '사하구', '장림': '사하구', '감천': '사하구',
    '감천문화마을': '사하구', '을숙도': '사하구', '부네치아': '사하구',

    // 8. 동래구 (Dongnae-gu)
    '동래': '동래구', '온천장': '동래구', '사직': '동래구', '명륜동': '동래구', '안락동': '동래구', '명장동': '동래구',
    '온천천': '동래구', // 연제구와 걸쳐있지만 동래구로 매핑 (대표성)

    // 9. 금정구 (Geumjeong-gu)
    '금정': '금정구', '부산대': '금정구', '장전동': '금정구', '구서동': '금정구', '남산동': '금정구', '범어사': '금정구',

    // 10. 남구 (Nam-gu)
    '대연동': '남구', '용호동': '남구', '문현동': '남구', '감만동': '남구', '우암동': '남구',
    '경성대': '남구', '부경대': '남구', '이기대': '남구', '유엔평화공원': '남구', 'BIFC': '남구',

    // 11. 북구 (Buk-gu)
    '덕천': '북구', '화명': '북구', '구포': '북구', '만덕': '북구', '금곡': '북구',

    // 12. 사상구 (Sasang-gu)
    '사상': '사상구', '괘법동': '사상구', '감전동': '사상구', '주례': '사상구', '모라': '사상구', '엄궁': '사상구',

    // 13. 강서구 (Gangseo-gu)
    '강서': '강서구', '명지': '강서구', '녹산': '강서구', '대저': '강서구', '가덕도': '강서구', '에코델타시티': '강서구',

    // 14. 연제구 (Yeonje-gu)
    '연산동': '연제구', '거제동': '연제구', '부산시청': '연제구', '법원': '연제구',

    // 15. 서구 (Seo-gu)
    '송도': '서구', '암남동': '서구', '대신동': '서구', '토성동': '서구', '부민동': '서구',

    // 16. 동구 (Dong-gu)
    '부산역': '동구', '초량': '동구', '수정동': '동구', '좌천동': '동구', '범일동': '동구'
};

// Helper to get district from user input
export const getDistrictFromLocation = (userLocation) => {
    if (!userLocation) return null;

    // 1. Direct match in map
    for (const [key, value] of Object.entries(LOCATION_MAP)) {
        if (userLocation.includes(key)) return value;
    }

    // 2. If user input itself is a district (e.g. "수영구")
    if (userLocation.endsWith('구') || userLocation.endsWith('군')) {
        return userLocation;
    }

    return null; // Unknown location
};

// Parse date string like "2025.8월 중 (예정)" or "2025. 7. 5.(토) ~ 7. 13.(일)"
// Returns { start: Date, end: Date } or null
const parseFestivalDate = (dateStr) => {
    if (!dateStr) return null;

    try {
        // Clean up string: remove whitespace, parens with day names
        const cleanStr = dateStr.replace(/\([가-힣]\)/g, '').trim();

        // Pattern: YYYY.MM.DD ~ YYYY.MM.DD
        // Supports 2025. 7. 5. format (spaces optional)
        const rangeRegex = /(\d{4})\.?\s*(\d{1,2})\.?\s*(\d{1,2})\.?\s*~\s*(?:(\d{4})\.?\s*)?(\d{1,2})\.?\s*(\d{1,2})\.?/;
        const rangeMatch = cleanStr.match(rangeRegex);

        if (rangeMatch) {
            const startYear = parseInt(rangeMatch[1]);
            const startMonth = parseInt(rangeMatch[2]) - 1; // 0-indexed
            const startDay = parseInt(rangeMatch[3]);

            let endYear = rangeMatch[4] ? parseInt(rangeMatch[4]) : startYear;
            const endMonth = parseInt(rangeMatch[5]) - 1;
            const endDay = parseInt(rangeMatch[6]);

            // Handle year rollover if end month is smaller than start month (rare but possible if year omitted)
            if (!rangeMatch[4] && endMonth < startMonth) {
                endYear++;
            }

            const start = new Date(startYear, startMonth, startDay);
            const end = new Date(endYear, endMonth, endDay);
            // Set end date to end of day
            end.setHours(23, 59, 59, 999);

            return { start, end };
        }

        // Single date or other formats could be added here
        // For now, we focus on the range format which covers most active festivals

        return null;
    } catch (e) {
        // console.warn('Date parse error:', dateStr, e);
        return null;
    }
};

let cachedFestivals = null;

export const loadFestivalData = () => {
    if (cachedFestivals) return cachedFestivals;

    try {
        const csvPath = path.join(process.cwd(), 'src', 'data', 'busan_festival.csv');
        const csvFile = fs.readFileSync(csvPath, 'utf8');

        const { data } = Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
        });

        cachedFestivals = data.map(item => {
            // Check both columns for date info
            const period = item['운영기간'] || item['이용요일 및 시간'];
            return {
                name: item['콘텐츠명'],
                district: item['구군'],
                place: item['장소'],
                period: period,
                parsedDate: parseFestivalDate(period),
                description: item['상세내용']
            };
        }).filter(item => item.parsedDate !== null); // Filter out unparsable dates

        return cachedFestivals;
    } catch (error) {
        console.error('Failed to load festival data:', error);
        return [];
    }
};

export const getActiveFestivals = (location, targetDate = new Date()) => {
    const district = getDistrictFromLocation(location);
    const festivals = loadFestivalData();

    // Filter criteria:
    // 1. Location matches (if district found) OR festival is major (Busan-wide) - for now strict location
    //    Let's be slightly loose: if district matches OR if no district found (maybe show all? no, too many).
    //    Let's stick to district match if possible.

    // 2. Date criteria:
    //    Festival Start <= Target Date <= Festival End (Strict)

    return festivals.filter(f => {
        // Location Filter
        if (district && f.district !== district) {
            // Optional: Allow "Busan-wide" festivals if district is not matching? 
            // For now, strict match to be relevant to "Local Context"
            return false;
        }

        // Date Filter
        const { start, end } = f.parsedDate;
        // User requested to remove the 2-week buffer
        return targetDate >= start && targetDate <= end;
    });
};
