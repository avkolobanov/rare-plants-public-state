(function () {
  "use strict";

  var API_URL =
    "https://script.google.com/macros/s/AKfycbwqjj6hFQ3PGNNMeAXgLBWj5Nq6yAQh65XbR4JKlqV_7wuqPGtUIhJnavZAXv96rgyI0w/exec";

  var PUBLIC_STATE_URL =
    "https://avkolobanov.github.io/rare-plants-public-state/state";

  var PUBLIC_STATE_PILOT_AUCTION_ID =
    "A009";

  var ROOT_ID =
    "plant-auction-universal";

  var LEGACY_APP_ID =
    "plant-auction-app";

  var LEGACY_GALLERY_RECORD =
    "rec4222882201";

  function escapeHtml(value) {
    return String(
      value === null ||
      value === undefined
        ? ""
        : value
    )
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function money(value) {
    var number =
      Number(value);

    if (!isFinite(number)) {
      return "—";
    }

    return new Intl.NumberFormat(
      "ru-RU"
    ).format(number) + " ₽";
  }


  function publicImageUrl(photo) {
    if (!photo) {
      return "";
    }

    var id =
      String(
        photo.id || ""
      ).trim();

    if (!id) {
      var source =
        String(
          photo.url || ""
        );

      var match =
        source.match(
          /[?&]id=([^&]+)/i
        );

      if (match) {
        try {
          id =
            decodeURIComponent(
              match[1]
            );
        } catch (error) {
          id =
            match[1];
        }
      }
    }

    if (
      id &&
      /^[A-Za-z0-9_-]+$/.test(
        id
      )
    ) {
      return (
        "https://lh3.googleusercontent.com/d/" +
        id +
        "=w1600"
      );
    }

    return String(
      photo.url || ""
    );
  }

  function formatDate(value, timezone) {
    if (!value) {
      return "—";
    }

    var date =
      new Date(value);

    if (
      isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    try {
      return new Intl.DateTimeFormat(
        "ru-RU",
        {
          timeZone:
            timezone ||
            "Europe/Moscow",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }
      ).format(date);

    } catch (error) {
      return date.toLocaleString(
        "ru-RU"
      );
    }
  }

  function statusLabel(status) {
    if (status === "active") {
      return "Идёт сейчас";
    }

    if (status === "upcoming") {
      return "Скоро";
    }

    if (status === "archive") {
      return "Завершён";
    }

    return status || "Аукцион";
  }

  function injectStyles() {
    if (
      document.getElementById(
        "plant-auction-universal-styles"
      )
    ) {
      return;
    }

    var style =
      document.createElement(
        "style"
      );

    style.id =
      "plant-auction-universal-styles";

    style.textContent =
      [
        "#" + ROOT_ID + "{max-width:1100px;margin:0 auto;padding:20px 20px 32px;font-family:Arial,sans-serif;color:#222;}",
        "#" + ROOT_ID + " *{box-sizing:border-box;}",
        ".pau-loading,.pau-error,.pau-empty{padding:22px;border:1px solid #ddd;border-radius:16px;background:#fff;text-align:center;}",
        ".pau-error{color:#8c1f1f;background:#fff5f5;border-color:#f0cccc;}",
        ".pau-section{margin-bottom:34px;}",
        ".pau-section-title{margin:0 0 16px;font-size:26px;line-height:1.2;}",
        ".pau-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;}",
        ".pau-card{display:flex;flex-direction:column;overflow:hidden;border:1px solid #ddd;border-radius:18px;background:#fff;color:inherit!important;text-decoration:none!important;}",
        ".pau-card-image-wrap{position:relative;width:100%;aspect-ratio:4/3;overflow:hidden;background:#f1f1f1;}",
        ".pau-card-image{width:100%;height:100%;object-fit:cover;display:block;}",
        ".pau-card-no-image{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#888;font-size:13px;}",
        ".pau-badge{position:absolute;left:12px;top:12px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.94);font-size:12px;font-weight:700;}",
        ".pau-card-body{display:flex;flex:1;flex-direction:column;padding:16px;}",
        ".pau-card-title{margin:0 0 6px;font-size:20px;line-height:1.2;}",
        ".pau-card-id{margin-bottom:12px;color:#888;font-size:12px;}",
        ".pau-card-description{margin-bottom:14px;color:#555;font-size:14px;line-height:1.45;}",
        ".pau-meta{margin-top:auto;padding-top:10px;border-top:1px solid #eee;color:#555;font-size:13px;line-height:1.55;}",
        ".pau-meta-row{display:flex;justify-content:space-between;gap:12px;}",
        ".pau-meta-row span:last-child{text-align:right;font-weight:600;}",
        ".pau-open{margin-top:14px;font-weight:700;}",
        ".pau-detail{margin-bottom:28px;}",
        ".pau-detail-head{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:24px;align-items:start;}",
        ".pau-main-photo{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:18px;background:#f1f1f1;display:block;}",
        ".pau-main-photo-empty{display:flex;align-items:center;justify-content:center;width:100%;aspect-ratio:4/3;border-radius:18px;background:#f1f1f1;color:#888;}",
        ".pau-thumbs{display:flex;gap:8px;overflow-x:auto;padding-top:8px;}",
        ".pau-thumb{width:78px;height:58px;object-fit:cover;border-radius:9px;border:1px solid #ddd;cursor:pointer;flex:0 0 auto;}",
        ".pau-detail-info{padding:6px 0;}",
        ".pau-back{display:inline-block;margin-bottom:14px;color:inherit!important;text-decoration:none!important;font-size:14px;font-weight:600;}",
        ".pau-title{margin:0 0 8px;font-size:32px;line-height:1.15;}",
        ".pau-subtitle{margin:0 0 16px;color:#777;font-size:13px;}",
        ".pau-status{display:inline-block;margin-bottom:16px;padding:7px 10px;border-radius:999px;background:#f2f2f2;font-size:12px;font-weight:700;}",
        ".pau-description{margin:0 0 18px;color:#444;font-size:15px;line-height:1.55;white-space:pre-line;}",
        ".pau-info-row{display:flex;justify-content:space-between;gap:16px;padding:8px 0;border-top:1px solid #eee;font-size:14px;}",
        ".pau-info-row strong{text-align:right;}",
        ".pau-lots{margin-top:28px;}",
        ".pau-lots-title{margin:0 0 14px;font-size:24px;}",
        ".pau-lot{display:grid;grid-template-columns:120px 1fr;gap:16px;padding:14px 0;border-top:1px solid #eee;}",
        ".pau-lot-photo{width:120px;height:90px;object-fit:cover;border-radius:12px;background:#f1f1f1;}",
        ".pau-lot-photo-empty{width:120px;height:90px;display:flex;align-items:center;justify-content:center;border-radius:12px;background:#f1f1f1;color:#888;font-size:12px;}",
        ".pau-lot-title{font-weight:700;margin-bottom:5px;}",
        ".pau-lot-desc{color:#666;font-size:13px;line-height:1.45;margin-bottom:6px;}",
        ".pau-lot-price{font-size:14px;line-height:1.5;}",
        ".pau-legacy-note{margin:26px 0 8px;color:#777;font-size:13px;}",
        "@media(max-width:900px){.pau-grid{grid-template-columns:repeat(2,minmax(0,1fr));}.pau-detail-head{grid-template-columns:1fr;}}",
        "@media(max-width:620px){#" + ROOT_ID + "{padding-left:14px;padding-right:14px;}.pau-grid{grid-template-columns:1fr;}.pau-section-title{font-size:23px;}.pau-title{font-size:27px;}.pau-lot{grid-template-columns:90px 1fr;}.pau-lot-photo,.pau-lot-photo-empty{width:90px;height:70px;}}"
      ].join("");

    document.head
      .appendChild(style);
  }

  function getRoot() {
    var root =
      document.getElementById(
        ROOT_ID
      );

    if (root) {
      return root;
    }

    root =
      document.createElement(
        "div"
      );

    root.id =
      ROOT_ID;

    var legacy =
      document.getElementById(
        LEGACY_APP_ID
      );

    if (
      legacy &&
      legacy.parentNode
    ) {
      legacy.parentNode
        .insertBefore(
          root,
          legacy
        );
    } else {
      document.body
        .appendChild(root);
    }

    return root;
  }

  function jsonp(params, onSuccess, onError) {
    var callbackName =
      "__pau_" +
      Date.now() +
      "_" +
      Math.floor(
        Math.random() *
        100000
      );

    var script =
      document.createElement(
        "script"
      );

    var done =
      false;

    function cleanup() {
      if (done) {
        return;
      }

      done =
        true;

      try {
        delete window[
          callbackName
        ];
      } catch (error) {
        window[
          callbackName
        ] =
          undefined;
      }

      if (
        script.parentNode
      ) {
        script.parentNode
          .removeChild(script);
      }
    }

    window[
      callbackName
    ] =
      function(data) {
        cleanup();
        onSuccess(data);
      };

    script.onerror =
      function() {
        cleanup();

        if (onError) {
          onError(
            new Error(
              "Не удалось загрузить данные."
            )
          );
        }
      };

    var query = [];

    Object.keys(
      params || {}
    ).forEach(
      function(key) {
        query.push(
          encodeURIComponent(key) +
          "=" +
          encodeURIComponent(
            params[key]
          )
        );
      }
    );

    query.push(
      "callback=" +
      encodeURIComponent(
        callbackName
      )
    );

    query.push(
      "_=" +
      Date.now()
    );

    script.src =
      API_URL +
      "?" +
      query.join("&");

    document.head
      .appendChild(script);

    setTimeout(
      function() {
        if (!done) {
          cleanup();

          if (onError) {
            onError(
              new Error(
                "Сервер отвечает слишком долго."
              )
            );
          }
        }
      },
      18000
    );
  }

  function card(item) {
    var photo =
      publicImageUrl(
        item.mainPhoto
      );

    var description =
      String(
        item.description || ""
      ).trim();

    if (
      description.length > 150
    ) {
      description =
        description.substring(
          0,
          147
        ) + "...";
    }

    return (
      '<a class="pau-card" href="/auctions?auction=' +
        encodeURIComponent(
          item.id
        ) +
      '">' +

        '<div class="pau-card-image-wrap">' +

          (
            photo
              ? (
                  '<img class="pau-card-image" src="' +
                    escapeHtml(photo) +
                    '" alt="' +
                    escapeHtml(
                      item.plant || ""
                    ) +
                  '" loading="lazy">'
                )
              : (
                  '<div class="pau-card-no-image">Фото пока нет</div>'
                )
          ) +

          '<div class="pau-badge">' +
            escapeHtml(
              statusLabel(
                item.status
              )
            ) +
          '</div>' +

        '</div>' +

        '<div class="pau-card-body">' +

          '<h3 class="pau-card-title">' +
            escapeHtml(
              item.plant ||
              item.id
            ) +
          '</h3>' +

          '<div class="pau-card-id">Аукцион ' +
            escapeHtml(item.id) +
          '</div>' +

          (
            description
              ? (
                  '<div class="pau-card-description">' +
                    escapeHtml(
                      description
                    ) +
                  '</div>'
                )
              : ""
          ) +

          '<div class="pau-meta">' +

            '<div class="pau-meta-row"><span>' +
              (
                item.status ===
                "archive"
                  ? "Завершён"
                  : "Начало"
              ) +
              '</span><span>' +
                escapeHtml(
                  formatDate(
                    item.status ===
                    "archive"
                      ? item.end
                      : item.start,
                    item.timezone
                  )
                ) +
              '</span></div>' +

            '<div class="pau-meta-row"><span>Черенков</span><span>' +
              escapeHtml(
                item.cuttingCount || 0
              ) +
            '</span></div>' +

            '<div class="pau-open">' +
              (
                item.status ===
                "archive"
                  ? "Посмотреть результаты →"
                  : "Открыть аукцион →"
              ) +
            '</div>' +

          '</div>' +

        '</div>' +

      '</a>'
    );
  }

  function section(
    title,
    items
  ) {
    if (!items.length) {
      return "";
    }

    var html =
      '<section class="pau-section">' +
        '<h2 class="pau-section-title">' +
          escapeHtml(title) +
        '</h2>' +
        '<div class="pau-grid">';

    items.forEach(
      function(item) {
        html +=
          card(item);
      }
    );

    html +=
        '</div>' +
      '</section>';

    return html;
  }

  function loadCatalog(
    onSuccess,
    onError
  ) {
    function loadLegacy() {
      jsonp(
        {
          action:
            "auctions"
        },
        onSuccess,
        onError
      );
    }

    if (
      typeof window.fetch !==
        "function"
    ) {
      loadLegacy();
      return;
    }

    window.fetch(
      PUBLIC_STATE_URL +
        "/catalog.json?_=" +
        Date.now(),
      {
        cache:
          "no-store"
      }
    )
      .then(
        function(response) {
          if (!response.ok) {
            throw new Error(
              "Public catalog HTTP " +
              response.status
            );
          }

          return response.json();
        }
      )
      .then(
        function(data) {
          if (
            !data ||
            data.ok !== true ||
            !Array.isArray(
              data.auctions
            )
          ) {
            throw new Error(
              "Некорректный public catalog."
            );
          }

          onSuccess(
            data
          );
        }
      )
      .catch(
        function() {
          loadLegacy();
        }
      );
  }


  function showCatalog(root) {
    var legacy =
      document.getElementById(
        LEGACY_APP_ID
      );

    if (legacy) {
      legacy.style.display =
        "none";
    }

    var oldGallery =
      document.getElementById(
        LEGACY_GALLERY_RECORD
      );

    if (oldGallery) {
      oldGallery.style.display =
        "none";
    }

    root.innerHTML =
      '<div class="pau-loading">Загружаем аукционы...</div>';

    loadCatalog(
      function(data) {
        if (
          !data ||
          data.ok !== true ||
          !Array.isArray(
            data.auctions
          )
        ) {
          root.innerHTML =
            '<div class="pau-error">Не удалось загрузить список аукционов.</div>';
          return;
        }

        var groups = {
          active: [],
          upcoming: [],
          archive: []
        };

        data.auctions.forEach(
          function(item) {
            if (
              groups[
                item.status
              ]
            ) {
              groups[
                item.status
              ].push(item);
            }
          }
        );

        var html =
          section(
            "Идёт сейчас",
            groups.active
          ) +
          section(
            "Скоро",
            groups.upcoming
          ) +
          section(
            "Архив",
            groups.archive
          );

        if (!html) {
          html =
            '<div class="pau-empty">Опубликованных аукционов пока нет.</div>';
        }

        root.innerHTML =
          html;
      },
      function(error) {
        root.innerHTML =
          '<div class="pau-error">' +
            escapeHtml(
              error.message
            ) +
          '</div>';
      }
    );
  }

  function photoHtml(photo, className, emptyClass) {
    var url =
      publicImageUrl(
        photo
      );

    if (url) {
      return (
        '<img class="' +
          className +
          '" src="' +
          escapeHtml(
            url
          ) +
          '" alt="" loading="lazy">'
      );
    }

    return (
      '<div class="' +
        emptyClass +
      '">Фото пока нет</div>'
    );
  }

  function detailPhotos(auction) {
    var photos =
      Array.isArray(
        auction.photos
      )
        ? auction.photos
        : [];

    var main =
      auction.mainPhoto ||
      photos[0] ||
      null;

    var html =
      '<div>' +
        '<div id="pau-main-photo">' +
          photoHtml(
            main,
            "pau-main-photo",
            "pau-main-photo-empty"
          ) +
        '</div>';

    if (
      photos.length > 1
    ) {
      html +=
        '<div class="pau-thumbs">';

      photos.forEach(
        function(photo) {
          var photoUrl =
            publicImageUrl(
              photo
            );

          if (!photoUrl) {
            return;
          }

          html +=
            '<img class="pau-thumb" src="' +
              escapeHtml(
                photoUrl
              ) +
              '" data-pau-photo="' +
              escapeHtml(
                photoUrl
              ) +
              '" alt="" loading="lazy">';
        }
      );

      html +=
        '</div>';
    }

    html +=
      '</div>';

    return html;
  }

  function lotHtml(item) {
    var main =
      item.mainPhoto ||
      (
        Array.isArray(
          item.photos
        )
          ? item.photos[0]
          : null
      );

    var priceLine;

    if (
      item.sold === true &&
      item.finalPrice !== null
    ) {
      priceLine =
        "Продан за " +
        money(
          item.finalPrice
        );

    } else if (
      item.currentPrice !== null &&
      item.currentPrice !==
        undefined
    ) {
      priceLine =
        "Текущая цена: " +
        money(
          item.currentPrice
        );

    } else {
      priceLine =
        "Старт: " +
        money(
          item.startPrice
        );
    }

    return (
      '<div class="pau-lot">' +

        '<div>' +
          photoHtml(
            main,
            "pau-lot-photo",
            "pau-lot-photo-empty"
          ) +
        '</div>' +

        '<div>' +
          '<div class="pau-lot-title">№' +
            escapeHtml(
              item.number
            ) +
            ' · ' +
            escapeHtml(
              item.type || "Черенок"
            ) +
          '</div>' +

          (
            item.description
              ? (
                  '<div class="pau-lot-desc">' +
                    escapeHtml(
                      item.description
                    ) +
                  '</div>'
                )
              : ""
          ) +

          '<div class="pau-lot-price">' +
            escapeHtml(
              priceLine
            ) +
            '<br>Шаг: ' +
            escapeHtml(
              money(
                item.step
              )
            ) +
          '</div>' +
        '</div>' +

      '</div>'
    );
  }

  function loadDetail(
    auctionId,
    onSuccess,
    onError
  ) {
    function loadLegacy() {
      jsonp(
        {
          auction:
            auctionId
        },
        onSuccess,
        onError
      );
    }

    if (
      auctionId !==
        PUBLIC_STATE_PILOT_AUCTION_ID ||
      typeof window.fetch !==
        "function"
    ) {
      loadLegacy();
      return;
    }

    window.fetch(
      PUBLIC_STATE_URL +
        "/" +
        encodeURIComponent(
          auctionId
        ) +
        ".json?_=" +
        Date.now(),
      {
        cache:
          "no-store"
      }
    )
      .then(
        function(response) {
          if (!response.ok) {
            throw new Error(
              "Public state HTTP " +
              response.status
            );
          }

          return response.json();
        }
      )
      .then(
        function(snapshot) {
          var data =
            snapshot &&
            snapshot.data
              ? snapshot.data
              : null;

          if (
            !data ||
            data.ok !== true ||
            !data.auction ||
            String(
              data.auction.id || ""
            ).trim() !==
              auctionId
          ) {
            throw new Error(
              "Некорректный public state."
            );
          }

          onSuccess(
            data
          );
        }
      )
      .catch(
        function() {
          loadLegacy();
        }
      );
  }


  function showDetail(
    root,
    auctionId
  ) {
    root.innerHTML =
      '<div class="pau-loading">Загружаем аукцион...</div>';

    loadDetail(
      auctionId,
      function(data) {
        if (
          !data ||
          data.ok !== true ||
          !data.auction
        ) {
          root.innerHTML =
            '<div class="pau-error">Аукцион не найден.</div>';
          return;
        }

        var auction =
          data.auction;

        var html =
          '<section class="pau-detail">' +

            '<a class="pau-back" href="/auctions">← Все аукционы</a>' +

            '<div class="pau-detail-head">' +

              detailPhotos(
                auction
              ) +

              '<div class="pau-detail-info">' +

                '<div class="pau-status">' +
                  escapeHtml(
                    statusLabel(
                      auction.publicStatus
                    )
                  ) +
                '</div>' +

                '<h1 class="pau-title">' +
                  escapeHtml(
                    auction.plant ||
                    auction.id
                  ) +
                '</h1>' +

                '<div class="pau-subtitle">Аукцион ' +
                  escapeHtml(
                    auction.id
                  ) +
                '</div>' +

                (
                  auction.description
                    ? (
                        '<div class="pau-description">' +
                          escapeHtml(
                            auction.description
                          ) +
                        '</div>'
                      )
                    : ""
                ) +

                '<div class="pau-info-row"><span>Начало</span><strong>' +
                  escapeHtml(
                    formatDate(
                      auction.start,
                      auction.timezone
                    )
                  ) +
                '</strong></div>' +

                '<div class="pau-info-row"><span>Окончание</span><strong>' +
                  escapeHtml(
                    formatDate(
                      auction.end,
                      auction.timezone
                    )
                  ) +
                '</strong></div>' +

                (
                  auction.blitz &&
                  auction.blitz.enabled
                    ? (
                        '<div class="pau-info-row"><span>Блиц</span><strong>' +
                          escapeHtml(
                            money(
                              auction.blitz.price
                            )
                          ) +
                        '</strong></div>'
                      )
                    : ""
                ) +

                (
                  auction.blitzSale &&
                  auction.blitzSale.sold
                    ? (
                        '<div class="pau-info-row"><span>Продано по блицу</span><strong>' +
                          escapeHtml(
                            money(
                              auction.blitzSale.price
                            )
                          ) +
                        '</strong></div>'
                      )
                    : ""
                ) +

              '</div>' +

            '</div>';

        if (
          Array.isArray(
            data.cuttings
          ) &&
          data.cuttings.length
        ) {
          html +=
            '<div class="pau-lots">' +
              '<h2 class="pau-lots-title">Черенки</h2>';

          data.cuttings.forEach(
            function(item) {
              html +=
                lotHtml(item);
            }
          );

          html +=
            '</div>';
        }

        html +=
            '<div class="pau-legacy-note">Ставки и блиц-покупка — в блоке ниже.</div>' +
          '</section>';

        root.innerHTML =
          html;

        root.addEventListener(
          "click",
          function(event) {
            var thumb =
              event.target &&
              event.target.getAttribute
                ? event.target.getAttribute(
                    "data-pau-photo"
                  )
                : null;

            if (!thumb) {
              return;
            }

            var holder =
              document.getElementById(
                "pau-main-photo"
              );

            if (holder) {
              holder.innerHTML =
                '<img class="pau-main-photo" src="' +
                  escapeHtml(
                    thumb
                  ) +
                  '" alt="">';
            }
          }
        );
      },
      function(error) {
        root.innerHTML =
          '<div class="pau-error">' +
            escapeHtml(
              error.message
            ) +
          '</div>';
      }
    );
  }

  function boot() {
    injectStyles();

    var root =
      getRoot();

    var params =
      new URLSearchParams(
        window.location.search
      );

    var auctionId =
      String(
        params.get(
          "auction"
        ) || ""
      ).trim();

    if (auctionId) {
      showDetail(
        root,
        auctionId
      );
    } else {
      showCatalog(root);
    }
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      boot
    );
  } else {
    setTimeout(
      boot,
      0
    );
  }
})();
