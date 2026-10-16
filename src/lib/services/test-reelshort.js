process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const zlib = require('zlib');

const WM = {
  Creator: 'IzzXd',
  Saluran: 'https://whatsapp.com/channel/0029VbCv97v9Bb5tC5cZFl0K'
};

const BASE = 'https://www.reelshort.com';
const AES_KEY = Buffer.from('VvRSNGFynLBW7aCP', 'utf8');
const AES_IV = Buffer.from('gLn8sxqpzyNjehDP', 'utf8');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9'
};

function decryptPlayInfo(playInfo) {
  if (!playInfo || typeof playInfo !== 'string') return [];
  try {
    const decipher = crypto.createDecipheriv('aes-128-cbc', AES_KEY, AES_IV);
    let decrypted = decipher.update(playInfo, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    let jsonStr = decrypted;
    if (decrypted.startsWith('eJz') || decrypted.startsWith('eJw')) {
      const buf = Buffer.from(decrypted, 'base64');
      jsonStr = zlib.inflateSync(buf).toString('utf8');
    }

    const items = JSON.parse(jsonStr);
    if (!Array.isArray(items)) return [];

    return items.map(item => ({
      quality: `${item.Dpi}p`,
      dpi: item.Dpi,
      codec: item.Encode,
      bitrate: item.Bitrate ? `${item.Bitrate} kbps` : null,
      stream_url: item.PlayURL
    }));
  } catch (err) {
    console.error('Decrypt error:', err.message);
    return [];
  }
}

async function search(query, page = 1) {
  const url = `${BASE}/search?keywords=${encodeURIComponent(query)}&page=${page}`;
  const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
  const $ = cheerio.load(res.data);
  const nextDataRaw = $('#__NEXT_DATA__').html();

  if (!nextDataRaw) {
    return {
      ...WM,
      status: false,
      error: 'Failed to read ReelShort data'
    };
  }

  const data = JSON.parse(nextDataRaw);
  const pageProps = data.props?.pageProps || {};
  const rawBooks = pageProps.books || [];

  const results = rawBooks.map(book => ({
    book_id: book.book_id || book._id,
    title: book.book_title,
    cover: book.book_pic,
    description: book.special_desc,
    share_text: book.share_text || null,
    total_episodes: book.chapter_count || null,
    read_count: book.read_count || null,
    collect_count: book.collect_count || null,
    tags: book.tag || book.theme || [],
    movie_url: `${BASE}/movie/${book.book_id || book._id}`
  }));

  return {
    ...WM,
    status: true,
    query,
    page: Number(page),
    total: pageProps.total || results.length,
    results
  };
}

async function detail(bookIdOrUrl) {
  let bookId = bookIdOrUrl.trim();
  if (bookId.includes('/movie/')) {
    const slugPart = bookId.split('/movie/')[1].split(/[?#]/)[0];
    const parts = slugPart.split('-');
    bookId = parts[parts.length - 1];
  }

  const url = `${BASE}/movie/${bookId}`;
  const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
  const $ = cheerio.load(res.data);
  const nextDataRaw = $('#__NEXT_DATA__').html();

  if (!nextDataRaw) {
    return {
      ...WM,
      status: false,
      error: 'Failed to read ReelShort movie data'
    };
  }

  const data = JSON.parse(nextDataRaw);
  const drama = data.props?.pageProps?.data || {};

  const streams = decryptPlayInfo(drama.start_play?.play_info);
  const episodes = (drama.online_base || []).map(ep => ({
    episode: ep.serial_number,
    chapter_id: ep.chapter_id,
    thumbnail: ep.video_pic,
    likes: ep.like_count || 0
  }));

  const tags = (drama.tag_list || []).map(t => t.tag_name).filter(Boolean);

  return {
    ...WM,
    status: true,
    book_id: drama.book_id || bookId,
    title: drama.book_title,
    sub_title: drama.book_sub_title || null,
    cover: drama.book_pic,
    description: drama.special_desc,
    language: drama.lang || 'en',
    tags,
    total_episodes: drama.total || episodes.length,
    read_count: drama.read_count || null,
    collect_count: drama.collect_count || null,
    sample_streams: streams.length > 0 ? streams : undefined,
    episodes: episodes.length > 0 ? episodes : undefined,
    url
  };
}

async function getHomeTrending() {
  try {
    const res = await axios.get(BASE, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(res.data);
    const nextDataRaw = $('#__NEXT_DATA__').html();
    if (!nextDataRaw) return [];

    const data = JSON.parse(nextDataRaw);
    const pageProps = data.props?.pageProps || {};
    // Check modules or lists
    const modules = pageProps.data?.module_list || pageProps.module_list || [];
    const dramas = [];

    modules.forEach(mod => {
      (mod.data_list || mod.books || []).forEach(b => {
        if (b && (b.book_id || b._id) && dramas.length < 24) {
          dramas.push({
            book_id: b.book_id || b._id,
            title: b.book_title || b.title,
            cover: b.book_pic || b.cover,
            description: b.special_desc || b.desc,
            total_episodes: b.chapter_count || b.total,
            tags: b.tag || b.theme || []
          });
        }
      });
    });

    return dramas;
  } catch (e) {
    return { error: e.message };
  }
}

async function runTest() {
  console.log('--- TESTING REELSHORT SCRAPER ---');
  console.log('1. Testing search for "CEO" or "Billionaire"...');
  const searchRes = await search('CEO');
  console.log('Search status:', searchRes.status, 'Total found:', searchRes.total);
  if (searchRes.results && searchRes.results.length > 0) {
    console.log('Sample result:', JSON.stringify(searchRes.results[0], null, 2));

    console.log('\n2. Testing detail & decrypted stream extraction for first item:', searchRes.results[0].book_id);
    const detailRes = await detail(String(searchRes.results[0].book_id));
    console.log('Detail status:', detailRes.status);
    console.log('Title:', detailRes.title);
    console.log('Cover:', detailRes.cover);
    console.log('Total episodes:', detailRes.total_episodes);
    console.log('Episodes count in list:', detailRes.episodes?.length);
    console.log('Sample decrypted streams count:', detailRes.sample_streams?.length);
    if (detailRes.sample_streams && detailRes.sample_streams.length > 0) {
      console.log('First Decrypted Stream URL:', detailRes.sample_streams[0]);
    }
  }

  console.log('\n3. Testing ReelShort Homepage trending dramas...');
  const homeRes = await getHomeTrending();
  console.log('Homepage dramas count:', Array.isArray(homeRes) ? homeRes.length : 0);
  if (Array.isArray(homeRes) && homeRes.length > 0) {
    console.log('First homepage drama:', homeRes[0]);
  }
}

runTest().catch(err => console.error('Test run failed:', err));
