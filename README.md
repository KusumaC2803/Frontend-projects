# StockFlow — Trading & Portfolio Dashboard

A responsive stock dashboard with live quotes, historical charts, watchlist, portfolio simulation, transactions, market movers, news and dark mode.

## Run the existing project

### Backend

Open a terminal:

```bash
cd server
npm install
```

Create `server/.env` from `.env.example` and add your Finnhub API key:

```env
FINNHUB_API_KEY=YOUR_FINNHUB_API_KEY
PORT=3000
```

Start it:

```bash
node server.js
```

### Frontend

Open a second terminal in the project root:

```bash
npx live-server --port=5500 .
```

Then open `http://127.0.0.1:5500`.

The frontend can still display demo prices if the backend/Finnhub service is unavailable.

## Main features

- Live quote integration through the local Node backend
- Yahoo Finance historical chart data through the backend
- 1D / 1W / 1M / 3M / 6M / 1Y ranges
- Persistent five-stock default watchlist
- Simulated Buy/Sell portfolio
- Transaction history
- Market movers
- Search
- Market news
- Dark mode
- Responsive sidebar
- Automatic 60-second refresh
