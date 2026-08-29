window.StockNews = (() => {
  const base=[
    ["Market momentum remains positive as investors watch earnings season.","Market Desk"],
    ["Technology stocks lead today's watchlist with mixed price action.","StockFlow"],
    ["Investors monitor inflation and interest-rate expectations.","Market Desk"],
    ["AI infrastructure companies remain active across major exchanges.","Finance Daily"],
    ["Portfolio diversification remains a key focus for investors.","StockFlow"],
    ["Markets react to fresh corporate guidance and economic data.","Market Desk"]
  ];
  function get(){return base.map((x,i)=>({title:x[0],source:x[1],time:`${i+1}h ago`,summary:"Demo feed — connect a Finnhub API key in Settings for live company news."}))}
  return {get};
})();