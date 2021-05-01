import { h, Component, render } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

// Initialize htm with Preact
const html = htm.bind(h);

function App (props) {
  return html`<h1>Hello ${props.name}!</h1>`;
}

render(html`<${App} name="World" />`, document.body);








async function history(payload){
    
    const DEBUG=true;
    const data = DEBUG?JSON.parse(payload.history).slice(0,4):JSON.parse(payload.history);

    const ul = document.getElementById("historylist");

    for (let item of data){

        let li = document.createElement("history-element");
        li.setAttribute("scmsId", item.externalId);
        ul.appendChild(li);
    }

    console.log(data);
}


function installListener(){

    if (!window.l1){

        window.addEventListener("message", (event)=>{
            if ( event.origin == "https://www.zdf.de" ) {

                if ( event.data.history ){
                    history(event.data);                    
                }


                console.log(event);
            }
        });

        document.addEventListener("DOMContentLoaded", function() {
            //JSON data for message
            window.opener.postMessage("ready",  "https://www.zdf.de/");
        });

        console.log("listener installed");
        
    } else {
        window.l1 = true;
        console.log("listener exists");
    }

}
installListener();