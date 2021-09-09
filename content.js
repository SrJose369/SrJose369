console.log("Hola2");
var titu;
var tiem;
var canal;
var cual = document.URL;
function refre() {
    var a, b, c;
    if (cual[12] == "y") {
        msjConsola("Yotubue creo");
        // tiempo video
        a = document.querySelector("#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > div.ytp-time-display.notranslate > span.ytp-time-current");
        // nombre canal
        b = document.querySelector("#text > a");
        // titulo
        c = document.querySelector("#container > h1 > yt-formatted-string");
    }
    else {
        if (cual[12] == "t") {
            msjConsola("Twitch creo");
            // tiempo directo
            a = document.querySelectorAll('[data-a-target="player-seekbar-current-time"]')[0];
            // canal
            b = document.getElementsByClassName("CoreText-sc-cpl358-0 ScTitleText-sc-1gsen4-0 cWnsFT InjectLayout-sc-588ddc-0 fwsYSr tw-title")[0];
            // titulo video
            c = document.querySelectorAll('[data-a-target="stream-title"]')[0];
        }
        else {
            msjConsola("Nose");
        }
    }
    var xtie, xcan, xtit;
    if (!a) {
        msjConsola("String vacio tiempo" + a);
        xtie = "?";
    }
    else {
        xtie = a.innerText ? a.innerText : "?";
    }
    if (!b) {
        msjConsola("String vacio canal" + b);
        xcan = "?";
    }
    else {
        xcan = b.innerText ? b.innerText : "?";
    }
    if (!c) {
        msjConsola("String vacio titulo" + c);
        xtit = "?";
    }
    else {
        xtit = c.innerText ? c.innerText : "?";
    }
    titu = xtit;
    tiem = xtie;
    canal = xcan;
    //chrome.storage.sync.set({"vidText": s1, "canal": s2});
}
chrome.runtime.onMessage.addListener(function (res, sender, sendResponse) {
    console.log(res.txt);
    if (res.txt == "refresh") {
        refre();
    }
    sendResponse({titu: titu, tiem: tiem, canal: canal});
});
function msjConsola(m) {
    console.log(m);
}
