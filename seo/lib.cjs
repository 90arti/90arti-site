"use strict";
// Takım adlarının Türkçe karşılıkları (6 Kasım 2026, kullanıcı: "Sparta Praha" değil "Sparta Prag"; Maçkolik Türkçe yazıyor).
// Veri kaynakları (API-Football, Sportmonks) adları yerel/İngilizce veriyor. Veritabanındaki ad DEĞİŞMEZ (eşleştirme kodları ona bakıyor);
// yalnız ekranda ve bildirim metninde çevrilir. Bu dosyanın aynısı sunucuda: supabase/functions/sync/teamnames.ts (değişince ikisini de güncelle).
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDirGroup = exports.COUNTRY_TR = exports.PRIORITY = void 0;
exports.trTeam = trTeam;
exports.searchVariants = searchVariants;
exports.trJson = trJson;
exports.priorityOf = priorityOf;
exports.groupPriority = groupPriority;
exports.lgHead = lgHead;
exports.leagueSeasonLabel = leagueSeasonLabel;
exports.roundTR = roundTR;
exports.roundGeneric = roundGeneric;
// Tam ad → Türkçe (kulüpler; Maçkolik/Türk basınında yerleşik kullanım)
const EXACT = {
    // basketbol / voleybol (6 Kasım 2026, kullanıcı: Maçkolik'te Kızılyıldız, Beşiktaş; kaynakta Türkçe harfsiz / sponsorlu)
    'Crvena Zvezda Meridianbet': 'Kızılyıldız', 'Partizan Mozzart Bet': 'Partizan', 'Besiktas': 'Beşiktaş', 'Fenerbahce': 'Fenerbahçe', 'Bahcesehir Kol.': 'Bahçeşehir Koleji',
    'Bordo Bandirma': 'Bandırma Bordo', 'Buyukcekmece': 'Büyükçekmece', 'Cayirova': 'Çayırova', 'Darussafaka': 'Darüşşafaka', 'Goztepe': 'Göztepe', 'Karsiyaka': 'Karşıyaka',
    'Kecioren Baglum': 'Keçiören Bağlum', 'Kipas Istiklal': 'Kipaş İstiklal', 'Korfez Basket': 'Körfez Basket', 'MKE Ankaragucu': 'MKE Ankaragücü', 'Tofas': 'Tofaş', 'Turk Telekom': 'Türk Telekom',
    'Balikesir': 'Balıkesir', 'Botas': 'Botaş', 'Nesibe Aydin': 'Nesibe Aydın', 'Istanbul GSK': 'İstanbul GSK', 'Istanbul BB': 'İstanbul BB', 'IBB Spor Kulubu': 'İBB Spor Kulübü',
    'Eczacibasi': 'Eczacıbaşı', 'Vakifbank': 'VakıfBank', 'Ziraat Bankasi': 'Ziraat Bankası', 'Ilbank': 'İlbank', 'Kuzey Boru Genclik': 'Kuzey Boru Gençlik', 'Nilufer Bld.': 'Nilüfer Bld.',
    'Ankara Karayollari': 'Ankara Karayolları', 'Bahcelievler': 'Bahçelievler', 'Muratpasa': 'Muratpaşa', 'Yesilyurt': 'Yeşilyurt', 'Kagitspor': 'Kağıtspor', 'Duzce': 'Düzce',
    'Sanliurfa B.Sehir Bld.': 'Şanlıurfa B.Şehir Bld.', 'Onikisubat': 'Onikişubat', 'Karapinar Anadolu': 'Karapınar Anadolu', 'Kilis Genclik': 'Kilis Gençlik', 'Gaziantep Genclik': 'Gaziantep Gençlik',
    'Siran Akademi': 'Şiran Akademi', 'Altinordu': 'Altınordu', 'Afyon Bld. Yuntas': 'Afyon Bld. Yüntaş', 'Aydin B.Sehir Bld.': 'Aydın B.Şehir Bld.', 'Bodrum Dogus': 'Bodrum Doğuş', 'Izmir DSI': 'İzmir DSİ',
    'FK Crvena Zvezda': 'Kızılyıldız', 'Crvena Zvezda': 'Kızılyıldız', 'Crvena Zvezda Belgrade': 'Kızılyıldız', 'Red Star Belgrade': 'Kızılyıldız', 'Crvena Zvezda mts': 'Kızılyıldız',
    'Dynamo Kyiv': 'Dinamo Kiev', 'Dynamo Kiev': 'Dinamo Kiev',
    'FC Copenhagen': 'Kopenhag', 'FC Kobenhavn': 'Kopenhag', 'FC København': 'Kopenhag',
    'Sporting CP': 'Sporting Lizbon', 'Sporting Lisbon': 'Sporting Lizbon',
    'Olympiakos Piraeus': 'Olympiakos', 'Olympiacos': 'Olympiakos', 'Olympiacos Piraeus': 'Olympiakos',
    'Bayern München': 'Bayern Münih', 'Bayern Munich': 'Bayern Münih',
    // Almanya (6 Kasım 2026, kullanıcı: "Hamburger SV" → Türkçede Hamburg; Maçkolik gibi kısa yerleşik adlar)
    'Gençlerbirliği S.K.': 'Gençlerbirliği', // 21 Kasım 2026, kullanıcı: "S.K." eki yüzünden listede kesiliyordu
    'Hamburger SV': 'Hamburg', 'Borussia Mönchengladbach': 'Mönchengladbach', 'Borussia Monchengladbach': 'Mönchengladbach', '1. FC Köln': 'Köln', 'FC Schalke 04': 'Schalke 04',
    'FSV Mainz 05': 'Mainz 05', '1899 Hoffenheim': 'Hoffenheim', 'TSG Hoffenheim': 'Hoffenheim', 'SC Paderborn 07': 'Paderborn',
    'FC Augsburg': 'Augsburg', 'SC Freiburg': 'Freiburg', 'VfB Stuttgart': 'Stuttgart', 'SV Elversberg': 'Elversberg', 'VfL Wolfsburg': 'Wolfsburg',
    '1. FC Heidenheim': 'Heidenheim', '1. FC Kaiserslautern': 'Kaiserslautern', '1. FC Magdeburg': 'Magdeburg', '1. FC Nürnberg': 'Nürnberg',
    'Eintracht Braunschweig': 'Braunschweig', 'FC St. Pauli': 'St. Pauli', 'Hertha BSC': 'Hertha Berlin',
    'Karlsruher SC': 'Karlsruhe', 'SpVgg Greuther Fürth': 'Greuther Fürth', 'SV Darmstadt 98': 'Darmstadt', 'VfL Bochum': 'Bochum', 'VfL Osnabrück': 'Osnabrück',
    // İngiltere / İspanya / İtalya / Fransa (6 Kasım 2026, kullanıcı: "tara"; Türkiye'de bilinen adlar)
    'Wolves': 'Wolverhampton', 'Sheffield Utd': 'Sheffield United',
    'Athletic Club': 'Athletic Bilbao', 'Granada CF': 'Granada', 'AD Ceuta FC': 'Ceuta', 'FC Andorra': 'Andorra', 'Celta de Vigo II': 'Celta Vigo B', 'Real Sociedad II': 'Real Sociedad B',
    'AC Milan': 'Milan', 'AS Roma': 'Roma', 'Hellas Verona': 'Verona', 'Sudtirol': 'Südtirol', 'Vicenza Virtus': 'Vicenza',
    'Paris Saint Germain': 'PSG', 'Paris Saint-Germain': 'PSG', 'Stade Brestois 29': 'Brest', 'Estac Troyes': 'Troyes', 'PAU': 'Pau', 'RED Star FC 93': 'Red Star',
    'Saint Etienne': 'Saint-Étienne', 'Clermont Foot': 'Clermont',
    // Portekiz, Hollanda, Belçika, İskoçya, Yunanistan, İsviçre, Avusturya, Suudi, Brezilya, Arjantin, MLS (6 Kasım 2026, kullanıcı: "tara")
    'FC Porto': 'Porto', 'SC Braga': 'Braga', 'Vitória SC': 'Vitória Guimarães', 'GIL Vicente': 'Gil Vicente',
    'GO Ahead Eagles': 'Go Ahead Eagles', 'NEC Nijmegen': 'NEC',
    'KV Mechelen': 'Mechelen', 'KVC Westerlo': 'Westerlo', 'Standard Liege': 'Standard Liège', 'Union St. Gilloise': 'Union Saint-Gilloise',
    'St. Truiden': 'Sint-Truiden', 'RAAL La Louvière': 'La Louvière', 'SK Beveren': 'Beveren',
    'Heart Of Midlothian': 'Hearts', 'Dundee Utd': 'Dundee United', 'ST Johnstone': 'St. Johnstone', 'ST Mirren': 'St. Mirren',
    'Aris Thessalonikis': 'Aris Selanik', 'Iraklis 1908': 'Iraklis', 'Volos NFC': 'Volos',
    'BSC Young Boys': 'Young Boys', 'FC Basel 1893': 'Basel', 'FC Lugano': 'Lugano', 'FC Luzern': 'Luzern', 'FC Sion': 'Sion', 'FC ST. Gallen': 'St. Gallen',
    'FC Thun': 'Thun', 'FC Vaduz': 'Vaduz', 'FC Zurich': 'Zürih', 'Servette FC': 'Servette',
    'Red Bull Salzburg': 'Salzburg', 'Lask Linz': 'LASK', 'TSV Hartberg': 'Hartberg', 'SCR Altach': 'Altach', 'WSG Wattens': 'WSG Tirol',
    'Al-Hilal Saudi FC': 'Al Hilal', 'Al-Ittihad FC': 'Al Ittihad', 'Al-Nassr': 'Al Nassr', 'Al-Ahli Jeddah': 'Al Ahli', 'Al-Ettifaq': 'Al Ettifaq',
    'Al-Qadisiyah FC': 'Al Qadsiah', 'Al-Fateh': 'Al Fateh', 'Al-Fayha': 'Al Fayha', 'Al-Hazm': 'Al Hazm', 'Al-Faisaly FC': 'Al Faisaly', 'Al Khaleej Saihat': 'Al Khaleej',
    'Atletico Paranaense': 'Athletico Paranaense', 'Atletico-MG': 'Atletico Mineiro', 'Chapecoense-sc': 'Chapecoense', 'Vasco DA Gama': 'Vasco da Gama',
    'Argentinos JRS': 'Argentinos Juniors', 'Estudiantes L.P.': 'Estudiantes', 'Gimnasia L.P.': 'Gimnasia La Plata', 'Gimnasia M.': 'Gimnasia Mendoza',
    'Independ. Rivadavia': 'Independiente Rivadavia', 'Defensa Y Justicia': 'Defensa y Justicia', 'Newells Old Boys': "Newell's Old Boys",
    'Belgrano Cordoba': 'Belgrano', 'Talleres Cordoba': 'Talleres', 'Instituto Cordoba': 'Instituto',
    'Atlanta United FC': 'Atlanta United', 'Minnesota United FC': 'Minnesota United', 'Orlando City SC': 'Orlando City', 'Los Angeles Galaxy': 'LA Galaxy',
    'Ferencvarosi TC': 'Ferencvaros', 'Malmo FF': 'Malmö', 'IFK Goteborg': 'Göteborg',
    'Zenit Saint Petersburg': 'Zenit', 'Zenit St. Petersburg': 'Zenit',
    'Qarabag': 'Karabağ', 'Qarabağ': 'Karabağ', 'Neftchi Baku': 'Neftçi Bakü', 'Sabah FA': 'Sabah',
    'Dinamo Tbilisi': 'Dinamo Tiflis', 'AEK Athens FC': 'AEK Atina', 'AEK Athens': 'AEK Atina', 'AEK Larnaca': 'AEK Larnaka',
    'Apollon Limassol': 'Apollon Limasol', 'Club Brugge KV': 'Club Brugge',
    'CSKA Sofia': 'CSKA Sofya', 'Levski Sofia': 'Levski Sofya', 'Slavia Sofia': 'Slavia Sofya', 'Lokomotiv Sofia': 'Lokomotiv Sofya', 'CSKA 1948': 'CSKA 1948 Sofya',
    // 23 Kasım 2026 (kullanıcı bildirimi: "Şahtar" saçma; Türk basını Shakhtar Donetsk yazıyor): şehir kelimesi çevirisinin bozduğu adlar özgün hâliyle
    'Austria Vienna': 'Austria Wien', 'Austria Wien': 'Austria Wien', 'Austria Vienna (Am)': 'Austria Wien (Am)', 'First Vienna': 'First Vienna', 'IMT Novi Beograd': 'IMT Novi Beograd', 'OFK Beograd': 'OFK Beograd',
    'Anadolu Efes': 'Anadolu Efes', 'Zalgiris Kaunas': 'Zalgiris Kaunas',
};
// Lig adları (yalnız ekranda; lig sırası kimlikle ya da Türkçe karşılığı da tanıyan kurallarla belirleniyor)
const LEAGUES = {
    'UEFA Champions League': 'UEFA Şampiyonlar Ligi', 'UEFA Europa Cup - Women': 'UEFA Avrupa Kupası Kadın', 'UEFA Europa League': 'UEFA Avrupa Ligi', 'UEFA Europa Conference League': 'UEFA Konferans Ligi',
    'UEFA Conference League': 'UEFA Konferans Ligi', 'UEFA Nations League': 'UEFA Uluslar Ligi', 'UEFA Super Cup': 'UEFA Süper Kupa',
    'UEFA Youth League': 'UEFA Gençlik Ligi', 'World Cup': 'Dünya Kupası', 'Euro Championship': 'Avrupa Şampiyonası',
    'Euro Championship - Qualification': 'Avrupa Şampiyonası Elemeleri', 'World Cup - Qualification Europe': 'Dünya Kupası Elemeleri - Avrupa',
    'World Cup - Qualification Asia': 'Dünya Kupası Elemeleri - Asya', 'World Cup - Qualification South America': 'Dünya Kupası Elemeleri - G. Amerika',
    'World Cup - Qualification Africa': 'Dünya Kupası Elemeleri - Afrika', 'World Cup - Qualification CONCACAF': 'Dünya Kupası Elemeleri - CONCACAF',
    'World Cup - Qualification Oceania': 'Dünya Kupası Elemeleri - Okyanusya', 'World Cup - Qualification Intercontinental Play-offs': 'Dünya Kupası Elemeleri - Kıtalararası Play-off',
    'Friendlies': 'Hazırlık Maçları', 'Friendlies Clubs': 'Kulüp Hazırlık Maçları',
    '3. Lig - Group 1': '3. Lig 1. Grup', '3. Lig - Group 2': '3. Lig 2. Grup', '3. Lig - Group 3': '3. Lig 3. Grup', 'U19 league': 'U19 Ligi',
};
Object.assign(EXACT, LEAGUES);
// Kelime → Türkçe (şehir adları; kulüp adının içinde geçince). Kişi adı olabilecek kelimeler (Sofia…) burada YOK, yukarıda tam adla.
const WORDS = [
    ['Praha', 'Prag'], ['Prague', 'Prag'], ['Bucuresti', 'Bükreş'], ['București', 'Bükreş'], ['Bucharest', 'Bükreş'],
    ['Beograd', 'Belgrad'], ['Belgrade', 'Belgrad'], ['Kobenhavn', 'Kopenhag'], ['København', 'Kopenhag'], ['Copenhagen', 'Kopenhag'],
    ['Moscow', 'Moskova'], ['Moskva', 'Moskova'], ['Warszawa', 'Varşova'], ['Warsaw', 'Varşova'], ['Vienna', 'Viyana'], ['Wien', 'Viyana'],
    ['München', 'Münih'], ['Munich', 'Münih'], ['Lisbon', 'Lizbon'], ['Lisboa', 'Lizbon'], ['Kyiv', 'Kiev'], ['Athens', 'Atina'],
    ['Tbilisi', 'Tiflis'], ['Baku', 'Bakü'], ['Thessaloniki', 'Selanik'],
    ['Brussels', 'Brüksel'], ['Bruxelles', 'Brüksel'], ['Kharkiv', 'Harkov'], ['Odesa', 'Odessa'],
];
// Milli takımlar: ülke adı (U21, Kadın gibi ekler korunur)
const NAT = {
    Turkey: 'Türkiye', England: 'İngiltere', Spain: 'İspanya', Italy: 'İtalya', Germany: 'Almanya', France: 'Fransa', Netherlands: 'Hollanda',
    Portugal: 'Portekiz', Belgium: 'Belçika', Scotland: 'İskoçya', Greece: 'Yunanistan', Brazil: 'Brezilya', Argentina: 'Arjantin', USA: 'ABD',
    Russia: 'Rusya', Ukraine: 'Ukrayna', Austria: 'Avusturya', Switzerland: 'İsviçre', Denmark: 'Danimarka', Sweden: 'İsveç', Norway: 'Norveç',
    Poland: 'Polonya', Croatia: 'Hırvatistan', Serbia: 'Sırbistan', Czechia: 'Çekya', 'Czech Republic': 'Çekya', Romania: 'Romanya',
    'Saudi Arabia': 'S. Arabistan', Japan: 'Japonya', Mexico: 'Meksika', Egypt: 'Mısır', Qatar: 'Katar', Nigeria: 'Nijerya', Ghana: 'Gana',
    Cameroon: 'Kamerun', "Côte d'Ivoire": 'Fildişi Sahili', 'Ivory Coast': 'Fildişi Sahili', Morocco: 'Fas', Algeria: 'Cezayir', Tunisia: 'Tunus',
    Colombia: 'Kolombiya', Chile: 'Şili', Ecuador: 'Ekvador', Bulgaria: 'Bulgaristan', Hungary: 'Macaristan', Cyprus: 'G. Kıbrıs Rum Kesimi',
    Azerbaijan: 'Azerbaycan', Georgia: 'Gürcistan', 'Bosnia & Herzegovina': 'Bosna-Hersek', 'Bosnia and Herzegovina': 'Bosna-Hersek', 'Bosnia-Herzegovina': 'Bosna-Hersek',
    Slovenia: 'Slovenya', Slovakia: 'Slovakya', Albania: 'Arnavutluk', Kosovo: 'Kosova', 'North Macedonia': 'K. Makedonya', 'FYR Macedonia': 'K. Makedonya',
    Montenegro: 'Karadağ', Finland: 'Finlandiya', Iceland: 'İzlanda', 'Rep. Of Ireland': 'İrlanda', 'Republic of Ireland': 'İrlanda', Ireland: 'İrlanda',
    Wales: 'Galler', 'Northern Ireland': 'K. İrlanda', Israel: 'İsrail', Iran: 'İran', Iraq: 'Irak', China: 'Çin', 'South Korea': 'G. Kore',
    'Korea Republic': 'G. Kore', Australia: 'Avustralya', Canada: 'Kanada', 'Cape Verde Islands': 'Yeşil Burun', Jamaica: 'Jamaika',
    Bolivia: 'Bolivya', 'Costa Rica': 'Kosta Rika', 'South Africa': 'G. Afrika', Uzbekistan: 'Özbekistan', Armenia: 'Ermenistan',
    Luxembourg: 'Lüksemburg', 'Faroe Islands': 'Faroe Adaları', Suriname: 'Surinam', 'United Arab Emirates': 'BAE', Kazakhstan: 'Kazakistan',
    Lithuania: 'Litvanya', Latvia: 'Letonya', Estonia: 'Estonya', 'New Zealand': 'Yeni Zelanda', 'Dominican Republic': 'Dominik Cumhuriyeti',
    Palestine: 'Filistin', Jordan: 'Ürdün', Kuwait: 'Kuveyt', Bahrain: 'Bahreyn', Thailand: 'Tayland', Indonesia: 'Endonezya', India: 'Hindistan',
    Malaysia: 'Malezya', Singapore: 'Singapur', Kyrgyzstan: 'Kırgızistan', Gibraltar: 'Cebelitarık', 'Chinese Taipei': 'Çin Taipei',
    'Basque Country': 'Bask Bölgesi', Belarus: 'Belarus', Tajikistan: 'Tacikistan', Turkmenistan: 'Türkmenistan', Syria: 'Suriye',
    Lebanon: 'Lübnan', Oman: 'Umman', Libya: 'Libya', Sudan: 'Sudan', Ethiopia: 'Etiyopya', 'DR Congo': 'Kongo DC', Congo: 'Kongo',
    Guinea: 'Gine', 'Equatorial Guinea': 'Ekvator Ginesi', Zambia: 'Zambiya', Zimbabwe: 'Zimbabve', Haiti: 'Haiti', 'Trinidad and Tobago': 'Trinidad ve Tobago',
};
const SUFFIX = /^(.*?)((?:\s+(?:U\s?\d{2}|W|Women|Olympic|B|2))*)$/;
const ESC = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const WORD_RE = new RegExp(`(^|[\\s\\-(])(${WORDS.map(([a]) => ESC(a)).join('|')})(?=$|[\\s\\-),])`, 'g');
const WORD_MAP = new Map(WORDS);
const cache = new Map();
function trTeam(name) {
    if (!name)
        return name ?? '';
    const hit = cache.get(name);
    if (hit !== undefined)
        return hit;
    let out = EXACT[name];
    if (!out) {
        const m = SUFFIX.exec(name);
        const base = m?.[1] ?? name, suf = (m?.[2] ?? '').replace(/\bWomen\b/, 'Kadın').replace(/\s+W$/, ' Kadın');
        if (NAT[base])
            out = NAT[base] + suf;
        else if (EXACT[base])
            out = EXACT[base] + suf;
        else
            out = (/\bW(omen)?$/.test(name) ? base + suf : name).replace(WORD_RE, (_s, pre, w) => pre + (WORD_MAP.get(w) ?? w)); // kadın takımı: "Galatasaray W" → "Galatasaray Kadın" (11 Kasım 2026)
    }
    if (cache.size > 5000)
        cache.clear();
    cache.set(name, out);
    return out;
}
// Arama: Türkçe yazılan adı kaynaktaki adla da aramak için (Prag → Praha, Belçika → Belgium, Kızılyıldız → Crvena Zvezda).
// Türkçe harfsiz yazım da tanınır (kizilyildiz). En çok 3 seçenek döner; asıl sorgu her zaman ayrıca aranır.
const fold = (s) => s.toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[İI]/g, 'i').trim();
let REV_FULL = null;
function searchVariants(q) {
    const fq = fold(q);
    if (fq.length < 3)
        return [];
    if (!REV_FULL)
        REV_FULL = [...Object.entries(EXACT), ...Object.entries(NAT)].map(([src, tr]) => [fold(tr), src]);
    const out = new Set();
    // tam ad ya da adın başı ("kızıl" → Crvena Zvezda)
    for (const [tr, src] of REV_FULL)
        if (tr === fq || (fq.length >= 4 && tr.startsWith(fq)) || (fq.length >= 5 && tr.includes(fq)))
            out.add(src);
    // kelime kelime şehir adları ("sparta prag" → "sparta praha")
    const words = fq.split(/\s+/);
    for (const [src, tr] of WORDS) {
        const ft = fold(tr);
        const i = words.findIndex((w) => w === ft || (w.length >= 3 && ft.startsWith(w) && w === words[words.length - 1]));
        if (i >= 0)
            out.add(words.map((w, j) => (j === i ? src : w)).join(' '));
    }
    out.delete(q);
    // biri ötekini içeriyorsa kısası yeter ("Crvena Zvezda" ⊂ "FK Crvena Zvezda"): veritabanı araması zaten "içinde geçen"
    const keep = [];
    for (const v of [...out].sort((a, b) => a.length - b.length))
        if (!keep.some((k) => fold(v).includes(fold(k))))
            keep.push(v);
    return keep.slice(0, 3);
}
// Sunucudan gelen JSON metnindeki takım adı alanları (name, home_name, away_name, team_name): ayrıştırmadan, yalnız metin değişimiyle.
// Hızlı ön kontrol: metinde çevrilecek bir kelime hiç yoksa dokunulmaz.
const KEYS_RE = /"(name|home_name|away_name|team_name)"(\s*):(\s*)"((?:[^"\\]|\\.)*)"/g;
const ANY = new RegExp([...Object.keys(EXACT), ...Object.keys(NAT), ...WORDS.map(([a]) => a)].map(ESC).join('|'));
function trJson(text) {
    if (!ANY.test(text))
        return text;
    return text.replace(KEYS_RE, (all, k, s1, s2, v) => {
        let raw;
        try {
            raw = JSON.parse(`"${v}"`);
        }
        catch {
            return all;
        }
        const t = trTeam(raw);
        return t === raw ? all : `"${k}"${s1}:${s2}${JSON.stringify(t)}`;
    });
}
// Maç listesinde lig sırası (Maçkolik/Flashscore düzenine yakın).
// Önce elle sıraladığımız ligler, sonra ülke önemi + lig kademesi.
const ORDER = [
    203, 204, 206, // Süper Lig, TFF 1. Lig (6 Kasım 2026, kullanıcı: Süper Lig'in hemen altında), Türkiye Kupası
    2, 3, 848, 531, // Şampiyonlar Ligi, Avrupa Ligi, Konferans Ligi, UEFA Süper Kupa
    1, 4, 5, 9, 32, 960, 10, // Dünya Kupası, EURO, Uluslar Ligi, Copa América, elemeler, milli hazırlık maçları
    525, 1191, // Kadınlar Şampiyonlar Ligi, Kadınlar Avrupa Kupası (11 Kasım 2026, kullanıcı: milli takım maçlarının altında)
    39, 140, 135, 78, 61, // 5 büyük lig: İngiltere, İspanya, İtalya, Almanya, Fransa
    40, 141, 136, 79, 62, // ikinci ligler: Championship, LaLiga 2, Serie B, 2. Bundesliga, Ligue 2
    45, 48, 143, 137, 81, 66, // 5 büyük ülkenin kupaları (6 Kasım 2026, kullanıcı: 5 büyük ligden hemen sonra ikinci ligler gelsin)
    88, 94, 144, 179, 307, 197, 218, 207, 235, 333, 119, 113, 103, 106, 345, 210, 286, 283, 172, 271, // diğer önemli ligler (Hollanda, Portekiz, Belçika, İskoçya, S. Arabistan…)
    205, 552, 553, 554, // TFF 2. Lig, 3. Lig grupları
    13, 11, 71, 128, 253, 262, 98, 292, 305, 301, 233, // Güney Amerika kupaları, Brezilya, Arjantin, ABD, Meksika, Japonya…
];
exports.PRIORITY = Object.fromEntries(ORDER.map((id, i) => [id, i + 1]));
const COUNTRY_RANK = ['World', 'Turkey', 'England', 'Spain', 'Italy', 'Germany', 'France', 'Netherlands', 'Portugal', 'Belgium', 'Scotland',
    'Saudi-Arabia', 'Greece', 'Austria', 'Switzerland', 'Russia', 'Ukraine', 'Denmark', 'Sweden', 'Norway', 'Poland', 'Czech-Republic',
    'Croatia', 'Serbia', 'Romania', 'Bulgaria', 'Hungary', 'Cyprus', 'Azerbaijan', 'Brazil', 'Argentina', 'USA', 'Mexico', 'Japan',
    'South-Korea', 'Qatar', 'United-Arab-Emirates', 'Egypt', 'Morocco'];
function priorityOf(l) {
    const id = typeof l === 'number' ? l : l.id;
    if (exports.PRIORITY[id])
        return exports.PRIORITY[id];
    if (typeof l === 'number')
        return 5000;
    const name = (l.name ?? '').toLowerCase();
    const ci = COUNTRY_RANK.indexOf(l.country ?? '');
    let score = 1000 + (ci < 0 ? 200 : ci * 5);
    // kademe: alt ligler, gençler, kadınlar, yedekler, hazırlık maçları aşağı
    if (/women|femen|feminin|frauen|kadın|w-league|nwsl|wsl|ladies|damallsvenskan|toppserien|liga f\b|division 1 féminine/.test(name))
        score += 3000;
    if (/u17|u18|u19|u20|u21|u23|youth|gençlik|junior|primavera|reserve|academy|development/.test(name))
        score += 2500;
    if (/friendl|hazırlık/.test(name))
        score += 2000;
    if (/regional|amateur|county|state league|oberliga|regionalliga|serie d|national league - (north|south)|segunda división rfef|tercera|national 3|liga 3 - |eccellenza|landesliga/.test(name) || (l.country === 'Brazil' && / - \d$/.test(name)))
        score += 1500;
    if (/(^|\s)(3|4|5)\.|third|tercera|division 3|liga 3|3\. liga|iii liga|league two|league 2|national 2|serie c|ligue 3|group \d/.test(name))
        score += 3;
    else if (/(^|\s)2\.|second|segunda|division 2|liga 2|ii liga|serie b|championship|league one|ligue 2|1\. lig|challenge|1st division|esiliiga|eerste divisie|primera b|liga alef|primera nacional| b$/.test(name))
        score += 2;
    else if (/cup|copa|coupe|pokal|kupa|coppa|taça|trophy|shield|beker|super ?cup|supercopa|supercoppa/.test(name))
        score += 1;
    return score;
}
// Maç listesinde bir ligin grubu için sıra: milli hazırlık maçları (lig 10) gibi ortak liglerde
// gruptaki maçların hepsi gençler / kadınlar / B takımı ise (Japan U17, Türkiye U21 …) üst sıralarda durmasın.
const MINOR = /\b(u ?1[5-9]|u ?2[0-3])\b|\b(women|w|ii|b)$|olimpik|kadın|youth/i;
const TOP_WOMEN = new Set([525, 1191]);
function groupPriority(league, games) {
    const base = priorityOf(league);
    if (TOP_WOMEN.has(league.id))
        return base;
    if (games.length && games.every(g => MINOR.test(g.home?.name ?? '') || MINOR.test(g.away?.name ?? ''))) {
        return Math.max(base, 1000 + 2500 + (/friendl/i.test(league.name ?? '') ? 2000 : 0));
    }
    return base;
}
exports.COUNTRY_TR = {
    Turkey: 'Türkiye', DRC: 'Kongo DC', England: 'İngiltere', Spain: 'İspanya', Italy: 'İtalya', Germany: 'Almanya',
    France: 'Fransa', Netherlands: 'Hollanda', Portugal: 'Portekiz', World: 'Dünya', Europe: 'Avrupa',
    Belgium: 'Belçika', Scotland: 'İskoçya', Greece: 'Yunanistan', Brazil: 'Brezilya', Argentina: 'Arjantin',
    USA: 'ABD', Russia: 'Rusya', Ukraine: 'Ukrayna', Austria: 'Avusturya', Switzerland: 'İsviçre',
    Denmark: 'Danimarka', Sweden: 'İsveç', Norway: 'Norveç', Poland: 'Polonya', Croatia: 'Hırvatistan',
    Serbia: 'Sırbistan', Czech: 'Çekya', 'Czech-Republic': 'Çekya', Romania: 'Romanya', Saudi: 'S. Arabistan',
    'Saudi-Arabia': 'S. Arabistan', Japan: 'Japonya', Mexico: 'Meksika', Egypt: 'Mısır', Qatar: 'Katar',
    Nigeria: 'Nijerya', Ghana: 'Gana', Senegal: 'Senegal', Cameroon: 'Kamerun', 'Ivory-Coast': 'Fildişi Sahili', "Côte d'Ivoire": 'Fildişi Sahili',
    Morocco: 'Fas', Algeria: 'Cezayir', Tunisia: 'Tunus', Colombia: 'Kolombiya', Uruguay: 'Uruguay', Chile: 'Şili', Peru: 'Peru',
    Ecuador: 'Ekvador', Paraguay: 'Paraguay', Bulgaria: 'Bulgaristan', Hungary: 'Macaristan', Cyprus: 'G. Kıbrıs Rum Kesimi', Azerbaijan: 'Azerbaycan',
    Georgia: 'Gürcistan', Bosnia: 'Bosna-Hersek', Slovenia: 'Slovenya', Slovakia: 'Slovakya', Albania: 'Arnavutluk', Kosovo: 'Kosova',
    'North-Macedonia': 'K. Makedonya', Montenegro: 'Karadağ', Finland: 'Finlandiya', Iceland: 'İzlanda', Ireland: 'İrlanda', Wales: 'Galler',
    'Northern-Ireland': 'K. İrlanda', Israel: 'İsrail', Iran: 'İran', Iraq: 'Irak', China: 'Çin', 'South-Korea': 'G. Kore', Australia: 'Avustralya',
    Canada: 'Kanada', Congo: 'Kongo', 'Congo DR': 'Kongo DC', 'North Macedonia': 'K. Makedonya', 'Bosnia and Herzegovina': 'Bosna-Hersek', 'Czech Republic': 'Çekya', 'Korea Republic': 'G. Kore', 'Cape Verde Islands': 'Yeşil Burun', Gabon: 'Gabon', Mali: 'Mali', Guinea: 'Gine', 'Burkina Faso': 'Burkina Faso', Angola: 'Angola', Jamaica: 'Jamaika', Venezuela: 'Venezuela', Bolivia: 'Bolivya', Costa: 'Kosta Rika', Haiti: 'Haiti', Zambia: 'Zambiya', Zimbabwe: 'Zimbabve', Kenya: 'Kenya', 'South Africa': 'G. Afrika', Togo: 'Togo', Benin: 'Benin', Uzbekistan: 'Özbekistan', Armenia: 'Ermenistan', Moldova: 'Moldova', Luxembourg: 'Lüksemburg', Malta: 'Malta', Andorra: 'Andorra', Faroe: 'Faroe', Curacao: 'Curaçao', Suriname: 'Surinam', 'United-Arab-Emirates': 'BAE', Kazakhstan: 'Kazakistan', Belarus: 'Belarus', Lithuania: 'Litvanya', Latvia: 'Letonya', Estonia: 'Estonya', Czechia: 'Çekya', 'Republic of Ireland': 'İrlanda', 'Northern Ireland': 'K. İrlanda',
};
// Lig başlığı "ÜLKE · Lig"; uluslararası (World) liglerde ülke yazılmaz (4 Kasım 2026, kullanıcı: "DÜNYA · UEFA Şampiyonlar Ligi" gereksiz)
function lgHead(country, name, tr) {
    if (!country || country === 'World')
        return name ?? '';
    return `${(tr ? tr(country) : exports.COUNTRY_TR[country] ?? country).toLocaleUpperCase('tr')} · ${name ?? ''}`;
}
// sezon adı: takvim yılı ligleri tek yıl (Brezilya 2026), API'nin bitiş yılıyla adlandırdığı sezon (Japonya 2027 = 2026/27)
// (9 Kasım 2026: lig sayfası bunu kullanmıyordu → Japonya "2027/28", Brezilya "2026/27" yazıyordu)
const CAL_YEAR = [71, 72, 128, 253, 113, 103, 292, 169];
function leagueSeasonLabel(id, season) {
    if (CAL_YEAR.includes(id))
        return String(season);
    const y = season > new Date().getFullYear() ? season - 1 : season;
    return `${y}/${String(y + 1).slice(2)}`;
}
const DIR_TR = { north: 'Kuzey', northern: 'Kuzey', south: 'Güney', southern: 'Güney', east: 'Doğu', west: 'Batı' };
// tur adı bir grubu mu gösteriyor (maç listesinde gruplar ayrı başlık altında)
const isDirGroup = (r) => !!r && /^Group (North|South|East|West|Northern|Southern)\s*-\s*\d+$/i.test(r);
exports.isDirGroup = isDirGroup;
function roundTR(r) {
    if (!r)
        return '';
    let m = r.match(/Regular Season - (\d+)/i);
    if (m)
        return `${m[1]}. Hafta`;
    m = r.match(/^(\d+)(st|nd|rd|th) (Round|Qualifying Round)/i);
    if (m)
        return `${m[1]}. ${/Qualifying/i.test(r) ? 'Ön Eleme' : 'Tur'}`;
    m = r.match(/^Round of (\d+)$/i);
    if (m)
        return `Son ${m[1]}`;
    m = r.match(/League Stage - (\d+)/i);
    if (m)
        return `Lig Aşaması ${m[1]}. Maç`;
    // EFL Trophy: "Group North - 2" = Kuzey B grubu (sayı grubu gösterir; 10 Kasım 2026)
    m = r.match(/^Group (North|South|East|West|Northern|Southern)\s*-\s*(\d+)$/i);
    if (m)
        return `${DIR_TR[m[1].toLowerCase()]} ${String.fromCharCode(64 + Number(m[2]))} Grubu`;
    // 15 Kasım 2026 (kullanıcı ekranı: "Hazırlık Maçları  Friendly International"): hazırlık turu adı gösterilmez; diğer çevrilmemiş turlar
    if (/^(Friendly International|Club Friendl(y|ies)|Friendlies)( \d+)?$/i.test(r))
        return '';
    m = r.match(/^(Apertura|Clausura)\s*-\s*(\d+)$/i);
    if (m)
        return `${m[1][0].toUpperCase()}${m[1].slice(1).toLowerCase()} ${m[2]}. Hafta`;
    m = r.match(/^League Phase\s*-\s*(\d+)$/i);
    if (m)
        return `Lig Aşaması ${m[1]}. Maç`;
    m = r.match(/^(North|South|East|West|Northern|Southern)(?:\s*-\s*(\d+))?$/i);
    if (m)
        return `${DIR_TR[m[1].toLowerCase()]}${m[2] ? ` · ${m[2]}. Hafta` : ''}`;
    if (/^Preliminary( Round)?$/i.test(r))
        return 'Ön Eleme';
    m = r.match(/Group Stage - (\d+)/i);
    if (m)
        return `Grup ${m[1]}. Maç`;
    const map = {
        'Round of 16': 'Son 16', 'Round of 32': 'Son 32', 'Round of 64': 'Son 64', '8th Finals': 'Son 16', '16th Finals': 'Son 32', '1/8-finals': 'Son 16', '1/16-finals': 'Son 32', '1/32-finals': 'Son 64', 'Quarter-finals': 'Çeyrek Final',
        'Semi-finals': 'Yarı Final', Final: 'Final', 'Play-offs': 'Play-off', 'Knockout Round Play-offs': 'Play-off',
    };
    if (map[r])
        return map[r];
    return roundGeneric(r);
}
// 28 Kasım 2026 (kullanıcı: "2. Lig Red Group - 14" İngilizce kalmış, "İngilizce şey kalmasın"): yukarıdaki özel kurallara
// uymayan tur adları parça parça çevrilir ("A - B - 14" → "A · B · 14. Hafta"); bilinmeyen özel adlar (Bayern, Hessen…) olduğu gibi
const PART_TR = {
    'regular season': '', 'group stage': 'Grup Aşaması', 'relegation group': 'Küme Düşme Grubu', 'championship group': 'Şampiyonluk Grubu',
    'promotion group': 'Çıkış Grubu', 'final group': 'Final Grubu', 'placement group': 'Sıralama Grubu', 'relegation round': 'Küme Düşme Turu',
    'promotion round': 'Çıkış Turu', 'championship round': 'Şampiyonluk Turu', 'championship playoffs': 'Şampiyonluk Play-off\'u',
    'relegation play-off': 'Küme Düşme Play-off\'u', 'relegation play-offs': 'Küme Düşme Play-off\'u', 'promotion play-offs': 'Çıkış Play-off\'u',
    'promotion': 'Çıkış', 'relegation': 'Küme Düşme', 'relegation final': 'Küme Düşme Finali', 'final-relegation': 'Küme Düşme Finali',
    'losers play offs': 'Kaybedenler Play-off\'u', 'play offs': 'Play-off', 'play-offs': 'Play-off', 'play-off': 'Play-off', 'play out': 'Play-out',
    'play-in final': 'Play-in Finali', 'super final': 'Süper Final', 'final': 'Final', 'semi-finals': 'Yarı Final', 'quarter-finals': 'Çeyrek Final',
    'qualification': 'Eleme', 'placement play offs': 'Sıralama Play-off\'u', 'fall season': 'Sonbahar Sezonu', 'fall season gold': 'Sonbahar Sezonu · Altın',
    'quadrangular': 'Dörtlü Grup', 'regions path': 'Bölgeler Yolu', 'first stage': '1. Aşama', 'second stage': '2. Aşama', 'central': 'Merkez',
    'northeast': 'Kuzeydoğu', 'northwest': 'Kuzeybatı', 'southeast': 'Güneydoğu', 'southwest': 'Güneybatı',
    'national league north': 'Kuzey', 'national league south': 'Güney', 'friendly international women': '', 'friendly international': '',
};
const COLOR_TR = { red: 'Kırmızı', white: 'Beyaz', blue: 'Mavi', green: 'Yeşil', black: 'Siyah', yellow: 'Sarı' };
function partTR(p) {
    const k = p.trim(), lk = k.toLowerCase();
    if (lk in PART_TR)
        return PART_TR[lk];
    if (lk in DIR_TR)
        return DIR_TR[lk];
    let m = k.match(/^(.*?)\s*(Red|White|Blue|Green|Black|Yellow) Group$/i); // "2. Lig Red Group"
    if (m)
        return `${m[1] ? m[1] + ' ' : ''}${COLOR_TR[m[2].toLowerCase()]} Grup`;
    m = k.match(/^(.*?)\s*(?:Group|Girone|Grupo|Groupe|Gruppe)\s+([A-Z]|\d+|[IVX]+)$/i); // "Group A", "3. Lig Group 2", "Girone B"
    if (m) {
        const g = m[2].toUpperCase();
        const name = /^\d+$/.test(g) ? `${g}. Grup` : /^[IVX]+$/.test(g) && g.length > 1 ? `Grup ${g}` : `${g} Grubu`;
        return `${m[1] ? m[1] + ' ' : ''}${name}`;
    }
    m = k.match(/^(\d+)(?:st|nd|rd|th) (Preliminary Round|Phase|Round|Qualifying Round)$/i);
    if (m)
        return `${m[1]}. ${/prelim|qualif/i.test(m[2]) ? 'Ön Eleme' : /phase/i.test(m[2]) ? 'Aşama' : 'Tur'}`;
    m = k.match(/^(\d+)(?:st|nd|rd|th) place(?: final)?$/i);
    if (m)
        return m[1] === '3' ? 'Üçüncülük Maçı' : `${m[1]}.lik Maçı`;
    m = k.match(/^Round (\d+)$/i);
    if (m)
        return `${m[1]}. Tur`;
    m = k.match(/^Round of (\d+)$/i);
    if (m)
        return `Son ${m[1]}`;
    m = k.match(/^1\/(\d+)-finals$/i);
    if (m)
        return `Son ${Number(m[1]) * 2}`;
    m = k.match(/^Top (\d+)$/i);
    if (m)
        return `İlk ${m[1]}`;
    m = k.match(/^League (\d+)$/i);
    if (m)
        return `${m[1]}. Lig`;
    m = k.match(/^League ([A-D])$/i);
    if (m)
        return `${m[1].toUpperCase()} Ligi`;
    if (/cup/i.test(k))
        return ''; // "Greek Cup - 5", "Caf Confederation Cup - 2": kupa adı başlıkta zaten var
    if (/^sudwest$/i.test(k))
        return 'Güneybatı';
    return k;
}
function roundGeneric(r) {
    const parts = r.split(/\s+-\s+/);
    const out = [];
    parts.forEach((p, i) => {
        if (/^\d+$/.test(p.trim()) && i === parts.length - 1 && i > 0) {
            out.push(/^(semi-finals|quarter-finals|final|play-offs?)$|cup/i.test(parts[i - 1].trim()) ? `${p.trim()}. Maç` : `${p.trim()}. Hafta`);
        }
        else {
            const x = partTR(p);
            if (x)
                out.push(x);
        }
    });
    return out.join(' · ');
}
