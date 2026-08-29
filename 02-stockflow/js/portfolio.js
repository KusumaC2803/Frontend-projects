window.StockPortfolio = (() => {
  const HOLD_KEY="stockflow_holdings", TX_KEY="stockflow_transactions", CASH_KEY="stockflow_cash";
  const defaults=[{symbol:"AAPL",shares:20,avg:198.42},{symbol:"NVDA",shares:15,avg:152.20},{symbol:"MSFT",shares:10,avg:462.15}];
  function holdings(){try{return JSON.parse(localStorage.getItem(HOLD_KEY))||defaults}catch(e){return defaults}}
  function saveHoldings(v){localStorage.setItem(HOLD_KEY,JSON.stringify(v))}
  function cash(){return Number(localStorage.getItem(CASH_KEY)??8420)}
  function saveCash(v){localStorage.setItem(CASH_KEY,String(v))}
  function transactions(){try{return JSON.parse(localStorage.getItem(TX_KEY))||[]}catch(e){return []}}
  function addTx(tx){const all=transactions();all.unshift(tx);localStorage.setItem(TX_KEY,JSON.stringify(all.slice(0,30)))}
  function trade(symbol,qty,price,type){
    symbol=symbol.toUpperCase();qty=Number(qty);price=Number(price);
    const h=holdings(), cost=qty*price, index=h.findIndex(x=>x.symbol===symbol);
    if(type==="BUY"){
      if(cash()<cost) throw new Error("Not enough cash");
      if(index<0) h.push({symbol,shares:qty,avg:price}); else {const old=h[index];old.avg=((old.shares*old.avg)+cost)/(old.shares+qty);old.shares+=qty}
      saveCash(cash()-cost);
    }else{
      if(index<0||h[index].shares<qty) throw new Error("Not enough shares");
      h[index].shares-=qty;if(h[index].shares===0)h.splice(index,1);saveCash(cash()+cost);
    }
    saveHoldings(h);addTx({symbol,qty,price,type,time:new Date().toLocaleString()});
  }
  return {holdings,cash,transactions,trade};
})();