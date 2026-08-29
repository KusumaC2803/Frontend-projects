window.StockWatchlist = (() => {
  const KEY = "stockflow_watchlist";
  const defaults = ["AAPL","MSFT","NVDA","TSLA","AMZN"];

  function get() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(value) && value.length
        ? [...new Set(value.map(x => String(x).toUpperCase()))]
        : [...defaults];
    } catch {
      return [...defaults];
    }
  }

  function save(list) {
    localStorage.setItem(KEY, JSON.stringify(
      [...new Set(list.map(x => String(x).trim().toUpperCase()).filter(Boolean))]
    ));
  }

  function add(symbol) {
    const list = get();
    symbol = String(symbol || "").trim().toUpperCase();
    if (!symbol || list.includes(symbol)) return false;
    list.push(symbol);
    save(list);
    return true;
  }

  function remove(symbol) {
    symbol = String(symbol || "").trim().toUpperCase();
    save(get().filter(x => x !== symbol));
  }

  return {get,add,remove,save};
})();
