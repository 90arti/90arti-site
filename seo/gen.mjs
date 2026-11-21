// 90arti.tr arama motoru sayfaları (21 Kasım 2026, kullanıcı: "Google aramasını arttıralım, olabilecek her şeyi ekle").
// Site tek sayfalık uygulama: /match/123 gibi adresler 404.html ile açılıyordu → Google 404 görüyordu, sayfa başlığı hep aynıydı.
// Bu betik maç / takım / lig / basketbol-voleybol maçı / TV rehberi / ana sayfa için GERÇEK dosyalar yazar (HTTP 200):
// kendi başlığı, açıklaması, canonical adresi, JSON-LD (SportsEvent) ve #root içinde düz metin (uygulama açılınca yerine geçer).
// Kullanım: node gen.mjs <site klasörü>   (klasörde seo/base.html = uygulamanın index.html'i, seo/lib.cjs = Türkçe ad yardımcıları)
// Yalnız içeriği değişen dosya yazılır; seo/pages.json her sayfanın özeti + son değişme zamanı (site haritası lastmod).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const OUT = path.resolve(process.argv[2] || '.');
const require = createRequire(import.meta.url);
const L = require(path.join(OUT, 'seo/lib.cjs'));
const BASE = fs.readFileSync(path.join(OUT, 'seo/base.html'), 'utf8');
const SITE = 'https://90arti.tr';
const SB = 'https://zeoruhodxfchwluczjig.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inplb3J1aG9keGZjaHdsdWN6amlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxOTgzMDcsImV4cCI6MjEwODc3NDMwN30.c_qfRAu-O6tNKXgx1y2gYQJVoPhLEXw0P8vcKVDTj_Y';
const NOW = Date.now(), DAY = 86400_000;
const MAN_F = path.join(OUT, 'seo/pages.json');
const man = fs.existsSync(MAN_F) ? JSON.parse(fs.readFileSync(MAN_F, 'utf8')) : {};
const seen = new Set();

// ---------- veri ----------
async function get(q, all = false) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    let r, tries = 0;
    for (;;) {
      r = await fetch(`${SB}/${q}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Range: `${from}-${from + 999}` } }).catch((e) => ({ ok: false, status: 0, text: async () => String(e) }));
      if (r.ok || ++tries >= 3) break;
      await new Promise((s) => setTimeout(s, 2000 * tries));
    }
    if (!r.ok) throw new Error(`${q.slice(0, 80)}: ${r.status} ${(await r.text()).slice(0, 200)}`);
    const part = await r.json();
    rows.push(...part);
    if (!all || part.length < 1000) break;
  }
  return rows;
}
async function getIn(table, col, ids, select, extra = '', size = 150) {
  const out = [], u = [...new Set(ids)].filter((x) => x != null);
  for (let i = 0; i < u.length; i += size) out.push(...(await get(`${table}?select=${select}&${col}=in.(${u.slice(i, i + size).join(',')})${extra}`, true)));
  return out;
}
const iso = (t) => new Date(t).toISOString();

// ---------- biçim ----------
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tr = (n) => L.trTeam(n || '');
const cTR = (c) => L.COUNTRY_TR[c] ?? c ?? '';
const fDate = (t) => new Date(t).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul', day: 'numeric', month: 'long', year: 'numeric' });
const fDay = (t) => new Date(t).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul', weekday: 'long' });
const fTime = (t) => new Date(t).toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit' });
const fShort = (t) => new Date(t).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul', day: 'numeric', month: 'short' });
const dayKey = (t) => new Date(t + 3 * 3600_000).toISOString().slice(0, 10);
const LIVE = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT']);
const DONE = new Set(['FT', 'AET', 'PEN']);
const lgName = (lg) => tr(lg?.name);
const lgFull = (lg) => (!lg ? '' : !lg.country || lg.country === 'World' ? lgName(lg) : `${cTR(lg.country)} ${lgName(lg)}`);

function statusTR(f) {
  const s = f.status;
  if (DONE.has(s)) return s === 'PEN' ? 'Maç sonu (penaltılar)' : s === 'AET' ? 'Maç sonu (uzatmalar)' : 'Maç sonu';
  if (s === 'HT') return 'Devre arası';
  if (LIVE.has(s)) return `Canlı · ${f.elapsed ?? ''}${f.extra ? '+' + f.extra : ''}'`;
  if (s === 'PST') return 'Ertelendi';
  if (s === 'CANC' || s === 'ABD') return 'İptal edildi';
  if (s === 'SUSP' || s === 'INT') return 'Durduruldu';
  return 'Başlamadı';
}
const score = (f) => (f.home_goals == null || f.status === 'NS' ? '-' : `${f.home_goals} - ${f.away_goals}`);

const CSS = `<style>#seo{font:15px/1.5 Roboto,Arial,sans-serif;color:#E6EDF5;background:#0B1B2D;padding:16px;max-width:760px;margin:0 auto;overflow:auto;height:100%;box-sizing:border-box}
#seo a{color:#FF6B76}#seo h1{font-size:21px;margin:4px 0 8px}#seo h2{font-size:17px;margin:18px 0 6px;color:#fff}#seo table{border-collapse:collapse;width:100%;font-size:14px}
#seo td,#seo th{padding:3px 6px;border-bottom:1px solid #1E3550;text-align:left}#seo ul{padding-left:18px;margin:4px 0}#seo nav{font-size:13px;margin-bottom:8px}#seo .k{color:#9FB2C8}</style>`;
const NAV = `<nav><a href="/">90Artı Canlı Skor</a> · <a href="/tv">Bugün TV'de hangi maç var</a> · <a href="/leagues">Puan durumları</a> · <a href="/iddaa">İddaa programı</a> · <a href="/news">Spor haberleri</a></nav>`;
const FOOT = `<p class="k">90Artı: canlı skor, maç sonuçları, ilk 11'ler, istatistikler, puan durumları ve maçların yayınlandığı kanallar. Android ve iPhone uygulaması: <a href="/indir">90arti.tr/indir</a></p>`;

function page({ p, title, desc, body, ld, img }) {
  const url = SITE + (p === '/' ? '/' : p);
  let h = BASE;
  h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  h = h.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}" />`);
  h = h.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}" />`);
  h = h.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(desc)}" />\n    <meta property="og:url" content="${url}" />\n    <meta property="og:type" content="website" />\n    <link rel="canonical" href="${url}" />` +
    (ld ? `\n    <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>` : '') + `\n    ${CSS}`);
  if (img) h = h.replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${esc(img)}" />`);
  h = h.replace('<div id="root"></div>', `<div id="root"><div id="seo">${NAV}${body}${FOOT}</div></div>`);
  write(p, h);
}
function write(p, html) {
  const file = p === '/' ? 'index.html' : p.slice(1) + '.html';
  const hash = crypto.createHash('sha1').update(html).digest('hex').slice(0, 16);
  seen.add(p);
  const full = path.join(OUT, file);
  if (man[p]?.h === hash && fs.existsSync(full)) return;
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
  man[p] = { ...(man[p] ?? {}), h: hash, m: new Date(NOW).toISOString() };
  stats.written++;
}
const stats = { written: 0, removed: 0 };

// ---------- ana akış ----------
const strip = await get('strip_leagues?select=league_id');
const LG_IDS = strip.map((r) => r.league_id);
const leagues = new Map((await getIn('leagues', 'id', LG_IDS, 'id,name,country,logo,season')).map((l) => [l.id, l]));
const FX_COLS = 'id,league_id,season,round,kickoff,status,elapsed,extra,home_id,away_id,home_goals,away_goals,ht_home,ht_away,venue,referee,pen_home,pen_away';
const fx = await get(`fixtures?select=${FX_COLS}&league_id=in.(${LG_IDS.join(',')})&kickoff=gte.${iso(NOW - 30 * DAY)}&kickoff=lt.${iso(NOW + 9 * DAY)}&order=kickoff`, true);
const fxById = new Map(fx.map((f) => [f.id, f]));
// TV: son 14 günde yazılmış maç bazında kanallar (lig dışı maçlar da TV sayfasına girsin)
const tvRows = await get(`tv_match?select=fixture_id,channels&updated_at=gte.${iso(NOW - 14 * DAY)}`, true);
const tv = new Map(tvRows.map((r) => [r.fixture_id, r.channels]));
const extraIds = tvRows.map((r) => r.fixture_id).filter((id) => !fxById.has(id));
const tvFx = (await getIn('fixtures', 'id', extraIds, FX_COLS, `&kickoff=gte.${iso(NOW - 2 * DAY)}&kickoff=lt.${iso(NOW + 3 * DAY)}`)).filter((f) => !fxById.has(f.id));
for (const f of tvFx) if (!leagues.has(f.league_id)) leagues.set(f.league_id, null);
const missingLg = [...leagues].filter(([, v]) => !v).map(([k]) => k);
for (const l of await getIn('leagues', 'id', missingLg, 'id,name,country,logo,season')) leagues.set(l.id, l);
const teamIds = [...fx, ...tvFx].flatMap((f) => [f.home_id, f.away_id]);
const teams = new Map((await getIn('teams', 'id', teamIds, 'id,name,logo')).map((t) => [t.id, t]));
const tName = (id) => tr(teams.get(id)?.name) || 'Takım';
const refTFF = new Map((await getIn('match_officials', 'fixture_id', fx.filter((f) => f.league_id === 203 || f.league_id === 204 || f.league_id === 206).map((f) => f.id), 'fixture_id,officials')).map((r) => [r.fixture_id, r.officials]));

// maç sayfası yazılacaklar: -30..+8 gün. Ayrıntı (olaylar/kadro/istatistik) yalnız değişebilecek maçlar için okunur:
// başlamamış ama 3 saat içinde (kadro), canlı, ya da biteli 1 günden az ve sayfası henüz "son" hâliyle yazılmamış.
const pageFx = fx.filter((f) => f.kickoff >= iso(NOW - 30 * DAY) && f.kickoff < iso(NOW + 8 * DAY));
const needDet = pageFx.filter((f) => {
  const k = Date.parse(f.kickoff), m = man[`/match/${f.id}`];
  if (m?.fin && DONE.has(f.status)) return false;
  if (f.status === 'NS') return k - NOW < 3 * 3600_000 && k > NOW - 3600_000;
  return true;
}).map((f) => f.id);
const det = new Map((await getIn('fixture_details', 'fixture_id', needDet, 'fixture_id,events,lineups,statistics', '', 60)).map((d) => [d.fixture_id, d]));

// puan durumları (strip ligleri, son sezon)
const stRows = await getIn('standings', 'league_id', LG_IDS, 'league_id,season,data', '&order=season.desc', 40);
const stand = new Map();
for (const r of stRows) if (!stand.has(r.league_id) || stand.get(r.league_id).season < r.season) stand.set(r.league_id, r);
const teamRank = new Map(); // takım → {lg, row}
for (const [lid, r] of stand) for (const g of r.data ?? []) for (const row of g ?? []) {
  const id = row?.team?.id;
  if (!id) continue;
  const cur = teamRank.get(id);
  if (!cur || L.priorityOf({ id: lid, ...(leagues.get(lid) ?? {}) }) < L.priorityOf({ id: cur.lg, ...(leagues.get(cur.lg) ?? {}) })) teamRank.set(id, { lg: lid, row });
}

const mLink = (f) => `<a href="/match/${f.id}">${esc(tName(f.home_id))} - ${esc(tName(f.away_id))}</a>`;
const tLink = (id) => `<a href="/team/${id}">${esc(tName(id))}</a>`;
const lLink = (id) => (leagues.get(id) ? `<a href="/league/${id}">${esc(lgFull(leagues.get(id)))}</a>` : '');
const evStatus = (f) => (f.status === 'PST' ? 'https://schema.org/EventPostponed' : f.status === 'CANC' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled');

function refName(f) {
  const o = refTFF.get(f.id);
  const h = Array.isArray(o) ? o.find((x) => x.role === 'Hakem')?.name : null;
  return h || (f.referee ? String(f.referee).split(',')[0] : '');
}

function goalsHtml(f, d) {
  const ev = (d?.events ?? []).filter((e) => e.type === 'Goal' && !/Missed/i.test(e.detail ?? ''));
  if (!ev.length) return '';
  return `<h2>Goller</h2><ul>${ev.map((e) => {
    const min = `${e.time?.elapsed ?? ''}${e.time?.extra ? '+' + e.time.extra : ''}'`;
    const kind = /Own/i.test(e.detail) ? ' (kendi kalesine)' : /Penalty/i.test(e.detail) ? ' (penaltı)' : '';
    return `<li>${min} ${esc(e.player?.name ?? '')}${kind} · ${esc(tr(e.team?.name))}${e.assist?.name ? ` <span class="k">(asist: ${esc(e.assist.name)})</span>` : ''}</li>`;
  }).join('')}</ul>`;
}
function cardsHtml(d) {
  const ev = (d?.events ?? []).filter((e) => e.type === 'Card' && /Red|Second Yellow/i.test(e.detail ?? ''));
  return ev.length ? `<h2>Kırmızı kartlar</h2><ul>${ev.map((e) => `<li>${e.time?.elapsed ?? ''}' ${esc(e.player?.name ?? '')} · ${esc(tr(e.team?.name))}</li>`).join('')}</ul>` : '';
}
function lineupsHtml(d) {
  const lu = (d?.lineups ?? []).filter((l) => l?.startXI?.length);
  if (lu.length < 2) return '';
  return `<h2>İlk 11'ler</h2>` + lu.map((l) => `<p><b>${esc(tr(l.team?.name))}</b>${l.formation ? ` (${esc(l.formation)})` : ''}${l.coach?.name ? ` · Teknik direktör: ${esc(l.coach.name)}` : ''}<br>${l.startXI.map((p) => esc(p.player?.name)).join(', ')}` +
    (l.substitutes?.length ? `<br><span class="k">Yedekler: ${l.substitutes.map((p) => esc(p.player?.name)).join(', ')}</span>` : '') + '</p>').join('');
}
const STAT_TR = { 'Ball Possession': 'Topa sahip olma', 'Total Shots': 'Toplam şut', 'Shots on Goal': 'İsabetli şut', 'Corner Kicks': 'Korner', Fouls: 'Faul', Offsides: 'Ofsayt', 'Yellow Cards': 'Sarı kart', 'Red Cards': 'Kırmızı kart', 'Goalkeeper Saves': 'Kurtarış', expected_goals: 'Gol beklentisi (xG)', 'Passes %': 'Pas isabeti' };
function statsHtml(d) {
  const s = d?.statistics;
  if (!Array.isArray(s) || s.length < 2) return '';
  const a = new Map((s[0].statistics ?? []).map((x) => [x.type, x.value])), b = new Map((s[1].statistics ?? []).map((x) => [x.type, x.value]));
  const rows = Object.entries(STAT_TR).filter(([k]) => a.get(k) != null || b.get(k) != null).map(([k, t]) => `<tr><td>${a.get(k) ?? 0}</td><td>${t}</td><td>${b.get(k) ?? 0}</td></tr>`);
  return rows.length ? `<h2>Maç istatistikleri</h2><table><tr><th>${esc(tr(s[0].team?.name))}</th><th></th><th>${esc(tr(s[1].team?.name))}</th></tr>${rows.join('')}</table>` : '';
}

function h2hHtml(f) {
  const prev = fx.filter((x) => x.id !== f.id && DONE.has(x.status) && ((x.home_id === f.home_id && x.away_id === f.away_id) || (x.home_id === f.away_id && x.away_id === f.home_id)));
  const form = (id) => fx.filter((x) => x.id !== f.id && DONE.has(x.status) && x.kickoff < f.kickoff && (x.home_id === id || x.away_id === id)).slice(-5).reverse();
  let h = '';
  for (const id of [f.home_id, f.away_id]) {
    const list = form(id);
    if (list.length) h += `<h2>${esc(tName(id))} son maçları</h2><ul>${list.map((x) => `<li>${fShort(x.kickoff)} ${mLink(x)} <b>${score(x)}</b></li>`).join('')}</ul>`;
  }
  if (prev.length) h += `<h2>Aralarındaki son maç</h2><ul>${prev.map((x) => `<li>${fShort(x.kickoff)} ${mLink(x)} <b>${score(x)}</b></li>`).join('')}</ul>`;
  return h;
}

function oldDet(p) {
  try { const m = /<!--det-->([\s\S]*?)<!--\/det-->/.exec(fs.readFileSync(path.join(OUT, p.slice(1) + '.html'), 'utf8')); return m ? m[1] : ''; } catch { return ''; }
}
function matchPage(f) {
  const H = tName(f.home_id), A = tName(f.away_id), lg = leagues.get(f.league_id), d = det.get(f.id);
  const k = Date.parse(f.kickoff), when = `${fDate(k)} ${fDay(k)}, ${fTime(k)}`;
  const rnd = L.roundTR(f.round), ch = tv.get(f.id), ref = refName(f), st = statusTR(f), done = DONE.has(f.status), live = LIVE.has(f.status);
  const sc = score(f);
  const title = done ? `${H} ${f.home_goals}-${f.away_goals} ${A} maç sonucu, goller ve istatistikler | 90Artı`
    : live ? `${H} - ${A} canlı skor (${sc}) | 90Artı`
    : `${H} - ${A} maçı ne zaman, saat kaçta, hangi kanalda? ${fShort(k)} ${fTime(k)} | 90Artı`;
  const desc = [`${lgFull(lg)}${rnd ? ' ' + rnd : ''}: ${H} - ${A} maçı ${when}.`, ch ? `Yayın: ${ch}.` : '', ref ? `Hakem: ${ref}.` : '', f.venue ? `Stat: ${f.venue}.` : '',
    done ? `Sonuç ${sc}, goller, ilk 11'ler ve istatistikler.` : 'Canlı skor, ilk 11, istatistik ve iddaa oranları 90Artı\'da.'].filter(Boolean).join(' ');
  let body = `<h1>${esc(H)} - ${esc(A)}</h1><p><b>${esc(st)}</b>${f.status !== 'NS' ? ` · Skor: <b>${sc}</b>` : ''}${f.ht_home != null && f.status !== '1H' ? ` <span class="k">(İY ${f.ht_home}-${f.ht_away})</span>` : ''}${f.pen_home != null ? ` · Penaltılar ${f.pen_home}-${f.pen_away}` : ''}</p>`;
  body += `<table><tr><td class="k">Turnuva</td><td>${lLink(f.league_id) || esc(lgFull(lg))}${rnd ? ' · ' + esc(rnd) : ''}</td></tr><tr><td class="k">Tarih / saat</td><td>${esc(when)} (TSİ)</td></tr>` +
    (ch ? `<tr><td class="k">Hangi kanalda</td><td>${esc(ch)}</td></tr>` : '') + (ref ? `<tr><td class="k">Hakem</td><td>${esc(ref)}</td></tr>` : '') + (f.venue ? `<tr><td class="k">Stat</td><td>${esc(f.venue)}</td></tr>` : '') +
    `<tr><td class="k">Takımlar</td><td>${tLink(f.home_id)} · ${tLink(f.away_id)}</td></tr></table>`;
  const p = `/match/${f.id}`;
  // biten maçın ayrıntısı (gol/kadro/istatistik) bir kez okunur; sonraki turlarda yazılmış dosyadaki hâli kullanılır (veritabanı yükü)
  let dh = d ? goalsHtml(f, d) + cardsHtml(d) + lineupsHtml(d) + statsHtml(d) : '';
  if (!d && man[p]?.fin) dh = oldDet(p);
  body += `<!--det-->${dh}<!--/det-->` + h2hHtml(f);
  const ld = {
    '@context': 'https://schema.org', '@type': 'SportsEvent', name: `${H} - ${A}`, sport: 'Futbol', startDate: iso(k), eventStatus: evStatus(f),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', url: `${SITE}/match/${f.id}`,
    homeTeam: { '@type': 'SportsTeam', name: H, url: `${SITE}/team/${f.home_id}` }, awayTeam: { '@type': 'SportsTeam', name: A, url: `${SITE}/team/${f.away_id}` },
    competitor: [{ '@type': 'SportsTeam', name: H }, { '@type': 'SportsTeam', name: A }],
    location: { '@type': 'Place', name: f.venue || `${H} stadı`, address: f.venue || cTR(lg?.country) || 'Dünya' },
    description: desc, organizer: lg ? { '@type': 'SportsOrganization', name: lgFull(lg), url: `${SITE}/league/${f.league_id}` } : undefined,
    image: [teams.get(f.home_id)?.logo, teams.get(f.away_id)?.logo].filter(Boolean),
  };
  page({ p, title, desc, body, ld, img: teams.get(f.home_id)?.logo });
  if (done && d && NOW - k > 4 * 3600_000) man[p].fin = 1; // bitmiş, ayrıntısı okunmuş: bir daha okunmaz
  man[p].k = f.kickoff;
}

for (const f of [...pageFx, ...tvFx]) matchPage(f);

// ---------- takım sayfaları ----------
const byTeam = new Map();
for (const f of fx) for (const id of [f.home_id, f.away_id]) (byTeam.get(id) ?? byTeam.set(id, []).get(id)).push(f);
for (const [id, list] of byTeam) {
  if (!list.some((f) => f.kickoff >= iso(NOW - 10 * DAY))) continue;
  const N = tName(id), rk = teamRank.get(id), lgR = rk ? leagues.get(rk.lg) : leagues.get(list[list.length - 1].league_id);
  const past = list.filter((f) => DONE.has(f.status)).slice(-10).reverse(), next = list.filter((f) => !DONE.has(f.status) && f.kickoff >= iso(NOW - 3 * 3600_000)).slice(0, 6);
  const nx = next[0];
  const title = `${N} fikstürü, maç sonuçları ve puan durumu${nx ? ` · Sıradaki maç: ${tName(nx.home_id)} - ${tName(nx.away_id)}` : ''} | 90Artı`;
  const desc = `${N} son maç sonuçları, sıradaki maçları, maç saatleri ve yayın kanalları${rk ? `, ${lgFull(lgR)} puan durumunda ${rk.row.rank}. sıra (${rk.row.points} puan)` : ''}. Canlı skor ve kadro 90Artı'da.`;
  let body = `<h1>${esc(N)}</h1>`;
  if (rk) body += `<p>${lLink(rk.lg)} puan durumunda <b>${rk.row.rank}. sıra</b> · ${rk.row.all?.played ?? 0} maç, ${rk.row.all?.win ?? 0} galibiyet, ${rk.row.all?.draw ?? 0} beraberlik, ${rk.row.all?.lose ?? 0} mağlubiyet, <b>${rk.row.points} puan</b>, averaj ${(rk.row.all?.goals?.for ?? 0) - (rk.row.all?.goals?.against ?? 0)}</p>`;
  if (next.length) body += `<h2>${esc(N)} sıradaki maçları</h2><ul>${next.map((f) => `<li>${fShort(f.kickoff)} ${fTime(f.kickoff)} ${mLink(f)} <span class="k">${esc(lgName(leagues.get(f.league_id)))}${tv.get(f.id) ? ' · ' + esc(tv.get(f.id)) : ''}</span></li>`).join('')}</ul>`;
  if (past.length) body += `<h2>${esc(N)} son maç sonuçları</h2><ul>${past.map((f) => `<li>${fShort(f.kickoff)} ${mLink(f)} <b>${score(f)}</b> <span class="k">${esc(lgName(leagues.get(f.league_id)))}</span></li>`).join('')}</ul>`;
  const ld = { '@context': 'https://schema.org', '@type': 'SportsTeam', name: N, sport: 'Futbol', url: `${SITE}/team/${id}`, logo: teams.get(id)?.logo, memberOf: lgR ? { '@type': 'SportsOrganization', name: lgFull(lgR) } : undefined };
  page({ p: `/team/${id}`, title, desc, body, ld, img: teams.get(id)?.logo });
}

// ---------- lig sayfaları ----------
function tableHtml(rows) {
  return `<table><tr><th>#</th><th>Takım</th><th>O</th><th>G</th><th>B</th><th>M</th><th>Av</th><th>P</th></tr>${rows.map((r) => `<tr><td>${r.rank}</td><td><a href="/team/${r.team?.id}">${esc(tr(r.team?.name))}</a></td><td>${r.all?.played ?? 0}</td><td>${r.all?.win ?? 0}</td><td>${r.all?.draw ?? 0}</td><td>${r.all?.lose ?? 0}</td><td>${(r.all?.goals?.for ?? 0) - (r.all?.goals?.against ?? 0)}</td><td><b>${r.points ?? '–'}</b></td></tr>`).join('')}</table>`;
}
const byLg = new Map();
for (const f of fx) (byLg.get(f.league_id) ?? byLg.set(f.league_id, []).get(f.league_id)).push(f);
for (const lid of LG_IDS) {
  const lg = leagues.get(lid);
  if (!lg) continue;
  const N = lgFull(lg), st = stand.get(lid), list = byLg.get(lid) ?? [];
  const season = L.leagueSeasonLabel(lid, st?.season ?? lg.season ?? new Date(NOW).getFullYear());
  const recent = list.filter((f) => DONE.has(f.status) && f.kickoff >= iso(NOW - 7 * DAY)).reverse(), up = list.filter((f) => !DONE.has(f.status) && f.kickoff >= iso(NOW - 3 * 3600_000)).slice(0, 30);
  if (!st && !list.length) continue;
  const title = `${N} puan durumu, fikstür ve maç sonuçları ${season} | 90Artı`;
  const leader = st?.data?.[0]?.[0];
  const desc = `${N} ${season} sezonu güncel puan durumu, haftanın maçları, maç sonuçları, maç saatleri ve yayın kanalları.${leader ? ` Lider: ${tr(leader.team?.name)} (${leader.points} puan).` : ''}`;
  let body = `<h1>${esc(N)} ${esc(season)}</h1>`;
  for (const g of st?.data ?? []) if (g?.length) body += `<h2>${esc(st.data.length > 1 ? tr(g[0].group) || 'Puan durumu' : 'Puan durumu')}</h2>` + tableHtml(g);
  if (up.length) body += `<h2>Sıradaki maçlar</h2><ul>${up.map((f) => `<li>${fShort(f.kickoff)} ${fTime(f.kickoff)} ${mLink(f)}${LIVE.has(f.status) ? ` <b>${score(f)} (canlı)</b>` : ''}${tv.get(f.id) ? ` <span class="k">${esc(tv.get(f.id))}</span>` : ''}</li>`).join('')}</ul>`;
  if (recent.length) body += `<h2>Son maç sonuçları</h2><ul>${recent.map((f) => `<li>${fShort(f.kickoff)} ${mLink(f)} <b>${score(f)}</b></li>`).join('')}</ul>`;
  const ld = { '@context': 'https://schema.org', '@type': 'SportsOrganization', name: N, sport: 'Futbol', url: `${SITE}/league/${lid}`, logo: lg.logo };
  page({ p: `/league/${lid}`, title, desc, body, ld, img: lg.logo });
}

// ---------- basketbol / voleybol ----------
const SPN = { bb: 'Basketbol', vb: 'Voleybol' };
const spTv = new Map((await get(`sp_tv?select=sport,game_id,channels&updated_at=gte.${iso(NOW - 14 * DAY)}`, true)).map((r) => [`${r.sport}:${r.game_id}`, r.channels]));
const SP_COLS = 'sport,id,league_id,kickoff,status,home_id,away_id,home_score,away_score,periods,venue,league_name,league_country,home_name,away_name,home_logo';
const spAll = await get(`sp_games_v?select=${SP_COLS}&kickoff=gte.${iso(NOW - 3 * DAY)}&kickoff=lt.${iso(NOW + 6 * DAY)}&order=kickoff`, true);
// önemli ligler: Türkiye, EuroLeague/EuroCup/NBA ve TV'de yayınlanan maçı olan ligler
const SP_BIG = new Set(['bb:120', 'bb:194', 'bb:12']);
const tvLg = new Set(spAll.filter((g) => spTv.has(`${g.sport}:${g.id}`)).map((g) => `${g.sport}:${g.league_id}`));
const spGames = spAll.filter((g) => g.league_country === 'Turkey' || SP_BIG.has(`${g.sport}:${g.league_id}`) || tvLg.has(`${g.sport}:${g.league_id}`) || spTv.has(`${g.sport}:${g.id}`));
const SP_DONE = new Set(['FT', 'AOT', 'AP', 'AW']);
const spSt = (g) => (SP_DONE.has(g.status) ? 'Maç sonu' : g.status === 'NS' ? 'Başlamadı' : ['POST', 'PST'].includes(g.status) ? 'Ertelendi' : ['CANC', 'ABD'].includes(g.status) ? 'İptal' : 'Canlı');
const spScore = (g) => (g.home_score == null || g.status === 'NS' ? '-' : `${g.home_score} - ${g.away_score}`);
const spLink = (g) => `<a href="/s/${g.sport}/${g.id}">${esc(tr(g.home_name))} - ${esc(tr(g.away_name))}</a>`;
for (const g of spGames) {
  const H = tr(g.home_name), A = tr(g.away_name), k = Date.parse(g.kickoff), ch = spTv.get(`${g.sport}:${g.id}`), sp = SPN[g.sport], done = SP_DONE.has(g.status);
  const lgN = `${g.league_country && g.league_country !== 'World' ? cTR(g.league_country) + ' ' : ''}${tr(g.league_name)}`;
  const title = done ? `${H} ${g.home_score}-${g.away_score} ${A} maç sonucu (${sp}) | 90Artı` : `${H} - ${A} ${sp.toLowerCase()} maçı saat kaçta, hangi kanalda? ${fShort(k)} ${fTime(k)} | 90Artı`;
  const desc = `${lgN}: ${H} - ${A} ${sp.toLowerCase()} maçı ${fDate(k)} ${fDay(k)} ${fTime(k)}.${ch ? ` Yayın: ${ch}.` : ''} Canlı skor, ${g.sport === 'bb' ? 'çeyrek' : 'set'} sonuçları ve istatistikler 90Artı'da.`;
  const per = g.periods ?? {};
  let pr = '';
  if (Array.isArray(per.home) && per.home.length && g.status !== 'NS') pr = `<p class="k">${g.sport === 'bb' ? 'Çeyrekler' : 'Setler'}: ${per.home.map((h, i) => `${h ?? '-'}-${per.away?.[i] ?? '-'}`).join(', ')}</p>`;
  const body = `<h1>${esc(H)} - ${esc(A)}</h1><p><b>${spSt(g)}</b>${g.status !== 'NS' ? ` · Skor: <b>${spScore(g)}</b>` : ''}</p>${pr}<table><tr><td class="k">Spor</td><td>${sp}</td></tr><tr><td class="k">Lig</td><td>${g.league_id ? `<a href="/sl/${g.sport}/${g.league_id}">${esc(lgN)}</a>` : esc(lgN)}</td></tr><tr><td class="k">Tarih / saat</td><td>${esc(`${fDate(k)} ${fDay(k)}, ${fTime(k)}`)} (TSİ)</td></tr>${ch ? `<tr><td class="k">Hangi kanalda</td><td>${esc(ch)}</td></tr>` : ''}${g.venue ? `<tr><td class="k">Salon</td><td>${esc(g.venue)}</td></tr>` : ''}<tr><td class="k">Takımlar</td><td><a href="/st/${g.sport}/${g.home_id}">${esc(H)}</a> · <a href="/st/${g.sport}/${g.away_id}">${esc(A)}</a></td></tr></table>`;
  const ld = { '@context': 'https://schema.org', '@type': 'SportsEvent', name: `${H} - ${A}`, sport: sp, startDate: iso(k), eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', url: `${SITE}/s/${g.sport}/${g.id}`, homeTeam: { '@type': 'SportsTeam', name: H }, awayTeam: { '@type': 'SportsTeam', name: A }, competitor: [{ '@type': 'SportsTeam', name: H }, { '@type': 'SportsTeam', name: A }], location: { '@type': 'Place', name: g.venue || `${H} salonu`, address: g.venue || cTR(g.league_country) || 'Dünya' }, description: desc };
  page({ p: `/s/${g.sport}/${g.id}`, title, desc, body, ld, img: g.home_logo });
  man[`/s/${g.sport}/${g.id}`].k = g.kickoff;
}

// ---------- TV rehberi ----------
{
  const days = [0, 1, 2].map((i) => dayKey(NOW + i * DAY));
  const items = [];
  for (const f of [...pageFx, ...tvFx]) if (tv.get(f.id) && days.includes(dayKey(Date.parse(f.kickoff)))) items.push({ t: f.kickoff, day: dayKey(Date.parse(f.kickoff)), html: `${fTime(f.kickoff)} ${mLink(f)} <span class="k">(${esc(lgName(leagues.get(f.league_id)))})</span> · <b>${esc(tv.get(f.id))}</b>` });
  for (const g of spGames) { const ch = spTv.get(`${g.sport}:${g.id}`); if (ch && days.includes(dayKey(Date.parse(g.kickoff)))) items.push({ t: g.kickoff, day: dayKey(Date.parse(g.kickoff)), html: `${fTime(g.kickoff)} ${spLink(g)} <span class="k">(${SPN[g.sport]} · ${esc(tr(g.league_name))})</span> · <b>${esc(ch)}</b>` }); }
  items.sort((a, b) => (a.t < b.t ? -1 : 1));
  let body = `<h1>Bugün hangi maç hangi kanalda? Maç yayın akışı</h1><p>Bugün ve önümüzdeki günlerde televizyonda yayınlanacak futbol, basketbol ve voleybol maçları; saatleri ve kanalları (beIN Sports, TRT Spor, S Sport, Tivibu Spor, A Spor, tabii, Exxen…).</p>`;
  for (const d of days) {
    const l = items.filter((x) => x.day === d);
    if (l.length) body += `<h2>${fDate(Date.parse(d + 'T12:00:00Z'))} ${fDay(Date.parse(d + 'T12:00:00Z'))}</h2><ul>${l.map((x) => `<li>${x.html}</li>`).join('')}</ul>`;
  }
  page({ p: '/tv', title: `Bugün hangi maç hangi kanalda? Günün maç yayınları (${fDate(NOW)}) | 90Artı TV Rehberi`, desc: `${fDate(NOW)} televizyonda yayınlanacak maçlar: futbol, basketbol ve voleybol maçlarının saatleri ve yayın kanalları. beIN Sports, TRT Spor, S Sport, Tivibu, A Spor yayın akışı.`, body });
}

// ---------- ana sayfa ----------
{
  const today = dayKey(NOW), tomorrow = dayKey(NOW + DAY);
  const pick = (d) => pageFx.filter((f) => dayKey(Date.parse(f.kickoff)) === d).sort((a, b) => L.priorityOf({ id: a.league_id, ...(leagues.get(a.league_id) ?? {}) }) - L.priorityOf({ id: b.league_id, ...(leagues.get(b.league_id) ?? {}) }) || (a.kickoff < b.kickoff ? -1 : 1));
  const block = (list) => {
    let h = '', last = null;
    for (const f of list.slice(0, 160)) {
      if (f.league_id !== last) { h += `${last != null ? '</ul>' : ''}<h2>${lLink(f.league_id) || esc(lgFull(leagues.get(f.league_id)))}</h2><ul>`; last = f.league_id; }
      h += `<li>${fTime(f.kickoff)} ${mLink(f)} ${f.status !== 'NS' ? `<b>${score(f)}</b> <span class="k">${esc(statusTR(f))}</span>` : ''}${tv.get(f.id) ? ` <span class="k">${esc(tv.get(f.id))}</span>` : ''}</li>`;
    }
    return h + (last != null ? '</ul>' : '');
  };
  let body = `<h1>Canlı skor, bugünkü maçlar ve maç sonuçları</h1><p>90Artı: Süper Lig, Premier Lig, Şampiyonlar Ligi ve dünyanın bütün liglerinden canlı skorlar, anlık gol bildirimi, ilk 11'ler, istatistikler, puan durumları, iddaa programı ve maçların yayınlandığı kanallar.</p>`;
  body += `<p><a href="/tv">Bugün hangi maç hangi kanalda?</a> · <a href="/league/203">Süper Lig puan durumu</a> · <a href="/league/39">Premier Lig puan durumu</a> · <a href="/league/2">Şampiyonlar Ligi</a> · <a href="/league/140">LaLiga</a> · <a href="/league/135">Serie A</a> · <a href="/league/78">Bundesliga</a></p>`;
  body += `<h2>Bugünün maçları (${fDate(NOW)})</h2>` + block(pick(today)) + `<h2>Yarının maçları (${fDate(NOW + DAY)})</h2>` + block(pick(tomorrow));
  const ld = { '@context': 'https://schema.org', '@type': 'WebSite', name: '90Artı', alternateName: '90Artı Canlı Skor', url: SITE + '/', inLanguage: 'tr-TR', publisher: { '@type': 'Organization', name: '90Artı', url: SITE + '/', logo: SITE + '/img/icon-192.png' } };
  page({ p: '/', title: '90Artı – Canlı Skor, Maç Sonuçları, Puan Durumu ve TV Rehberi', desc: 'Canlı maç skorları, bugünkü maçlar, maç sonuçları, ilk 11, istatistikler, puan durumları, iddaa programı ve hangi maç hangi kanalda. Süper Lig, Avrupa kupaları, basketbol ve voleybol.', body, ld });
}

// ---------- sabit sayfalar ----------
{
  const list = LG_IDS.map((id) => leagues.get(id)).filter(Boolean).sort((a, b) => L.priorityOf(a) - L.priorityOf(b));
  page({ p: '/leagues', title: 'Puan durumları: Süper Lig, Premier Lig, LaLiga ve bütün ligler | 90Artı', desc: 'Süper Lig, TFF 1. Lig, Premier Lig, LaLiga, Serie A, Bundesliga, Ligue 1, Şampiyonlar Ligi ve dünyanın bütün liglerinin güncel ve canlı puan durumları.',
    body: `<h1>Puan durumları</h1><ul>${list.map((l) => `<li>${lLink(l.id)}</li>`).join('')}</ul>` });
  page({ p: '/iddaa', title: 'İddaa programı, iddaa oranları ve bugünkü maçlar | 90Artı', desc: 'Günün iddaa programı: futbol, basketbol ve voleybol maçlarının iddaa oranları, MBS, maç saatleri. Oranı değişen maçlar ve maç analizleri 90Artı\'da.',
    body: `<h1>İddaa programı</h1><p>Bugünün ve önümüzdeki günlerin iddaa bülteni: maç sonucu, çifte şans, alt/üst, karşılıklı gol, ilk yarı ve bütün seçeneklerin oranları. Oranı en çok değişen maçlar için <a href="/oranlar">Oranı Değişenler</a>.</p><h2>Bugünkü maçlar</h2><ul>${pageFx.filter((f) => dayKey(Date.parse(f.kickoff)) === dayKey(NOW)).slice(0, 80).map((f) => `<li>${fTime(f.kickoff)} ${mLink(f)}</li>`).join('')}</ul>` });
  page({ p: '/oranlar', title: 'Oranı düşen ve yükselen maçlar (iddaa) | 90Artı', desc: 'İddaa oranı en çok düşen ve yükselen maçlar, açılış oranı ve saat saat oran değişimi.',
    body: `<h1>Oranı değişen maçlar</h1><p>İddaa bültenindeki maçların açılış oranları ve güncel oranları: oranı düşen (▼) ve yükselen (▲) maçlar, saat saat oran geçmişi. <a href="/iddaa">İddaa programı</a></p>` });
  const hl = await get(`headlines?select=id,title,source,published_at&dup_of=is.null&order=published_at.desc&limit=40`).catch(() => []);
  page({ p: '/news', title: 'Son dakika spor haberleri, transfer ve futbol gündemi | 90Artı', desc: 'Son dakika futbol ve spor haberleri: Galatasaray, Fenerbahçe, Beşiktaş, Trabzonspor, milli takım, transfer ve sakatlık haberleri.',
    body: `<h1>Spor haberleri</h1><ul>${hl.map((h) => `<li>${esc(h.title)} <span class="k">${esc(h.source ?? '')}</span></li>`).join('')}</ul>` });
}

// ---------- eski sayfalar: maç 45 gün, takım/lig artık üretilmiyorsa 30 gün sonra silinir ----------
for (const p of Object.keys(man)) {
  if (seen.has(p)) continue;
  const m = man[p];
  const t = m.k ? Date.parse(m.k) : Date.parse(m.m);
  if (NOW - t < (m.k ? 45 : 30) * DAY) continue;
  fs.rmSync(path.join(OUT, p === '/' ? 'index.html' : p.slice(1) + '.html'), { force: true });
  delete man[p];
  stats.removed++;
}

// ---------- site haritası ----------
const urls = Object.entries(man).sort(([a], [b]) => (a < b ? -1 : 1));
const pri = (p) => (p === '/' ? '1.0' : p === '/tv' || p.startsWith('/league/') ? '0.8' : p.startsWith('/team/') ? '0.7' : '0.6');
const cf = (p) => (p === '/' || p === '/tv' ? 'hourly' : p.startsWith('/match/') || p.startsWith('/s/') ? 'hourly' : 'daily');
const sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([p, m]) => `<url><loc>${SITE}${p === '/' ? '/' : p}</loc><lastmod>${m.m}</lastmod><changefreq>${cf(p)}</changefreq><priority>${pri(p)}</priority></url>`).join('\n')}\n<url><loc>${SITE}/indir</loc><changefreq>monthly</changefreq></url>\n</urlset>\n`;
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sm);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /durum\nDisallow: /seo/\n\nSitemap: ${SITE}/sitemap.xml\n`);
fs.writeFileSync(MAN_F, JSON.stringify(man));
console.log(`seo: ${seen.size} sayfa, ${stats.written} yazıldı, ${stats.removed} silindi, site haritası ${urls.length + 1} adres`);
