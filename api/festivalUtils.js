import fs from 'fs';
import path from 'path';

// Location to District Mapping
const LOCATION_MAP = {
  '광안리': '수영구',
  '광안동': '수영구',
  '남천동': '수영구',
  '민락동': '수영구',
  '망미동': '수영구',
  '수영동': '수영구',
  '민락수변공원': '수영구',
  '금련산': '수영구',
  '해운대': '해운대구',
  '우동': '해운대구',
  '좌동': '해운대구',
  '중동': '해운대구',
  '송정': '해운대구',
  '반여동': '해운대구',
  '재송동': '해운대구',
  '센텀': '해운대구',
  '센텀시티': '해운대구',
  '마린시티': '해운대구',
  '달맞이': '해운대구',
  '청사포': '해운대구',
  '해리단길': '해운대구',
  '서면': '부산진구',
  '전포': '부산진구',
  '부전동': '부산진구',
  '양정': '부산진구',
  '초읍': '부산진구',
  '연지동': '부산진구',
  '가야': '부산진구',
  '개금': '부산진구',
  '당감동': '부산진구',
  '범천동': '부산진구',
  '전포카페거리': '부산진구',
  '전리단길': '부산진구',
  '시민공원': '부산진구',
  '남포동': '중구',
  '광복동': '중구',
  '중앙동': '중구',
  '보수동': '중구',
  '대청동': '중구',
  '자갈치': '중구',
  '국제시장': '중구',
  '깡통시장': '중구',
  '부평동': '중구',
  '용두산공원': '중구',
  '보수동책방골목': '중구',
  '영도': '영도구',
  '남항동': '영도구',
  '영선동': '영도구',
  '봉래동': '영도구',
  '청학동': '영도구',
  '동삼동': '영도구',
  '흰여울': '영도구',
  '흰여울문화마을': '영도구',
  '태종대': '영도구',
  '기장': '기장군',
  '일광': '기장군',
  '정관': '기장군',
  '장안': '기장군',
  '철마': '기장군',
  '오시리아': '기장군',
  '동부산': '기장군',
  '연화리': '기장군',
  '대변항': '기장군',
  '아홉산숲': '기장군',
  '사하': '사하구',
  '하단': '사하구',
  '당리': '사하구',
  '괴정': '사하구',
  '다대포': '사하구',
  '장림': '사하구',
  '감천': '사하구',
  '감천문화마을': '사하구',
  '을숙도': '사하구',
  '부네치아': '사하구',
  '동래': '동래구',
  '온천장': '동래구',
  '사직': '동래구',
  '명륜동': '동래구',
  '안락동': '동래구',
  '명장동': '동래구',
  '온천천': '동래구',
  '금정': '금정구',
  '부산대': '금정구',
  '장전동': '금정구',
  '구서동': '금정구',
  '남산동': '금정구',
  '범어사': '금정구',
  '대연동': '남구',
  '용호동': '남구',
  '문현동': '남구',
  '감만동': '남구',
  '우암동': '남구',
  '경성대': '남구',
  '부경대': '남구',
  '이기대': '남구',
  '유엔평화공원': '남구',
  'BIFC': '남구',
  '덕천': '북구',
  '화명': '북구',
  '구포': '북구',
  '만덕': '북구',
  '금곡': '북구',
  '사상': '사상구',
  '괘법동': '사상구',
  '감전동': '사상구',
  '주례': '사상구',
  '모라': '사상구',
  '엄궁': '사상구',
  '강서': '강서구',
  '명지': '강서구',
  '녹산': '강서구',
  '대저': '강서구',
  '가덕도': '강서구',
  '에코델타시티': '강서구',
  '연산동': '연제구',
  '거제동': '연제구',
  '부산시청': '연제구',
  '법원': '연제구',
  '송도': '서구',
  '암남동': '서구',
  '대신동': '서구',
  '토성동': '서구',
  '부민동': '서구',
  '부산역': '동구',
  '초량': '동구',
  '수정동': '동구',
  '좌천동': '동구',
  '범일동': '동구'
};

export const getDistrictFromLocation = (userLocation) => {
  if (!userLocation) return null;
  for (const [key, value] of Object.entries(LOCATION_MAP)) {
    if (userLocation.includes(key)) return value;
  }
  if (userLocation.endsWith('구') || userLocation.endsWith('군')) {
    return userLocation;
  }
  return null;
};

const parseFestivalDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const cleanStr = dateStr.replace(/\([가-힣]\)/g, '').trim();
    const rangeRegex = /(\d{4})\.?\s*(\d{1,2})\.?\s*(\d{1,2})\.?\s*~\s*(?:(\d{4})\.?\s*)?(\d{1,2})\.?\s*(\d{1,2})\.?/;
    const rangeMatch = cleanStr.match(rangeRegex);
    if (rangeMatch) {
      const startYear = parseInt(rangeMatch[1]);
      const startMonth = parseInt(rangeMatch[2]) - 1;
      const startDay = parseInt(rangeMatch[3]);
      let endYear = rangeMatch[4] ? parseInt(rangeMatch[4]) : startYear;
      const endMonth = parseInt(rangeMatch[5]) - 1;
      const endDay = parseInt(rangeMatch[6]);
      if (!rangeMatch[4] && endMonth < startMonth) endYear++;
      const start = new Date(startYear, startMonth, startDay);
      const end = new Date(endYear, endMonth, endDay);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    return null;
  } catch (e) {
    return null;
  }
};

const parseCSV = (csvText) => {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] ?? '';
    });
    return row;
  });
};

let cachedFestivals = null;

export const loadFestivalData = () => {
  if (cachedFestivals) return cachedFestivals;
  try {
    const csvPath = path.join(process.cwd(), 'src', 'data', 'busan_festival.csv');
    const csvFile = fs.readFileSync(csvPath, 'utf8');
    const data = parseCSV(csvFile);
    cachedFestivals = data
      .map((item) => {
        const period = item['운영기간'] || item['이용요일 및 시간'];
        const parsedDate = parseFestivalDate(period);
        return {
          name: item['콘텐츠명'],
          district: item['구군'],
          place: item['장소'],
          period,
          parsedDate,
          description: item['상세내용']
        };
      })
      .filter((item) => item.parsedDate !== null);
    return cachedFestivals;
  } catch (error) {
    console.error('Failed to load festival data:', error);
    return [];
  }
};

export const getActiveFestivals = (location, targetDate = new Date()) => {
  const district = getDistrictFromLocation(location);
  const festivals = loadFestivalData();
  return festivals.filter((f) => {
    if (district && f.district !== district) return false;
    const { start, end } = f.parsedDate;
    return targetDate >= start && targetDate <= end;
  });
};
