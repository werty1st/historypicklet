(()=>{var p=Object.create,r=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var g=Object.getOwnPropertyNames;var u=Object.getPrototypeOf,w=Object.prototype.hasOwnProperty;var f=t=>r(t,"__esModule",{value:!0});var d=t=>{if(typeof require!="undefined")return require(t);throw new Error('Dynamic require of "'+t+'" is not supported')};var y=(t,e,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of g(e))!w.call(t,i)&&i!=="default"&&r(t,i,{get:()=>e[i],enumerable:!(s=h(e,i))||s.enumerable});return t},l=t=>y(f(r(t!=null?p(u(t)):{},"default",t&&t.__esModule&&"default"in t?{get:()=>t.default,enumerable:!0}:{value:t,enumerable:!0})),t);var n=l(d("https://unpkg.com/preact?module")),m=l(d("https://unpkg.com/preact-custom-element?module")),c=l(d("https://unpkg.com/htm?module")),b=c.default.bind(n.h),a=class extends n.Component{constructor(){super(...arguments);this.onClick=e=>{window.opener.postMessage(JSON.stringify({message:"reload",id:this.props.scmsid}),"https://www.zdf.de/")}}render({scmsid:e,title:s,leadParagraph:i}){return s||(s="loading..."),b`<li onClick=${this.onClick} >
        <a href="#"> ${s} </a>
        </li>`}};a.tagName="history-element",a.observedAttributes=["scmsid","lead-paragraph","title"];(0,m.default)(a);async function k(t,e){let s=JSON.parse(t),i=document.getElementById("historylist"),o=document.createElement("history-element");o.setAttribute("scmsid",e),o.setAttribute("lead-paragraph",s.leadParagraph),o.setAttribute("title",s.title),i.appendChild(o)}function C(){window.l1?(window.l1=!0,console.log("listener exists")):(window.addEventListener("message",t=>{t.origin=="https://www.zdf.de"&&(t.data.history&&k(t.data.history,t.data.externalId),console.log(t))}),document.addEventListener("DOMContentLoaded",function(){window.opener.postMessage(JSON.stringify({message:"ready"}),"https://www.zdf.de/")}),console.log("listener installed"))}C();})();