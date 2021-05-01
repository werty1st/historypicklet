


function installFetch(){
    if (!window.f1){
        var regex1 = /^https:\/\/(api|zdf-int-api)\.(zdf)\.de\/broker\/relay/;
        var _fetch = window.fetch;
        
        window.fetch = function() {
            const url = arguments[0];
            if (regex1.test(url)) {
        
                const ID = "SCMS_904a8c10-fdf2-4f20-8075-0f8d5b2c9d5b";
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



installFetch()
var parser = new DOMParser();
var html = `
<div class="js-rb-live" data-recommendation-cluster-list-uri="/broker/relay?plays={plays}&amp;appId={appId}&amp;bookmarks={bookmarks}&amp;interests={interests}&amp;abGroup={abGroup}&amp;views={views}&amp;preferences={preferences}&amp;profile=minimal&amp;configuration=history-picks&amp;pageId=SCMS_2fd1b340-e4db-47f2-b55b-633ac4ed1dba&amp;clusterLimit=1"
 data-module="recommendation-cluster-list"
 data-recommendation-cluster-list-nodeid="34e6008c-7c5c-402e-ace9-fd3e247f6d97">
</div>
`
var parsed = parser.parseFromString(html, `text/html`)
var newArticle = parsed.querySelector("div")
var oldArticle = document.querySelector(".sb-page > article")
oldArticle.replaceWith(newArticle)


function prepareHistory(){
    const h1 = zdfsite.user.getPlaybackHistory().getItems().sort(({eventDate:a}, {eventDate:b}) => (a, b) => (new Date(b) - new Date(a))(a, b));

}
//zdfsite.user.dispatch("abGroupName", "gruppe-b");


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

function getNamefromID(id){

    const options = {};
    options['method'] = 'GET';
    options['headers'] = getHeaders();
    const url = ``;

    fetch( url, options )
        .then(response => {

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
        } )
        .then(json => {
            return this.renderPostData(json);
        })
        .catch((error) => {
            console.log("Error while fetching cluster list with POST: " + error);
            teaserWriter.writeReady(this.element);
        });
    
}







class HistoryElement extends HTMLElement {
    constructor() {
      super();

        // Create a shadow root
        const shadow = this.attachShadow({mode: 'open'});

        // Create spans
        const wrapper = document.createElement('span');
        wrapper.setAttribute('class', 'wrapper');

        const icon = document.createElement('span');
        icon.setAttribute('class', 'icon');
        icon.setAttribute('tabindex', 0);

        const info = document.createElement('span');
        info.setAttribute('class', 'info');

        // Take attribute content and put it inside the info span
        const text = this.getAttribute('data-text');
        info.textContent = text;

        // Create some CSS to apply to the shadow dom
        const style = document.createElement('style');
        console.log(style.isConnected);

        style.textContent = `
        .wrapper {
            position: relative;
        }
        .info {
            font-size: 0.8rem;
            width: 200px;
            display: inline-block;
            border: 1px solid black;
            padding: 10px;
            background: white;
            border-radius: 10px;
            opacity: 0;
            transition: 0.6s all;
            position: absolute;
            bottom: 20px;
            left: 10px;
            z-index: 3;
        }
        img {
            width: 1.2rem;
        }
        .icon:hover + .info, .icon:focus + .info {
            opacity: 1;
        }
        `;

        // Attach the created elements to the shadow dom
        shadow.appendChild(style);
        console.log(style.isConnected);
        shadow.appendChild(wrapper);
        wrapper.appendChild(icon);
        wrapper.appendChild(info);
    

    }
  
    connectedCallback() {
      // browser calls this method when the element is added to the document
      // (can be called many times if an element is repeatedly added/removed)
      console.log("added", this);
    //   this.innerHTML = `
    //   <p>
    //   <a href="#"> asdasdasdasd</a>
    //   </p>
    //   `;
    }
  
    disconnectedCallback() {
      // browser calls this method when the element is removed from the document
      // (can be called many times if an element is repeatedly added/removed)
    }
  
    static get observedAttributes() {
      return [/* array of attribute names to monitor for changes */];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      // called when one of attributes listed above is modified
    }
  
    adoptedCallback() {
      // called when the element is moved to a new document
      // (happens in document.adoptNode, very rarely used)
    }
  
    // there can be other element methods and properties
}

customElements.define("history-element", HistoryElement);