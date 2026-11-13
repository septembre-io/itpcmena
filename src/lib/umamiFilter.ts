// ---------------------------------------------------------------------------
// Filtre des robots pour Umami (atom.septembre.io).
//
// Avant ce filtre, environ trois sessions sur quatre étaient des robots qui
// chargent une page et repartent (note de fréquentation du 27/10/2026) : le
// taux de rebond affiché (94 %) mesurait surtout eux.
//
// Le script de suivi appelle window[UMAMI_BEFORE_SEND] avant chaque envoi
// (attribut data-before-send) ; une valeur fausse annule l'envoi, une promesse
// le retarde. Règles :
//   1. navigateur automatisé (navigator.webdriver, agent « Headless ») ou écran
//      typique des robots (liste reprise de Site-itpcmena/stats/umami_extraction.js) :
//      rien n'est envoyé ;
//   2. sinon, rien n'est envoyé avant un premier geste humain (souris, toucher,
//      molette, clavier). La page vue part alors avec ses données d'origine.
//      Conséquence assumée : une visite fermée sans aucun geste n'est plus comptée.
//      Le geste est retenu pour l'onglet (sessionStorage) : les pages suivantes
//      de la visite partent sans attendre.
// Les pays (Singapour, Chine…) ne sont pas visibles côté navigateur : ce critère
// reste dans le script d'extraction.
// ---------------------------------------------------------------------------

export const UMAMI_BEFORE_SEND = "umamiAvantEnvoi";

const ECRANS_ROBOTS = [
  "1280x1200",
  "1366x1366",
  "1600x1600",
  "2000x2000",
  "1280x1280",
  "1024x768",
  "800x600",
];

const GESTES = ["pointerdown", "pointermove", "touchstart", "wheel", "keydown"];

export const UMAMI_FILTER_SCRIPT = `(function () {
  var w = window, n = w.navigator;
  var ecran = w.screen.width + "x" + w.screen.height;
  var robot = n.webdriver === true || /Headless|PhantomJS/i.test(n.userAgent) ||
    ${JSON.stringify(ECRANS_ROBOTS)}.indexOf(ecran) !== -1;
  var gestes = ${JSON.stringify(GESTES)};
  var CLE = "umami.humain", attente = [], humain = false;
  try { humain = w.sessionStorage.getItem(CLE) === "1"; } catch (e) {}
  function geste() {
    if (humain) return;
    humain = true;
    try { w.sessionStorage.setItem(CLE, "1"); } catch (e) {}
    gestes.forEach(function (g) { w.removeEventListener(g, geste, true); });
    attente.forEach(function (f) { f(); });
    attente = [];
  }
  if (!robot && !humain) gestes.forEach(function (g) {
    w.addEventListener(g, geste, { capture: true, passive: true });
  });
  w[${JSON.stringify(UMAMI_BEFORE_SEND)}] = function (type, payload) {
    if (robot) return false;
    if (humain) return payload;
    return new Promise(function (resolve) {
      attente.push(function () { resolve(payload); });
    });
  };
})();`;
