"use strict";

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const API_KEY = process.env.FINNHUB_API_KEY || "";
const FINNHUB = "https://finnhub.io/api/v1";
const YAHOO = "https://query1.finance.yahoo.com/v8/finance/chart";

app.use(cors());
app.use(express.json());

async function getJSON(url, timeout=10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {signal:controller.signal, headers:{"User-Agent":"Mozilla/5.0 StockFlow/1.0"}});
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  } finally { clearTimeout(timer); }
}

async function finnhub(endpoint) {
  if (!API_KEY) throw new Error("FINNHUB_API_KEY is missing");
  const join = endpoint.includes("?") ? "&" : "?";
  return getJSON(`${FINNHUB}${endpoint}${join}token=${encodeURIComponent(API_KEY)}`, 8000);
}

app.get("/health", (req,res) => res.json({status:"ok",service:"StockFlow API",finnhubConfigured:Boolean(API_KEY)}));

app.get("/api/quote/:symbol", async (req,res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const q = await finnhub(`/quote?symbol=${encodeURIComponent(symbol)}`);
    res.json({symbol,price:Number(q.c)||0,change:Number(q.d)||0,percent:Number(q.dp)||0,high:Number(q.h)||0,low:Number(q.l)||0,open:Number(q.o)||0,previousClose:Number(q.pc)||0,timestamp:Number(q.t)||Math.floor(Date.now()/1000)});
  } catch (e) { res.status(500).json({error:e.message}); }
});

app.get("/api/candles/:symbol", async (req,res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const range = String(req.query.range || "1M").toUpperCase();
    const settings = {
      "1D": ["1d","5m"], "1W":["5d","30m"], "1M":["1mo","1d"],
      "3M":["3mo","1d"], "6M":["6mo","1d"], "1Y":["1y","1d"]
    }[range] || ["1mo","1d"];

    const data = await getJSON(`${YAHOO}/${encodeURIComponent(symbol)}?range=${settings[0]}&interval=${settings[1]}&includePrePost=false&events=div%2Csplits`, 12000);
    const result = data?.chart?.result?.[0];
    if (!result) throw new Error(`No historical data for ${symbol}`);
    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const out = [];
    for (let i=0;i<timestamps.length;i++) {
      const open=Number(quote.open?.[i]), high=Number(quote.high?.[i]), low=Number(quote.low?.[i]), close=Number(quote.close?.[i]);
      if ([open,high,low,close].every(Number.isFinite)) out.push({time:Number(timestamps[i]),open,high,low,close});
    }
    if (!out.length) throw new Error(`No valid historical data for ${symbol}`);
    res.json({symbol,range,source:"Yahoo Finance",data:out});
  } catch (e) { res.status(500).json({error:e.message}); }
});

app.get("/api/news/:symbol", async (req,res) => {
  try {
    const symbol=req.params.symbol.toUpperCase();
    const to=new Date(); const from=new Date(to); from.setDate(from.getDate()-30);
    const fmt=d=>d.toISOString().slice(0,10);
    const data=await finnhub(`/company-news?symbol=${encodeURIComponent(symbol)}&from=${fmt(from)}&to=${fmt(to)}`);
    res.json(Array.isArray(data)?data:[]);
  } catch(e) { res.status(500).json({error:e.message}); }
});

app.listen(PORT,()=>{
  console.log("========================================");
  console.log("StockFlow backend started");
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log("Finnhub: Live quotes + news");
  console.log("Yahoo Finance: Historical charts");
  console.log("========================================");
});
