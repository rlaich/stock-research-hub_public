const passiveView = document.querySelector('#passive-view');
const activeView = document.querySelector('#active-view');
const list = document.querySelector('#episode-list');
const count = document.querySelector('#episode-count');
const generatedAt = document.querySelector('#generated-at');
const errorBox = document.querySelector('#error-box');
const navButtons = [...document.querySelectorAll('[data-view]')];

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

async function loadEpisodes() {
  try {
    // web/ is one directory below the repository root.
    const response = await fetch('data/passive/gooaye/episodes.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    count.textContent = `${data.episode_count} episodes`;
    const generated = new Date(data.generated_at);
    generatedAt.textContent = Number.isNaN(generated.getTime())
      ? ''
      : `Updated ${generated.toLocaleString('zh-TW')}`;

    list.replaceChildren(...data.episodes.map(renderEpisode));
  } catch (error) {
    count.textContent = 'Data unavailable';
    errorBox.classList.remove('hidden');
    errorBox.textContent = `無法載入 episodes.json：${error.message}。請透過 HTTP server / deployed site 開啟 web UI，不要直接使用 file://。`;
  }
}

setView('passive');
loadEpisodes();
