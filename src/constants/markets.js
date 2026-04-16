/**
 * Market configuration by country.
 * Maps ISO 3166-1 alpha-2 country codes to exchange parameters.
 * Yahoo Finance ticker suffixes let us fetch data for any global exchange.
 */

export const MARKETS = {
  US: {
    name: 'United States',
    flag: '\u{1F1FA}\u{1F1F8}',
    currency: 'USD',
    currencySymbol: '$',
    exchangeSuffix: '',
    exchangeName: 'NYSE / NASDAQ',
    indexes: [
      { symbol: '^GSPC', name: 'S&P 500', short: 'S&P 500' },
      { symbol: '^IXIC', name: 'NASDAQ Composite', short: 'NASDAQ' },
      { symbol: '^DJI', name: 'Dow Jones', short: 'Dow Jones' },
    ],
    popularTickers: [
      { ticker: 'AAPL', name: 'Apple', sector: 'Tech' },
      { ticker: 'MSFT', name: 'Microsoft', sector: 'Tech' },
      { ticker: 'GOOGL', name: 'Alphabet', sector: 'Tech' },
      { ticker: 'AMZN', name: 'Amazon', sector: 'Tech' },
      { ticker: 'TSLA', name: 'Tesla', sector: 'Auto' },
      { ticker: 'NVDA', name: 'Nvidia', sector: 'Tech' },
      { ticker: 'META', name: 'Meta', sector: 'Tech' },
      { ticker: 'NFLX', name: 'Netflix', sector: 'Media' },
      { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Banking' },
      { ticker: 'V', name: 'Visa', sector: 'Finance' },
      { ticker: 'MA', name: 'Mastercard', sector: 'Finance' },
      { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
      { ticker: 'WMT', name: 'Walmart', sector: 'Retail' },
      { ticker: 'PG', name: 'Procter & Gamble', sector: 'Consumer' },
      { ticker: 'UNH', name: 'UnitedHealth', sector: 'Healthcare' },
      { ticker: 'HD', name: 'Home Depot', sector: 'Retail' },
      { ticker: 'BAC', name: 'Bank of America', sector: 'Banking' },
      { ticker: 'XOM', name: 'ExxonMobil', sector: 'Energy' },
      { ticker: 'CVX', name: 'Chevron', sector: 'Energy' },
      { ticker: 'KO', name: 'Coca-Cola', sector: 'Consumer' },
      { ticker: 'PEP', name: 'PepsiCo', sector: 'Consumer' },
      { ticker: 'AVGO', name: 'Broadcom', sector: 'Tech' },
      { ticker: 'COST', name: 'Costco', sector: 'Retail' },
      { ticker: 'ORCL', name: 'Oracle', sector: 'Tech' },
      { ticker: 'AMD', name: 'AMD', sector: 'Tech' },
      { ticker: 'ADBE', name: 'Adobe', sector: 'Tech' },
      { ticker: 'CRM', name: 'Salesforce', sector: 'Tech' },
      { ticker: 'DIS', name: 'Disney', sector: 'Media' },
      { ticker: 'NKE', name: 'Nike', sector: 'Consumer' },
      { ticker: 'MCD', name: "McDonald's", sector: 'Consumer' },
      { ticker: 'PFE', name: 'Pfizer', sector: 'Healthcare' },
      { ticker: 'T', name: 'AT&T', sector: 'Telecom' },
      { ticker: 'INTC', name: 'Intel', sector: 'Tech' },
      { ticker: 'BA', name: 'Boeing', sector: 'Industrial' },
      { ticker: 'IBM', name: 'IBM', sector: 'Tech' },
    ],
    newsQuery: 'US stock market investing news',
    locale: 'en-US',
  },
  PK: {
    name: 'Pakistan',
    flag: '\u{1F1F5}\u{1F1F0}',
    currency: 'PKR',
    currencySymbol: 'Rs',
    exchangeSuffix: '.KA',
    exchangeName: 'PSX',
    indexes: [
      { symbol: 'KSE100', name: 'KSE 100', short: 'KSE 100', source: 'psx' },
      { symbol: 'KSE30', name: 'KSE 30', short: 'KSE 30', source: 'psx' },
      { symbol: 'KMI30', name: 'KMI 30 (Shariah)', short: 'KMI 30', source: 'psx' },
    ],
    popularTickers: [
      { ticker: 'FFC.KA', name: 'Fauji Fertilizer', sector: 'Fertilizer', aliases: ['fauji', 'ffc'] },
      { ticker: 'OGDC.KA', name: 'Oil & Gas Development Company', sector: 'Energy', aliases: ['ogdcl', 'oil and gas'] },
      { ticker: 'PPL.KA', name: 'Pakistan Petroleum Ltd', sector: 'Energy', aliases: ['petroleum', 'pakistan petroleum'] },
      { ticker: 'LUCK.KA', name: 'Lucky Cement', sector: 'Cement', aliases: ['lucky'] },
      { ticker: 'ENGRO.KA', name: 'Engro Corporation', sector: 'Conglomerate', aliases: ['engro'] },
      { ticker: 'HBL.KA', name: 'Habib Bank Limited', sector: 'Banking', aliases: ['habib bank', 'hbl'] },
      { ticker: 'UBL.KA', name: 'United Bank Limited', sector: 'Banking', aliases: ['united bank', 'ubl'] },
      { ticker: 'PSO.KA', name: 'Pakistan State Oil', sector: 'Energy', aliases: ['state oil', 'pso'] },
      { ticker: 'MCB.KA', name: 'MCB Bank', sector: 'Banking', aliases: ['muslim commercial bank', 'mcb'] },
      { ticker: 'MEBL.KA', name: 'Meezan Bank', sector: 'Banking', aliases: ['meezan', 'islamic bank'] },
      { ticker: 'NBP.KA', name: 'National Bank of Pakistan', sector: 'Banking', aliases: ['national bank', 'nbp'] },
      { ticker: 'BAHL.KA', name: 'Bank Al-Habib', sector: 'Banking', aliases: ['al habib', 'bank al habib'] },
      { ticker: 'ABL.KA', name: 'Allied Bank', sector: 'Banking', aliases: ['allied', 'abl'] },
      { ticker: 'FABL.KA', name: 'Faysal Bank', sector: 'Banking', aliases: ['faysal'] },
      { ticker: 'ENGROH.KA', name: 'Engro Holdings', sector: 'Conglomerate', aliases: ['engro holdings'] },
      { ticker: 'DGKC.KA', name: 'D.G. Khan Cement', sector: 'Cement', aliases: ['dg khan', 'dera ghazi khan'] },
      { ticker: 'MLCF.KA', name: 'Maple Leaf Cement', sector: 'Cement', aliases: ['maple leaf'] },
      { ticker: 'PIOC.KA', name: 'Pioneer Cement', sector: 'Cement', aliases: ['pioneer'] },
      { ticker: 'FCCL.KA', name: 'Fauji Cement', sector: 'Cement', aliases: ['fauji cement'] },
      { ticker: 'KOHC.KA', name: 'Kohat Cement', sector: 'Cement', aliases: ['kohat'] },
      { ticker: 'EFERT.KA', name: 'Engro Fertilizer', sector: 'Fertilizer', aliases: ['engro fert'] },
      { ticker: 'FFBL.KA', name: 'Fauji Fertilizer Bin Qasim', sector: 'Fertilizer', aliases: ['ffbl', 'bin qasim'] },
      { ticker: 'PAEL.KA', name: 'Pak Elektron', sector: 'Consumer', aliases: ['pel', 'elektron'] },
      { ticker: 'NESTLE.KA', name: 'Nestle Pakistan', sector: 'Consumer', aliases: ['nestle'] },
      { ticker: 'UNITY.KA', name: 'Unity Foods', sector: 'Consumer', aliases: ['unity'] },
      { ticker: 'HUBC.KA', name: 'Hub Power Company', sector: 'Power', aliases: ['hub power', 'hubco'] },
      { ticker: 'KAPCO.KA', name: 'Kot Addu Power Company', sector: 'Power', aliases: ['kot addu', 'kapco'] },
      { ticker: 'PKGP.KA', name: 'Pakgen Power', sector: 'Power', aliases: ['pakgen'] },
      { ticker: 'SSGC.KA', name: 'Sui Southern Gas Company', sector: 'Energy', aliases: ['sui gas', 'sui southern', 'sui southern gas', 'ssgc'] },
      { ticker: 'SNGP.KA', name: 'Sui Northern Gas Pipelines', sector: 'Energy', aliases: ['sui gas', 'sui northern', 'sui northern gas', 'sngpl'] },
      { ticker: 'MARI.KA', name: 'Mari Petroleum', sector: 'Energy', aliases: ['mari'] },
      { ticker: 'SEARL.KA', name: 'The Searle Company', sector: 'Pharma', aliases: ['searle'] },
      { ticker: 'GSK.KA', name: 'GlaxoSmithKline Pakistan', sector: 'Pharma', aliases: ['glaxo', 'gsk'] },
      { ticker: 'COLG.KA', name: 'Colgate Palmolive', sector: 'Consumer', aliases: ['colgate'] },
      { ticker: 'PTC.KA', name: 'Pakistan Telecommunication Company', sector: 'Telecom', aliases: ['ptcl', 'telecom'] },
    ],
    newsQuery: 'Pakistan stock market PSX investing news',
    locale: 'en-PK',
  },
  IN: {
    name: 'India',
    flag: '\u{1F1EE}\u{1F1F3}',
    currency: 'INR',
    currencySymbol: '\u20B9',
    exchangeSuffix: '.NS',
    exchangeName: 'NSE',
    indexes: [
      { symbol: '^NSEI', name: 'NIFTY 50', short: 'NIFTY 50' },
      { symbol: '^BSESN', name: 'BSE SENSEX', short: 'SENSEX' },
    ],
    popularTickers: [
      { ticker: 'RELIANCE.NS', name: 'Reliance Industries' },
      { ticker: 'TCS.NS', name: 'TCS' },
      { ticker: 'INFY.NS', name: 'Infosys' },
      { ticker: 'HDFCBANK.NS', name: 'HDFC Bank' },
      { ticker: 'ICICIBANK.NS', name: 'ICICI Bank' },
      { ticker: 'WIPRO.NS', name: 'Wipro' },
      { ticker: 'SBIN.NS', name: 'SBI' },
      { ticker: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
    ],
    newsQuery: 'India stock market NSE Sensex Nifty investing news',
    locale: 'en-IN',
  },
  GB: {
    name: 'United Kingdom',
    flag: '\u{1F1EC}\u{1F1E7}',
    currency: 'GBP',
    currencySymbol: '\u00A3',
    exchangeSuffix: '.L',
    exchangeName: 'LSE',
    indexes: [{ symbol: '^FTSE', name: 'FTSE 100', short: 'FTSE 100' }],
    popularTickers: [
      { ticker: 'SHEL.L', name: 'Shell' },
      { ticker: 'AZN.L', name: 'AstraZeneca' },
      { ticker: 'HSBA.L', name: 'HSBC' },
      { ticker: 'ULVR.L', name: 'Unilever' },
      { ticker: 'BP.L', name: 'BP' },
      { ticker: 'RIO.L', name: 'Rio Tinto' },
      { ticker: 'GSK.L', name: 'GSK' },
      { ticker: 'BARC.L', name: 'Barclays' },
    ],
    newsQuery: 'UK stock market London FTSE investing news',
    locale: 'en-GB',
  },
  JP: {
    name: 'Japan',
    flag: '\u{1F1EF}\u{1F1F5}',
    currency: 'JPY',
    currencySymbol: '\u00A5',
    exchangeSuffix: '.T',
    exchangeName: 'TSE',
    indexes: [{ symbol: '^N225', name: 'Nikkei 225', short: 'Nikkei 225' }],
    popularTickers: [
      { ticker: '7203.T', name: 'Toyota' },
      { ticker: '6758.T', name: 'Sony' },
      { ticker: '9984.T', name: 'SoftBank' },
      { ticker: '6861.T', name: 'Keyence' },
      { ticker: '8306.T', name: 'Mitsubishi UFJ' },
      { ticker: '9432.T', name: 'NTT' },
      { ticker: '6902.T', name: 'Denso' },
      { ticker: '4063.T', name: 'Shin-Etsu Chemical' },
    ],
    newsQuery: 'Japan stock market Nikkei Tokyo investing news',
    locale: 'ja-JP',
  },
  // Saudi Arabia and UAE removed — Yahoo Finance returns incorrect
  // prices for these exchanges. Can be re-added if a reliable native
  // API (like PSX's dps.psx.com.pk) becomes available for Tadawul/DFM.
  DE: {
    name: 'Germany',
    flag: '\u{1F1E9}\u{1F1EA}',
    currency: 'EUR',
    currencySymbol: '\u20AC',
    exchangeSuffix: '.DE',
    exchangeName: 'XETRA',
    indexes: [{ symbol: '^GDAXI', name: 'DAX', short: 'DAX' }],
    popularTickers: [
      { ticker: 'SAP.DE', name: 'SAP' },
      { ticker: 'SIE.DE', name: 'Siemens' },
      { ticker: 'ALV.DE', name: 'Allianz' },
      { ticker: 'BAS.DE', name: 'BASF' },
      { ticker: 'DTE.DE', name: 'Deutsche Telekom' },
      { ticker: 'BMW.DE', name: 'BMW' },
      { ticker: 'MRK.DE', name: 'Merck' },
      { ticker: 'ADS.DE', name: 'Adidas' },
    ],
    newsQuery: 'Germany stock market DAX XETRA investing news',
    locale: 'de-DE',
  },
  CA: {
    name: 'Canada',
    flag: '\u{1F1E8}\u{1F1E6}',
    currency: 'CAD',
    currencySymbol: 'C$',
    exchangeSuffix: '.TO',
    exchangeName: 'TSX',
    indexes: [{ symbol: '^GSPTSE', name: 'S&P/TSX Composite', short: 'TSX' }],
    popularTickers: [
      { ticker: 'RY.TO', name: 'Royal Bank' },
      { ticker: 'TD.TO', name: 'TD Bank' },
      { ticker: 'SHOP.TO', name: 'Shopify' },
      { ticker: 'ENB.TO', name: 'Enbridge' },
      { ticker: 'CNR.TO', name: 'Canadian National' },
      { ticker: 'BMO.TO', name: 'Bank of Montreal' },
      { ticker: 'BN.TO', name: 'Brookfield' },
      { ticker: 'CP.TO', name: 'Canadian Pacific' },
    ],
    newsQuery: 'Canada stock market TSX investing news',
    locale: 'en-CA',
  },
  AU: {
    name: 'Australia',
    flag: '\u{1F1E6}\u{1F1FA}',
    currency: 'AUD',
    currencySymbol: 'A$',
    exchangeSuffix: '.AX',
    exchangeName: 'ASX',
    indexes: [{ symbol: '^AXJO', name: 'S&P/ASX 200', short: 'ASX 200' }],
    popularTickers: [
      { ticker: 'BHP.AX', name: 'BHP Group' },
      { ticker: 'CBA.AX', name: 'CommBank' },
      { ticker: 'CSL.AX', name: 'CSL' },
      { ticker: 'NAB.AX', name: 'NAB' },
      { ticker: 'WBC.AX', name: 'Westpac' },
      { ticker: 'ANZ.AX', name: 'ANZ' },
      { ticker: 'FMG.AX', name: 'Fortescue' },
      { ticker: 'WES.AX', name: 'Wesfarmers' },
    ],
    newsQuery: 'Australia stock market ASX investing news',
    locale: 'en-AU',
  },
};

/** List of supported countries for the onboarding picker */
export const SUPPORTED_COUNTRIES = Object.entries(MARKETS).map(([code, m]) => ({
  code,
  name: m.name,
  flag: m.flag,
  currency: m.currency,
}));

/** Get market config for a country code. Falls back to US. */
export function getMarketConfig(countryCode) {
  return MARKETS[countryCode] || MARKETS['US'];
}

/**
 * Levenshtein edit distance between two strings.
 * Used for typo-tolerant "did you mean" matching.
 */
export function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  // Two-row DP (memory-efficient)
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,        // deletion
        curr[j - 1] + 1,    // insertion
        prev[j - 1] + cost  // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * Fuzzy search helper. Matches against ticker, name, sector, and aliases.
 * Returns a score (higher = better match) or 0 if no match.
 */
export function scoreStock(stock, query) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  const ticker = stock.ticker.toLowerCase();
  const tickerShort = ticker.split('.')[0];
  const name = stock.name.toLowerCase();
  const sector = (stock.sector || '').toLowerCase();
  const aliases = (stock.aliases || []).map((a) => a.toLowerCase());

  // Exact ticker match = best
  if (tickerShort === q) return 100;
  if (ticker === q) return 100;

  // Exact alias match
  if (aliases.includes(q)) return 90;

  // Ticker startsWith
  if (tickerShort.startsWith(q)) return 80;

  // Name startsWith
  if (name.startsWith(q)) return 75;

  // Alias startsWith
  for (const a of aliases) {
    if (a.startsWith(q)) return 70;
  }

  // Name includes
  if (name.includes(q)) return 60;

  // Alias includes
  for (const a of aliases) {
    if (a.includes(q)) return 55;
  }

  // Multi-word query: check if all query words appear somewhere
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const haystack = `${name} ${aliases.join(' ')} ${sector}`;
    if (words.every((w) => haystack.includes(w))) return 50;
  }

  // Sector match (only if query is a reasonable sector term)
  if (sector.includes(q) && q.length >= 3) return 30;

  // Ticker includes (last resort)
  if (tickerShort.includes(q)) return 20;

  // Typo-tolerant: surface close matches via edit distance
  // (scoped to short queries to avoid noise)
  if (q.length >= 3) {
    const tickerDist = levenshtein(q, tickerShort);
    const nameFirstWord = name.split(' ')[0];
    const nameDist = levenshtein(q, nameFirstWord);
    const minDist = Math.min(tickerDist, nameDist);
    const maxAllowed = q.length <= 4 ? 1 : q.length <= 6 ? 2 : 3;
    if (minDist <= maxAllowed) {
      // Score inversely proportional to distance: 1 off = 15, 2 off = 10, 3 off = 5
      return Math.max(5, 20 - minDist * 5);
    }
  }

  return 0;
}

/**
 * Find similar stocks in a market via edit distance.
 * Used for "Did you mean?" suggestions when a direct lookup fails.
 */
export function findSimilarStocks(marketConfig, query, limit = 3) {
  const q = query
    .toLowerCase()
    .replace(/\.[a-z]+$/i, '') // strip exchange suffix
    .trim();
  if (!q) return marketConfig.popularTickers.slice(0, limit);

  const scored = marketConfig.popularTickers.map((stock) => {
    const tickerShort = stock.ticker.split('.')[0].toLowerCase();
    const name = stock.name.toLowerCase();
    const nameFirstWord = name.split(' ')[0];
    const aliases = (stock.aliases || []).map((a) => a.toLowerCase());

    // Distance to ticker, first word of name, and closest alias
    const tickerDist = levenshtein(q, tickerShort);
    const nameDist = levenshtein(q, nameFirstWord);
    const aliasDist = aliases.length
      ? Math.min(...aliases.map((a) => levenshtein(q, a)))
      : Infinity;

    // Partial substring bonus — if the name contains the query string,
    // we want it ahead of pure edit-distance matches
    let dist = Math.min(tickerDist, nameDist, aliasDist);
    if (name.includes(q) || aliases.some((a) => a.includes(q))) {
      dist -= 2;
    }
    return { stock, dist };
  });

  scored.sort((a, b) => a.dist - b.dist);
  return scored.slice(0, limit).map((x) => x.stock);
}

/**
 * Search popular stocks for a given market config by query.
 * Returns sorted matches.
 */
export function searchStocks(marketConfig, query, limit = 8) {
  const scored = marketConfig.popularTickers
    .map((stock) => ({ stock, score: scoreStock(stock, query) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored.map((x) => x.stock);
}

/**
 * Format a currency amount using the user's locale.
 * Works for any supported currency globally.
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  if (amount == null || isNaN(amount)) return '--';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
