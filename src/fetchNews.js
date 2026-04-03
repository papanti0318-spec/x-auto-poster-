const AI_RADAR_URL =
  process.env.AI_RADAR_URL ||
  'https://ai-radar-git-main-papanti0318-specs-projects.vercel.app';

async function fetchHackerNews() {
  const url = `${AI_RADAR_URL}/api/hackernews?limit=8`;
  console.log('[fetchNews] HackerNews取得中...');
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[fetchNews] HackerNews APIエラー: ${res.status}`);
      return [];
    }
    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) {
      console.error('[fetchNews] HackerNews: items が空です');
      return [];
    }
    return data.items.map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url || item.permalink,
      source: 'HackerNews',
      score: item.score || 0,
    }));
  } catch (err) {
    console.error('[fetchNews] HackerNews取得エラー:', err.message);
    return [];
  }
}

async function fetchYouTube() {
  const url = `${AI_RADAR_URL}/api/youtube?q=AI+news+latest`;
  console.log('[fetchNews] YouTube取得中...');
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[fetchNews] YouTube APIエラー: ${res.status}`);
      return [];
    }
    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) {
      console.error('[fetchNews] YouTube: items が空です');
      return [];
    }
    return data.items.map((item) => ({
      id: item.id,
      title: item.title,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      source: 'YouTube',
      score: item.viewCount || item.score || 0,
    }));
  } catch (err) {
    console.error('[fetchNews] YouTube取得エラー:', err.message);
    return [];
  }
}

async function fetchNoteArticles() {
  const url = `${AI_RADAR_URL}/api/note-articles?limit=16`;
  console.log('[fetchNews] note記事取得中...');
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[fetchNews] note APIエラー: ${res.status}`);
      return [];
    }
    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) {
      console.error('[fetchNews] note: items が空です');
      return [];
    }
    return data.items.map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url || item.id,
      source: 'note',
      score: 0,
    }));
  } catch (err) {
    console.error('[fetchNews] note取得エラー:', err.message);
    return [];
  }
}

async function fetchAllNews() {
  const [hn, yt, note] = await Promise.all([
    fetchHackerNews(),
    fetchYouTube(),
    fetchNoteArticles(),
  ]);

  const all = [...hn, ...yt, ...note];
  // スコア順にソート
  all.sort((a, b) => b.score - a.score);

  console.log(`[fetchNews] 合計 ${all.length} 件取得`);
  return all;
}

module.exports = { fetchAllNews };
