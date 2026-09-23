export function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell.trim()); cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell.trim()); cell = '';
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else cell += char;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  const [header, ...values] = rows;
  if (!header || !['Ten_Vot', 'Diem_Cong', 'Diem_Thu', 'Gia_Trieu', 'Phong_Cach'].every(k => header.includes(k))) {
    throw new Error('Dữ liệu vợt thiếu cột bắt buộc.');
  }
  return values.map((cells, index) => {
    const item = Object.fromEntries(header.map((key, i) => [key, cells[i] ?? '']));
    const attack = Number(item.Diem_Cong), defense = Number(item.Diem_Thu);
    const price = item.Gia_Trieu === '' ? null : Number(item.Gia_Trieu);
    if (!item.Ten_Vot || !Number.isFinite(attack) || !Number.isFinite(defense) ||
        attack < 1 || attack > 10 || defense < 1 || defense > 10 ||
        (price !== null && (!Number.isFinite(price) || price <= 0))) {
      throw new Error(`Dữ liệu không hợp lệ ở dòng ${index + 2}.`);
    }
    return {
      name: item.Ten_Vot, brand: item.Ten_Vot.split(' ')[0],
      attack, defense, price, style: item.Phong_Cach,
      priceSource: item.Nguon_Gia || '', priceUrl: item.Url_Gia || ''
    };
  });
}

export function fitScore(racket, preference) {
  const distance = Math.hypot(racket.attack - preference.attack, racket.defense - preference.defense);
  return Math.max(0, Math.round(100 - distance * 12));
}

export function recommend(rackets, preference) {
  const { attack, defense, budget, brand = 'all' } = preference;
  if (![attack, defense, budget].every(Number.isFinite) ||
      attack < 1 || attack > 10 || defense < 1 || defense > 10 || budget <= 0) {
    throw new Error('Thông số tư vấn không hợp lệ.');
  }
  const candidates = rackets.filter(racket => brand === 'all' || racket.brand === brand);
  const rank = (items) => items
    .map(racket => ({ ...racket, score: fitScore(racket, preference) }))
    .sort((a, b) => b.score - a.score || (a.price ?? Infinity) - (b.price ?? Infinity) || a.name.localeCompare(b.name, 'vi'));
  return {
    affordable: rank(candidates.filter(racket => racket.price !== null && racket.price <= budget)),
    unpriced: rank(candidates.filter(racket => racket.price === null)),
    aboveBudget: candidates.filter(racket => racket.price !== null && racket.price > budget).length
  };
}
