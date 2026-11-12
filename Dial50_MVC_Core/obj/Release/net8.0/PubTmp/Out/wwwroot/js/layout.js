
document.addEventListener("DOMContentLoaded",()=>{
load('header','partials/header.html');
load('nav','partials/nav.html');
load('footer','partials/footer.html');
setTimeout(setActive,200);
setTimeout(updateTime,200);
});
function load(id,file){fetch(file).then(r=>r.text()).then(d=>document.getElementById(id).innerHTML=d);}
function setActive(){
let page=window.location.pathname.split("/").pop();
document.querySelectorAll(".nav button").forEach(b=>{
if(b.dataset.page===page)b.classList.add("active");
});
}
function updateTime(){
let el=document.getElementById("time");
if(!el)return;
function tick(){
let n=new Date();
el.innerText=n.toLocaleDateString()+" | "+n.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
}
tick();setInterval(tick,60000);
}
