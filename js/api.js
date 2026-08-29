window.StockAPI = (() => {
  const API_BASE = "http://localhost:3000/api";
  const CONFIG = {
    apiKey: localStorage.getItem("finnhub_api_key") || "",
    base: "https://finnhub.io/api/v1"
  };

  const symbols = {
    AAPL:{name:"Apple Inc.",exchange:"NASDAQ"},
    MSFT:{name:"Microsoft Corp.",exchange:"NASDAQ"},
    NVDA:{name:"NVIDIA Corp.",exchange:"NASDAQ"},
    TSLA:{name:"Tesla Inc.",exchange:"NASDAQ"},
    AMZN:{name:"Amazon.com Inc.",exchange:"NASDAQ"},
    GOOGL:{name:"Alphabet Inc.",exchange:"NASDAQ"},
    META:{name:"Meta Platforms Inc.",exchange:"NASDAQ"},
    NFLX:{name:"Netflix Inc.",exchange:"NASDAQ"}
  };

  const demoPrices = {
    AAPL:314.58, MSFT:505.06, NVDA:227.98, TSLA:354.81,
    AMZN:256.26, GOOGL:318.22, META:747.42, NFLX:123.41
  };

  const cache = new Map();

  async function fetchJSON(url, timeout=8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { signal: controller.signal, cache:"no-store" });
      const text = await response.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      return data;
    } finally {
      clearTimeout(timer);
    }
  }

  function demoQuote(symbol) {
    const base = demoPrices[symbol] || 100;
    const previousClose = base * (1 - ((Math.random() - 0.5) * 0.02));
    const price = Math.max(0.01, base + ((Math.random() - 0.45) * base * 0.006));
    const change = price - previousClose;
    return {
      symbol,
      price,
      change,
      percent: previousClose ? (change / previousClose) * 100 : 0,
      high: price * 1.01,
      low: price * 0.99,
      open: previousClose,
      previousClose,
      timestamp: Math.floor(Date.now()/1000)
    };
  }

  function normalizeQuote(q, symbol) {
    return {
      symbol,
      price: Number(q.price ?? q.c ?? 0),
      change: Number(q.change ?? q.d ?? 0),
      percent: Number(q.percent ?? q.dp ?? 0),
      high: Number(q.high ?? q.h ?? 0),
      low: Number(q.low ?? q.l ?? 0),
      open: Number(q.open ?? q.o ?? 0),
      previousClose: Number(q.previousClose ?? q.pc ?? 0),
      timestamp: Number(q.timestamp ?? q.t ?? Date.now()/1000)
    };
  }

  async function quote(symbol) {
    symbol = String(symbol || "").trim().toUpperCase();
    if (!symbol) throw new Error("Stock symbol is required");

    const cached = cache.get(symbol);
    if (cached && Date.now() - cached.time < 10000) return cached.data;

    try {
      const data = await fetchJSON(`${API_BASE}/quote/${encodeURIComponent(symbol)}`, 6000);
      const q = normalizeQuote(data, symbol);
      if (q.price > 0) {
        cache.set(symbol, {time:Date.now(), data:q});
        return q;
      }
    } catch (error) {
      console.warn(`Backend quote failed for ${symbol}:`, error.message);
    }

    if (CONFIG.apiKey) {
      try {
        const q = await fetchJSON(`${CONFIG.base}/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(CONFIG.apiKey)}`, 7000);
        const result = normalizeQuote(q, symbol);
        if (result.price > 0) {
          cache.set(symbol, {time:Date.now(), data:result});
          return result;
        }
      } catch (error) {
        console.warn(`Finnhub quote failed for ${symbol}:`, error.message);
      }
    }

    const demo = demoQuote(symbol);
    cache.set(symbol, {time:Date.now(), data:demo});
    return demo;
  }

  async function candles(symbol, range="1M") {
    symbol = String(symbol || "").trim().toUpperCase();
    range = String(range || "1M").trim().toUpperCase();

    try {
      const response = await fetchJSON(
        `${API_BASE}/candles/${encodeURIComponent(symbol)}?range=${encodeURIComponent(range)}`,
        12000
      );
      const data = response?.data || response;
      if (Array.isArray(data) && data.length) return data;
    } catch (error) {
      console.warn(`Backend candles failed for ${symbol}:`, error.message);
    }

    const q = await quote(symbol);
    const days = {"1D":24,"1W":7,"1M":30,"3M":90,"6M":180,"1Y":365}[range] || 30;
    const points = [];
    let value = q.price * (0.94 + Math.random()*0.08);
    const count = range === "1D" ? 78 : days + 1;
    const step = range === "1D" ? 5*60*1000 : 24*60*60*1000;
    const start = Date.now() - (count-1)*step;

    for (let i=0;i<count;i++) {
      const time = Math.floor((start + i*step)/1000);
      const open = value;
      const close = Math.max(0.5, open * (1 + (Math.random()-0.48)*0.025));
      const high = Math.max(open, close) * (1 + Math.random()*0.012);
      const low = Math.min(open, close) * (1 - Math.random()*0.012);
      points.push({time, open, high, low, close});
      value = close;
    }
    return points;
  }

  function company(symbol) {
    return symbols[String(symbol).toUpperCase()] || {
      name:String(symbol).toUpperCase(), exchange:"US"
    };
  }

  function setApiKey(key) {
    CONFIG.apiKey = String(key || "").trim();
    localStorage.setItem("finnhub_api_key", CONFIG.apiKey);
    cache.clear();
  }

  async function search(query) {
    query = String(query || "").trim().toUpperCase();
    if (!query) return [];
    const local = Object.keys(symbols)
      .filter(s => s.includes(query) || symbols[s].name.toUpperCase().includes(query))
      .map(s => ({symbol:s, description:symbols[s].name, displaySymbol:s}));
    if (local.length) return local;
    return [];
  }

  async function news(symbol) {
    try {
      const data = await fetchJSON(`${API_BASE}/news/${encodeURIComponent(symbol)}`, 8000);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function clearCache() { cache.clear(); }

  return {
    quote,
    candles,
    company,
    setApiKey,
    search,
    news,
    clearCache,
    symbols
  };
})();
