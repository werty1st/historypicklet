(() => {
  // app/window.html
  var window_default = "./window-5VJUUJNB.html";

  // app/app.ts
  !async function() {
    const HOST = "https://werty1st.github.io/historypicklet/dist";
    console.log("injected");
    console.log(window_default);
    const pdoc = window.open(`${HOST}/${window_default}`, "Custom Picks", "width=300,height=600,scrollbars=1,resizable=1");
    function getHeaders() {
      const headers = {};
      const user = zdfsite.user;
      headers["Api-Auth"] = "Bearer " + zdfsite.apiToken;
      const token = user.getState().token;
      if (token && !user.getState().profile.deactivatePersonalRecommendations) {
        headers.Authorization = `Bearer ${token}`;
      }
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      return headers;
    }
    async function resolveId(externalId) {
      const options = {};
      options["method"] = "GET";
      options["headers"] = getHeaders();
      const url = `https://api.zdf.de/content/embed/${externalId}.json?profile=player2`;
      const response = await fetch(url, options);
      if (!response.ok) {
        console.error(`${response.status} - ${response.statusText} (for url ${url})`);
        return { doc: null, err: response.status };
      } else {
        return { doc: await response.json(), err: null };
      }
    }
    async function postPopup(externalId, payload) {
      console.log(`Name: ${payload}, ID: ${externalId}`);
      pdoc.postMessage({ history: payload, externalId, datatype: "json" }, HOST);
    }
    async function resolveHistoryItems() {
      const history = zdfsite.user.getPlaybackHistory().getItems().sort(({ eventDate: a }, { eventDate: b }) => (a2, b2) => (new Date(b2) - new Date(a2))(a2, b2));
      const DEBUG = false;
      const data = DEBUG ? history.slice(0, 4) : history;
      for await (const entry of data) {
        const cacheJson = localStorage.getItem(entry.externalId);
        if (!(cacheJson == void 0 || cacheJson == "{}" || cacheJson == "")) {
          try {
            let tempjson = JSON.parse(cacheJson);
            console.log(tempjson);
            postPopup(entry.externalId, cacheJson);
          } catch (error) {
            localStorage.removeItem(entry.externalId);
          }
        } else {
          const { doc, err } = await resolveId(entry.externalId);
          if (doc) {
            const newJson = JSON.stringify({
              leadParagraph: doc.leadParagraph,
              title: doc.title
            });
            localStorage.setItem(entry.externalId, newJson);
            postPopup(entry.externalId, newJson);
          } else {
          }
        }
      }
    }
    async function blacklist(ID) {
      alert(`No history picks for ${ID}`);
    }
    async function reLoadCluster(ID) {
      console.log("reload ID", ID);
      window.XCustomID = ID;
      const nodeid = "34e6008c-7c5c-402e-ace9-fd3e247f6d97";
      var history = [
        { "externalId": ID, "eventDate": "2021-05-24T13:27:05Z", "currentPosition": 99 }
      ];
      const plays = encodeURIComponent(JSON.stringify(history));
      const parser = new DOMParser();
      const html = `
        <div class="js-rb-live" data-recommendation-cluster-list-uri="/broker/relay?plays=${plays}&amp;appId={appId}&amp;abGroup={abGroup}&amp;preferences={preferences}&amp;profile=minimal&amp;configuration=history-picks&amp;pageId=SCMS_2fd1b340-e4db-47f2-b55b-633ac4ed1dba&amp;clusterLimit=1"
         data-module="recommendation-cluster-list"
         data-recommendation-cluster-list-nodeid="${nodeid}">
        </div>
        `;
      const parsed = parser.parseFromString(html, `text/html`);
      const newArticle = parsed.querySelector("div");
      let oldArticle;
      if (oldArticle = document.querySelector(`article[data-node-id="${nodeid}"]`)) {
        oldArticle.replaceWith(newArticle);
      } else {
        oldArticle = document.querySelector(".sb-page > article");
        oldArticle.nextElementSibling.prepend(newArticle);
      }
    }
    async function ready() {
      resolveHistoryItems();
    }
    function init() {
      if (!window.l1) {
        window.addEventListener("message", (event) => {
          if (event.origin == HOST) {
            try {
              const payload = JSON.parse(event.data);
              if (payload.message === "ready") {
                ready();
              } else if (payload.message === "reload") {
                reLoadCluster(payload.id);
              }
            } catch (error) {
              console.error("Payload not json");
            }
          }
        }, false);
        console.log("parent listener installed");
      } else {
        window.l1 = true;
        console.log("parent listener exists");
      }
      if (!window.f1) {
        var regex1 = /^https:\/\/(api|zdf-int-api)\.(zdf)\.de\/broker\/relay/;
        var _fetch = window.fetch;
        window.fetch = async function() {
          const url = arguments[0];
          if (regex1.test(url)) {
            const ID = window.XCustomID;
            var x = await _fetch.apply(this, arguments);
            if (x.status != 200) {
              blacklist(ID);
            }
            return Promise.resolve(x);
          }
          return _fetch.apply(this, arguments);
        };
        window.f1 = true;
      } else {
        console.warn("fetch installed");
      }
    }
    init();
  }();
})();
