import fs from 'fs';
import path from 'path';

// Location to District Mapping
// Removed hardcoded map in favor of regex extraction from address

export const getDistrictFromLocation = (userLocation) => {
  if (!userLocation) return null;

  // Extract 'Gu' or 'Gun' from the string (e.g., "부산진구", "기장군")
  const match = userLocation.match(/([가-힣]+(구|군))/);
  return match ? match[1] : null;
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
