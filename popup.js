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
 * URL del video actual
 */
var urlVideo;
/**
 * El id del bookmark continuar, osea el bookmark que se guardo que tiene la informacion
 * de donde se dejo el video, porque si quiero actualizar el bookmark porque avanze en el
 * video solo necesito el id de ese bookmark
 */
var IDbokcontinuar;
/**
 * Informacion del video actual que me dio el pedido, osea lo que me devolvio
 * el content.js al hacerle el request
 */
var actualRequest;
var listaEnPantalla = false;
var youOtwitch = null;
const showMsj = false;
const canIrun = navigator.mediaDevices.getDisplayMedia;
/**
 * La informacion que me dio content sobre la pagina, que deberia ser la informacion
 * del video
 */
var actData = {
    titulo: "*?",
    url: "+?",
};
/**
 * Clase streamer que guarda la info de los folder de los bookmarks
 */
class Streamer {
    constructor(nom, contin, nomCont, finis, nomFinis, grou) {
        this.nombre = nom;
        this.IDcontinuar = contin;
        this.nameContinuar = nomCont;
        this.IDfinish = finis;
        this.nameFinish = nomFinis;
        this.group = grou;
    }

    continuar() {
        try {
            if (refreshBokConti === false) {
                crearBok(this.IDcontinuar, actData.titulo, actData.url);
            } else {
                chrome.bookmarks.update(IDbokcontinuar, {title: actData.titulo});
            }
            document.getElementById("canal").innerText = "Todo ok";
        } catch (e) {
            console.warn(e);
            document.getElementById("canal").innerText = "Err :(";
        }
    }

    finish() {
        try {
            crearBok(this.IDfinish, actData.titulo, actData.url);
            document.getElementById("canal").innerText = "Todo ok";
        } catch (e) {
            console.warn(e);
            document.getElementById("canal").innerText = "Err :(";
        }
    }
}
//  Nombre  -  IDcontinuar  -  NombreContinuar  -  IDfinish  -  NombreFinish  -  Grupo
/**
 * Informacion sobre willy 9 carpeta principal
 */
const willy = new Streamer("Willy", "11", "Viendo", "14", "WFinish 2021-06-05 20_18_39", "Y");
/**
 * Informacion sobre vege 90 carpeta principal
 */
const vege = new Streamer("Vege", "95", "Viendo", "97", "VFinish 2021-06-05 20_18_39", "Y");
/**
 * Informacion sobre rubius
 */
const rubius = new Streamer("Rubius", "203", "2021", "155", "Finish", "T");
/**
 * Informacion sobre lely
 */
const lely = new Streamer("Lely", "88", "2021", "14", "Finish", "T");
// eslint-disable-next-line no-unused-vars
const listStreamers = [willy, vege, rubius, lely];
document.addEventListener("DOMContentLoaded", () => {
    try {
        getData(true);
        document.getElementById("cont").addEventListener("click", continuarBok);
        document.getElementById("fini").addEventListener("click", finishBok);
        document.getElementById("refreData").addEventListener("click", getData);
        document.getElementById("verB").addEventListener("click", dumpBookmarks);
        document.getElementById("screenshot").addEventListener("click", () => {
            if (canIrun) {
                takeScreenshot();
            }
        });
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
            const ta = tabs[0];
            urlVideo = ta.url;
            if (checkNull(urlVideo)) {
                mensaje('Error el url vacio');
            }
        });
    } catch (e) {
        console.warn(e);
    }
    setTimeout(() => {
        console.clear();
        let bol = false;
        try {
            if (urlVideo[12] === "y" || urlVideo[12] === "t") {
                getData(true);
                bol = true;
            }
        } catch (e) {
            // coment, no hago nada porque la pagina en la que estoy no me sirve para hacer
            // el request de la data
        }
        if (bol === false) {
            urlVideo = "?";
        }
        checkExistBok();
    }, 600);
});
/**
 * Funcion que se llama cunado se presiona el boton de continuar,
 * se obtienen los datos y depues se guarda el punto de continuar
 */
function continuarBok() {
    getData(true);
    actualStreamer.continuar();
}
/**
 * Funcion que se llama cunado se presiona el boton de continuar,
 * se obtienen los datos y depues se guarda el punto de continuar
 */
function finishBok() {
    getData(false);
    actualStreamer.finish();
}
/**
 * Buscar si estan los bookmarks de continuar o finish para saber si ya se termino de ver el video,
 * y tambien para saber que fue lo ultimo que se vio o lo ultimo que se hizo
 */
async function checkExistBok() {
    let foundBok;
    try {
        await isYoutube_o_Twitch();
    } catch (e) {
        console.warn(e);
    }
    mensaje(youOtwitch);
    if (youOtwitch === "Y") {
        foundBok = await checkRecentBok("Willy"); // true, encontro los bookmarks de wiily y vegeta
    }
    if (youOtwitch === "T") {
        foundBok = await checkRecentBok("Lely");
    }
    if (youOtwitch !== "Y" && youOtwitch !== "T") {
        foundBok = await checkRecentBok("Willy");
        if (foundBok === false) {
            foundBok = await checkRecentBok("Lely");
            if (foundBok === false) {
                try {
                    chrome.bookmarks.getRecent(2, (bok) => {
                        document.getElementById("streamer1").innerText = "Recent1 " + bok[0].title;
                        document.getElementById("streamer2").innerText = "Recent2 " + bok[1].title;
                    });
                } catch (e) {
                    console.warn(e);
                }
            }
        }
    }
    if (urlVideo !== "?") {
        checkVideoFinish_o_Cont();
    }
}
/**
 * Tratar de saber si estamos en youtube o twitch, (osea el perfil, vegetita(youtube) o
 * twitch369(tiwtch)), en la variable youOtwitch se pone Y o T
 */
async function isYoutube_o_Twitch() {
    try {
        await new Promise(function (callb) {
            chrome.bookmarks.getTree(function (bok) {
                let i;
                let willyfound = false;
                let vegefound = false;
                let rubiusfound = false;
                let lelyfound = false;
                const v = bok[0].children[0].children;
                // Agarro la barra de bookmarks, y me fijo si estan las carpetas de (Willy y Vege)
                // o (Rubius y Lely), pero esas son las carpetas principales necesito fijarme
                // si adentro de esas carpetas estan las carpetas de Continuar - Finish
                for (i = 0; i < v.length; i+=1) {
                    if (youOtwitch !== "T") {
                        if (willyfound === false) {
                            willyfound = findMainFolder(v[i], willy, "Y");
                        }
                        if (vegefound === false) {
                            vegefound = findMainFolder(v[i], vege, "Y");
                        }
                        if (willyfound === true && vegefound === true) {
                            mensaje("Se llego al final Y i "+i+" v "+v.length);
                            break;
                        }
                    }
                    if (youOtwitch !== "Y") {
                        if (rubiusfound === false) {
                            rubiusfound = findMainFolder(v[i], rubius, "T");
                        }
                        if (lelyfound === false) {
                            lelyfound = findMainFolder(v[i], lely, "T");
                        }
                        if (rubiusfound === true && lelyfound === true) {
                            mensaje("Se llego al final T i "+i+" v "+v.length);
                            break;
                        }
                    }
                }
                // Buscar en la barra de bookmarks la carpeta principal de cada streamer
                // y despues dentro buscar la carpeta de continuar o finish
                // bokNode deberia ser la carpeta principal
                function findMainFolder(bokNode, stre, youtubeTwitch) {
                    let bol = false;
                    let contFound = false;
                    let finiFound = false;
                    if (bokNode.title === stre.nombre && bokNode.url === undefined) {
                        youOtwitch = youtubeTwitch;
                        let j;
                        const child = bokNode.children;
                        for (j = 0; j < child.length; j+=1) {
                            if (checkNull(contFound)) {
                                mensaje("Err contFound vacio");
                            }
                            if (checkNull(finiFound)) {
                                mensaje("Err finiFound vacio");
                            }
                            if (contFound === false) {
                                contFound = checkNameContFin(child[j], stre, "Continuar", stre.IDcontinuar, stre.nameContinuar);
                            }
                            if (finiFound === false) {
                                finiFound = checkNameContFin(child[j], stre, "Finish", stre.IDfinish, stre.nameFinish);
                            }
                            if (contFound === true && finiFound === true) {
                                mensaje("Se llego al final i "+i+" v "+v.length);
                                break;
                            }
                        }
                        bol = true;
                    }
                    return bol;
                }
                // Comrprobar si los ID de las carpetas coiinciden con los que yo carge
                // en la variables, porque pueden ser diferentes(nose porque cambia)
                // creo que cambia si renombras los bookmarks o cambias cosas
                function checkNameContFin(bokChild, stre, cual, IDfolder, nom) {
                    let bol = false;
                    if (bokChild.title === nom) {
                        if (bokChild.id !== IDfolder) {
                            mensaje("Deberia ser "+bokChild.id+" folder "+cual+" de "+stre.nombre
                            +" pero es "+IDfolder);
                            const op = cual === "Continuar" ? "IDcontinuar" : "IDfinish";
                            // eslint-disable-next-line no-param-reassign
                            stre[op] = bokChild.id;
                        }
                        bol = true;
                    }
                    return bol;
                }
                callb();
            });
        });
    } catch (e) {
        console.warn(e);
    }
}
/**
 * Comprobar si el video actual ya se termino de ver o tiene un punto de continuar
 */
function checkVideoFinish_o_Cont() {
    if (checkNull(actualStreamer)) {
        mensaje("Err actualStreamer vacio");
        return;
    }
    try {
        if (checkNull(actualStreamer.IDcontinuar)) {
            mensaje("Error actualStreamer.IDcontinuar vacio");
        } else {
            chrome.bookmarks.getSubTree(actualStreamer.IDcontinuar, function (bok) {
                const x = findbokInTree(bok);
                checkBokContinuar(x);
            });
        }
    } catch (e) {
        console.warn(e);
        mensaje(actualStreamer);
    }
    try {
        if (checkNull(actualStreamer.IDfinish)) {
            mensaje("Error actualStreamer.IDfinish vacio");
        } else {
            chrome.bookmarks.getSubTree(actualStreamer.IDfinish, function (bok) {
                const x = findbokInTree(bok);
                checkBokFinish(x);
            });
        }
    } catch (e) {
        console.warn(e);
        mensaje(actualStreamer);
    }
}
async function checkRecentBok(cualStreamers) {
    let bol = true;
    let actS1;
    let actS2;
    let nom1;
    let nom2;
    if (checkNull(cualStreamers)) {
        mensaje('Error cualStreamers vacio');
    }
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
    let a1;
    let a2;
    try {
        a1 = await getBokLastContFinish(actS1, nom1, "streamer1");
        a2 = await getBokLastContFinish(actS2, nom2, "streamer2");
    } catch (e) {
        console.warn(e);
    }
    if (a1 === false || a2 === false) {
        bol = false;
    }
    return bol;
}
async function getBokLastContFinish(cual, nom, elem) {
    if (checkNull(cual)) {
        mensaje('Error cual vacio');
    }
    if (checkNull(nom)) {
        mensaje('Error nom vacio');
    }
    if (checkNull(elem)) {
        mensaje('Error nom vacio');
    }
    let bolu = true;
    let x;
    let ac;
    let af;
    try {
        ac = await getBokChild(cual.IDcontinuar);
        af = await getBokChild(cual.IDfinish);
        if (checkNull(ac) || checkNull(af)) {
            mensaje("ac o af vacio");
            mensaje(cual);
            mensaje(nom);
            return false;
        }
        if (checkNull(ac.id) || checkNull(af.id)) {
            mensaje("(ac o af)ID vacio");
            mensaje(cual);
            mensaje(nom);
            return false;
        }
        if (parseInt(ac.id, 10) > parseInt(af.id, 10)) {
            x = `<span style="color: green";>C</span> <a target="_blank" href="`+ac.url
            +`"style="color: blue">`+ac.title+`</a>`;
        } else {
            x = `<span style="color: red";>F</span> ` + af.title;
        }
        document.getElementById(elem).innerHTML = nom + " " + x;
    } catch (e) {
        bolu = false;
        console.warn(e);
        mensaje(cual);
        mensaje(nom);
        document.getElementById("streamer1").innerHTML = "Err";
    }
    return bolu;
}
async function getBokChild(id) {
    if (checkNull(id)) {
        mensaje('Error id vacio');
        return undefined;
    }
    let bok;
    try {
        bok = await getBokChildrenAsync(id);
        if (checkNull(bok)) {
            mensaje('Error bok vacio');
            return undefined;
        }
        if (checkNull(bok.length)) {
            mensaje('Error bok.lnegth vacio');
            return undefined;
        }
        bok = bok[bok.length - 1];
    } catch (e) {
        console.warn(e);
    }
    return bok;
}
async function getBokChildrenAsync(id) {
    if (checkNull(id)) {
        mensaje('Error id vacio');
    }
    let prom;
    try {
        prom = await new Promise(function (callb) {
            chrome.bookmarks.getChildren(id, function (bok) {
                if (chrome.runtime.lastError) {
                    mensaje(chrome.runtime.lastError.message);
                }
                if (checkNull(bok)) {
                    mensaje('Error bok vacio');
                    mensaje(id);
                }
                callb(bok);
            });
        });
    } catch (e) {
        console.warn(e);
    }
    return prom;
}
function findbokInTree(bok) {
    let i;
    let x = null;
    if (checkNull(bok)) {
        mensaje('Error bok vacio');
    }
    let unv = bok[0].children;
    try {
        unv = bok[0].children;
    } catch (e) {
        console.warn(e);
        return x;
    }
    for (i = unv.length - 1; i >= 0; i-=1) {
        if (unv[i].url === urlVideo) {
            x = unv[i];
            break;
        }
    }
    return x;
}
function checkBokContinuar(bok) {
    let bol = true;
    if (bok === undefined) {
        mensaje('Error bok vacio');
    }
    if (bok === null) { // si bok es null es porque no encontre el bookmark, ose que
        // toadavia no se guardo un continuar
        bol = false;
    }
    try {
        if (bol === true) {
            document.getElementById("cont").innerText = "Resfresh Continuar";
            document.getElementById("dateC").innerText = ""+bok.title.substring(0, 19);
            document.getElementById("tiemC").innerText = ""+bok.title.substring(19, 29)+" ("+bok.id+")";
            document.getElementById("estadoBok").innerText = "Tiene un punto de continuar";
            IDbokcontinuar = bok.id; // el id del bookmark donde se quedo el video
        } else {
            document.getElementById("cont").innerText = "Add Continuar";
        }
    } catch (e) {
        console.warn(e);
    }
    refreshBokConti = bol;
}
function checkBokFinish(bok) {
    if (bok !== null) { // si bok es null no se encontro el bookmark, osea que el video
        // todavia no se finalizo
        document.getElementById("estadoBok").innerText = "---!!!Video finalizado!!!---";
    }
}
function refrescar() {
    let da = actDate();
    try {
        da = actDate();
        document.getElementById("date").innerText = da;
    } catch (e) {
        console.warn(e);
    }
}
function actDate() {
    let a;
    let date;
    let d;
    try {
        date = new Date();
        d = ""+date.getFullYear();
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
    } catch (e) {
        console.warn(e);
    }
    return d;
}
function getData(cont_O_finish) {
    request("refresh");
    refrescar();
    let xtie = "?";
    let xtit = "?";
    let xcan = "?";
    if (checkNull(actualRequest)) {
        mensaje("Vacio actualRequest " + actualRequest);
    } else {
        try {
            xtit = actualRequest.titu;
            xtie = actualRequest.tiem;
            xcan = actualRequest.canal;
        } catch (e) {
            console.warn(e);
        }
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
        mensaje("Sin canal ?");
        break;
    }
    let aux;
    if (cont_O_finish) {
        aux = actDate() + " " + formatTi(xtie) + " " + xtit;
    } else {
        aux = actDate() + " " + xtit;
    }
    if (checkNull(actData)) {
        mensaje('Error acDtata vacio');
    }
    try {
        actData.titulo = aux;
        actData.url = urlVideo;
    } catch (e) {
        console.warn(e);
    }
}
function crearBok(id, tit, ur) {
    try {
        chrome.bookmarks.create({parentId: id, title: tit, url: ur});
    } catch (e) {
        console.warn(e);
    }
}
const takeScreenshot = async () => {
    console.clear();
    const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
            displaySurface: "window",
            resizeMode: "none",
            logicalSurface: true,
        },
    });
    // get correct video track
    //applyConstraints(constraints)
    const track = stream.getVideoTracks()[0];
    // init Image Capture and not Video stream
    const img = new ImageCapture(track);
    setTimeout(async () => {
        // take first frame only
        const bitmap = await img.grabFrame();
        // destory video track to prevent more recording / mem leak
        track.stop();
        const canvas = document.getElementById('canva');
        // this could be a document.createElement('canvas') if you want
        // draw weird image type to canvas so we can get a useful image
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext('2d');
        context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
        const image = canvas.toDataURL();
        // this turns the base 64 string to a [File] object
        const res = await fetch(image);
        const buff = await res.arrayBuffer();
        // clone so we can rename, and put into array for easy proccessing
        writeFile(await getNewFileHandle(), buff);
    }, 500);
};
async function getNewFileHandle() {
    const options = {
        suggestedName: `${actDate()}.jpg`,
        startIn: 'pictures',
        /*types: [{
            description: 'Text Files',
            accept: {'text/plain': ['.txt']},
        }],*/
    };
    const handle = await window.showSaveFilePicker(options);
    return handle;
}
async function writeFile(fileHandle, contents) {
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(contents);
    // Close the file and write the contents to disk.
    await writable.close();
}
function request(m) {
    try {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
            var acT = tabs[0];
            chrome.tabs.sendMessage(acT.id, {txt: m}, function (ped) {
                if (chrome.runtime.lastError) {
                    mensaje(chrome.runtime.lastError.message);
                }
                actualRequest = ped;
            });
        });
    } catch (e) {
        console.warn(e);
    }
}
function mensaje(ms) {
    if (showMsj === true) {
        mensaje(ms);
    }
}
function checkNull(valor) {
    if (valor === undefined || valor === null) {
        return true;
    }
    return false;
}
function formatTi(tiem) {
    // 00_13_23
    let x = tiem;
    x = x.replaceAll(":", "_");
    if (x.length === 8) {
        return x;
    }
    if (x.length > 8) {
        mensaje("no deberia tener mas de 8 length");
        return x;
    }
    if (x.length === 4) {
        return "00_0" + x;
    }
    if (x.length === 5) {
        return "00_" + x;
    }
    if (x.length === 7) {
        return "0" + x;
    }
    return "Err";
}
function fromTxt(tx) {
    let n = "" + tx;
    // (n).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    if (n.length === 1) {
        n = "0" + n;
    }
    return n;
}
function dumpBookmarks() {
    if (listaEnPantalla === true) {
        mensaje("Ya esta la lista de bookmarks");
        // $("#vB").text("Ok.");
    } else {
        listaEnPantalla = true;
        try {
            chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
                $("#vB").append(dumpTreeNodes(bookmarkTreeNodes));
            });
        } catch (e) {
            console.warn(e);
        }
    }
}
function dumpTreeNodes(bookmarkNodes) {
    const list = $("<ul>");
    let i;
    // msg(bookmarkNodes);
    for (i = 0; i < bookmarkNodes.length; i+=1) {
        list.append(dumpNode(bookmarkNodes[i]));
        if (i === 1) {
            // break;
        }
    }
    return list;
}
function dumpNode(bookmarkNode) {
    const bok = bookmarkNode;
    if (!bok.title) {
        if (bok.url) {
            bok.title = "vacio";
        }
    }
    let anchor;
    if (bok.title) {
        anchor = $("<a>");
        if (!bok.children) {
            anchor = $('<a style="color: green">');
        }
        anchor.attr("href", bok.url);
        anchor.text(bok.title);
        const au = $('<span style="color: red;">   ' + bok.id + "</span>");
        anchor.append(au);
    }
    const li = $(bok.title ? "<li>" : "<div>").append(anchor);
    if (bok.children && bok.children.length > 0) {
        li.append(dumpTreeNodes(bok.children));
    }
    return li;
}
/*
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
