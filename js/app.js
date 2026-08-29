(() => {
  let selected = localStorage.getItem("stockflow_selected") || "AAPL";
  let range = localStorage.getItem("stockflow_range") || "1M";
  let tradeType = "BUY";
  let refreshTimer = null;
  let refreshing = false;

  const $ = id => document.getElementById(id);

  const money = n =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(Number(n) || 0);

  const pct = n =>
    `${Number(n) >= 0 ? "+" : ""}${(Number(n) || 0).toFixed(2)}%`;

  function toast(msg) {
    if (!$("toastText") || !$("toast")) return;

    $("toastText").textContent = msg;
    $("toast").classList.add("show");

    setTimeout(() => {
      $("toast").classList.remove("show");
    }, 2200);
  }


  /* =========================================================
     NAVIGATION
     ========================================================= */

  async function nav(section) {

    document
      .querySelectorAll(".page-section")
      .forEach(x => {
        x.classList.remove("active-section");
      });

    const target = $(section + "Section");

    if (target) {
      target.classList.add("active-section");
    }

    document
      .querySelectorAll(".nav-item[data-section]")
      .forEach(x => {
        x.classList.toggle(
          "active",
          x.dataset.section === section
        );
      });

    /*
     * Close mobile sidebar after selecting a page.
     */
    if ($("sidebar")) {
      $("sidebar").classList.remove("open");
    }

    try {

      if (section === "dashboard") {
        await selectStock(selected);
        await renderWatchlist();
        await renderHoldings();
        renderNews();
      }

      if (section === "markets") {
        await renderMarkets();
      }

      if (section === "watchlist") {
        await renderWatchlist();
      }

      if (section === "portfolio") {
        await renderHoldings();
      }

      if (section === "transactions") {
        renderTransactions();
      }

      if (section === "news") {
        renderNews();
      }

    } catch (error) {

      console.warn(
        `Navigation error (${section}):`,
        error.message
      );

      toast(
        `Unable to load ${section}`
      );
    }
  }


  /* =========================================================
     SELECT STOCK
     ========================================================= */

  async function selectStock(symbol) {

    selected =
      String(symbol || "AAPL")
        .trim()
        .toUpperCase();

    localStorage.setItem(
      "stockflow_selected",
      selected
    );

    const info =
      StockAPI.company(selected);

    try {

      const q =
        await StockAPI.quote(selected);

      if ($("selectedStockLogo")) {
        $("selectedStockLogo").textContent =
          selected[0] || "S";
      }

      if ($("selectedStockName")) {
        $("selectedStockName").textContent =
          info.name;
      }

      if ($("selectedStockSymbol")) {
        $("selectedStockSymbol").textContent =
          `${info.exchange}: ${selected}`;
      }

      if ($("selectedStockPrice")) {
        $("selectedStockPrice").textContent =
          money(q.price);
      }

      if ($("selectedStockChange")) {

        $("selectedStockChange").textContent =
          `${q.change >= 0 ? "+" : ""}` +
          `${q.change.toFixed(2)} ` +
          `(${pct(q.percent)})`;

        $("selectedStockChange").className =
          q.change >= 0
            ? "positive"
            : "negative";
      }

      /*
       * Render the chart only when the stock
       * is actually selected.
       *
       * The live refresh function below does NOT
       * recreate the chart.
       */
      if (
        window.StockChart &&
        typeof StockChart.render === "function"
      ) {

        await StockChart.render(
          selected,
          range
        );
      }

    } catch (error) {

      console.error(
        "Stock selection error:",
        error
      );

      toast(
        error.message ||
        `Unable to load ${selected}`
      );
    }
  }


  /* =========================================================
     WATCHLIST
     ========================================================= */

  async function renderWatchlist() {

    const list =
      StockWatchlist.get();

    if ($("watchlistCount")) {
      $("watchlistCount").textContent =
        list.length;
    }

    if (!list.length) {

      const empty =
        '<p class="muted">Your watchlist is empty.</p>';

      if ($("dashboardWatchlist")) {
        $("dashboardWatchlist").innerHTML =
          empty;
      }

      if ($("fullWatchlist")) {
        $("fullWatchlist").innerHTML =
          empty;
      }

      return;
    }


    const rows =
      await Promise.all(
        list.map(
          async s => {

            try {

              const q =
                await StockAPI.quote(s);

              const info =
                StockAPI.company(s);

              return `
                <div
                  class="watch-row"
                  data-symbol="${s}"
                >

                  <div>
                    <strong>${s}</strong>
                    <small>${info.name}</small>
                  </div>

                  <div class="watch-price">

                    <strong>
                      ${money(q.price)}
                    </strong>

                    <small
                      class="${
                        q.change >= 0
                          ? "positive"
                          : "negative"
                      }"
                    >
                      ${pct(q.percent)}
                    </small>

                  </div>

                  <button
                    class="star-btn"
                    data-remove="${s}"
                    title="Remove"
                  >
                    ★
                  </button>

                </div>
              `;

            } catch (error) {

              return `
                <div
                  class="watch-row"
                  data-symbol="${s}"
                >

                  <div>
                    <strong>${s}</strong>
                    <small>Unavailable</small>
                  </div>

                  <div class="watch-price">
                    <strong>—</strong>
                    <small class="muted">
                      Data unavailable
                    </small>
                  </div>

                  <button
                    class="star-btn"
                    data-remove="${s}"
                    title="Remove"
                  >
                    ★
                  </button>

                </div>
              `;
            }
          }
        )
      );


    const html =
      rows.join("");

    if ($("dashboardWatchlist")) {
      $("dashboardWatchlist").innerHTML =
        html;
    }

    if ($("fullWatchlist")) {
      $("fullWatchlist").innerHTML =
        html;
    }


    /*
     * Remove buttons.
     */

    document
      .querySelectorAll("[data-remove]")
      .forEach(button => {

        button.onclick =
          event => {

            event.preventDefault();
            event.stopPropagation();

            StockWatchlist.remove(
              button.dataset.remove
            );

            renderWatchlist();

            toast(
              "Removed from watchlist"
            );
          };
      });


    /*
     * Stock rows.
     */

    document
      .querySelectorAll(
        ".watch-row[data-symbol]"
      )
      .forEach(row => {

        row.onclick =
          event => {

            if (
              event.target.closest(
                "[data-remove]"
              )
            ) {
              return;
            }

            selectStock(
              row.dataset.symbol
            );

            nav("dashboard");
          };
      });
  }


  /* =========================================================
     HOLDINGS
     ========================================================= */

  async function renderHoldings() {

    const holdings =
      StockPortfolio.holdings();

    let total = 0;
    let invested = 0;
    let html = "";


    for (const h of holdings) {

      try {

        const q =
          await StockAPI.quote(
            h.symbol
          );

        const value =
          h.shares * q.price;

        const cost =
          h.shares * h.avg;

        const pl =
          value - cost;

        total += value;
        invested += cost;


        html += `
          <tr>

            <td>

              <div class="asset">

                <div class="asset-icon">
                  ${h.symbol[0]}
                </div>

                <div>

                  <strong>
                    ${h.symbol}
                  </strong>

                  <small>
                    ${StockAPI.company(h.symbol).name}
                  </small>

                </div>

              </div>

            </td>

            <td>${h.shares}</td>

            <td>${money(h.avg)}</td>

            <td>${money(q.price)}</td>

            <td>${money(value)}</td>

            <td
              class="${
                pl >= 0
                  ? "positive"
                  : "negative"
              }"
            >
              ${
                pct(
                  cost
                    ? (pl / cost) * 100
                    : 0
                )
              }
            </td>

          </tr>
        `;

      } catch (error) {

        console.warn(
          `Holding ${h.symbol} failed:`,
          error.message
        );
      }
    }


    const empty =
      '<tr><td colspan="6" class="muted">No holdings.</td></tr>';

    if ($("holdingsTableBody")) {
      $("holdingsTableBody").innerHTML =
        html || empty;
    }

    if ($("portfolioTableBody")) {
      $("portfolioTableBody").innerHTML =
        html || empty;
    }


    const cash =
      StockPortfolio.cash();

    const profit =
      total - invested;


    if ($("portfolioValue")) {
      $("portfolioValue").textContent =
        money(total + cash);
    }

    if ($("cashBalance")) {
      $("cashBalance").textContent =
        money(cash);
    }

    if ($("portfolioTotalValue")) {
      $("portfolioTotalValue").textContent =
        money(total + cash);
    }

    if ($("portfolioInvested")) {
      $("portfolioInvested").textContent =
        money(invested);
    }

    if ($("portfolioProfit")) {
      $("portfolioProfit").textContent =
        `${profit >= 0 ? "+" : "-"}${money(
          Math.abs(profit)
        )}`;
    }
  }


  /* =========================================================
     TRANSACTIONS
     ========================================================= */

  function renderTransactions() {

    const tx =
      StockPortfolio.transactions();

    if (!$("transactionsList")) {
      return;
    }


    $("transactionsList").innerHTML =
      tx.length

        ? tx.map(
            t => `
              <div class="transaction">

                <div>

                  <strong>
                    ${
                      t.type === "BUY"
                        ? "Bought"
                        : "Sold"
                    }
                    ${t.symbol}
                  </strong>

                  <small class="muted">
                    ${t.qty} shares · ${t.time}
                  </small>

                </div>

                <strong
                  class="${
                    t.type === "BUY"
                      ? "negative"
                      : "positive"
                  }"
                >
                  ${
                    t.type === "BUY"
                      ? "-"
                      : "+"
                  }${money(
                    t.qty * t.price
                  )}
                </strong>

              </div>
            `
          ).join("")

        : '<p class="muted">No transactions yet.</p>';
  }


  /* =========================================================
     NEWS
     ========================================================= */

  function renderNews() {

    const news =
      StockNews.get();

    const make =
      list =>
        list
          .map(
            n => `
              <article class="news-card">

                <small>
                  ${n.source} · ${n.time}
                </small>

                <h3>
                  ${n.title}
                </h3>

                <p>
                  ${n.summary}
                </p>

              </article>
            `
          )
          .join("");


    if ($("fullNews")) {
      $("fullNews").innerHTML =
        make(news);
    }

    if ($("dashboardNews")) {
      $("dashboardNews").innerHTML =
        make(news.slice(0, 3));
    }
  }


  /* =========================================================
     MARKETS
     ========================================================= */

  async function renderMarkets() {

    const container =
      $("marketMovers");

    if (!container) {
      return;
    }


    container.innerHTML =
      '<p class="muted">Loading market data...</p>';


    const syms = [
      "AAPL",
      "MSFT",
      "NVDA",
      "TSLA",
      "AMZN",
      "GOOGL",
      "META",
      "NFLX"
    ];


    try {

      const results =
        await Promise.allSettled(
          syms.map(
            s => StockAPI.quote(s)
          )
        );


      const quotes =
        results
          .filter(
            x =>
              x.status ===
              "fulfilled"
          )
          .map(
            x => x.value
          );


      if (!quotes.length) {

        throw new Error(
          "No market data available."
        );
      }


      container.innerHTML =
        quotes
          .map(
            q => `
              <article class="mover">

                <div class="mover-head">

                  <strong>
                    ${q.symbol}
                  </strong>

                  <span
                    class="${
                      q.change >= 0
                        ? "positive"
                        : "negative"
                    }"
                  >
                    ${pct(q.percent)}
                  </span>

                </div>

                <strong>
                  ${money(q.price)}
                </strong>

                <small class="muted">
                  ${StockAPI.company(q.symbol).name}
                </small>

              </article>
            `
          )
          .join("");


    } catch (error) {

      container.innerHTML =
        `
          <p class="muted">
            Unable to load market data:
            ${error.message}
          </p>
        `;
    }
  }


  /* =========================================================
     TRADE
     ========================================================= */

  function openTrade(symbol = selected) {

    if (!$("tradeSymbol")) {
      return;
    }

    $("tradeSymbol").value =
      symbol;

    $("tradeQuantity").value =
      $("tradeQuantity").value || 1;

    $("tradeModal").classList.remove(
      "hidden"
    );

    updateTradePrice();
  }


  async function updateTradePrice() {

    const s =
      $("tradeSymbol")
        ?.value
        .trim()
        .toUpperCase();

    if (!s) {
      return;
    }


    try {

      const q =
        await StockAPI.quote(s);

      const qty =
        Number(
          $("tradeQuantity").value
        ) || 0;

      $("tradePrice").textContent =
        money(q.price);

      $("tradeTotal").textContent =
        money(q.price * qty);

    } catch (error) {

      if ($("tradePrice")) {
        $("tradePrice").textContent =
          "Unavailable";
      }

      if ($("tradeTotal")) {
        $("tradeTotal").textContent =
          "—";
      }
    }
  }


  /* =========================================================
     THEME
     ========================================================= */

  function initTheme() {

    const dark =
      localStorage.getItem(
        "stockflow_theme"
      ) === "dark";

    document.body.classList.toggle(
      "dark",
      dark
    );

    if ($("settingsThemeToggle")) {
      $("settingsThemeToggle").checked =
        dark;
    }

    if (
      $("themeToggle") &&
      $("themeToggle").querySelector("span")
    ) {

      $("themeToggle")
        .querySelector("span")
        .textContent =
          dark
            ? "Light Mode"
            : "Dark Mode";
    }
  }


  /* =========================================================
     NAVIGATION + SIDEBAR
     ========================================================= */

  function setupNavigation() {

    /*
     * Main navigation buttons.
     */

    document
      .querySelectorAll(
        ".nav-item[data-section]"
      )
      .forEach(button => {

        button.onclick =
          event => {

            event.preventDefault();

            nav(
              button.dataset.section
            );
          };
      });


    /*
     * Sidebar hamburger.
     */

    const sidebar =
      $("sidebar");

    const sidebarToggle =
      $("sidebarToggle");


    if (
      sidebar &&
      sidebarToggle
    ) {

      sidebarToggle.onclick =
        event => {

          event.preventDefault();
          event.stopPropagation();

          sidebar.classList.toggle(
            "open"
          );

        };
    }


    /*
     * Close sidebar when clicking outside it.
     */

    document.addEventListener(
      "click",
      event => {

        if (
          !sidebar ||
          !sidebar.classList.contains("open")
        ) {
          return;
        }


        if (
          event.target.closest(
            "#sidebar"
          ) ||
          event.target.closest(
            "#sidebarToggle"
          )
        ) {
          return;
        }


        sidebar.classList.remove(
          "open"
        );
      }
    );
  }


  /* =========================================================
     THEME CONTROLS
     ========================================================= */

  function setupTheme() {

    if ($("themeToggle")) {

      $("themeToggle").onclick =
        () => {

          const dark =
            !document.body.classList.contains(
              "dark"
            );

          document.body.classList.toggle(
            "dark",
            dark
          );

          localStorage.setItem(
            "stockflow_theme",
            dark
              ? "dark"
              : "light"
          );


          if ($("settingsThemeToggle")) {
            $("settingsThemeToggle").checked =
              dark;
          }


          const span =
            $("themeToggle")
              .querySelector("span");

          if (span) {
            span.textContent =
              dark
                ? "Light Mode"
                : "Dark Mode";
          }
        };
    }


    if ($("settingsThemeToggle")) {

      $("settingsThemeToggle").onchange =
        event => {

          const dark =
            event.target.checked;

          document.body.classList.toggle(
            "dark",
            dark
          );

          localStorage.setItem(
            "stockflow_theme",
            dark
              ? "dark"
              : "light"
          );


          if ($("themeToggle")) {

            const span =
              $("themeToggle")
                .querySelector("span");

            if (span) {
              span.textContent =
                dark
                  ? "Light Mode"
                  : "Dark Mode";
            }
          }
        };
    }
  }


  /* =========================================================
     WATCHLIST CONTROLS
     ========================================================= */

  function setupWatchlist() {

    if (
      $("addStockButton") &&
      $("watchlistAddButton")
    ) {

      const openModal =
        () => {

          if ($("stockModal")) {
            $("stockModal")
              .classList
              .remove("hidden");
          }
        };

      $("addStockButton").onclick =
        openModal;

      $("watchlistAddButton").onclick =
        openModal;
    }


    if ($("closeStockModal")) {

      $("closeStockModal").onclick =
        () => {

          $("stockModal")
            ?.classList
            .add("hidden");
        };
    }


    if ($("addStockForm")) {

      $("addStockForm").onsubmit =
        event => {

          event.preventDefault();

          const s =
            $("newStockSymbol")
              .value
              .trim()
              .toUpperCase();

          if (!s) {
            return;
          }


          if (
            StockWatchlist.add(s)
          ) {

            $("newStockSymbol")
              .value = "";

            $("stockModal")
              .classList
              .add("hidden");

            renderWatchlist();

            toast(
              `${s} added to watchlist`
            );

          } else {

            toast(
              "Stock already in watchlist"
            );
          }
        };
    }
  }


  /* =========================================================
     TRADING CONTROLS
     ========================================================= */

  function setupTrading() {

    if ($("portfolioTradeButton")) {

      $("portfolioTradeButton").onclick =
        () => openTrade();
    }


    if ($("closeTradeModal")) {

      $("closeTradeModal").onclick =
        () => {

          $("tradeModal")
            ?.classList
            .add("hidden");
        };
    }


    if ($("buyTab")) {

      $("buyTab").onclick =
        () => {

          tradeType = "BUY";

          $("buyTab")
            .classList
            .add("active");

          $("sellTab")
            ?.classList
            .remove("active");

          if ($("confirmTrade")) {
            $("confirmTrade")
              .textContent =
              "Confirm Buy";
          }
        };
    }


    if ($("sellTab")) {

      $("sellTab").onclick =
        () => {

          tradeType = "SELL";

          $("sellTab")
            .classList
            .add("active");

          $("buyTab")
            ?.classList
            .remove("active");

          if ($("confirmTrade")) {
            $("confirmTrade")
              .textContent =
              "Confirm Sell";
          }
        };
    }


    if ($("tradeSymbol")) {
      $("tradeSymbol").oninput =
        updateTradePrice;
    }

    if ($("tradeQuantity")) {
      $("tradeQuantity").oninput =
        updateTradePrice;
    }


    if ($("tradeForm")) {

      $("tradeForm").onsubmit =
        async event => {

          event.preventDefault();

          try {

            const s =
              $("tradeSymbol")
                .value
                .trim()
                .toUpperCase();

            const qty =
              Number(
                $("tradeQuantity").value
              );


            if (!qty || qty <= 0) {
              throw new Error(
                "Enter a valid quantity"
              );
            }


            const q =
              await StockAPI.quote(s);


            StockPortfolio.trade(
              s,
              qty,
              q.price,
              tradeType
            );


            $("tradeModal")
              .classList
              .add("hidden");


            toast(
              `${tradeType} order completed`
            );


            await renderHoldings();

            renderTransactions();

          } catch (error) {

            toast(
              error.message
            );
          }
        };
    }
  }


  /* =========================================================
     CHART
     ========================================================= */

  function setupChart() {

    document
      .querySelectorAll(
        ".ranges button"
      )
      .forEach(button => {

        button.onclick =
          async event => {

            event.preventDefault();

            document
              .querySelectorAll(
                ".ranges button"
              )
              .forEach(x => {
                x.classList.remove(
                  "active"
                );
              });


            button.classList.add(
              "active"
            );


            range =
              button.dataset.range;


            localStorage.setItem(
              "stockflow_range",
              range
            );


            if (
              window.StockChart &&
              typeof StockChart.render ===
                "function"
            ) {

              await StockChart.render(
                selected,
                range
              );
            }
          };
      });
  }


  /* =========================================================
     SEARCH
     ========================================================= */

  function setupSearch() {

    if (!$("stockSearch")) {
      return;
    }


    $("stockSearch").oninput =
      async event => {

        const term =
          event.target.value
            .trim()
            .toUpperCase();

        const box =
          $("searchResults");


        if (!box) {
          return;
        }


        if (!term) {

          box.classList.remove(
            "show"
          );

          box.innerHTML = "";

          return;
        }


        try {

          const matches =
            await StockAPI.search(term);


          box.innerHTML =
            matches
              .slice(0, 6)
              .map(
                item => `
                  <div
                    class="search-result"
                    data-search="${item.symbol}"
                  >

                    <strong>
                      ${item.symbol}
                    </strong>

                    <span>
                      ${item.description}
                    </span>

                  </div>
                `
              )
              .join("");


          box.classList.toggle(
            "show",
            matches.length > 0
          );


          box
            .querySelectorAll(
              "[data-search]"
            )
            .forEach(x => {

              x.onclick =
                async () => {

                  box.classList.remove(
                    "show"
                  );

                  event.target.value =
                    "";

                  await selectStock(
                    x.dataset.search
                  );

                  await nav(
                    "dashboard"
                  );
                };
            });

        } catch (error) {

          console.warn(
            "Search failed:",
            error.message
          );

          box.classList.remove(
            "show"
          );
        }
      };
  }


  /* =========================================================
     MISC BUTTONS
     ========================================================= */

  function setupMisc() {

    if ($("viewWatchlist")) {
      $("viewWatchlist").onclick =
        event => {
          event.preventDefault();
          nav("watchlist");
        };
    }


    if ($("viewPortfolio")) {
      $("viewPortfolio").onclick =
        event => {
          event.preventDefault();
          nav("portfolio");
        };
    }


    if ($("viewNews")) {
      $("viewNews").onclick =
        event => {
          event.preventDefault();
          nav("news");
        };
    }


    if ($("notificationButton")) {
      $("notificationButton").onclick =
        () => {
          toast(
            "No new market alerts"
          );
        };
    }


    if ($("refreshNews")) {
      $("refreshNews").onclick =
        () => {

          renderNews();

          toast(
            "News refreshed"
          );
        };
    }


    if ($("refreshDashboard")) {

      $("refreshDashboard").onclick =
        async event => {

          event.preventDefault();

          if (refreshing) {
            return;
          }

          try {

            refreshing = true;

            await refreshLive();

            toast(
              "Dashboard refreshed"
            );

          } finally {

            refreshing = false;
          }
        };
    }
  }


  /* =========================================================
     LIVE REFRESH
     ========================================================= */

  async function refreshLive() {

    /*
     * Prevent overlapping refresh requests.
     */

    if (refreshing) {
      return;
    }


    refreshing = true;


    try {

      /*
       * IMPORTANT:
       *
       * We do NOT call:
       *
       * location.reload()
       * window.location.reload()
       * StockChart.render()
       *
       * here.
       *
       * This prevents the screen/chart from constantly
       * rebuilding.
       */

      if (
        $("dashboardSection") &&
        $("dashboardSection")
          .classList
          .contains("active-section")
      ) {

        await renderWatchlist();

        await renderHoldings();


        /*
         * Update only the selected stock's
         * price/change.
         */

        try {

          const q =
            await StockAPI.quote(
              selected
            );


          if ($("selectedStockPrice")) {
            $("selectedStockPrice")
              .textContent =
              money(q.price);
          }


          if ($("selectedStockChange")) {

            $("selectedStockChange")
              .textContent =
              `${q.change >= 0 ? "+" : ""}` +
              `${q.change.toFixed(2)} ` +
              `(${pct(q.percent)})`;

            $("selectedStockChange")
              .className =
              q.change >= 0
                ? "positive"
                : "negative";
          }

        } catch (error) {

          console.warn(
            "Selected stock refresh failed:",
            error.message
          );
        }
      }


      if (
        $("marketsSection") &&
        $("marketsSection")
          .classList
          .contains("active-section")
      ) {

        await renderMarkets();
      }


      /*
       * The chart.js file has its own live-price
       * update timer. We intentionally don't recreate
       * the chart here.
       */

    } catch (error) {

      console.warn(
        "Live refresh failed:",
        error.message
      );

    } finally {

      refreshing = false;
    }
  }


  /* =========================================================
     INITIALIZATION
     ========================================================= */

  async function init() {

    selected =
      localStorage.getItem(
        "stockflow_selected"
      ) || "AAPL";


    range =
      localStorage.getItem(
        "stockflow_range"
      ) || "1M";


    /*
     * Setup controls first.
     */

    setupNavigation();

    setupTheme();

    setupWatchlist();

    setupTrading();

    setupChart();

    setupSearch();

    setupMisc();

    initTheme();


    /*
     * Render local content.
     */

    renderNews();


    /*
     * Load dashboard data.
     */

    await renderWatchlist();

    await renderHoldings();

    await selectStock(
      selected
    );


    /*
     * One background refresh every 60 seconds.
     *
     * This does NOT reload the browser.
     */

    if (refreshTimer) {
      clearInterval(
        refreshTimer
      );
    }


    refreshTimer =
      setInterval(
        () => {
          refreshLive();
        },
        60000
      );
  }


  /* =========================================================
     START
     ========================================================= */

  init().catch(
    error => {

      console.error(
        "StockFlow initialization error:",
        error
      );

      toast(
        "Some market data could not be loaded"
      );
    }
  );

})();