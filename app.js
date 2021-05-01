
!(async function (){
    const HOST = "https://dev.home.wrty.eu";
    console.log("injected");
    var pdoc;


    //ready to communicate
    async function init(){
        sendHistory();
    }
    

    function installListener(){

        if (!window.l1){

            window.addEventListener("message", (event) => {
                if (event.origin == HOST){
                    
                    if (event.data === "ready"){                    
                        init();
                    }


                    console.log(event);
                }
            }, false);
            
            console.log("parent listener installed");            
        } else {
            window.l1 = true;
            console.log("parent listener exists");
        }    
    }

    async function sendHistory(){
        const h = zdfsite.user.getPlaybackHistory().getItems().sort(({eventDate:a}, {eventDate:b}) => (a, b) => (new Date(b) - new Date(a))(a, b));
        //send history to popup
        const hjson = JSON.stringify(h);
        pdoc.postMessage({history: hjson, datatype: "json"}, HOST);  
    }

    async function setupPopup(){
        pdoc = window.open(`${HOST}/popup.html`,"Custom Picks","width=300,height=600,scrollbars=1,resizable=1");
    }

    installListener();
    setupPopup();



})()
