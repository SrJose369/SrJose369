document.addEventListener("DOMContentLoaded", function () {
    try {
        getData(true);
        document.getElementById("cont").addEventListener("click", continuarBok);
        document.getElementById("fini").addEventListener("click", finishBok);
        document.getElementById("refreData").addEventListener("click", getData);
        document.getElementById("verB").addEventListener("click", dumpBookmarks);
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
            let ta = tabs[0];
            urlVideo = ta.url;
        });
    } catch (error) {
        console.log(error);
    }
    setTimeout(() => {
        getData(true);
        checkExistBok();
    }, 600);
});
function continuarBok() {
    getData(true);
    //findBok();
    actualStreamer.continuar();
}
function finishBok() {
    getData(false);
    actualStreamer.finish();
}
async function checkExistBok() {
    let ok = await checkRecentBok("Willy"); // true, encontro los bookmarks de wiily y vegeta
    if (ok === false) {
        ok = await checkRecentBok("Lely");
        if (ok === false) {
            try {
                chrome.bookmarks.getRecent(2, function (bok) {
                    document.getElementById("streamer1").innerText = "Recent1 " + bok[0].title;
                    document.getElementById("streamer2").innerText = "Recent2 " + bok[1].title;
                });
            } catch (e) {
                console.warn(e);
            }
        }
    }
    try {
        chrome.bookmarks.getSubTree(actualStreamer.IDcontinuar, function (bok) {
            let x = findbokInTree(bok);
            checkBokContinuar(x);
        });
    } catch (e) {
        console.warn(e);
    }
    try {
        chrome.bookmarks.getSubTree(actualStreamer.IDfinish, function (bok) {
            let x = findbokInTree(bok);
            checkBokFinish(x);
        });
    } catch (e) {
        console.warn(e);
    }
}
async function checkRecentBok(cualStreamers) {
    let bol = true;
    let actS1, actS2;
    let nom1, nom2;
    if (cualStreamers === "Willy") {
        actS1 = willy;
        actS2 = vege;
        nom1 = "Willy";
        nom2 = "Vege";
    } else {
        actS1 = lely;
        actS2 = rubius;
        nom1 = "Lely";
        nom2 = "Rubius";
    }
    try {
        await getBokLastContFinish(actS1, nom1, "streamer1");
        await getBokLastContFinish(actS2, nom2, "streamer2");
    } catch (e) {
        console.warn(e);
        bol = false;
    }
    return bol;
}
async function getBokLastContFinish(cual, nom, elem) {
    ac = await getBokChild(cual.IDcontinuar);
    af = await getBokChild(cual.IDfinish);
    console.log(ac);
    console.log(af);
    if (ac.id > af.id) {
        x = `<span style="color: green";>C</span> ` + ac.title;
    } else {
        x = `<span style="color: red";>F</span> ` + af.title;
    }
    document.getElementById(elem).innerHTML = nom + " " + x;
}
async function getBokChild(id) {
    let bok = await getBokChildrenAsync(id);
    return bok[bok.length - 1];
}
function getBokChildrenAsync(id) {
    return new Promise(function (callb, reject) {
        chrome.bookmarks.getChildren(id, callb);
    });
}
function findbokInTree(bok) {
    let i,
        x = null;
    let unv = bok[0].children;
    for (i = unv.length - 1; i >= 0; i--) {
        if (unv[i].url == urlVideo) {
            x = unv[i];
            break;
        }
    }
    return x;
}
function checkBokContinuar(bok) {
    let bol = true;
    if (bok === null) {
        bol = false;
    }
    if (bol == true) {
        document.getElementById("cont").innerText = "Resfresh Continuar";
        document.getElementById("dateC").innerText = "" + bok.title.substring(0, 19);
        document.getElementById("tiemC").innerText = "" + bok.title.substring(19, 29) + " (" + bok.id + ")";
        document.getElementById("estadoBok").innerText = "Tiene un punto de continuar";
        IDbokcontinuar = bok.id;
    } else {
        document.getElementById("cont").innerText = "Add Continuar";
    }
    refreshBokConti = bol;
}
function checkBokFinish(bok) {
    if (bok !== null) {
        document.getElementById("estadoBok").innerText = "---!!!Video finalizado!!!---";
    }
}
function refrescar() {
    let da = actDate();
    document.getElementById("date").innerText = da;
}
function actDate() {
    let a;
    let date = new Date();
    let d = ""+date.getFullYear();
    a = ""+date.getMonth() + 1;
    d = d + "-" + fromTxt(a);
    a = ""+date.getDate();
    d = d + "-" + fromTxt(a);
    a = ""+date.getHours();
    d = d + " " + fromTxt(a);
    a = ""+date.getMinutes();
    d = d + "_" + fromTxt(a);
    a = ""+date.getSeconds();
    d = d + "_" + fromTxt(a);
    return d;
}
function getData(cont_O_finish) {
    request("refresh");
    refrescar();
    let xtie = "?";
    let xtit = "?";
    let xcan = "?";
    if (!actualRequest) {
        msg("Vacio actualRequest " + actualRequest);
        return;
    } else {
        xtit = actualRequest.titu;
        xtie = actualRequest.tiem;
        xcan = actualRequest.canal;
    }
    document.getElementById("titulo").innerText = xtit;
    document.getElementById("tiem").innerText = xtie;
    document.getElementById("canal").innerText = xcan;
    switch (xcan) {
        case "Rubius":
            actualStreamer = rubius;
            break;
        case "Alexby11":
            actualStreamer = lely;
            break;
        case "Willyrex":
            actualStreamer = willy;
            break;
        case "VEGETTA777":
            actualStreamer = vege;
            break;
        default:
            console.log("Sin canal ?");
            break;
    }
    let aux;
    if (cont_O_finish) {
        aux = actDate() + " " + formatTi(xtie) + " " + xtit;
    } else {
        aux = actDate() + " " + xtit;
    }
    actData.titulo = aux;
    actData.url = urlVideo;
}
class Streamer {
    constructor(contin, finis) {
        this.IDcontinuar = contin;
        this.IDfinish = finis;
    }
    continuar() {
        if (refreshBokConti == false) {
            crearBok(this.IDcontinuar, actData.titulo, actData.url);
        } else {
            chrome.bookmarks.update(IDbokcontinuar, {title: actData.titulo});
        }
    }
    finish() {
        crearBok(this.IDfinish, actData.titulo, actData.url);
    }
}
function crearBok(id, tit, ur) {
    chrome.bookmarks.create({parentId: id, title: tit, url: ur});
}
const rubius = new Streamer("203", "155");
const lely = new Streamer("88", "14");
const willy = new Streamer("192", "11"); // 9 carpeta principal
const vege = new Streamer("193", "36"); // 32 carpeta principal
/**
 * true para actualizar el bookmark que deberia ser IDbokcontinuar
 * false para crear un nuevo bookmark continuar
 */
var refreshBokConti = false;
/**
 * El streamer actual, del cual necesito el id de la carpeta continuar y finish
 */
var actualStreamer;
/**
 * Titulo del video actual
 */
var tituloVideo;
/**
 * URL del video actual
 */
var urlVideo;
/**
 * El id del bookmark continuar, osea el bookmark que se guardo que tiene la informacion
 * de donde se dejo el video, porque si quiero actualizar el bookmark porque avanze en el
 * video solo necesito el id de ese bookmark
 */
var IDbokcontinuar;
var con = 1;
var s = "";
/**
 * Informacion del video actual que me dio el pedido, osea lo que me devolvio
 * el content.js al hacerle el request
 */
var actualRequest;
var con = 1;
var ok = false;
var actData = {
    titulo: "3",
    url: "aasd",
};
function msg(m) {
    console.log(m);
}
function request(m) {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        var acT = tabs[0];
        chrome.tabs.sendMessage(acT.id, {txt: m}, function (ped) {
            actualRequest = ped;
        });
    });
}
function formatTi(x) {
    // 00_13_23
    x = x.replaceAll(":", "_");
    if (x.length == 8) {
        return x;
    }
    if (x.length > 8) {
        console.log("no deberia tener mas de 8 length");
        return x;
    }
    if (x.length == 4) {
        return "00_0" + x;
    }
    if (x.length == 5) {
        return "00_" + x;
    }
    if (x.length == 7) {
        return "0" + x;
    }
}
function fromTxt(tx) {
    let n = "" + tx;
    //(n).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    if (n.length == 1) {
        n = "0" + n;
    }
    return n;
}
function dumpBookmarks() {
    if (ok === true) {
        console.log("Ya esta la lista de bookmarks");
        //$("#vB").text("Ok.");
        ok = false;
        return;
    } else {
        ok = true;
    }
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
        $("#vB").append(dumpTreeNodes(bookmarkTreeNodes));
    });
}
function dumpTreeNodes(bookmarkNodes) {
    var list = $("<ul>");
    //msg(bookmarkNodes);
    for (var i = 0; i < bookmarkNodes.length; i++) {
        list.append(dumpNode(bookmarkNodes[i]));
        if (i == 1) {
            //break;
        }
    }
    return list;
}
function dumpNode(bookmarkNode) {
    if (!bookmarkNode.title) {
        if (bookmarkNode.url) {
            bookmarkNode.title = "vacio";
        }
    }
    if (bookmarkNode.title) {
        var anchor = $("<a>");
        if (!bookmarkNode.children) {
            anchor = $('<a style="color: green">');
        }
        anchor.attr("href", bookmarkNode.url);
        anchor.text(bookmarkNode.title);
        var au = $('<span style="color: red;">   ' + bookmarkNode.id + "</span>");
        anchor.append(au);
    }
    var li = $(bookmarkNode.title ? "<li>" : "<div>").append(anchor);
    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
        li.append(dumpTreeNodes(bookmarkNode.children));
    }
    return li;
}
/**
 * 2021-08-31 21_57_21 V1.1
 * Funciona solo probe crear un nuevo continuar y despues actualizar ese continuar
 * y en youtube, funciona estoy muy contento tarde mucho en llegar aca, comence cerca del viernes
 * a practicar bookmarks, y javascripts(que no me gusta nada) un poco antes
 * Vamoo funciona ya lo probe con finish, toy contentisimo
 *
 * 2021-09-01 00_58_22 v1.2
 * Hubo un poco de problemiia con twitch el titulo y el nombre del canal no carga bien
 * pero parece que ya anda, buenisimo despues de todo va :)
 */