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
const analysisDetail = document.querySelector('#analysis-detail');
const analysisBack = document.querySelector('#analysis-back');
const analysisSourceLink = document.querySelector('#analysis-source-link');
const analysisTitle = document.querySelector('#analysis-title');
const analysisDate = document.querySelector('#analysis-date');
const analysisRelevance = document.querySelector('#analysis-relevance');
const analysisSummary = document.querySelector('#analysis-summary');
const analysisEntities = document.querySelector('#analysis-entities');
const analysisTopics = document.querySelector('#analysis-topics');
const analysisObservations = document.querySelector('#analysis-observations');
const analysisMeta = document.querySelector('#analysis-meta');
const historyControls = [
  document.querySelector('.page-heading'),
  document.querySelector('.status-row'),
  document.querySelector('.history-toolbar'),
  list,
  document.querySelector('.load-more-row'),
  emptyResults,
  errorBox,
];

const PAGE_SIZE = 10;
let episodes = [];
let displayLimit = PAGE_SIZE;
let analysisIndex = new Map();

function setView(view) {
  const passive = view === 'passive';
  passiveView.classList.toggle('hidden', !passive);
  activeView.classList.toggle('hidden', passive);
  navButtons.forEach(button => button.classList.toggle('active', button.dataset.view === view));
  if (!passive) closeAnalysis();
}

navButtons.forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));

function analysisPath(relativePath) {
  // Private web/ preview needs ../ while GitHub Pages is published at repository root.
  const prefix = window.location.pathname.includes('/web/') ? '../' : '';
  return prefix + relativePath;
}

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

  const actions = document.createElement('div');
  actions.className = 'episode-actions';

  const link = document.createElement('a');
  link.className = 'episode-link';
  link.href = item.source_url;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.textContent = '逐字稿 ↗';
  actions.append(link);

  const analysisEntry = analysisIndex.get(Number(item.episode));
  if (analysisEntry) {
    const button = document.createElement('button');
    button.className = 'analysis-button';
    button.type = 'button';
    button.textContent = '查看分析';
    button.addEventListener('click', () => openAnalysis(analysisEntry));
    actions.append(button);
  }

  card.append(number, meta, actions);
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

function itemCard(titleText, copyText, tags = []) {
  const card = document.createElement('div');
  card.className = 'analysis-item';
  const title = document.createElement('div');
  title.className = 'analysis-item-title';
  title.textContent = titleText;
  const copy = document.createElement('div');
  copy.className = 'analysis-item-copy';
  copy.textContent = copyText;
  card.append(title, copy);

  if (tags.length) {
    const tagRow = document.createElement('div');
    tagRow.className = 'analysis-tags';
    for (const value of tags.filter(Boolean)) {
      const tag = document.createElement('span');
      tag.className = 'analysis-tag';
      tag.textContent = value;
      tagRow.append(tag);
    }
    card.append(tagRow);
  }
  return card;
}

async function openAnalysis(entry) {
  try {
    const response = await fetch(analysisPath(entry.path), { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    analysisTitle.textContent = `EP${data.episode.number} Analysis`;
    analysisDate.textContent = `${data.episode.date} · ${data.episode.title}`;
    analysisRelevance.textContent = `Relevance: ${data.analysis.relevance}`;
    analysisSummary.textContent = data.analysis.summary;
    analysisSourceLink.href = data.source.url;

    analysisEntities.replaceChildren(...data.entities.map(entity =>
      itemCard(
        entity.ticker ? `${entity.name} · ${entity.ticker}` : entity.name,
        entity.mention_context,
        [entity.market, entity.entity_type, `stance: ${entity.stance}`, `confidence: ${entity.confidence}`]
      )
    ));

    analysisTopics.replaceChildren(...data.topics.map(topic =>
      itemCard(topic.topic, topic.summary)
    ));

    analysisObservations.replaceChildren(...data.market_observations.map(observation =>
      itemCard(
        observation.evidence_type === 'source_statement' ? 'Source statement' : 'Derived interpretation',
        observation.observation,
        [`time: ${observation.time_sensitivity}`, observation.evidence_type]
      )
    ));

    const generated = new Date(data.analysis_meta.generated_at);
    const metaRows = [
      ['Source scope', data.analysis_meta.source_scope],
      ['Review status', data.analysis_meta.review_status],
      ['Generator', data.analysis_meta.generator],
      ['Generated', Number.isNaN(generated.getTime()) ? data.analysis_meta.generated_at : generated.toLocaleString('zh-TW')],
      ['Schema', `v${data.schema_version}`],
      ['Source stored', String(data.source.content_stored)],
    ];
    analysisMeta.replaceChildren(...metaRows.map(([label, value]) => {
      const row = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = `${label}: `;
      row.append(strong, document.createTextNode(value));
      return row;
    }));

    historyControls.forEach(node => node.classList.add('hidden'));
    analysisDetail.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    errorBox.classList.remove('hidden');
    errorBox.textContent = `無法載入 Analysis：${error.message}`;
  }
}

function closeAnalysis() {
  analysisDetail.classList.add('hidden');
  historyControls.forEach(node => node.classList.remove('hidden'));
  renderHistory();
}

analysisBack.addEventListener('click', closeAnalysis);
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

async function loadAnalysisIndex() {
  try {
    const response = await fetch(analysisPath('data/analysis/gooaye/index.json'), { cache: 'no-store' });
    if (response.status === 404) return;
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    analysisIndex = new Map(data.episodes.map(item => [Number(item.episode), item]));
  } catch (error) {
    console.warn('Analysis index unavailable:', error);
  }
}

async function loadEpisodes() {
  try {
    const response = await fetch(analysisPath('data/passive/gooaye/episodes.json'), { cache: 'no-store' });
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

async function initialize() {
  setView('passive');
  await loadAnalysisIndex();
  await loadEpisodes();
}

initialize();
