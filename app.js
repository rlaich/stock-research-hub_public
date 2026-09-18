const passiveView = document.querySelector('#passive-view');
const activeView = document.querySelector('#active-view');
const list = document.querySelector('#episode-list');
const count = document.querySelector('#episode-count');
const visibleCount = document.querySelector('#visible-count');
const generatedAt = document.querySelector('#generated-at');
const errorBox = document.querySelector('#error-box');
const emptyResults = document.querySelector('#empty-results');
const searchInput = document.querySelector('#episode-search');
const yearFilter = document.querySelector('#year-filter');
const resetFilter = document.querySelector('#reset-filter');
const loadMore = document.querySelector('#load-more');
const navButtons = [...document.querySelectorAll('[data-view]')];

const PAGE_SIZE = 10;
let episodes = [];
let displayLimit = PAGE_SIZE;

function setView(view) {
  const passive = view === 'passive';
  passiveView.classList.toggle('hidden', !passive);
  activeView.classList.toggle('hidden', passive);
  navButtons.forEach(button => button.classList.toggle('active', button.dataset.view === view));
}

navButtons.forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));

function renderEpisode(item) {
  const card = document.createElement('article');
  card.className = 'episode-card';

  const number = document.createElement('div');
  number.className = 'episode-number';
  number.textContent = `EP${item.episode}`;

  const meta = document.createElement('div');
  const title = document.createElement('div');
  title.className = 'episode-title';
  title.textContent = item.title;
  const date = document.createElement('div');
  date.className = 'episode-date';
  date.textContent = item.date;
  meta.append(title, date);

  const link = document.createElement('a');
  link.className = 'episode-link';
  link.href = item.source_url;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.textContent = '逐字稿 ↗';

  card.append(number, meta, link);
  return card;
}

function filteredEpisodes() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedYear = yearFilter.value;

  return episodes.filter(item => {
    const yearMatches = selectedYear === 'all' || item.date.startsWith(`${selectedYear}-`);
    if (!yearMatches) return false;
    if (!query) return true;

    const haystack = [
      `ep${item.episode}`,
      String(item.episode),
      item.title,
      item.date,
    ].join(' ').toLowerCase();
    return haystack.includes(query);
  });
}

function renderHistory() {
  const filtered = filteredEpisodes();
  const visible = filtered.slice(0, displayLimit);
  list.replaceChildren(...visible.map(renderEpisode));

  visibleCount.textContent = filtered.length === episodes.length
    ? `顯示 ${visible.length} / ${episodes.length}`
    : `符合 ${filtered.length} · 顯示 ${visible.length}`;

  emptyResults.classList.toggle('hidden', filtered.length !== 0);
  loadMore.classList.toggle('hidden', visible.length >= filtered.length);
  if (visible.length < filtered.length) {
    loadMore.textContent = `載入更多（剩餘 ${filtered.length - visible.length}）`;
  }
}

function resetDisplayLimit() {
  displayLimit = PAGE_SIZE;
  renderHistory();
}

function populateYears() {
  const years = [...new Set(episodes.map(item => item.date.slice(0, 4)).filter(Boolean))]
    .sort((a, b) => b.localeCompare(a));

  for (const year of years) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearFilter.append(option);
  }
}

searchInput.addEventListener('input', resetDisplayLimit);
yearFilter.addEventListener('change', resetDisplayLimit);
resetFilter.addEventListener('click', () => {
  searchInput.value = '';
  yearFilter.value = 'all';
  resetDisplayLimit();
  searchInput.focus();
});
loadMore.addEventListener('click', () => {
  displayLimit += PAGE_SIZE;
  renderHistory();
});

async function loadEpisodes() {
  try {
    // web/ is one directory below the repository root. The public publish workflow
    // rewrites this known path for the GitHub Pages root artifact.
    const response = await fetch('data/passive/gooaye/episodes.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    episodes = [...data.episodes].sort((a, b) => Number(b.episode) - Number(a.episode));
    count.textContent = `${data.episode_count} episodes`;
    const generated = new Date(data.generated_at);
    generatedAt.textContent = Number.isNaN(generated.getTime())
      ? ''
      : `Updated ${generated.toLocaleString('zh-TW')}`;

    populateYears();
    renderHistory();
  } catch (error) {
    count.textContent = 'Data unavailable';
    visibleCount.textContent = '';
    errorBox.classList.remove('hidden');
    errorBox.textContent = `無法載入 episodes.json：${error.message}。請透過 HTTP server / deployed site 開啟 web UI，不要直接使用 file://。`;
  }
}

setView('passive');
loadEpisodes();
