
!(async function (){
    const HOST = "https://dev.home.wrty.eu";

    console.log("injected");
    const pdoc = window.open(`${HOST}/popup.html`,"Custom Picks","width=300,height=600,scrollbars=1,resizable=1");

    function getHeaders() {
        const headers = {};
        const user = zdfsite.user;
        headers["Api-Auth"] = "Bearer " + zdfsite.apiToken;
        const token = user.getState().token;
        if (token && !user.getState().profile.deactivatePersonalRecommendations) {
            headers.Authorization = `Bearer ${token}`;
        }
    
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        return headers;
    }

    async function resolveId(externalId){

        const options = {};
        options['method'] = 'GET';
        options['headers'] = getHeaders();
        const url = `https://api.zdf.de/content/embed/${externalId}.json?profile=player2`;
    
        const response = await fetch( url, options );

        // if nothing is coming from server that means list was delete on another device
        if ( response.status === 404 ) {
            return {};
        }
        if ( !response.ok ) {
            throw Error( `${response.status} - ${response.statusText} (for url ${url})` );
        }
        else {
            return response.json();
        }

    }

    async function postPopup(externalId, payload){

        console.log( `Name: ${payload}, ID: ${externalId}`  );
        pdoc.postMessage({history: payload, externalId: externalId, datatype: "json"}, HOST); 
    }

    async function resolveHistoryItems(history){
        history = zdfsite.user.getPlaybackHistory().getItems().sort(({eventDate:a}, {eventDate:b}) => (a, b) => (new Date(b) - new Date(a))(a, b));
        
        const DEBUG=false;
        const data = DEBUG?history.slice(0,4):history;

        for (entry of data) {
            //find in cache
            const infoJson = await (async ()=>{

                const cacheJson = localStorage.getItem( entry.externalId );

                if ( cacheJson ){
                    try {
                        const info = JSON.parse(cacheJson);
                        return cacheJson;
                    } catch (error) {
                        localStorage.removeItem( entry.externalId );
                    }
                    return Promise.resolve(  );
                } else {
                    const doc = await resolveId( entry.externalId );
                    const info = JSON.stringify({
                        leadParagraph: doc.leadParagraph,
                        title: doc.title
                    });
                    //store in cache
                    localStorage.setItem( entry.externalId, info );
                    return info;
                }
            })()

            //post to popup
            postPopup( entry.externalId, infoJson );
        }

    }


    async function reLoadCluster(id){
        console.log("reload ID", id);

        window.XCustomID = id;

        var parser = new DOMParser();
        var html = `
        <div class="js-rb-live" data-recommendation-cluster-list-uri="/broker/relay?plays={plays}&amp;appId={appId}&amp;bookmarks={bookmarks}&amp;interests={interests}&amp;abGroup={abGroup}&amp;views={views}&amp;preferences={preferences}&amp;profile=minimal&amp;configuration=history-picks&amp;pageId=SCMS_2fd1b340-e4db-47f2-b55b-633ac4ed1dba&amp;clusterLimit=1"
         data-module="recommendation-cluster-list"
         data-recommendation-cluster-list-nodeid="34e6008c-7c5c-402e-ace9-fd3e247f6d97">
        </div>
        `
        var parsed = parser.parseFromString(html, `text/html`)
        var newArticle = parsed.querySelector("div")
        //var oldArticle = document.querySelector(".sb-page > article")
        var oldArticle = document.querySelector(".sb-page > .stage-wrapper")
        //oldArticle.replaceWith(newArticle)        
        oldArticle.nextElementSibling.prepend(newArticle)        

    }


    //ready to communicate
    async function ready(){
        resolveHistoryItems();
    }
    

    function init(){

        if (!window.l1){

            window.addEventListener("message", (event) => {
                if (event.origin == HOST){

                    try {
                        const payload = JSON.parse(event.data)

                        if (payload.message === "ready"){                    
                            ready();
                        } else if (payload.message === "reload"){
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

        if (!window.f1){
            var regex1 = /^https:\/\/(api|zdf-int-api)\.(zdf)\.de\/broker\/relay/;
            var _fetch = window.fetch;
            
            window.fetch = function() {
                const url = arguments[0];
                if (regex1.test(url)) {
            
                    const ID = window.XCustomID; //"SCMS_904a8c10-fdf2-4f20-8075-0f8d5b2c9d5b";
                    const plays = "plays=" + encodeURIComponent(`[{"externalId":"${ID}","eventDate":"2021-04-24T13:27:05Z","currentPosition":1}]`);
                    const G = "gruppe-c";
                    const body = `${plays}&appId=exozet-zdf-pd-0.74.7307&abGroup=${G}&preferences=&profile=minimal&configuration=history-picks&pageId=SCMS_2fd1b340-e4db-47f2-b55b-633ac4ed1dba&clusterLimit=1`;
                    arguments[1].body = body;
                }
               return _fetch.apply(this, arguments)
            }
            window.f1 = true;
        } else {
            console.warn("fetch installed")
        }        

    }

    init();



})()
