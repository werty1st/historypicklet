import { type } from 'node:os';
import mywindow from './window.html';


!(async function (){

    const HOST = "https://" + process.env.URL;

    console.log("injected");
    console.log(mywindow);
    const pdoc = window.open(`${HOST}/${mywindow}`,"Custom Picks","width=300,height=600,scrollbars=1,resizable=1");

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
        if ( !response.ok ) {
            //throw Error( `${response.status} - ${response.statusText} (for url ${url})` );
            console.error( `${response.status} - ${response.statusText} (for url ${url})` );
            return { doc: null, err: response.status };
        }
        else {
            return { doc: await response.json(), err: null };
        }

    }

    async function postPopup(externalId, payload){

        console.log( `Name: ${payload}, ID: ${externalId}`  );
        pdoc.postMessage({history: payload, externalId: externalId, datatype: "json"}, HOST); 
    }

    interface itemx {
        leadParagraph: string;
        title: string 
    }

    async function resolveHistoryItems(){
        const history: Array<any> = zdfsite.user.getPlaybackHistory().getItems().sort(({eventDate:a}, {eventDate:b}) => (a, b) => (new Date(b) - new Date(a))(a, b));
        
        const DEBUG=false;
        const data = DEBUG?history.slice(0,4):history;

        for await (const entry of data) {
            
                
            //find in cache
            const cacheJson = localStorage.getItem( entry.externalId );
            if (!( cacheJson == undefined || cacheJson == "{}" || cacheJson == "" ))
            {
                try {
                    let tempjson:itemx = JSON.parse(cacheJson);
                    console.log(tempjson);
                    postPopup( entry.externalId, cacheJson );
                } catch (error) {
                    localStorage.removeItem( entry.externalId );
                }
            
            } else {
                //get Info from API                
                const {doc, err} = await resolveId( entry.externalId );
                if (doc){
                    const newJson = JSON.stringify({
                        leadParagraph: doc.leadParagraph,
                        title: doc.title
                    });
                    //store in cache
                    localStorage.setItem( entry.externalId, newJson );
                    postPopup( entry.externalId, newJson );
                }
                else {
                    //todo
                    //remove from user history
                }
            }

        }

    }

    async function blacklist(ID:string) {
        alert(`No history picks for ${ID}`);
    }

    async function reLoadCluster(ID){
        console.log("reload ID", ID);

        // window.XCustomID = "SCMS_c45739d6-6bd5-4fa2-a29b-5e66dde11fa0"
        window.XCustomID = ID; //for blacklisting
        const nodeid = "34e6008c-7c5c-402e-ace9-fd3e247f6d97";

        var history = [
            {"externalId":ID,"eventDate":"2021-05-24T13:27:05Z","currentPosition":99}
        ]
        const plays = encodeURIComponent( JSON.stringify(history) ) ;

        const parser = new DOMParser();
        const html = `
        <div class="js-rb-live" data-recommendation-cluster-list-uri="/broker/relay?plays=${plays}&amp;appId={appId}&amp;abGroup={abGroup}&amp;preferences={preferences}&amp;profile=minimal&amp;configuration=history-picks&amp;pageId=SCMS_2fd1b340-e4db-47f2-b55b-633ac4ed1dba&amp;clusterLimit=1"
         data-module="recommendation-cluster-list"
         data-recommendation-cluster-list-nodeid="${nodeid}">
        </div>
        `

        const parsed = parser.parseFromString(html, `text/html`);
        const newArticle = parsed.querySelector("div");
        let oldArticle;
        if ( oldArticle = document.querySelector( `article[data-node-id="${nodeid}"]` ) ){
            oldArticle.replaceWith(newArticle);
        } else {
            oldArticle = document.querySelector(".sb-page > article");
            //var oldArticle = document.querySelector(".sb-page > .stage-wrapper")
            oldArticle.nextElementSibling.prepend(newArticle);

        }

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
            
            window.fetch = async function() {
                const url = arguments[0];
                if (regex1.test(url)) {
            
                    const ID = window.XCustomID; //"SCMS_904a8c10-fdf2-4f20-8075-0f8d5b2c9d5b";
                    // const plays = "plays=" + encodeURIComponent(`[{"externalId":"${ID}","eventDate":"2021-05-24T13:27:05Z","currentPosition":1}]`);
                    // //const plays = "plays=%5B%7B%22externalId%22%3A%22SCMS_c45739d6-6bd5-4fa2-a29b-5e66dde11fa0%22%2C%22eventDate%22%3A%222021-05-17T12%3A34%3A39.029Z%22%2C%22currentPosition%22%3A2145%7D%2C%7B%22externalId%22%3A%22SCMS_2ed207cc-ed1f-4cfc-822e-b48deaf974e2%22%2C%22eventDate%22%3A%222021-05-06T12%3A21%3A49.859Z%22%2C%22currentPosition%22%3A1.875531%7D%2C%7B%22externalId%22%3A%22SCMS_29ff63da-eac3-441d-9e5d-b856eed167b1%22%2C%22eventDate%22%3A%222021-05-05T16%3A14%3A59Z%22%2C%22currentPosition%22%3A647%7D%2C%7B%22externalId%22%3A%22SCMS_a50fca6d-765d-4f26-94a6-c92f2ab88cd6%22%2C%22eventDate%22%3A%222021-05-04T20%3A08%3A38.234Z%22%2C%22currentPosition%22%3A126%7D%2C%7B%22externalId%22%3A%22SCMS_38a45c56-32f6-4b73-86d9-9c8391bc5049%22%2C%22eventDate%22%3A%222021-04-24T13%3A27%3A05Z%22%2C%22currentPosition%22%3A7%7D%2C%7B%22externalId%22%3A%22SCMS_265182ac-2236-405b-b1eb-93028e21e09d%22%2C%22eventDate%22%3A%222021-03-28T21%3A17%3A39Z%22%2C%22currentPosition%22%3A1%7D%2C%7B%22externalId%22%3A%22SCMS_686fadc4-a803-4aff-8a59-a5730a64302f%22%2C%22eventDate%22%3A%222021-03-24T19%3A27%3A46.446Z%22%2C%22currentPosition%22%3A787.59091%7D%2C%7B%22externalId%22%3A%22SCMS_2f1d20ec-c6a0-4946-92fb-9c86d57a65aa%22%2C%22eventDate%22%3A%222021-03-01T22%3A23%3A05Z%22%2C%22currentPosition%22%3A5241%7D%2C%7B%22externalId%22%3A%22SCMS_c2ddea41-e0f7-41a7-9fa0-a18747cdf9f2%22%2C%22eventDate%22%3A%222021-02-25T18%3A13%3A02Z%22%2C%22currentPosition%22%3A42%7D%2C%7B%22externalId%22%3A%22SCMS_3fc83c22-1137-4114-85c8-e1dcf4eb8bfa%22%2C%22eventDate%22%3A%222021-02-25T17%3A07%3A14Z%22%2C%22currentPosition%22%3A6%7D%5D";
                    // const G = "gruppe-c";
                    // const body = `${plays}&appId=exozet-zdf-pd-0.74.7307&abGroup=${G}&preferences=&profile=minimal&configuration=history-picks&pageId=SCMS_2fd1b340-e4db-47f2-b55b-633ac4ed1dba&clusterLimit=1`;
                    // arguments[1].body = body;
                    var x = await _fetch.apply(this, arguments)
                    if (x.status != 200){
                        blacklist(ID);
                    }
                    return  Promise.resolve(x);
                }
               return _fetch.apply(this, arguments);
            }

            window.f1 = true;
        } else {
            console.warn("fetch installed")
        }        

    }

    init();



})()
