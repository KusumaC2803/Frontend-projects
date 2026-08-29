"use strict";

window.StockChart = (() => {

  let chart = null;
  let series = null;

  let resizeHandler = null;
  let liveTimer = null;

  let currentSymbol = "AAPL";
  let currentRange = "1M";

  let lastCandle = null;


  /* =========================================================
     HELPERS
     ========================================================= */

  function getElement(id) {
    return document.getElementById(id);
  }


  function showLoading(text) {

    const loading =
      getElement("chartLoading");

    if (loading) {
      loading.textContent = text;
    }
  }


  function showError(message) {

    const errorBox =
      getElement("chartError");

    if (!errorBox) return;

    errorBox.textContent =
      `Unable to load chart — ${message}`;

    errorBox.classList.remove("hidden");
  }


  function clearError() {

    const errorBox =
      getElement("chartError");

    if (!errorBox) return;

    errorBox.textContent = "";

    errorBox.classList.add("hidden");
  }


  /* =========================================================
     GET LIVE QUOTE
     ========================================================= */

  async function getLiveQuote(symbol) {

    /*
     * Use the existing StockAPI from api.js.
     */

    if (
      window.StockAPI &&
      typeof StockAPI.quote === "function"
    ) {

      return await StockAPI.quote(symbol);
    }


    /*
     * Fallback directly to your backend.
     */

    const response =
      await fetch(
        `http://localhost:3000/api/quote/${encodeURIComponent(symbol)}`,
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        `Quote request failed: ${response.status}`
      );
    }


    const data =
      await response.json();


    return {

      price:
        Number(
          data.price ??
          data.c ??
          0
        ),

      change:
        Number(
          data.change ??
          data.d ??
          0
        ),

      percent:
        Number(
          data.percent ??
          data.dp ??
          0
        )
    };
  }


  /* =========================================================
     UPDATE LIVE PRICE DISPLAY
     ========================================================= */

  function updateLiveDisplay(quote) {

    const price =
      Number(
        quote.price ??
        quote.c ??
        0
      );


    const change =
      Number(
        quote.change ??
        quote.d ??
        0
      );


    const percent =
      Number(
        quote.percent ??
        quote.dp ??
        0
      );


    /*
     * Update chart price if those elements exist.
     */

    const chartPrice =
      getElement("chartCurrentPrice");

    if (chartPrice && price > 0) {

      chartPrice.textContent =
        `$${price.toFixed(2)}`;
    }


    const chartChange =
      getElement("chartPriceChange");

    if (chartChange) {

      const sign =
        change >= 0
          ? "+"
          : "";

      const percentSign =
        percent >= 0
          ? "+"
          : "";

      chartChange.textContent =
        `${sign}${change.toFixed(2)} ` +
        `(${percentSign}${percent.toFixed(2)}%)`;

      chartChange.className =
        change >= 0
          ? "positive"
          : "negative";
    }


    /*
     * Also update the existing StockFlow
     * selected stock elements.
     */

    const selectedPrice =
      getElement("selectedStockPrice");

    if (
      selectedPrice &&
      price > 0
    ) {

      selectedPrice.textContent =
        new Intl.NumberFormat(
          "en-US",
          {
            style: "currency",
            currency: "USD"
          }
        ).format(price);
    }


    const selectedChange =
      getElement("selectedStockChange");

    if (selectedChange) {

      const sign =
        change >= 0
          ? "+"
          : "";

      const percentSign =
        percent >= 0
          ? "+"
          : "";

      selectedChange.textContent =
        `${sign}${change.toFixed(2)} ` +
        `(${percentSign}${percent.toFixed(2)}%)`;

      selectedChange.className =
        change >= 0
          ? "positive"
          : "negative";
    }
  }


  /* =========================================================
     UPDATE CHART WITH LIVE PRICE
     ========================================================= */

  async function updateLiveChart() {

    if (
      !chart ||
      !series ||
      !currentSymbol
    ) {
      return;
    }


    try {

      const quote =
        await getLiveQuote(
          currentSymbol
        );


      const price =
        Number(
          quote.price ??
          quote.c ??
          0
        );


      if (
        !Number.isFinite(price) ||
        price <= 0
      ) {

        console.warn(
          "Invalid live price:",
          quote
        );

        return;
      }


      updateLiveDisplay(
        quote
      );


      /*
       * IMPORTANT:
       *
       * We update the CURRENT candle instead of
       * recreating the complete chart.
       *
       * This makes the graph actually move.
       */

      const now =
        Math.floor(
          Date.now() / 1000
        );


      /*
       * For intraday charts, keep updating the
       * current time position.
       *
       * For longer ranges, create a new point
       * occasionally so the chart visibly changes.
       */

      let candleTime;


      if (
        currentRange === "1D"
      ) {

        /*
         * 5-minute bucket.
         */

        candleTime =
          Math.floor(
            now / 300
          ) * 300;

      } else {

        /*
         * Use today's timestamp for longer
         * ranges.
         */

        candleTime =
          Math.floor(
            now / 86400
          ) * 86400;
      }


      /*
       * If we already have a candle for this time,
       * update it.
       */

      if (
        lastCandle &&
        lastCandle.time === candleTime
      ) {

        lastCandle.high =
          Math.max(
            lastCandle.high,
            price
          );

        lastCandle.low =
          Math.min(
            lastCandle.low,
            price
          );

        lastCandle.close =
          price;


        series.update({
          time:
            lastCandle.time,

          open:
            lastCandle.open,

          high:
            lastCandle.high,

          low:
            lastCandle.low,

          close:
            lastCandle.close
        });


      } else {

        /*
         * Create a new live candle.
         */

        const open =
          lastCandle
            ? lastCandle.close
            : price;


        lastCandle = {

          time:
            candleTime,

          open:
            open,

          high:
            Math.max(
              open,
              price
            ),

          low:
            Math.min(
              open,
              price
            ),

          close:
            price
        };


        series.update(
          lastCandle
        );
      }


      /*
       * Keep the newest point visible.
       */

      chart
        .timeScale()
        .scrollToRealTime();


      console.log(
        `Live chart update: ${currentSymbol} $${price.toFixed(2)}`
      );


    } catch (error) {

      console.warn(
        "Live chart update failed:",
        error.message
      );
    }
  }


  /* =========================================================
     START LIVE UPDATES
     ========================================================= */

  function startLiveUpdates() {

    stopLiveUpdates();


    /*
     * Update immediately.
     */

    updateLiveChart();


    /*
     * Update every 10 seconds.
     *
     * This makes the graph visibly responsive.
     */

    liveTimer =
      setInterval(
        updateLiveChart,
        10000
      );


    console.log(
      "StockFlow live chart started."
    );
  }


  /* =========================================================
     STOP LIVE UPDATES
     ========================================================= */

  function stopLiveUpdates() {

    if (liveTimer) {

      clearInterval(
        liveTimer
      );

      liveTimer =
        null;
    }
  }


  /* =========================================================
     RENDER CHART
     ========================================================= */

  async function render(
    symbol = "AAPL",
    range = "1M"
  ) {

    const el =
      getElement(
        "chartContainer"
      );

    const errorBox =
      getElement(
        "chartError"
      );


    if (
      !el ||
      !window.LightweightCharts
    ) {

      console.error(
        "Chart container or LightweightCharts missing."
      );

      return;
    }


    currentSymbol =
      String(symbol)
        .trim()
        .toUpperCase();

    currentRange =
      String(range)
        .trim()
        .toUpperCase();


    /*
     * Stop old timer before rebuilding.
     */

    stopLiveUpdates();


    /*
     * Reset last candle.
     */

    lastCandle =
      null;


    showLoading(
      "Loading chart..."
    );

    clearError();


    /*
     * Remove old resize handler.
     */

    if (resizeHandler) {

      window.removeEventListener(
        "resize",
        resizeHandler
      );

      resizeHandler =
        null;
    }


    /*
     * Remove old chart.
     */

    if (chart) {

      chart.remove();

      chart =
        null;

      series =
        null;
    }


    el.innerHTML =
      "";


    try {

      /* -----------------------------------------------------
         CREATE CHART
         ----------------------------------------------------- */

      chart =
        LightweightCharts.createChart(
          el,
          {

            width:
              el.clientWidth,

            height:
              330,

            layout: {

              background: {
                color:
                  "transparent"
              },

              textColor:
                getComputedStyle(
                  document.body
                )
                  .getPropertyValue(
                    "--muted"
                  ) ||
                "#64748b"
            },


            grid: {

              vertLines: {
                visible:
                  false
              },

              horzLines: {
                color:
                  "rgba(120,130,150,.12)"
              }
            },


            rightPriceScale: {

              borderVisible:
                false,

              autoScale:
                true
            },


            timeScale: {

              borderVisible:
                false,

              timeVisible:
                currentRange === "1D",

              secondsVisible:
                false,

              rightOffset:
                5
            }
          }
        );


      /* -----------------------------------------------------
         CANDLESTICK SERIES
         ----------------------------------------------------- */

      const candleOptions = {

        upColor:
          "#16a34a",

        downColor:
          "#dc3545",

        borderUpColor:
          "#16a34a",

        borderDownColor:
          "#dc3545",

        wickUpColor:
          "#16a34a",

        wickDownColor:
          "#dc3545"
      };


      if (
        typeof chart.addCandlestickSeries ===
        "function"
      ) {

        series =
          chart.addCandlestickSeries(
            candleOptions
          );

      } else {

        series =
          chart.addSeries(
            LightweightCharts.CandlestickSeries,
            candleOptions
          );
      }


      /* -----------------------------------------------------
         LOAD HISTORICAL DATA
         ----------------------------------------------------- */

      const data =
        await StockAPI.candles(
          currentSymbol,
          currentRange
        );


      if (
        !Array.isArray(data) ||
        !data.length
      ) {

        throw new Error(
          "No historical data available."
        );
      }


      const normalized =
        data
          .map(x => ({

            time:
              Number(
                x.time
              ),

            open:
              Number(
                x.open
              ),

            high:
              Number(
                x.high
              ),

            low:
              Number(
                x.low
              ),

            close:
              Number(
                x.close
              )
          }))


          .filter(x =>

            Number.isFinite(
              x.time
            ) &&

            Number.isFinite(
              x.open
            ) &&

            Number.isFinite(
              x.high
            ) &&

            Number.isFinite(
              x.low
            ) &&

            Number.isFinite(
              x.close
            ) &&

            x.open > 0 &&
            x.high > 0 &&
            x.low > 0 &&
            x.close > 0
          )


          .sort(
            (a, b) =>
              a.time - b.time
          );


      if (!normalized.length) {

        throw new Error(
          "Historical data is invalid."
        );
      }


      /* -----------------------------------------------------
         REMOVE DUPLICATE TIMES
         ----------------------------------------------------- */

      const unique = [];

      const seen =
        new Set();


      for (
        const item of normalized
      ) {

        if (
          seen.has(
            item.time
          )
        ) {
          continue;
        }

        seen.add(
          item.time
        );

        unique.push(
          item
        );
      }


      /* -----------------------------------------------------
         SET HISTORICAL DATA
         ----------------------------------------------------- */

      series.setData(
        unique
      );


      /*
       * Keep the last historical candle.
       */

      const lastHistorical =
        unique[
          unique.length - 1
        ];


      if (lastHistorical) {

        lastCandle = {
          ...lastHistorical
        };
      }


      chart
        .timeScale()
        .fitContent();


      /* -----------------------------------------------------
         RESIZE
         ----------------------------------------------------- */

      resizeHandler =
        () => {

          if (!chart) {
            return;
          }

          chart.applyOptions({

            width:
              el.clientWidth
          });
        };


      window.addEventListener(
        "resize",
        resizeHandler
      );


      /* -----------------------------------------------------
         INITIAL LIVE PRICE
         ----------------------------------------------------- */

      try {

        const quote =
          await getLiveQuote(
            currentSymbol
          );

        updateLiveDisplay(
          quote
        );

        /*
         * Update the current candle
         * immediately with the live price.
         */

        const price =
          Number(
            quote.price ??
            quote.c ??
            0
          );


        if (
          Number.isFinite(price) &&
          price > 0 &&
          lastCandle
        ) {

          lastCandle.high =
            Math.max(
              lastCandle.high,
              price
            );

          lastCandle.low =
            Math.min(
              lastCandle.low,
              price
            );

          lastCandle.close =
            price;


          series.update(
            lastCandle
          );
        }

      } catch (error) {

        console.warn(
          "Initial live quote failed:",
          error.message
        );
      }


      /* -----------------------------------------------------
         START CONTINUOUS LIVE UPDATES
         ----------------------------------------------------- */

      startLiveUpdates();


      showLoading(
        "Live"
      );


      console.log(
        `Chart ready: ${currentSymbol} ${currentRange}`
      );


    } catch (error) {

      console.error(
        "Chart error:",
        error
      );


      showLoading(
        "Chart unavailable"
      );


      showError(
        error.message
      );
    }
  }


  /* =========================================================
     DESTROY
     ========================================================= */

  function destroy() {

    stopLiveUpdates();


    if (resizeHandler) {

      window.removeEventListener(
        "resize",
        resizeHandler
      );

      resizeHandler =
        null;
    }


    if (chart) {

      chart.remove();

      chart =
        null;
    }


    series =
      null;

    lastCandle =
      null;
  }


  /* =========================================================
     MANUAL LIVE REFRESH
     ========================================================= */

  async function refreshLivePrice() {

    await updateLiveChart();
  }


  /* =========================================================
     PUBLIC API
     ========================================================= */

  return {

    render,

    destroy,

    refreshLivePrice

  };

})();