import { parseCSV, recommend } from './engine.mjs';

const $ = (selector) => document.querySelector(selector);
const money = (millions) => new Intl.NumberFormat('vi-VN').format(Math.round(millions * 1_000_000)) + ' ₫';
const normalize = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
const state = { rackets: [], visible: 9 };

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function priceBlock(racket) {
  const box = element('div');
  box.append(element('strong', '', racket.price === null ? 'Chưa có giá' : money(racket.price)));
  const note = racket.priceSource.startsWith('VNB') ? 'Giá VNB · 23/09/2026' :
    racket.price === null ? 'Chưa xác minh tại VNB' : 'Giá dữ liệu gốc';
  box.append(element('small', '', note));
  return box;
}

function sourceLink(racket) {
  if (!racket.priceUrl || !racket.priceUrl.startsWith('https://shopvnb.com/')) return null;
  const link = element('a', 'source-link', 'Xem tại VNB ↗');
  link.href = racket.priceUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', `Xem giá ${racket.name} tại VNB Shop (mở tab mới)`);
  return link;
}

function createCard(racket) {
  const card = element('article', 'racket-card');
  const top = element('div', 'racket-top');
  top.append(element('span', 'racket-brand', racket.brand), element('span', 'racket-icon', '✳'));
  card.append(top, element('h3', '', racket.name), element('p', 'racket-style', racket.style));
  const bottom = element('div', 'racket-bottom');
  bottom.append(priceBlock(racket), element('span', 'racket-traits', `Công ${racket.attack} · Thủ ${racket.defense}`));
  card.append(bottom);
  const link = sourceLink(racket);
  if (link) card.append(link);
  return card;
}

function renderLibrary() {
  const query = normalize($('#search').value.trim());
  const brand = $('#library-brand').value;
  const priceFilter = $('#price-filter').value;
  const matches = state.rackets.filter((r) => {
    if (brand !== 'all' && r.brand !== brand) return false;
    if (query && !normalize(r.name + ' ' + r.style).includes(query)) return false;
    if (priceFilter === 'unknown') return r.price === null;
    if (priceFilter === 'under1') return r.price !== null && r.price < 1;
    if (priceFilter === 'one-two') return r.price !== null && r.price >= 1 && r.price <= 2;
    if (priceFilter === 'over2') return r.price !== null && r.price > 2;
    return true;
  });
  $('#library-count').textContent = `Đang xem ${Math.min(state.visible, matches.length)} / ${matches.length} mẫu vợt`;
  $('#racket-grid').replaceChildren(...matches.slice(0, state.visible).map(createCard));
  $('#load-more').hidden = state.visible >= matches.length;
  if (!matches.length) $('#racket-grid').append(element('p', 'empty-state', 'Chưa tìm thấy mẫu phù hợp. Thử đổi tên hoặc bộ lọc nhé.'));
}

function explanation(racket, preference) {
  const attackGap = Math.abs(racket.attack - preference.attack);
  const defenseGap = Math.abs(racket.defense - preference.defense);
  return `Điểm công ${racket.attack}/10 và thủ ${racket.defense}/10; lệch ${attackGap.toFixed(1)} điểm công, ${defenseGap.toFixed(1)} điểm thủ so với lựa chọn của bạn.`;
}

function createResult(racket, index, preference) {
  const card = element('article', 'result-card');
  const top = element('div', 'result-top');
  top.append(element('span', 'result-rank', index === 0 ? 'Phù hợp nhất' : `Gợi ý 0${index + 1}`),
             element('span', 'fit-pill', `${racket.score}% khớp`));
  const price = element('div', 'result-price');
  price.append(priceBlock(racket));
  card.append(top, element('h4', '', racket.name), element('p', '', racket.style), price,
              element('div', 'match-reason', explanation(racket, preference)));
  const link = sourceLink(racket);
  if (link) card.append(link);
  return card;
}

function renderResults(preference) {
  const { affordable, unpriced, aboveBudget } = recommend(state.rackets, preference);
  const results = $('#results');
  results.replaceChildren();
  const heading = element('div', 'results-header');
  const title = element('h3', '', affordable.length ? 'Những cây vợt hợp với bạn' : 'Chưa có mẫu đã biết giá trong ngân sách');
  const copy = element('p', '', affordable.length ?
    `${affordable.length} mẫu có giá tham khảo trong ngân sách · ${aboveBudget} mẫu cao hơn ngân sách` :
    'Hãy tăng ngân sách, đổi hãng hoặc xem các mẫu chưa xác minh giá bên dưới.');
  heading.append(title, copy);
  results.append(heading);
  if (affordable.length) {
    const grid = element('div', 'result-grid');
    grid.append(...affordable.slice(0, 3).map((r, i) => createResult(r, i, preference)));
    results.append(grid);
  }
  if (unpriced.length) {
    const note = element('div', 'unknown-note');
    note.append(element('strong', '', `${unpriced.length} mẫu khác hợp lối đánh nhưng chưa có giá VNB:`));
    const list = element('ul');
    unpriced.slice(0, 3).forEach(r => list.append(element('li', '', `${r.name} · ${r.score}% khớp`)));
    note.append(list, element('p', '', 'Các mẫu này chưa được tính là nằm trong ngân sách.'));
    results.append(note);
  }
  results.hidden = false;
  results.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
}

function syncSliders() {
  $('#attack-value').value = $('#attack').value;
  $('#defense-value').value = $('#defense').value;
  $('#budget-value').textContent = `${Number($('#budget').value).toFixed(1)} triệu ₫`;
}

async function init() {
  try {
    const response = await fetch('./data/racket_dataset.csv');
    if (!response.ok) throw new Error('Không tải được danh sách vợt.');
    state.rackets = parseCSV(await response.text());
    const brands = [...new Set(state.rackets.map(r => r.brand))].sort((a, b) => a.localeCompare(b, 'vi'));
    for (const select of [$('#brand'), $('#library-brand')]) {
      for (const brand of brands) {
        const option = element('option', '', brand);
        option.value = brand;
        select.append(option);
      }
    }
    syncSliders();
    renderLibrary();
    $('#finder-form').addEventListener('submit', (event) => {
      event.preventDefault();
      renderResults({
        attack: Number($('#attack').value), defense: Number($('#defense').value),
        budget: Number($('#budget').value), brand: $('#brand').value
      });
    });
    document.querySelectorAll('input[name="style"]').forEach(input => input.addEventListener('change', () => {
      const preset = { attack: [9, 5.5], balanced: [7, 7.5], defense: [5, 9] }[input.value];
      $('#attack').value = preset[0]; $('#defense').value = preset[1];
      syncSliders();
    }));
    for (const slider of ['#attack', '#defense', '#budget']) $(slider).addEventListener('input', syncSliders);
    for (const filter of ['#search', '#library-brand', '#price-filter']) {
      $(filter).addEventListener(filter === '#search' ? 'input' : 'change', () => { state.visible = 9; renderLibrary(); });
    }
    $('#load-more').addEventListener('click', () => { state.visible += 9; renderLibrary(); });
  } catch (error) {
    $('#library-count').textContent = 'Không tải được dữ liệu. Hãy tải lại trang hoặc kiểm tra kết nối.';
    $('#racket-grid').append(element('p', 'empty-state', error.message));
    $('#finder-form').querySelector('button[type="submit"]').disabled = true;
  }
}

init();
