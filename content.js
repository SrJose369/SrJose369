var titu;
var tiem;
var canal;
var cual = document.URL;
function refre() {
    let a;
    let b;
    let c;
    try {
        if (checkNull(cual) || checkNull(cual.length)) {
            console.log("Error cual vacio");
        } else {
            if (cual.length < 13) {
                console.log('Error el length de cual es menor a 13');
            }
        }
    } catch (error) {
        console.warn(error);
    }
    try {
        if (cual[12] === "y") {
            msjConsola("Yotubue creo");
            // tiempo video
            a = document.querySelector("#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > div.ytp-time-display.notranslate > span.ytp-time-current");
            // nombre canal
            b = document.querySelector("#text > a");
            // titulo
            c = document.querySelector("#container > h1 > yt-formatted-string");
        } else {
            if (cual[12] === "t") {
                msjConsola("Twitch creo");
                // tiempo directo
                a = document.querySelectorAll('[data-a-target="player-seekbar-current-time"]')[0];
                // canal
                b = document.getElementsByClassName("CoreText-sc-cpl358-0 ScTitleText-sc-1gsen4-0 cWnsFT InjectLayout-sc-588ddc-0 fwsYSr tw-title")[0];
                // titulo video
                c = document.querySelectorAll('[data-a-target="stream-title"]')[0];
            } else {
                msjConsola("No es youtbe y tampoco twitch :/");
            }
        }
    } catch (error) {
        console.warn(error);
    }
    let xtie;
    let xcan;
    let xtit;
    try {
        if (checkNull(a) || checkNull(a.innerText)) {
            msjConsola("String vacio tiempo" + a);
            xtie = "?";
        } else {
            xtie = a.innerText;
        }
    } catch (error) {
        msjConsola("String error vacio tiempo" + a);
        xtie = "?";
    }
    try {
        if (checkNull(b) || checkNull(b.innerText)) {
            msjConsola("String vacio canal" + b);
            xcan = "?";
        } else {
            xcan = b.innerText;
        }
    } catch (error) {
        msjConsola("String error vacio canal" + b);
        xcan = "?";
    }
    try {
        if (checkNull(c) || checkNull(c.innerText)) {
            msjConsola("String vacio titulo" + c);
            xtit = "?";
        } else {
            xtit = c.innerText;
        }
    } catch (error) {
        msjConsola("String error vacio titulo" + c);
        xtit = "?";
    }
    titu = xtit;
    tiem = xtie;
    canal = xcan;
}
chrome.runtime.onMessage.addListener(function (res, sender, sendResponse) {
    try {
        if (checkNull(res) || checkNull(res.txt)) {
            msjConsola("Error en el paquete recibido en content");
        } else {
            console.log(res.txt);
            if (res.txt === "refresh") {
                refre();
            }
            sendResponse({titu, tiem, canal});
        }
    } catch (error) {
        console.warn(error);
    }
});
function msjConsola(m) {
    console.log(m);
}
function checkNull(valor) {
    if (valor === undefined || valor === null) {
        return true;
    }
    return false;
}
