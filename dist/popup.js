import { h, Component } from "https://unpkg.com/preact?module";
import register from "https://unpkg.com/preact-custom-element?module";
import htm from "https://unpkg.com/htm?module";
const html = htm.bind(h);
class HistoryElement extends Component {
  constructor() {
    super(...arguments);
    this.onClick = (e) => {
      window.opener.postMessage(JSON.stringify({ message: "reload", id: this.props.scmsid }), "https://www.zdf.de/");
    };
  }
  render({ scmsid, title, leadParagraph }) {
    if (!title)
      title = "loading...";
    return html`<li onClick=${this.onClick} >
        <a href="#"> ${title} </a>
        </li>`;
  }
}
HistoryElement.tagName = "history-element";
HistoryElement.observedAttributes = ["scmsid", "lead-paragraph", "title"];
register(HistoryElement);
async function history(historyItem, externalId) {
  const data = JSON.parse(historyItem);
  const ul = document.getElementById("historylist");
  let li = document.createElement("history-element");
  li.setAttribute("scmsid", externalId);
  li.setAttribute("lead-paragraph", data.leadParagraph);
  li.setAttribute("title", data.title);
  ul.appendChild(li);
}
function installListener() {
  if (!window.l1) {
    window.addEventListener("message", (event) => {
      if (event.origin == "https://www.zdf.de") {
        if (event.data.history) {
          history(event.data.history, event.data.externalId);
        }
        console.log(event);
      }
    });
    document.addEventListener("DOMContentLoaded", function() {
      window.opener.postMessage(JSON.stringify({ message: "ready" }), "https://www.zdf.de/");
    });
    console.log("listener installed");
  } else {
    window.l1 = true;
    console.log("listener exists");
  }
}
installListener();
