/* ================================ */
/* =========================
/* =========================
   Utils (namespace léger)
   ========================= */
   /**
 * Injecte un encart d'information sur l'installation de la PWA,
 * avec protection anti-doublon.
 * @param {HTMLElement|string} container - Élément ou sélecteur CSS du conteneur cible.
 */
function injectPwaTip(container) {
  // 🔸 Autoriser sélecteur ou élément
  const target = typeof container === "string"
    ? document.querySelector(container)
    : container;

  if (!target) {
    console.warn("⚠️ injectPwaTip : conteneur introuvable");
    return;
  }

  // 🔸 Vérifie si déjà présent
  if (target.querySelector(".pwa-tip")) {
    console.info("ℹ️ PWA tip déjà présent dans ce conteneur");
    return;
  }

  // 🔸 Crée le contenu
  const html = `
    <div class="pwa-tip">
      <h3>💡 Astuce&nbsp;: installez l’application</h3>
      <p>
        Ce site est une <strong>PWA (Progressive Web App)</strong> : vous pouvez 
        <strong>l’ajouter à votre écran d’accueil</strong> pour un accès rapide, 
        <em>même hors connexion</em>.
      </p>
      <ul>
        <li>📱 Sur <strong>Android</strong> : menu ⋮ → <em>Ajouter à l’écran d’accueil</em></li>
        <li>🍎 Sur <strong>iPhone</strong> : <em>Partager → Sur l’écran d’accueil</em></li>
        <li>💻 Sur <strong>ordinateur</strong> : bouton <em>Installer l’application</em> dans la barre d’adresse</li>
      </ul>
    </div>
  `;

  // 🔸 Injection
  target.insertAdjacentHTML("beforeend", html);
}
   async function logUserEvenmt(eventLabel) {
  const terminalKey = localStorage.getItem("terminalKey");
  if (!terminalKey) return console.warn("⛔ terminalKey manquant");

  try {
    const res = await fetch("api/log_event.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terminalKey, event: eventLabel })
    });
    const data = await res.json();
    if (!data.success) {
      console.error("⚠️ log_event:", data.error);
    } else {
      console.log("📝", data.message, ":", data.event);
    }
  } catch (err) {
    console.error("🚨 Erreur réseau log_event:", err);
  }
}

async function logUserEvent(eventType, details = {}) {
  const terminalKey = localStorage.getItem("terminalKey");
  if (!terminalKey) return console.warn("⛔ terminalKey manquant");

  try {
    const payload = {
      terminalKey,
      eventType,   // ex: "browse", "filter-change", ...
      details,     // objet complet (ex: { category: "pizza" })
      timestamp: Date.now()
    };

    const res = await fetch("api/log_event.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.success) {
      console.error("⚠️ log_event:", data.error);
    } else {
      console.log(`📝 ${data.message}:`, payload);
    }
  } catch (err) {
    console.error("🚨 Erreur réseau log_event:", err);
  }
}
   function setThemeColor(color) {
     
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', color);
}

   function getTerminalKey() {
    let key = localStorage.getItem("terminalKey");
    if (!key) {
    /*
      key = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
      localStorage.setItem("terminalKey", key);
      console.log("🔑 Nouvelle clé générée :", key);
      */
      console.log("🔑 Clé introuvable :");
    } else {
      console.log("🔑 Clé existante :", key);
    }
    return key;
  }
  let terminalKey = null;
  
// ic : icon/path ref (dtring)
const Utils = {
  jumpEl(el) {
    if (!el) return;

    el.classList.remove('jump');
    // Forcer le reflow pour relancer l'animation si déjà jouée
    void el.offsetWidth;
    el.classList.add('jump');

    // Suppression automatique à la fin de l'animation
    el.addEventListener('animationend', () => {
      el.classList.remove('jump');
    }, { once: true });
  },
  generateId(length = 8) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  },
  generateCellShadingClasses(thicknesses = [1,2,3,4], color = "#000") {
    const STYLE_ID = "cellshade-styles";
    let styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }
    let css = "";
    thicknesses.forEach(t => {
      const shadows = [];
      for (let x = -t; x <= t; x++) for (let y = -t; y <= t; y++) {
        if (x || y) shadows.push(`${x}px ${y}px 0 ${color}`);
      }
      css += `.cellshade-${t}{text-shadow:${shadows.join(",")}}\n`;
    });
    styleEl.textContent = css;
  },
  applyCellShading(el, thickness = 2, color = "#000") {
    return;
    const shadows = [];
    for (let x = -thickness; x <= thickness; x++) for (let y = -thickness; y <= thickness; y++) {
      if (x || y) shadows.push(`${x}px ${y}px 0 ${color}`);
    }
    el.style.textShadow = shadows.join(", ");
  },
  mkSelect(options, initialValue, onChange) {
    const container = document.createElement("div");
    container.className = "custom-selector";
    options.forEach(opt => {
      const item = document.createElement("div");
      item.className = "selector-item";
      item.textContent = opt;
      if (opt === initialValue) item.classList.add("active");
      item.addEventListener("click", () => {
        container.querySelectorAll(".selector-item").forEach(el => el.classList.remove("active"));
        item.classList.add("active");
        onChange(opt);
      });
      container.appendChild(item);
    });
    return container;
  },
  async apiGet(url) {
    try {
      const r = await fetch(url, { headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } catch (e) { console.error("⚡ apiGet:", e); throw e; }
  },
  async apiPost(url, data = {}) {
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data)
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } catch (e) { console.error("⚡ apiPost:", e); throw e; }
  }
};
Utils.formatEventLabel = function (e, color = "#111") {
  if (!e) return "";

  // ✅ Si e est un objet ({ type, details })
  let text = "";
  if (typeof e === "object") {
    const type = e.type || "";
    const cat = e.details?.category || "";
    text = `[${type}]${cat ? " " + cat : ""}`;
  } else {
    text = String(e);
  }

  // --- Dictionnaire texte → icône ---
  const iconMap = {
    "browse": "icon-eye",
    "modif": "icon-sliders",
    "zoom": "icon-search",
    "filter-change": "icon-target",
    "scroll-theme-change": "icon-adjust",
    "category-render": "icon-th-large",
    "context-userland": "icon-user",
    "context-shopland": "icon-icburger",
    "context-root": "icon-cog",
    "login": "icon-login",
    "logout": "icon-lock-open",
    "register": "icon-user-add",
    "error": "icon-cancel",
    "ok": "icon-ok",
    "print": "icon-print",
    "download": "icon-download",
    "upload": "icon-upload",
    "money": "icon-money",
    "gift": "icon-gift",
    "chart": "icon-chart-line",
    "stat": "icon-chart-line",
    "qrcode": "icon-qrcode",
    "barcode": "icon-qrcode",
    "map": "icon-location",
    "location": "icon-location",
    "delivery": "icon-location",
    "mail": "icon-mail-alt",
    "contact": "icon-mail-alt",
    "info": "icon-info"
  };

  let html = text;

  // 🔁 Remplace chaque mot-clé par son <i> équivalent
  for (const [key, iconClass] of Object.entries(iconMap)) {
    const regex = new RegExp(`\\b${key}\\b`, "gi");
    html = html.replace(regex, `<i class="${iconClass}" style="color:${color}"></i>`);
  }

  // 🧹 Supprimer les crochets et espaces inutiles
  html = html
    .replace(/\[+/g, "")  // supprime les [
    .replace(/\]+/g, "")  // supprime les ]
    .replace(/\s{2,}/g, " ") // supprime les espaces doubles
    .trim();

  return html;
};
/* =========================
   Boutons icônes (inchangé)
   ========================= */
   /**
 * Transforme un bouton en bouton "tempo" à confirmation intégrée.
 * @param {HTMLButtonElement} btn - Le bouton à transformer
 * @param {Function} onConfirm - Fonction exécutée à la 2e validation
 * @param {String} label - Libellé du bouton en mode confirmation (défaut: "Confirmer")
 * @param {Number} timeout - Durée (ms) avant retour automatique (défaut: 4000)
 */
function makeTempoButton(btn, onConfirm, label = "Confirmer", timeout = 2500) {
  if (!btn) return;
  let tempoTimeout = null;

  btn.addEventListener("click", () => {
    // --- Si déjà en mode confirmation ---
    if (btn.classList.contains("confirm")) {
      btn.textContent = "En cours...";
      btn.disabled = true;

      // Exécute la fonction de confirmation
      Promise.resolve(onConfirm()).finally(() => {
        // petit délai visuel
        setTimeout(() => {
          btn.disabled = false;
          btn.classList.remove("confirm");
          btn.textContent = btn.dataset.label || btn.textContent;
          btn.style.backgroundColor = "";
        }, 800);
      });
      return;
    }

    // --- Activation du mode confirmation ---
    btn.dataset.label = btn.textContent; // sauvegarde du texte initial
    btn.classList.add("confirm");
    btn.textContent = label;
    btn.style.transition = "background-color 0.4s ease, color 0.3s ease";
    btn.style.backgroundColor = "#000";
    btn.style.color = "#fff";

    // --- Timeout pour retour automatique ---
    clearTimeout(tempoTimeout);
    tempoTimeout = setTimeout(() => {
      btn.classList.remove("confirm");
      btn.textContent = btn.dataset.label || "Action";
      btn.style.backgroundColor = "";
      btn.style.color = "";
    }, timeout);
  });
}
function mkjsonbtn(filename = "data.json", obj)
{
  
  return mkdiv(filename,'','', 'click',  () => {
    // 1. Convertir en JSON texte
    const jsonStr = JSON.stringify(obj, null, 2);

    // 2. Créer un Blob
    const blob = new Blob([jsonStr], { type: "application/json" });

    // 3. Créer une URL temporaire
    const url = URL.createObjectURL(blob);

    // 4. Créer un lien <a> caché et le cliquer
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json"; // nom du fichier
    a.click();

    // 5. Nettoyer l’URL temporaire
    URL.revokeObjectURL(url);
  });
}

function mkdiv(textcontent = "", className = "", id = "", eventType = "", eventTriggeredCallback = null)
{ 
  // Création du div
  const div = document.createElement("div");

  // Ajout du contenu texte si fourni
  if (textcontent) div.innerHTML = textcontent;

  // Ajout de la classe
  if (className) div.className = className;

  // Ajout de l'id
  if (id) div.id = id;

  // Ajout éventuel de l'événement
  if (eventType && typeof eventTriggeredCallback === "function") {
    div.addEventListener(eventType, eventTriggeredCallback);
  }

  return div;
}
/**
 * Crée un bouton simple ou "tempo" (confirmation intégrée)
 * @param {string} label - Texte ou HTML du bouton
 * @param {string} [className=""] - Classe(s) CSS
 * @param {string} [id=""] - ID du bouton
 * @param {string} [eventType=""] - Type d'événement (ex: "click")
 * @param {Function} [callback=null] - Callback classique pour l'événement
 * @param {Function} [tempoConfirmCallback=null] - Si fourni, active le mode bouton tempo
 * @returns {HTMLButtonElement}
 */
function mksbtn(
  label = "",
  className = "",
  id = "",
  eventType = "",
  callback = null,
  tempoConfirmCallback = null
) {
  // --- Création du bouton ---
  const btn = document.createElement("button");
  if (label) btn.innerHTML = label;
  if (className) btn.className = className;
  if (id) btn.id = id;

  // --- Mode bouton normal ---
  if (eventType && typeof callback === "function") {
    btn.addEventListener(eventType, callback);
  }

  // --- Mode bouton tempo (confirmation intégrée) ---
  if (typeof tempoConfirmCallback === "function") {
    makeTempoButton(btn, tempoConfirmCallback);
  }

  return btn;
}
function mkimg(src, className, id, eventType, eventCallback)
{
  const img = document.createElement("img");
  if (src) img.src = src;
  if (className) img.className = className;
  if (id) img.id = id;

  if (eventType && eventCallback) {
    img.addEventListener(eventType, eventCallback);
  }

  return img;
}
// mkflathack({ color, backgroundColor, font })
// Retourne le div overlay déjà ajouté au body.
// Petite API incluse : overlay.close() pour le retirer (ou Esc)
function mkflathack ({
  id = id || '',
  color = '#fff',
  backgroundColor = 'rgba(0,0,0,.85)',
  font = 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'
} = {}) {
  const el = mkdiv('','',id);
  
  
  // Styles inline, aucun CSS global requis
  Object.assign(el.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '99999',             // au-dessus de tout
    background: backgroundColor,
    color,
    fontFamily: font,
    display: 'block',
  /*
  alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',*/
    padding: '.0em',
    // confort mobile
    touchAction: 'none',
    WebkitTapHighlightColor: 'transparent',
    // transition légère optionnelle (peut être retirée)
    opacity: '1',
    transition: 'opacity .15s ease'
  });

  // Accessibilité basique
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.tabIndex = -1;

  // Empêche le scroll de fond
  ;
  document.documentElement.style.overflow = 'scroll';

  document.body.appendChild(el);


  // petite API utilitaire
  el.close = (remove = true) => {
    // petite fade-out (optionnel)
    el.style.opacity = '0';
    const done = () => {
      document.documentElement.style.overflow = prevOverflow;
      if (remove && el.parentNode) el.parentNode.removeChild(el);
      el.removeEventListener('transitionend', done);
    };
    // si pas de transition, on nettoie immédiatement
    if (getComputedStyle(el).transitionDuration === '0s') {
      done();
    } else {
      el.addEventListener('transitionend', done);
    }
  };

  // Esc pour fermer
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') el.close();
  });

  return el;
}

const buttonData = {
  "": { img: "pictos/Picto.png", label: "" },
  "croutons": { img: "pictos/croutonsnaturesPicto.png", label: "croutons" },
  "gruyère": { img: "pictos/gruyerePicto.png", label: "gruyère" },
  "Gruyère": { img: "pictos/gruyerePicto.png", label: "gruyère" },
  "œufs durs": { img: "pictos/oeufdurPicto.png", label: "œufs durs" },
  "œuf dur": { img: "pictos/oeufdurPicto.png", label: "œufs durs" },
  "oeuf dur": { img: "pictos/oeufdurPicto.png", label: "œufs durs" },
  "oeufs durs": { img: "pictos/oeufdurPicto.png", label: "œufs durs" },
  "sauce fromagère": { img: "pictos/saucefromPicto.png", label: "sauce fromagère" },
  "Sauce fromagère": { img: "pictos/saucefromPicto.png", label: "sauce fromagère" },
  "tenders": { img: "pictos/tendersPicto.png", label: "tenders" },
  "Tenders": { img: "pictos/tendersPicto.png", label: "tenders" },
  "salade": { img: "pictos/saladevertePicto.png", label: "salade verte" },
  "Salade": { img: "pictos/saladevertePicto.png", label: "salade verte" },
  "salade verte": { img: "pictos/saladevertePicto.png", label: "salade verte" },
  "Salade verte": { img: "pictos/saladevertePicto.png", label: "salade verte" },
  "mais": { img: "pictos/maisPicto.png", label: "maïs" },
  "maïs": { img: "pictos/maisPicto.png", label: "maïs" },
  "carottes": { img: "pictos/carottesPicto.png", label: "carottes" },
  "câpres": { img: "pictos/capresPicto.png", label: "câpres" },
  "capres": { img: "pictos/capresPicto.png", label: "câpreS" },
  "ananas": { img: "pictos/ananasPicto.png", label: "ananas" },
  "Boursin": { img: "pictos/boursinPicto.png", label: "boursin" },
  "courgette": { img: "pictos/courgettesPicto.png", label: "courgettes" },
  "courgettes": { img: "pictos/courgettesPicto.png", label: "courgettes" },
  "gorgonzola": { img: "pictos/gorgonzollaPicto.png", label: "gorgonzolla" },
  "maroilles": { img: "pictos/maroillesPicto.png", label: "maroilles" },
  "Maroilles": { img: "pictos/maroillesPicto.png", label: "maroilles" },
  "pepperoni": { img: "pictos/pepperoniPicto.png", label: "pepperoni" },
  "piment fort": { img: "pictos/pimentPicto.png", label: "piment fort" },
  "Sauce chili tai": { img: "pictos/chilitaiPicto.png", label: "sauce chili tai" },
  "kebab": { img: "pictos/kebabPicto.png", label: "kebab" },
  "viande kebab": { img: "pictos/kebabPicto.png", label: "kebab" },
  "poivrons": { img: "pictos/poivronsPicto.png", label: "poivrons" },
  "poivron": { img: "pictos/poivronsPicto.png", label: "poivrons" },
  "tomate fraiche": { img: "pictos/tomatePicto.png", label: "tomte fraiche" },
  "tomate": { img: "pictos/tomatePicto.png", label: "tomte fraiche" },
  "chèvre": { img: "pictos/chevrePicto.png", label: "chèvre" },
  "sauce BBQ": { img: "pictos/bbqPicto.png", label: "sauce BBQ" },
  "crème fraiche": { img: "pictos/potcremePicto.png", label: "crème fraiche" },
  "creme fraiche": { img: "pictos/potcremePicto.png", label: "crème fraiche" },
  "pommes de terres": { img: "pictos/pdtPicto.png", label: "pomme de terres" },
  "pomme de terre": { img: "pictos/pdtPicto.png", label: "pomme de terre" },
  "olive": { img: "pictos/olivesPicto.png", label: "olive" },
  "olives": { img: "pictos/olivesPicto.png", label: "olive" },
  "anchois": { img: "pictos/anchoisPicto.png", label: "anchois" },
  "oignon": { img: "pictos/oignonsPicto.png", label: "oignons" },
  "oignons": { img: "pictos/oignonsPicto.png", label: "oignons" },
  "œuf": { img: "pictos/oeufPicto.png", label: "oeuf" },
  "oeuf": { img: "pictos/oeufPicto.png", label: "oeuf" },
  "saumon": { img: "pictos/saumonPicto.png", label: "saumon" },
  "miel": { img: "pictos/mielPicto.png", label: "miel" },
  "cheddar": { img: "pictos/chedarPicto.png", label: "cheddar" },
  "jambon": { img: "pictos/jambonPicto.png", label: "jambon" },
  "base tomate": { img: "pictos/basetomatePicto.png", label: "base tomate" },
  "base crème": { img: "pictos/basecremePicto.png", label: "base crème" },
  "4 fromages différents": { img: "pictos/4fromPicto.png", label: "4 fromages différents" },
  "fromage": { img: "pictos/fromPicto.png", label: "mozzarella" },
  "Mozzarella": { img: "pictos/fromPicto.png", label: "mozzarella" },
  "mozzarella": { img: "pictos/fromPicto.png", label: "mozzarella" },
  "champignons": { img: "pictos/champignonPicto.png", label: "champignons" },
  "chorizo": { img: "pictos/chorizzoPicto.png", label: "chorizzo" },
  "chorizzo": { img: "pictos/chorizzoPicto.png", label: "chorizzo" },
  "lardons": { img: "pictos/lardonsPicto.png", label: "lardons" },
  "fromage à raclette": { img: "pictos/raclettePicto.png", label: "fromage à raclette" },
  "merguez": { img: "pictos/merguezPicto.png", label: "merguez" },
  "poulet": { img: "pictos/pouletPicto.png", label: "poulet" },
  "viande hachée": { img: "pictos/vhacheePicto.png", label: "viande hachée" },
  "origan": { img: "pictos/origanPicto.png", label: "origan" }
};
function createIconButtonj(key, parent) {
  if (!buttonData[key]) return null;
  const { img, label } = buttonData[key];
  const button = document.createElement("div");
  button.className = "icon-button";
  let pictoSide = mkdiv('', 'icon-btn-picto');
  let labelSide = mkdiv('', 'icon-btn-label');
  const image = document.createElement("img");
  image.src = img;
  image.alt = label;
  image.className = "icon-button-img";

  pictoSide.appendChild(image);
  labelSide.textContent = label;

  button.appendChild(pictoSide);
  button.appendChild(labelSide);
  
  parent.appendChild(button);
  return button;
}

// Configuration normalisée des ingrédients
const ingredients = {
  "": { img: "pictos/Picto.png", label: "" },
  "croutons": { img: "pictos/croutonsnaturesPicto.png", label: "croutons" },
  "gruyère": { img: "pictos/gruyerePicto.png", label: "gruyère" },
  "œufs durs": { img: "pictos/oeufdurPicto.png", label: "œufs durs" },
  "sauce fromagère": { img: "pictos/saucefromPicto.png", label: "sauce fromagère" },
  "tenders": { img: "pictos/tendersPicto.png", label: "tenders" },
  "salade verte": { img: "pictos/saladevertePicto.png", label: "salade verte" },
  "Salade verte": { img: "pictos/saladevertePicto.png", label: "salade verte" },
  "Salade": { img: "pictos/saladevertePicto.png", label: "salade verte" },
  "Salade": { img: "pictos/saladevertePicto.png", label: "salade verte" },
  "maïs": { img: "pictos/maisPicto.png", label: "maïs" },
  "carottes": { img: "pictos/carottesPicto.png", label: "carottes" },
  "câpres": { img: "pictos/capresPicto.png", label: "câpres" },
  "ananas": { img: "pictos/ananasPicto.png", label: "ananas" },
  "boursin": { img: "pictos/boursinPicto.png", label: "boursin" },
  "courgettes": { img: "pictos/courgettesPicto.png", label: "courgettes" },
  "gorgonzola": { img: "pictos/gorgonzollaPicto.png", label: "gorgonzola" },
  "maroilles": { img: "pictos/maroillesPicto.png", label: "maroilles" },
  "pepperoni": { img: "pictos/pepperoniPicto.png", label: "pepperoni" },
  "piment fort": { img: "pictos/pimentPicto.png", label: "piment fort" },
  "sauce chili tai": { img: "pictos/chilitaiPicto.png", label: "sauce chili tai" },
  "kebab": { img: "pictos/kebabPicto.png", label: "kebab" },
  "poivrons": { img: "pictos/poivronsPicto.png", label: "poivrons" },
  "tomate fraiche": { img: "pictos/tomatePicto.png", label: "tomate fraiche" },
  "chèvre": { img: "pictos/chevrePicto.png", label: "chèvre" },
  "sauce BBQ": { img: "pictos/bbqPicto.png", label: "sauce BBQ" },
  "crème fraiche": { img: "pictos/potcremePicto.png", label: "crème fraiche" },
  "pommes de terre": { img: "pictos/pdtPicto.png", label: "pommes de terre" },
  "olives": { img: "pictos/olivesPicto.png", label: "olives" },
  "anchois": { img: "pictos/anchoisPicto.png", label: "anchois" },
  "oignons": { img: "pictos/oignonsPicto.png", label: "oignons" },
  "œuf": { img: "pictos/oeufPicto.png", label: "œuf" },
  "saumon": { img: "pictos/saumonPicto.png", label: "saumon" },
  "miel": { img: "pictos/mielPicto.png", label: "miel" },
  "cheddar": { img: "pictos/chedarPicto.png", label: "cheddar" },
  "jambon": { img: "pictos/jambonPicto.png", label: "jambon" },
  "base tomate": { img: "pictos/basetomatePicto.png", label: "base tomate" },
  "base crème": { img: "pictos/basecremePicto.png", label: "base crème" },
  "4 fromages différents": { img: "pictos/4fromPicto.png", label: "4 fromages différents" },
  "mozzarella": { img: "pictos/fromPicto.png", label: "mozzarella" },
  "champignons": { img: "pictos/champignonPicto.png", label: "champignons" },
  "chorizo": { img: "pictos/chorizzoPicto.png", label: "chorizo" },
  "lardons": { img: "pictos/lardonsPicto.png", label: "lardons" },
  "fromage à raclette": { img: "pictos/raclettePicto.png", label: "fromage à raclette" },
  "merguez": { img: "pictos/merguezPicto.png", label: "merguez" },
  "poulet": { img: "pictos/pouletPicto.png", label: "poulet" },
  "viande hachée": { img: "pictos/vhacheePicto.png", label: "viande hachée" },
  "origan": { img: "pictos/origanPicto.png", label: "origan" }
};

// Fonction pour normaliser les clés (gère majuscules, accents, variantes)
function normalizeKey(key) {
  const normalized = key.toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/ê/g, 'e')
    .trim();
  
  // Map des variations vers la clé canonique
  const variations = {
    'gruyere': 'gruyère',
    'oeuf dur': 'œufs durs',
    'oeufs durs': 'œufs durs',
    'sauce fromagere': 'sauce fromagère',
    'salade': 'salade verte',
    'mais': 'maïs',
    'capres': 'câpres',
    'courgette': 'courgettes',
    'gorgonzolla': 'gorgonzola',
    'sauce chili taï': 'sauce chili tai',
    'viande kebab': 'kebab',
    'poivron': 'poivrons',
    'tomate': 'tomate fraiche',
    'creme fraiche': 'crème fraiche',
    'pomme de terre': 'pommes de terre',
    'pommes de terres': 'pommes de terre',
    'olive': 'olives',
    'oignon': 'oignons',
    'oeuf': 'œuf',
    'fromage': 'mozzarella',
    'mozarella': 'mozzarella',
    'chorizzo': 'chorizo'
  };
  
  return variations[normalized] || key;
}

function createIconButton(key, parent) {
  const normalizedKey = normalizeKey(key);
  const data = ingredients[normalizedKey];
  
  if (!data) return null;
  
  const { img, label } = data;
  
  const button = document.createElement("div");
  button.className = "icon-button";
  
  const pictoSide = mkdiv('', 'icon-btn-picto');
  const labelSide = mkdiv('', 'icon-btn-label');
  
  const image = document.createElement("img");
  image.src = img;
  image.alt = label;
  image.className = "icon-button-img";

  pictoSide.appendChild(image);
  labelSide.textContent = label;

  button.appendChild(pictoSide);
  button.appendChild(labelSide);
  
  parent.appendChild(button);
  return button;
}

// Création d’un index intelligent à partir du dictionnaire brut
function buildPictoIindex(buttonData) {
  const index = {};

  for (const key in buttonData) {
    const entry = buttonData[key];
    const label = entry.label?.toLowerCase().trim() || key.toLowerCase();

    // Définir une clé canonique (ex: pluriel préféré)
    const canonical = label.endsWith('s') ? label : label + 's';

    // Si la clé existe déjà, on ajoute l’alias
    if (index[canonical]) {
      if (!index[canonical].aliases.includes(key)) {
        index[canonical].aliases.push(key);
      }
      if (!index[canonical].aliases.includes(label)) {
        index[canonical].aliases.push(label);
      }
      continue;
    }

    // Sinon, on crée une nouvelle entrée
    index[canonical] = {
      img: entry.img,
      label: label,
      aliases: [key, label]
    };
  }

  return index;
}
function buildPictoIndex(buttonData) {
  const index = {};
  const allIngr = []; // 🔹 tableau de tous les ingrédients (chaînes de caractères)

  for (const key in buttonData) {
    const entry = buttonData[key];
    const label = entry.label?.toLowerCase().trim() || key.toLowerCase();

    // Définir une clé canonique (ex: pluriel préféré)
    const canonical = label;
    //const canonical = label.endsWith('s') ? label : label + 's';

    // Ajouter au tableau global des ingrédients
    if (!allIngr.includes(canonical)) {
      allIngr.push(canonical);
    }

    // Si la clé existe déjà, on ajoute l’alias
    if (index[canonical]) {
      if (!index[canonical].aliases.includes(key)) {
        index[canonical].aliases.push(key);
      }
      if (!index[canonical].aliases.includes(label)) {
        index[canonical].aliases.push(label);
      }
      continue;
    }

    // Sinon, on crée une nouvelle entrée
    index[canonical] = {
      img: entry.img,
      label: label,
      aliases: [key, label]
    };
  }

  return { index, allIngr };
}

const pictoIndex = buildPictoIndex(buttonData);
console.log(JSON.stringify(pictoIndex.allIngr));
let pizzaAddons = ["ananas","boursin","courgettes","gorgonzola","maroilles","pepperoni","piment fort","sauce chili tai","kebab","poivrons","tomte fraiche","chèvre","sauce bbq","crème fraiche","pomme de terres","pomme de terre","olive","anchois","oignons","oeuf","miel","cheddar","jambon","mozzarella","champignons","chorizzo","lardons","fromage à raclette","merguez","poulet","viande hachée","origan"];


/**
 * Ajoute les champs addons et addonPrice aux pizzas selon leur taille
 * @param {Array} database - Tableau d'objets produits
 * @returns {Array} - Tableau modifié avec les champs ajoutés
 */
function addPizzaAddons(database) {
  // Configuration des prix par taille
  const priceBySize = {
    'senior': 1.5,
    'méga': 2.5,
    'super méga': 3.5
  };

  // Liste des addons disponibles pour les pizzas
  const pizzaAddons = [
    "ananas", "boursin", "courgettes", "gorgonzola", "maroilles", 
    "pepperoni", "piment fort", "sauce chili tai", "kebab", "poivrons", 
    "tomate fraiche", "chèvre", "sauce bbq", "crème fraiche", 
    "pomme de terres", "olive", "anchois", "oignons", "oeuf", "miel", 
    "cheddar", "jambon", "mozzarella", "champignons", "chorizzo", 
    "lardons", "fromage à raclette", "merguez", "poulet", "viande hachée", 
    "origan"
  ];

  // Parcours de la base de données
  database.forEach(product => {
    // Vérification : catégorie pizza ET taille éligible
    if (product.category === 'pizza' && product.size) {
      const sizeLower = product.size.toLowerCase();
      
      // Si la taille correspond à l'un des critères
      if (priceBySize[sizeLower]) {
        product.addonPrice = priceBySize[sizeLower];
        product.addons = [...pizzaAddons]; // Clone du tableau
      }
    }
  });

  return database;
}

/**
 * Version qui modifie directement window.data (objet avec clés)
 */
function addPizzaAddonsToWindowData() {
  if (!window.data || typeof window.data !== 'object') {
    console.error('❌ window.data non trouvé ou invalide');
    return;
  }

  const priceBySize = {
    'senior': 1.5,
    'méga': 2.5,
    'super méga': 3.5
  };

  const pizzaAddons = [
    "ananas", "boursin", "courgettes", "gorgonzola", "maroilles", 
    "pepperoni", "piment fort", "sauce chili tai", "kebab", "poivrons", 
    "tomate fraiche", "chèvre", "sauce bbq", "crème fraiche", 
    "pomme de terres", "olive", "anchois", "oignons", "oeuf", "miel", 
    "cheddar", "jambon", "mozzarella", "champignons", "chorizzo", 
    "lardons", "fromage à raclette", "merguez", "poulet", "viande hachée", 
    "origan"
  ];

  let count = 0;

  for (const key in window.data) {
    const product = window.data[key];
    
    if (product.category === 'pizza' && product.size) {
      const sizeLower = product.size.toLowerCase();
      
      if (priceBySize[sizeLower]) {
        product.addonPrice = priceBySize[sizeLower];
        product.addons = [...pizzaAddons];
        count++;
      }
    }
  }

  console.log(`✅ ${count} produit(s) pizza mis à jour avec addons`);
  return count;
}

// ============================================
// VERSION AVEC RAPPORT DÉTAILLÉ
// ============================================

/**
 * Version avec rapport de traitement
 */
function addPizzaAddonsWithReport(database) {
  const priceBySize = {
    'senior': 1.5,
    'méga': 2.5,
    'super méga': 3.5
  };

  const pizzaAddons = [
    "ananas", "boursin", "courgettes", "gorgonzola", "maroilles", 
    "pepperoni", "piment fort", "sauce chili tai", "kebab", "poivrons", 
    "tomate fraiche", "chèvre", "sauce bbq", "crème fraiche", 
    "pomme de terres", "olive", "anchois", "oignons", "oeuf", "miel", 
    "cheddar", "jambon", "mozzarella", "champignons", "chorizzo", 
    "lardons", "fromage à raclette", "merguez", "poulet", "viande hachée", 
    "origan"
  ];

  const report = {
    total: database.length,
    updated: 0,
    skipped: 0,
    bySizes: {}
  };

  database.forEach(product => {
    if (product.category === 'pizza' && product.size) {
      const sizeLower = product.size.toLowerCase();
      
      if (priceBySize[sizeLower]) {
        product.addonPrice = priceBySize[sizeLower];
        product.addons = [...pizzaAddons];
        
        report.updated++;
        report.bySizes[sizeLower] = (report.bySizes[sizeLower] || 0) + 1;
      } else {
        report.skipped++;
      }
    } else {
      report.skipped++;
    }
  });

  console.log('📊 Rapport de traitement:', report);
  return { database, report };
}

// ============================================
// EXPORTER POUR UTILISATION GLOBALE
// ============================================

// Si vous voulez l'utiliser globalement
if (typeof window !== 'undefined') {
  window.addPizzaAddons = addPizzaAddons;
  window.addPizzaAddonsToWindowData = addPizzaAddonsToWindowData;
  window.addPizzaAddonsWithReport = addPizzaAddonsWithReport;
}
window.userland = {};
class SmartContentnext {
  /**
   * @param {HTMLElement} container  Élément DOM cible où afficher le contenu.
   * @param {Object} [data=window.data]  Base de données des produits.
   */
   constructor(container, data = window.data, siteCfg = window.data[0] || {}) {
     window.siteCfg = window.data[0];
     addPizzaAddonsWithReport(window.data)
     
     //window.smartcontent = this;
     const perf = new PerfMonitor({visible: false})
    this.container = container;
    this.data = data;
    this.siteCfg = siteCfg;
    this.activeFilters = {};
   // this.activeFilters = {pizza:{size:'senior'}};
    this.columns = siteCfg.site?.columns || 1;
  
    this.sdata = { categories: [] };
    this.currentCat = null;
    this.buildSmartData();
    window.sdata = this.sdata;
    this.renderHeaders();
    this.createDock();
    this.buildColorIndex();
    this.observeScrollTheme();
    window.smartContent = this;
    l(this);
    this.onCategoryFilterChange();
  }

  buildColorIndex(buffer = 100) {
    this.colorIndex = [];
  
    const siteCfg = this.siteCfg?.categories || window.site?.categories || {};
    const sections = this.container.querySelectorAll(".cat-section");
  
    sections.forEach(sec => {
      const category = sec.dataset.cat;
      const color = siteCfg[category]?.color || "#b71c1c";
  
      const top =
    sec.getBoundingClientRect().top -
    this.container.getBoundingClientRect().top +
    this.container.scrollTop;
    
      const height = sec.offsetHeight;
      const endPos = top + Math.max(0, height - buffer);
  
      // point de début (fige la couleur au début de la section)
      this.colorIndex.push({ position: top, color, category });
  
      // point proche de la fin (la couleur reste jusqu'ici)
      this.colorIndex.push({ position: endPos, color, category });
    });
  
    // S’assure de démarrer à 0 si nécessaire
    if (this.colorIndex.length && this.colorIndex[0].position > 0) {
      const first = this.colorIndex[0];
      this.colorIndex.unshift({ position: 0, color: first.color, category: first.category });
    }
  
    // Tri croissant par position
    this.colorIndex.sort((a, b) => a.position - b.position);
  
    console.log("🎨 Index couleur enrichi (avec catégorie) :", this.colorIndex);
  }
  observeScrollTheme(step = 10, debounceDelay = 800) {
    const container = this.container;
    if (!this.colorIndex?.length) return;
  
    const lerp = (a, b, t) => a + (b - a) * t;
    const hexToRgb = hex => {
      const c = hex.replace("#", "");
      const n = parseInt(c, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const rgbToHex = ([r, g, b]) =>
      "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
  
    let lastStep = -1;
    let browseTimeout = null; // 🔸 pour debounce des événements browse
  
    const onScroll = () => {
      const scrollTop = container.scrollTop || window.scrollY;
      const idx = this.colorIndex;
  
      // --- mode discret pour limiter la fréquence des calculs
      const currentStep = step > 0 ? Math.floor(scrollTop / step) : -1;
      if (step > 0 && currentStep === lastStep) return;
      lastStep = currentStep;
  
      // --- bornes encadrantes
      let lower = idx[0];
      let upper = idx[idx.length - 1];
      for (let i = 0; i < idx.length - 1; i++) {
        if (scrollTop >= idx[i].position && scrollTop < idx[i + 1].position) {
          lower = idx[i];
          upper = idx[i + 1];
          break;
        }
      }
  
      const range = Math.max(upper.position - lower.position, 1);
      const t = Math.min(Math.max((scrollTop - lower.position) / range, 0), 1);
  
      // --- interpolation couleur
      const c1 = hexToRgb(lower.color);
      const c2 = hexToRgb(upper.color);
      const mixed = [
        Math.round(lerp(c1[0], c2[0], t)),
        Math.round(lerp(c1[1], c2[1], t)),
        Math.round(lerp(c1[2], c2[2], t))
      ];
      const hex = rgbToHex(mixed);
  
      document.documentElement.style.setProperty("--main-texture", hex);
      document.body.style.background = hex;
      setThemeColor(hex);
  
      // --- catégorie actuellement dominante
      const activeCat = t < 0.5 ? lower.category : upper.category;
  
      // 🔸 debounce : n’émettre l’événement qu’une fois le scroll stabilisé
      if (this.currentCat !== activeCat) {
        clearTimeout(browseTimeout);
        browseTimeout = setTimeout(() => {
          if (this.currentCat !== activeCat) {
            this.currentCat = activeCat;
            this.emitUserEvent("browse", { category: activeCat });
          }
        }, debounceDelay);
      }
    };
  
    container.addEventListener("scroll", onScroll);
    window.addEventListener("resize", () => this.buildColorIndex());
  }
  /**
   * Construit une structure synthétique de toutes les catégories présentes
   * dans la base de données, en listant leurs options et leurs produits.
   */
  buildSmartData() {
  const raw = Object.entries(this.data)
    .filter(([key, val]) => val && typeof val === "object" && val.category)
    .map(([key, val]) => val);

  const categoriesMap = new Map();
  const siteCfg = this.siteCfg?.categories || window.site?.categories || {};

  for (const item of raw) {
    const cat = item.category || "autres";
    if (!categoriesMap.has(cat)) {
      categoriesMap.set(cat, {
        name: cat,
        options: [],
        items: new Map()
      });
    }

    const catEntry = categoriesMap.get(cat);
    const catCfg = siteCfg[cat] || {};
    const filtering = catCfg.filtering !== false; // ✅ true par défaut

    // 🔹 Si filtering est activé → regroupement par nom
    const key = filtering ? (item.name?.trim() || "inconnu") : Utils.generateId(6);

    // 🔸 Ajoute le produit sous sa clé (nom ou id unique)
    if (!catEntry.items.has(key)) {
      catEntry.items.set(key, item.name || "inconnu");
    }

    // 🔸 Collecte des options (size, pate, formule) seulement si filtering actif
    if (filtering) {
      const optionKeys = ["size", "pate", "formule"];
      for (const key of optionKeys) {
        if (item[key]) {
          let opt = catEntry.options.find(o => o.name === key);
          if (!opt) {
            opt = { name: key, values: new Set() };
            catEntry.options.push(opt);
          }
          opt.values.add(item[key]);
        }
      }
    }
  }

  // --- Transformation finale ---
  this.sdata.categories = Array.from(categoriesMap.values()).map(cat => ({
    name: cat.name,
    options: cat.options.map(o => ({
      name: o.name,
      values: Array.from(o.values)
    })),
    items: Array.from(cat.items.values())
  }));

  console.log("🧠 SmartContent.sdata (avec filtering)", this.sdata);
}
  renderHeaders() {
  this.container.innerHTML = "";

  // --- Icônes par défaut (fallbacks globaux) ---
  const catIcons = {
    assiette: "/app/icons/icPlat.svg",
    pizza: "/app/icons/icPizza.svg",
    burger: "/app/icons/icBurger.svg",
    tacos: "/app/icons/icTacos.svg",
    panini: "/app/icons/icPanini.svg",
    panizza: "/app/icons/icPanizza.svg",
    dessert: "/app/icons/icDessert.svg",
    boisson: "/app/icons/icDrink.svg",
    autres: "/app/icons/icFood.svg"
  };

  // --- Configuration site depuis le GSM ---
  const siteCfg = this.siteCfg?.categories || window.site?.categories || {};
  const defaultCols = this.siteCfg?.site?.columns || window.site?.site?.columns || 2;

  // --- Tri préalable des catégories selon l’ordre défini dans le siteCfg ---
  const sortedCats = [...this.sdata.categories].sort((a, b) => {
    const aOrder = siteCfg[a.name]?.order ?? 999;
    const bOrder = siteCfg[b.name]?.order ?? 999;
    if (aOrder === bOrder) return a.name.localeCompare(b.name);
    return aOrder - bOrder;
  });

  // --- Parcours des catégories triées ---
  for (const cat of sortedCats) {
    const siteCat = siteCfg[cat.name] || {};

    // 🔹 Ignore les catégories non visibles ou globales parasites
    if (siteCat.visible === false) continue;
    if (["site", "delivery", "gsm"].includes(cat.name)) continue;

    // --- Détermination du nombre de colonnes ---
    const ncols = siteCat.columns || defaultCols;

    // --- Construction du bloc de section ---
    const section = mkdiv("", "cat-section");
    section.dataset.cat = cat.name;
    section.dataset.cols = ncols;

    const header = mkdiv("", "cat-header cellshade-3 flex-between");
    const leftBox = mkdiv("", "header-left flex align-center");
    const rightBox = mkdiv("", "header-right flex align-center gap4");

    // --- Icône + titre ---
    const iconSrc = siteCat.icon || catIcons[cat.name] || catIcons.autres;
    const icon = mkimg(iconSrc, "cat-icon");

    const label =
      siteCat.label ||
      ("Nos " + cat.name.charAt(0).toUpperCase() + cat.name.slice(1) + "s");
    const title = mkdiv(label, "cat-title");

    leftBox.append(title);
    const about =
      siteCat.about ||
      "";
    const subtitle = mkdiv(about, "cat-sub-title");

    

// --- Sélecteurs stylisés pour chaque option multiple ---
// --- Sélecteurs stylisés pour chaque option multiple ---
for (const opt of cat.options) {
  if (!Array.isArray(opt.values) || opt.values.length < 2) continue;

  const siteCat = siteCfg?.[cat.name] || {};
  const defaultFilters = siteCat.defaultFilters || {};

  // 🔹 Priorité : 1️⃣ filtre actif  2️⃣ valeur par défaut  3️⃣ première valeur
  const activeValue = this.activeFilters?.[cat.name]?.[opt.name];
  const defaultValue = defaultFilters?.[opt.name];
  let initValue = opt.values[0];

  if (activeValue && opt.values.includes(activeValue)) {
    initValue = activeValue;
  } else if (defaultValue && opt.values.includes(defaultValue)) {
    initValue = defaultValue;
  }

  // 🔹 Création du sélecteur stylisé avec la valeur trouvée
  const mkSel = Utils.mkSelect(opt.values, initValue, value => {
    this.onCategoryFilterChange(cat.name, opt.name, value);
  });

  // 🔹 Mémorise la sélection initiale dans activeFilters
  this.activeFilters[cat.name] = this.activeFilters[cat.name] || {};
  this.activeFilters[cat.name][opt.name] = initValue;

  // 🔹 Conteneur visuel
  const box = mkdiv("", "filter-box flex align-center gap2");
  box.append(mkSel);
  rightBox.appendChild(box);

  // 🔹 Debug optionnel
  // console.debug(`⚙️ Filtre ${cat.name}.${opt.name} initialisé à "${initValue}"`);
}
    header.append(leftBox, rightBox);
    header.append(subtitle);
    section.appendChild(header);
    this.container.appendChild(section);

    // --- Rendu de la grille de produits avec le bon nombre de colonnes ---
    const previousCols = this.columns; // sauvegarde
    this.columns = ncols;              // applique la valeur spécifique
    this.renderItems(cat.name);
    this.columns = previousCols;       // restaure le fallback global
  }
}
  renderItems(catName) {
    const cat = this.sdata.categories.find(c => c.name === catName);
    if (!cat) return console.warn("❌ Catégorie introuvable :", catName);
    
    const grid = mkdiv("", "smart-grid");
    
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = `repeat(${this.columns || 1}, 1fr)`;
    grid.style.gap = "8px";
  
    const active = this.activeFilters?.[catName] || {};
    l("active");
    l(active);
    const hasFilters = Object.keys(active).length > 0;
    let visibleCount = 0;
  
    cat.items.forEach(name => {
      const variants = Object.values(this.data).filter(
        p => p.name === name && p.category === catName
      );
  
      let prod = null;
  
      if (hasFilters) {
        // 🔹 On cherche une variante correspondant exactement aux filtres actifs
        prod = variants.find(v =>
          Object.entries(active).every(([key, val]) => v[key] === val)
        );
  
        // ❗ Si aucun produit ne correspond, on ne prend rien du tout
        if (!prod) return; 
      } else {
        // 🔹 Si pas de filtre, on prend la première variante
        prod = variants[0];
      }
  
      if (prod) {
        new SmartCard(prod, grid);
        visibleCount++;
      }
    });
  
    // 🔹 Si aucun produit trouvé avec filtres actifs → ne rien afficher
    if (hasFilters && visibleCount === 0) {
      console.log(`⚠️ Aucun résultat pour "${catName}" avec les filtres actifs`);
      return;
    }
  
    // 🔹 Insère la grille après le header
    const section = this.container.querySelector(`.cat-section[data-cat="${catName}"]`);
    if (section && visibleCount > 0) section.appendChild(grid);
  }
  
  onCategoryFilterChange(catName, optName, value) {
    this.activeFilters[catName] = this.activeFilters[catName] || {};
  this.activeFilters[catName][optName] = value;
  
    // --- Supprime l’ancienne grille ---
    const section = this.container.querySelector(`.cat-section[data-cat="${catName}"]`);
    const grid = section?.querySelector(".smart-grid");
    if (grid) grid.remove();
  
    // --- Recherche du nombre de colonnes spécifique à la catégorie ---
    const siteCfg = this.siteCfg?.categories || window.site?.categories || {};
    const catCfg = siteCfg[catName] || {};
    const catCols =
      catCfg.columns ||
      this.siteCfg?.site?.columns ||
      window.site?.site?.columns ||
      this.columns || 2;
  
    // --- Met à jour dynamiquement le nombre de colonnes ---
    const previousCols = this.columns;
    this.columns = catCols;
  
    // --- Rafraîchit la grille correspondante ---
    this.renderItems(catName);
  
    // --- Restaure la valeur globale ---
    this.columns = previousCols;
  
    // (Optionnel) petit feedback console pour debug
    console.info(`🔄 ${catName}: filtre ${optName}=${value}, ${catCols} col(s)`);
    l(this.activeFilters)
  }
  createDockk() {
    const dock = mkdiv("", "smart-dock");
    const siteCfg = this.siteCfg?.categories || window.site?.categories || {};
    
    this.sdata.categories.forEach(cat => {
      const siteCat = siteCfg[cat.name] || {};
      if (siteCat.visible === false) return;
  
      const iconSrc = siteCat.icon || `/app/icons/ic${cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}.svg`;
      const img = mkimg(iconSrc, "dock-icon");
      img.title = siteCat.label || cat.name;
  
      img.addEventListener("click", () => {
        const section = this.container.querySelector(`.cat-section[data-cat="${cat.name}"]`);
        if (!section) return;
  
        // Déplie la section correspondante, replie les autres
        this.container.querySelectorAll(".cat-section").forEach(sec => {
         // sec.classList.toggle("collapsed", sec !== section);
          true;
        });
  
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      });
  
      dock.appendChild(img);
    });
  
    document.getElementById('root-ground').appendChild(dock);
  }
  createDock() {
  const dock = mkdiv("", "smart-dock", "navdock");
  const siteCfg = this.siteCfg?.categories || window.site?.categories || {};

  // 🔹 Tri des catégories selon la config site
  const sortedCats = [...this.sdata.categories].sort((a, b) => {
    const aOrder = siteCfg[a.name]?.order ?? 999;
    const bOrder = siteCfg[b.name]?.order ?? 999;
    if (aOrder === bOrder) return a.name.localeCompare(b.name);
    return aOrder - bOrder;
  });

  // 🔹 Génération du dock selon l’ordre trié
  sortedCats.forEach( cat => {
    const siteCat = siteCfg[cat.name] || {};
    if (siteCat.visible === false) return;

    const iconSrc =
      siteCat.icon ||
      `/app/icons/ic${cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}.svg`;

    const img = mkimg(iconSrc, "dock-icon");
    img.title = siteCat.label || cat.name;

    img.addEventListener("click", () => {
      const section = this.container.querySelector(`.cat-section[data-cat="${cat.name}"]`);
      if (!section) return;

      // 🔹 Scroll fluide vers la section correspondante
      section.scrollIntoView({ behavior: "smooth", block: "start" });

      // 🔸 Feedback visuel sur l’icône active
      dock.querySelectorAll(".dock-icon").forEach(i => i.classList.remove("active"));
      img.classList.add("active");
    });

    dock.appendChild(img);
  });

  // 🔹 Ajoute le dock dans le conteneur global
  const rootGround = document.getElementById("root-ground") || document.body;
  rootGround.appendChild(dock);
}
  emitUserEvent(type, details = {}) {
  const label = `[${type}] ${details.category}`;
  if (typeof logUserEvent === "function") logUserEvent(label);
  else console.log("📋 UserEvent:", label);
}
checkAllContentReady() {
  // Si toutes les sections ont des cartes chargées
  const allLoaded = Array.from(this.container.querySelectorAll(".smart-card"))
    .every(el => el.classList.contains("loaded") || el.classList.contains("no-img"));

  if (allLoaded && !this._contentReadyEmitted) {
    this._contentReadyEmitted = true;
    console.log("✅ SmartContent: tout le contenu est chargé");
    this.emitUserEvent("content-ready", { count: this.container.querySelectorAll(".smart-card").length });

    // Envoi d’un événement DOM pour usage externe
    const evt = new CustomEvent("smartcontent-ready", { detail: { source: this } });
    document.dispatchEvent(evt);
  }
}
showLoadehr(message = "Chargement du contenu...") {
  // Empêche les doublons
  if (this.loaderEl) return;
  
  const loader = document.createElement("div");
  loader.className = "smart-loader";
  loader.innerHTML = `
    <div class="loader-spinner"></div>
    <p>${message}</p>
  `;
  this.container.appendChild(loader);
  this.loaderEl = loader;
}


hideLoaderh() {
  if (!this.loaderEl) return;
  this.loaderEl.classList.add("fade-out");
  setTimeout(() => {
    this.loaderEl.remove();
    this.loaderEl = null;
  }, 400);
}
showLoader(message = "Chargement du contenu...") {
  if (this.loaderEl) return;

  const loader = document.createElement("div");
  loader.className = "smart-loader";
  loader.innerHTML = `
    <div class="loader-spinner"></div>
    <p class="loader-text">${message}</p>
    <div class="loader-progress">
      <div class="loader-progress-bar"></div>
    </div>
  `;
  document.body.appendChild(loader); // ✅ fixé sur le body pour ne pas être remplacé
  this.loaderEl = loader;
  this.loaderBar = loader.querySelector(".loader-progress-bar");
  this.loaderText = loader.querySelector(".loader-text");
}

updateLoaderProgress(done, total) {
  if (!this.loaderBar) return;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  this.loaderBar.style.width = pct + "%";
  this.loaderText.textContent = `Chargement... ${pct}%`;
}

hideLoader() {
  if (!this.loaderEl) return;
  this.loaderEl.classList.add("fade-out");
  setTimeout(() => {
    this.loaderEl.remove();
    this.loaderEl = null;
    this.loaderBar = null;
  }, 500);
}
}
class SmartContent {
  /**
   * @param {HTMLElement} container  Élément DOM cible où afficher le contenu.
   * @param {Object} [data=window.data]  Base de données des produits.
   */
   constructor(container, data = window.data, siteCfg = window.data[0] || {}) {
     window.siteCfg = window.data[0];
     addPizzaAddonsWithReport(window.data)
     
     //window.smartcontent = this;
     const perf = new PerfMonitor({visible: false})
    this.container = container;
    this.data = data;
    this.siteCfg = siteCfg;
    this.activeFilters = {};
   // this.activeFilters = {pizza:{size:'senior'}};
    this.columns = siteCfg.site?.columns || 1;
  
    this.sdata = { categories: [] };
    this.currentCat = null;
    this.buildSmartData();
    window.sdata = this.sdata;
    this.renderHeaders();
    this.createDock();
    this.buildColorIndex();
    this.observeScrollTheme();
    window.smartContent = this;
    l(this);
    this.onCategoryFilterChange();
  }

  buildColorIndex(buffer = 100) {
    this.colorIndex = [];
  
    const siteCfg = this.siteCfg?.categories || window.site?.categories || {};
    const sections = this.container.querySelectorAll(".cat-section");
  
    sections.forEach(sec => {
      const category = sec.dataset.cat;
      const color = siteCfg[category]?.color || "#b71c1c";
  
      const top =
    sec.getBoundingClientRect().top -
    this.container.getBoundingClientRect().top +
    this.container.scrollTop;
    
      const height = sec.offsetHeight;
      const endPos = top + Math.max(0, height - buffer);
  
      // point de début (fige la couleur au début de la section)
      this.colorIndex.push({ position: top, color, category });
  
      // point proche de la fin (la couleur reste jusqu'ici)
      this.colorIndex.push({ position: endPos, color, category });
    });
  
    // S’assure de démarrer à 0 si nécessaire
    if (this.colorIndex.length && this.colorIndex[0].position > 0) {
      const first = this.colorIndex[0];
      this.colorIndex.unshift({ position: 0, color: first.color, category: first.category });
    }
  
    // Tri croissant par position
    this.colorIndex.sort((a, b) => a.position - b.position);
  
    console.log("🎨 Index couleur enrichi (avec catégorie) :", this.colorIndex);
  }
  observeScrollTheme(step = 10, debounceDelay = 800) {
    const container = this.container;
    if (!this.colorIndex?.length) return;
  
    const lerp = (a, b, t) => a + (b - a) * t;
    const hexToRgb = hex => {
      const c = hex.replace("#", "");
      const n = parseInt(c, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const rgbToHex = ([r, g, b]) =>
      "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
  
    let lastStep = -1;
    let browseTimeout = null; // 🔸 pour debounce des événements browse
  
    const onScroll = () => {
      const scrollTop = container.scrollTop || window.scrollY;
      const idx = this.colorIndex;
  
      // --- mode discret pour limiter la fréquence des calculs
      const currentStep = step > 0 ? Math.floor(scrollTop / step) : -1;
      if (step > 0 && currentStep === lastStep) return;
      lastStep = currentStep;
  
      // --- bornes encadrantes
      let lower = idx[0];
      let upper = idx[idx.length - 1];
      for (let i = 0; i < idx.length - 1; i++) {
        if (scrollTop >= idx[i].position && scrollTop < idx[i + 1].position) {
          lower = idx[i];
          upper = idx[i + 1];
          break;
        }
      }
  
      const range = Math.max(upper.position - lower.position, 1);
      const t = Math.min(Math.max((scrollTop - lower.position) / range, 0), 1);
  
      // --- interpolation couleur
      const c1 = hexToRgb(lower.color);
      const c2 = hexToRgb(upper.color);
      const mixed = [
        Math.round(lerp(c1[0], c2[0], t)),
        Math.round(lerp(c1[1], c2[1], t)),
        Math.round(lerp(c1[2], c2[2], t))
      ];
      const hex = rgbToHex(mixed);
  
      document.documentElement.style.setProperty("--main-texture", hex);
      document.body.style.background = hex;
      setThemeColor(hex);
  
      // --- catégorie actuellement dominante
      const activeCat = t < 0.5 ? lower.category : upper.category;
  
      // 🔸 debounce : n’émettre l’événement qu’une fois le scroll stabilisé
      if (this.currentCat !== activeCat) {
        clearTimeout(browseTimeout);
        browseTimeout = setTimeout(() => {
          if (this.currentCat !== activeCat) {
            this.currentCat = activeCat;
            this.emitUserEvent("browse", { category: activeCat });
          }
        }, debounceDelay);
      }
    };
  
    container.addEventListener("scroll", onScroll);
    window.addEventListener("resize", () => this.buildColorIndex());
  }
  /**
   * Construit une structure synthétique de toutes les catégories présentes
   * dans la base de données, en listant leurs options et leurs produits.
   */
  buildSmartData() {
  const raw = Object.entries(this.data)
    .filter(([key, val]) => val && typeof val === "object" && val.category)
    .map(([key, val]) => val);

  const categoriesMap = new Map();
  const siteCfg = this.siteCfg?.categories || window.site?.categories || {};

  for (const item of raw) {
    const cat = item.category || "autres";
    if (!categoriesMap.has(cat)) {
      categoriesMap.set(cat, {
        name: cat,
        options: [],
        items: new Map()
      });
    }

    const catEntry = categoriesMap.get(cat);
    const catCfg = siteCfg[cat] || {};
    const filtering = catCfg.filtering !== false; // ✅ true par défaut

    // 🔹 Si filtering est activé → regroupement par nom
    const key = filtering ? (item.name?.trim() || "inconnu") : Utils.generateId(6);

    // 🔸 Ajoute le produit sous sa clé (nom ou id unique)
    if (!catEntry.items.has(key)) {
      catEntry.items.set(key, item.name || "inconnu");
    }

    // 🔸 Collecte des options (size, pate, formule) seulement si filtering actif
    if (filtering) {
      const optionKeys = ["size", "pate", "formule"];
      for (const key of optionKeys) {
        if (item[key]) {
          let opt = catEntry.options.find(o => o.name === key);
          if (!opt) {
            opt = { name: key, values: new Set() };
            catEntry.options.push(opt);
          }
          opt.values.add(item[key]);
        }
      }
    }
  }

  // --- Transformation finale ---
  this.sdata.categories = Array.from(categoriesMap.values()).map(cat => ({
    name: cat.name,
    options: cat.options.map(o => ({
      name: o.name,
      values: Array.from(o.values)
    })),
    items: Array.from(cat.items.values())
  }));

  console.log("🧠 SmartContent.sdata (avec filtering)", this.sdata);
}
  renderHeaders() {
  this.container.innerHTML = "";

  // --- Icônes par défaut (fallbacks globaux) ---
  const catIcons = {
    assiette: "/app/icons/icPlat.svg",
    pizza: "/app/icons/icPizza.svg",
    burger: "/app/icons/icBurger.svg",
    tacos: "/app/icons/icTacos.svg",
    panini: "/app/icons/icPanini.svg",
    panizza: "/app/icons/icPanizza.svg",
    dessert: "/app/icons/icDessert.svg",
    boisson: "/app/icons/icDrink.svg",
    autres: "/app/icons/icFood.svg"
  };

  // --- Configuration site depuis le GSM ---
  const siteCfg = this.siteCfg?.categories || window.site?.categories || {};
  const defaultCols = this.siteCfg?.site?.columns || window.site?.site?.columns || 2;

  // --- Tri préalable des catégories selon l’ordre défini dans le siteCfg ---
  const sortedCats = [...this.sdata.categories].sort((a, b) => {
    const aOrder = siteCfg[a.name]?.order ?? 999;
    const bOrder = siteCfg[b.name]?.order ?? 999;
    if (aOrder === bOrder) return a.name.localeCompare(b.name);
    return aOrder - bOrder;
  });

  // --- Parcours des catégories triées ---
  for (const cat of sortedCats) {
    const siteCat = siteCfg[cat.name] || {};

    // 🔹 Ignore les catégories non visibles ou globales parasites
    if (siteCat.visible === false) continue;
    if (["site", "delivery", "gsm"].includes(cat.name)) continue;

    // --- Détermination du nombre de colonnes ---
    const ncols = siteCat.columns || defaultCols;

    // --- Construction du bloc de section ---
    const section = mkdiv("", "cat-section");
    section.dataset.cat = cat.name;
    section.dataset.cols = ncols;

    const header = mkdiv("", "cat-header cellshade-3 flex-between");
    const leftBox = mkdiv("", "header-left flex align-center");
    const rightBox = mkdiv("", "header-right flex align-center gap4");

    // --- Icône + titre ---
    const iconSrc = siteCat.icon || catIcons[cat.name] || catIcons.autres;
    const icon = mkimg(iconSrc, "cat-icon");

    const label =
      siteCat.label ||
      ("Nos " + cat.name.charAt(0).toUpperCase() + cat.name.slice(1) + "s");

    const title = mkdiv(label, "cat-title");
  //  Utils.applyCellShading(title, 3);

    leftBox.append(title);

// --- Sélecteurs stylisés pour chaque option multiple ---
// --- Sélecteurs stylisés pour chaque option multiple ---
for (const opt of cat.options) {
  if (!Array.isArray(opt.values) || opt.values.length < 2) continue;

  const siteCat = siteCfg?.[cat.name] || {};
  const defaultFilters = siteCat.defaultFilters || {};

  // 🔹 Priorité : 1️⃣ filtre actif  2️⃣ valeur par défaut  3️⃣ première valeur
  const activeValue = this.activeFilters?.[cat.name]?.[opt.name];
  const defaultValue = defaultFilters?.[opt.name];
  let initValue = opt.values[0];

  if (activeValue && opt.values.includes(activeValue)) {
    initValue = activeValue;
  } else if (defaultValue && opt.values.includes(defaultValue)) {
    initValue = defaultValue;
  }

  // 🔹 Création du sélecteur stylisé avec la valeur trouvée
  const mkSel = Utils.mkSelect(opt.values, initValue, value => {
    this.onCategoryFilterChange(cat.name, opt.name, value);
  });

  // 🔹 Mémorise la sélection initiale dans activeFilters
  this.activeFilters[cat.name] = this.activeFilters[cat.name] || {};
  this.activeFilters[cat.name][opt.name] = initValue;

  // 🔹 Conteneur visuel
  const box = mkdiv("", "filter-box flex align-center gap2");
  box.append(mkSel);
  rightBox.appendChild(box);

  // 🔹 Debug optionnel
  // console.debug(`⚙️ Filtre ${cat.name}.${opt.name} initialisé à "${initValue}"`);
}
    header.append(leftBox, rightBox);
    section.appendChild(header);
    this.container.appendChild(section);

    // --- Rendu de la grille de produits avec le bon nombre de colonnes ---
    const previousCols = this.columns; // sauvegarde
    this.columns = ncols;              // applique la valeur spécifique
    this.renderItems(cat.name);
    this.columns = previousCols;       // restaure le fallback global
  }
}
  renderItems(catName) {
    const cat = this.sdata.categories.find(c => c.name === catName);
    if (!cat) return console.warn("❌ Catégorie introuvable :", catName);
    
    const grid = mkdiv("", "smart-grid");
    
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = `repeat(${this.columns || 1}, 1fr)`;
    grid.style.gap = "8px";
  
    const active = this.activeFilters?.[catName] || {};
    l("active");
    l(active);
    const hasFilters = Object.keys(active).length > 0;
    let visibleCount = 0;
  
    cat.items.forEach(name => {
      const variants = Object.values(this.data).filter(
        p => p.name === name && p.category === catName
      );
  
      let prod = null;
  
      if (hasFilters) {
        // 🔹 On cherche une variante correspondant exactement aux filtres actifs
        prod = variants.find(v =>
          Object.entries(active).every(([key, val]) => v[key] === val)
        );
  
        // ❗ Si aucun produit ne correspond, on ne prend rien du tout
        if (!prod) return; 
      } else {
        // 🔹 Si pas de filtre, on prend la première variante
        prod = variants[0];
      }
  
      if (prod) {
        new SmartCard(prod, grid);
        visibleCount++;
      }
    });
  
    // 🔹 Si aucun produit trouvé avec filtres actifs → ne rien afficher
    if (hasFilters && visibleCount === 0) {
      console.log(`⚠️ Aucun résultat pour "${catName}" avec les filtres actifs`);
      return;
    }
  
    // 🔹 Insère la grille après le header
    const section = this.container.querySelector(`.cat-section[data-cat="${catName}"]`);
    if (section && visibleCount > 0) section.appendChild(grid);
  }
  
  onCategoryFilterChange(catName, optName, value) {
    this.activeFilters[catName] = this.activeFilters[catName] || {};
  this.activeFilters[catName][optName] = value;
  
    // --- Supprime l’ancienne grille ---
    const section = this.container.querySelector(`.cat-section[data-cat="${catName}"]`);
    const grid = section?.querySelector(".smart-grid");
    if (grid) grid.remove();
  
    // --- Recherche du nombre de colonnes spécifique à la catégorie ---
    const siteCfg = this.siteCfg?.categories || window.site?.categories || {};
    const catCfg = siteCfg[catName] || {};
    const catCols =
      catCfg.columns ||
      this.siteCfg?.site?.columns ||
      window.site?.site?.columns ||
      this.columns || 2;
  
    // --- Met à jour dynamiquement le nombre de colonnes ---
    const previousCols = this.columns;
    this.columns = catCols;
  
    // --- Rafraîchit la grille correspondante ---
    this.renderItems(catName);
  
    // --- Restaure la valeur globale ---
    this.columns = previousCols;
  
    // (Optionnel) petit feedback console pour debug
    console.info(`🔄 ${catName}: filtre ${optName}=${value}, ${catCols} col(s)`);
    l(this.activeFilters)
  }
  createDockk() {
    const dock = mkdiv("", "smart-dock");
    const siteCfg = this.siteCfg?.categories || window.site?.categories || {};
    
    this.sdata.categories.forEach(cat => {
      const siteCat = siteCfg[cat.name] || {};
      if (siteCat.visible === false) return;
  
      const iconSrc = siteCat.icon || `/app/icons/ic${cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}.svg`;
      const img = mkimg(iconSrc, "dock-icon");
      img.title = siteCat.label || cat.name;
  
      img.addEventListener("click", () => {
        const section = this.container.querySelector(`.cat-section[data-cat="${cat.name}"]`);
        if (!section) return;
  
        // Déplie la section correspondante, replie les autres
        this.container.querySelectorAll(".cat-section").forEach(sec => {
         // sec.classList.toggle("collapsed", sec !== section);
          true;
        });
  
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      });
  
      dock.appendChild(img);
    });
  
    document.getElementById('root-ground').appendChild(dock);
  }
  createDock() {
  const dock = mkdiv("", "smart-dock", "navdock");
  const siteCfg = this.siteCfg?.categories || window.site?.categories || {};

  // 🔹 Tri des catégories selon la config site
  const sortedCats = [...this.sdata.categories].sort((a, b) => {
    const aOrder = siteCfg[a.name]?.order ?? 999;
    const bOrder = siteCfg[b.name]?.order ?? 999;
    if (aOrder === bOrder) return a.name.localeCompare(b.name);
    return aOrder - bOrder;
  });

  // 🔹 Génération du dock selon l’ordre trié
  sortedCats.forEach( cat => {
    const siteCat = siteCfg[cat.name] || {};
    if (siteCat.visible === false) return;

    const iconSrc =
      siteCat.icon ||
      `/app/icons/ic${cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}.svg`;

    const img = mkimg(iconSrc, "dock-icon");
    img.title = siteCat.label || cat.name;

    img.addEventListener("click", () => {
      const section = this.container.querySelector(`.cat-section[data-cat="${cat.name}"]`);
      if (!section) return;

      // 🔹 Scroll fluide vers la section correspondante
      section.scrollIntoView({ behavior: "smooth", block: "start" });

      // 🔸 Feedback visuel sur l’icône active
      dock.querySelectorAll(".dock-icon").forEach(i => i.classList.remove("active"));
      img.classList.add("active");
    });

    dock.appendChild(img);
  });

  // 🔹 Ajoute le dock dans le conteneur global
  const rootGround = document.getElementById("root-ground") || document.body;
  rootGround.appendChild(dock);
}
  emitUserEvent(type, details = {}) {
  const label = `[${type}] ${details.category}`;
  if (typeof logUserEvent === "function") logUserEvent(label);
  else console.log("📋 UserEvent:", label);
}
checkAllContentReady() {
  // Si toutes les sections ont des cartes chargées
  const allLoaded = Array.from(this.container.querySelectorAll(".smart-card"))
    .every(el => el.classList.contains("loaded") || el.classList.contains("no-img"));

  if (allLoaded && !this._contentReadyEmitted) {
    this._contentReadyEmitted = true;
    console.log("✅ SmartContent: tout le contenu est chargé");
    this.emitUserEvent("content-ready", { count: this.container.querySelectorAll(".smart-card").length });

    // Envoi d’un événement DOM pour usage externe
    const evt = new CustomEvent("smartcontent-ready", { detail: { source: this } });
    document.dispatchEvent(evt);
  }
}
showLoadehr(message = "Chargement du contenu...") {
  // Empêche les doublons
  if (this.loaderEl) return;
  
  const loader = document.createElement("div");
  loader.className = "smart-loader";
  loader.innerHTML = `
    <div class="loader-spinner"></div>
    <p>${message}</p>
  `;
  this.container.appendChild(loader);
  this.loaderEl = loader;
}


hideLoaderh() {
  if (!this.loaderEl) return;
  this.loaderEl.classList.add("fade-out");
  setTimeout(() => {
    this.loaderEl.remove();
    this.loaderEl = null;
  }, 400);
}
showLoader(message = "Chargement du contenu...") {
  if (this.loaderEl) return;

  const loader = document.createElement("div");
  loader.className = "smart-loader";
  loader.innerHTML = `
    <div class="loader-spinner"></div>
    <p class="loader-text">${message}</p>
    <div class="loader-progress">
      <div class="loader-progress-bar"></div>
    </div>
  `;
  document.body.appendChild(loader); // ✅ fixé sur le body pour ne pas être remplacé
  this.loaderEl = loader;
  this.loaderBar = loader.querySelector(".loader-progress-bar");
  this.loaderText = loader.querySelector(".loader-text");
}

updateLoaderProgress(done, total) {
  if (!this.loaderBar) return;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  this.loaderBar.style.width = pct + "%";
  this.loaderText.textContent = `Chargement... ${pct}%`;
}

hideLoader() {
  if (!this.loaderEl) return;
  this.loaderEl.classList.add("fade-out");
  setTimeout(() => {
    this.loaderEl.remove();
    this.loaderEl = null;
    this.loaderBar = null;
  }, 500);
}
}
class ProductSelector {
  constructor(root, sdata, onConfirm) {
    this.root = root;
    this.sdata = sdata;        // données SmartContent
    this.onConfirm = onConfirm; // callback finale
    this.state = {
      category: null,
      product: null,
      options: {},
      addons: []
    };
    this.renderCategories();
  }

  // --- Étape 1 : Catégories ---
  renderCategories() {
    this.root.innerHTML = `<h2>Catégories</h2><div class="sel-grid"></div>`;
    const grid = this.root.querySelector('.sel-grid');

    Object.entries(this.sdata.categories).forEach(([id, cat]) => {
      if (!cat.visible) return;
      const btn = document.createElement('button');
      btn.className = 'cat-btn';
      btn.innerHTML = `${cat.label}`;
      btn.onclick = () => {
        this.state.category = id;
        this.renderProducts();
      };
      grid.appendChild(btn);
    });
  }

  // --- Étape 2 : Produits ---
  renderProducts() {
    const cat = this.state.category;
    const products = Object.values(this.sdata.products)
      .filter(p => p.category === cat);

    this.root.innerHTML = `
      <h2>${this.sdata.categories[cat].label}</h2>
      <div class="sel-grid"></div>
      <button class="back-btn">⬅ Catégories</button>
    `;
    const grid = this.root.querySelector('.sel-grid');
    this.root.querySelector('.back-btn').onclick = () => this.renderCategories();

    products.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'prod-btn';
      btn.innerHTML = `<img src="${p.picture}" alt=""><br>${p.name}`;
      btn.onclick = () => {
        this.state.product = p;
        this.renderOptions();
      };
      grid.appendChild(btn);
    });
  }

  // --- Étape 3 : Options (taille, pâte, etc.) ---
  renderOptions() {
    const p = this.state.product;
    this.root.innerHTML = `<h2>${p.name}</h2><div class="sel-options"></div>`;
    const box = this.root.querySelector('.sel-options');

    // exemple générique : SmartContent gère les champs d’option
    if (p.options) {
      for (const [key, vals] of Object.entries(p.options)) {
        const div = document.createElement('div');
        div.className = 'opt-block';
        div.innerHTML = `<h3>${key}</h3>`;
        vals.forEach(v => {
          const b = document.createElement('button');
          b.textContent = v;
          b.onclick = () => {
            this.state.options[key] = v;
            [...div.querySelectorAll('button')].forEach(x => x.classList.remove('sel'));
            b.classList.add('sel');
          };
          div.appendChild(b);
        });
        box.appendChild(div);
      }
    }

    const next = document.createElement('button');
    next.className = 'next-btn';
    next.textContent = "Suivant → Suppléments";
    next.onclick = () => this.renderAddons();
    box.appendChild(next);
  }

  // --- Étape 4 : Suppléments ---
  renderAddons() {
    const p = this.state.product;
    this.root.innerHTML = `<h2>Suppléments</h2><div class="sel-addons"></div>`;
    const box = this.root.querySelector('.sel-addons');

    if (p.addons) {
      p.addons.forEach(a => {
        const btn = document.createElement('button');
        btn.className = 'addon-btn';
        btn.textContent = `${a.name} (+${a.price}€)`;
        btn.onclick = () => {
          const i = this.state.addons.indexOf(a.name);
          if (i >= 0) this.state.addons.splice(i,1), btn.classList.remove('sel');
          else this.state.addons.push(a.name), btn.classList.add('sel');
        };
        box.appendChild(btn);
      });
    }

    const confirm = document.createElement('button');
    confirm.className = 'confirm-btn';
    confirm.textContent = "✅ Ajouter au ticket";
    confirm.onclick = () => {
      this.onConfirm({
        category: this.state.category,
        product: this.state.product,
        options: this.state.options,
        addons: this.state.addons
      });
    };

    const back = document.createElement('button');
    back.className = 'back-btn';
    back.textContent = "⬅ Retour";
    back.onclick = () => this.renderOptions();

    this.root.append(confirm, back);
  }
}
class SmartCard {
  /**
   * @param {Object} product
   * @param {HTMLElement} container
   * @param {String} type
   */
  constructor(product, container = null, type = "glass") {
    if (!product) throw new Error("❌ SmartCard: produit invalide");

    this.data = product;
    this.type = type;
    this.el = document.createElement("div");
    this.el.className = `smart-card ${type} cellshade-1`;

    this.id = Utils.generateId(6);
    this.el.dataset.id = this.id;
    this.el.dataset.category = product.category || "autres";

    // ✅ promesse de fin de chargement
    this.ready = this.render();

    if (container instanceof Element) container.appendChild(this.el);

    // 🔹 Ajout de la gestion fake/buyable
    const isInactive = product.fake === true || product.buyable === false || product.indic === true;
    if (!isInactive) {
      this.el.addEventListener("click", () => this.onClick());
    } else {
      this.el.classList.add("disabled");
      // 🔹 Style spécifique pour les cartes indicatives / fake
      this.el.classList.add("indic-card");
    }
    if (product.fake || product.indic) {
      this.el.classList.add("indic-card");
    }
  }

  renderok() {
    return new Promise(resolve => {
      const p = this.data;

      const body = document.createElement("div");
      body.className = "card-body";

      const title = document.createElement("div");
      title.className = "card-title";
      title.textContent = p.name || "Produit";

      const ctnt = document.createElement("div");
      ctnt.className = "card-ctnt";
      if (Array.isArray(p.ingr) && p.ingr.length > 0) {
        let txt = p.ingr.join(", ") + ".";
        txt = txt.charAt(0).toUpperCase() + txt.slice(1);
        ctnt.textContent = txt;
      }

      const price = document.createElement("div");
      price.className = "card-price";
      price.textContent = p.price ? `${p.price} €` : "";

      body.append(title, ctnt, price);
      this.el.append(body);

      // Applique style et image
      const pImg = this.applyGlassStyle(resolve);

      // Si pas d’image ou mode flat → on résout direct
      if (!p.picture || this.type !== "glass") resolve(this.el);
    });
  }
  render() {
    return new Promise(resolve => {
      const p = this.data;
  
      const body = document.createElement("div");
      body.className = "card-body";
  
      // --- Titre
      const title = document.createElement("div");
      title.className = "card-title";
      title.textContent = p.name || "Produit";
  
      // --- Rangée de pictogrammes (mini)
      const iconsRow = document.createElement("div");
      iconsRow.className = "card-ingr-icons";
      if (Array.isArray(p.ingr)) {
        p.ingr.forEach(key => {
          const icon = createIconButton(key, iconsRow);
          if (icon) {
            icon.classList.add("mini");
            // supprime le label pour ne garder que le pictogramme
            const label = icon.querySelector(".icon-btn-label");
            if (label) label.remove();
          }
        });
      }
  
      // --- Texte ingrédients
      const ctnt = document.createElement("div");
      ctnt.className = "card-ctnt";
      if (Array.isArray(p.ingr) && p.ingr.length > 0) {
        let txt = p.ingr.join(", ") + ".";
        txt = txt.charAt(0).toUpperCase() + txt.slice(1);
        ctnt.textContent = txt;
      }
  
      // --- Prix
      const price = document.createElement("div");
      price.className = "card-price";
      price.textContent = p.price ? `${p.price} €` : "";
  
      // 🔹 Composition du corps
      body.append(title, iconsRow, ctnt, price);
      this.el.append(body);
  
      // --- Style d’image
      const pImg = this.applyGlassStyle(resolve);
  
      if (!p.picture || this.type !== "glass") resolve(this.el);
    });
  }
  applyGlassStyle(resolve) {
    const p = this.data;
    const imgUrl = "/app" + (p.picture || "/icons/noimg.png");

    this.el.classList.add("glass-card");

    // --- précharge l'image avant d'appliquer le fond
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      this.el.style.backgroundImage = `url('${imgUrl}')`;
      this.el.classList.add("loaded");
      resolve(this.el);
    };
    img.onerror = () => {
      this.el.classList.add("no-img");
      resolve(this.el);
    };

    if (!this.el.querySelector(".glass-veil")) {
      const veil = document.createElement("div");
      veil.className = "glass-veil";
      this.el.prepend(veil);
    }

    const body = this.el.querySelector(".card-body");
    if (body) body.classList.add("glass-body");
    this.el.querySelector(".card-title").classList.add("cellshade-2");
  }

  onClick() {
    if (document.querySelector(".modal-product")) return;

    const cat = this.data.category;
    let activeFilters = window.smartContent?.activeFilters?.[cat] || {};

    // Effet visuel rapide
    this.el.classList.add("clicked");
    setTimeout(() => this.el.classList.remove("clicked"), 150);

    // Ouvre le modal avec filtres actifs
    if (typeof ModalProduct === "function") {
      new ModalProduct(this.data, this.el, activeFilters);
    } else {
      console.warn("ℹ️ ModalProduct non disponible");
    }
  }
}
/*____ ScratchCard _____*/
class ScratchCard {
  constructor(containerId, ticketId, coverImage, prizeImage, options = {}) {
    this.container = document.getElementById(containerId);
    this.ticketId = ticketId;
    this.coverImagePath = coverImage;
    this.prizeImagePath = prizeImage;

    this.options = Object.assign({
      width: 300,
      height: 450,
      brushSize: 20,
      revealPercent: 70,
      onComplete: null
    }, options);

    this.isDrawing = false;
    this.imagesLoaded = 0;
    this.init();
  }

  init() {
    // ✅ Wrapper
    this.wrapper = document.createElement("div");
    this.wrapper.className = "scratch-wrapper";
    this.wrapper.style.width = this.options.width + "px";
    this.wrapper.style.height = this.options.height + "px";
    this.container.appendChild(this.wrapper);

    // ✅ Image du ticket (fond)
    this.prizeImg = new Image();
    this.prizeImg.className = "scratch-prize";
    this.wrapper.appendChild(this.prizeImg);

    // ✅ Canvas par-dessus (zone à gratter)
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.canvas.className = "scratch-canvas";
    this.ctx = this.canvas.getContext("2d");
    this.wrapper.appendChild(this.canvas);

    // Charger les images
    this.prizeImg.onload = () => this.checkImagesLoaded();
    this.coverImg = new Image();
    this.coverImg.onload = () => this.checkImagesLoaded();

    this.prizeImg.src = this.prizeImagePath;
    this.coverImg.src = this.coverImagePath;
  }
  checkImagesLoaded() {
    this.imagesLoaded++;
    if (this.imagesLoaded === 2) {
      // On dessine le masque (cover) sur le canvas
      this.ctx.drawImage(this.coverImg, 0, 0, this.options.width, this.options.height);
      this.addEvents();
    }
  }
  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return {x, y};
  }
  draw(e) {
    if (!this.isDrawing) return;
    const {x, y} = this.getPos(e);

    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.options.brushSize, 0, Math.PI * 2);
    this.ctx.fill();

    const percent = this.getScratchedPercent();
    if (percent >= this.options.revealPercent && this.options.onComplete) {
      this.options.onComplete(this.ticketId, percent);
      this.options.onComplete = null; // éviter doublons
    }
  }
  addEvents() {
    this.canvas.addEventListener("mousedown", e => { this.isDrawing = true; this.draw(e); });
    this.canvas.addEventListener("mousemove", e => this.draw(e));
    this.canvas.addEventListener("mouseup", () => this.isDrawing = false);

    this.canvas.addEventListener("touchstart", e => { this.isDrawing = true; this.draw(e); });
    this.canvas.addEventListener("touchmove", e => { e.preventDefault(); this.draw(e); });
    this.canvas.addEventListener("touchend", () => this.isDrawing = false);
  }
  getScratchedPercent() {
    const pixels = this.ctx.getImageData(0, 0, this.options.width, this.options.height).data;
    let transparent = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    return (transparent / (this.options.width * this.options.height)) * 100;
  }
  revealAll() {
    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.fillRect(0, 0, this.options.width, this.options.height);
  }
}
/*___________ lightmap _____________*/
/**
 * Vue d’ensemble des méthodes :
 * 
 * 🔹 Rendu & Projection
 *   - initsvgrender()      → Prépare le SVG
 *   - mercatorProject()    → Coord. → Mercator
 *   - getProjToSvg()       → Mercator → SVG
 *   - lineStringToPath()   → Coord. → path
 * 
 * 🔹 Données OSM & Relief
 *   - fetchGeoData()       → Routes, bâtiments, nature
 *   - fetchAgglomerationData() → Agglomérations
 *   - fetchElevationGrid() → Altitudes
 *   - drawAllLayersFromCache(), drawAgglomerationLayer(), drawElevationLayer()
 * 
 * 🔹 UI & Contrôles
 *   - initCtrlPanel()      → Panneau 3 états
 *   - addLayerControls()   → Cases à cocher calques
 *   - addReliefControl()   → Case Relief
 *   - initLocateButton()   → Bouton GPS
 * 
 * 🔹 GPS & Itinéraires
 *   - getCurrentPosition() → Position actuelle
 *   - addMarker()          → Marqueurs personnalisés
 *   - centerOn(), centerBetweenHomeAndCurrent() → Recentre la vue
 *   - drawRouteFromGeoJSON() → Tracé d’itinéraires
 * 
 * 🔹 Cache & Persistance
 *   - openDB(), dbSet(), dbGet(), dbDelete(), dbClear() → IndexedDB
 *   - getCacheStats(), getIndexedDBStats(), getStorageEstimate()
 *   - addCacheManagerPanel(), showCacheInfo()
 * 
 * 🔹 Utilitaires
 *   - setTarget(), refreshView() → Mise à jour zone cible
 */
/**
 * Classe LightMap
 * 
 * Gère l’affichage d’une carte simplifiée (SVG) à partir d’OpenStreetMap (Overpass API),
 * avec gestion du cache, du relief et de l’interactivité.
 * 
 * 🔹 Méthodes principales :
 * 
 * - constructor(domdest, target, size)
 *   → Initialise la zone cible, calcule la bbox, lance le rendu et charge les données.
 * 
 * - initsvgrender(width, height)
 *   → Prépare le conteneur SVG pour dessiner la carte.
 * 
 * - initCtrlPanel()
 *   → Ajoute le panneau de contrôle (3 états : masqué, compact, plein écran).
 * 
 * - mercatorProject(lon, lat)
 *   → Convertit coordonnées géographiques en projection Mercator.
 * 
 * - getTargetBBoxProjected()
 *   → Retourne la bbox projetée en coordonnées Mercator.
 * 
 * - getProjToSvg(width, height, padding)
 *   → Fabrique une fonction de projection (lon/lat → coordonnées SVG).
 * 
 * - lineStringToPath(coords, projToSvg)
 *   → Transforme une polyligne en chemin SVG ("M/L").
 * 
 * - fetchWithRetry(url, maxAttempts, delay)
 *   → Récupère des données avec retry automatique en cas d’échec.
 * 
 * - fetchGeoData(forceRefresh)
 *   → Télécharge routes/bâtiments/nature/places depuis Overpass, avec cache IndexedDB.
 * 
 * - fetchAgglomerationData()
 *   → Télécharge les polygones d’agglomération (communes, villes).
 * 
 * - drawAllLayersFromCache(container, w, h, padding)
 *   → Dessine tous les calques (routes, bâtiments, nature, villes) depuis le cache.
 * 
 * - drawAgglomerationLayer()
 *   → Dessine par-dessus la carte les zones d’agglomération.
 * 
 * - fetchElevationGrid(step)
 *   → Récupère les données de relief (API Open-Elevation).
 * 
 * - drawElevationLayer()
 *   → Ajoute un calque coloré représentant les altitudes.
 * 
 * - addLayerControls(container)
 *   → Interface pour afficher/masquer calques (routes, bâtiments, nature, villes).
 * 
 * - toggleLayerVisibility(key, visible)
 *   → Affiche ou masque un calque donné.
 * 
 * - initLocateButton()
 *   → Ajoute un bouton GPS (localisation et calcul d’itinéraire via OSRM).
 * 
 * - getCurrentPosition()
 *   → Récupère la position GPS du terminal.
 * 
 * - addMarker(lon, lat, label, options)
 *   → Place un marqueur personnalisé sur la carte.
 * 
 * - addReliefControl(container)
 *   → Ajoute une case à cocher pour activer/désactiver le relief.
 * 
 * - addCacheManagerPanel(container)
 *   → Interface pour consulter et vider le cache local.
 * 
 * - setTarget(lat, lon, size)
 *   → Définit une nouvelle zone cible.
 * 
 * - refreshView(force)
 *   → Rafraîchit la carte avec la zone courante.
 * 
 * - centerOn(lat, lon, size)
 *   → Recentre la vue sur un point donné.
 * 
 * - centerBetweenHomeAndCurrent(scaleFactor, minSize)
 *   → Recentre entre homePos et position GPS actuelle.
 * 
 * - drawRouteFromGeoJSON(geojson, options)
 *   → Dessine un itinéraire (LineString, MultiLineString ou Feature).
 * 
 * - Fonctions IndexedDB : openDB, dbSet, dbGet, dbDelete, dbClear
 *   → Gestion du cache persistant.
 * 
 * - Outils cache : getCacheStats, getIndexedDBStats, getStorageEstimate, showCacheInfo
 *   → Inspecte et affiche les infos d’utilisation du cache.
 */
class LightMap {
  constructor(domdest, target = '49.283572,1.557704', size =3000) {
    console.log('🗺️ LightMap init');
    //l(this.getCacheStats());
    l('domdest:');
    l(domdest);
    this.container = domdest;
    this.homePos= target;
  //  l(this.getStorageEstimate());
    // 🔹 Extraire centre et rayon
    const [latC, lonC] = target.split(',').map(Number);
    const earthRadius = 6378137;
    const pCenter = this.mercatorProject(lonC, latC);
    const delta = size / earthRadius;

    // 🔹 Calcul bbox Mercator
    const minX = pCenter.x - delta, maxX = pCenter.x + delta;
    const minY = pCenter.y - delta, maxY = pCenter.y + delta;

    const mercatorUnproject = (x, y) => {
      const lon = x * 180 / Math.PI;
      const lat = (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180 / Math.PI;
      return { lon, lat };
    };
    const sw = mercatorUnproject(minX, minY);
    const ne = mercatorUnproject(maxX, maxY);

    this.targetbbox = {
      string: [sw.lat.toFixed(6), sw.lon.toFixed(6), ne.lat.toFixed(6), ne.lon.toFixed(6)].join(','),
      lat: { min: sw.lat, max: ne.lat },
      long: { min: sw.lon, max: ne.lon }
    };
    this.bbox = this.getTargetBBoxProjected();

    console.log("🎯 BBox cible projetée :", this.bbox);

    // 🔹 Initialisation du rendu SVG
    this.initsvgrender();
    this.initCtrlPanel();
    this.initLocateButton();
    let cachediv = mkdiv();
  //  domdest.parentNode.appendChild(cachediv);
   // this.showCacheInfo(this.ctrlPanel);
    const container = domdest || document.getElementById("map") || document.body;
    
    l('this')
    l('this')
    l('this')
    l('this')
    l(this)
    l('this.container:');
    l(this.container);

    
    (async () => {
  await this.fetchGeoData(false);
  await this.fetchAgglomerationData(); // nouvelle étape
  await this.drawAllLayersFromCache(container, 500, 500, 10);
  this.drawAgglomerationLayer();       // dessine par-dessus la nature
  this.addLayerControls(this.ctrlPanel);
  this.addReliefControl(this.ctrlPanel);
  this.addCacheManagerPanel(this.ctrlPanelContent);
})().catch(console.error);
  }
  /**
 * 🔍 Centre et ajuste la vue sur un ensemble de positions utilisateur
 * @param {Array<{lat:number, lon:number}>} positions
 */
  focusOnUsers(positions = []) {
    if (!Array.isArray(positions) || positions.length === 0) {
      console.warn("⚠️ LightMap.focusOnUsers: aucune position fournie");
      return;
    }
  l(positions);
    // Extraire min / max latitude et longitude
    const lats = positions.map(p => p.lat);
    const lons = positions.map(p => p.lon);
  
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
  
    // Calcul du centre géographique
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
  
    // Rayon en km approximatif (Haversine light)
    const R = 6371;
    const latDist = (maxLat - minLat) * Math.PI / 180 * R;
    const lonDist = (maxLon - minLon) * Math.PI / 180 * R * Math.cos(centerLat * Math.PI / 180);
    const approxRadiusKm = Math.max(latDist, lonDist) / 2;
  
    // ✅ Applique ce centre et rayon à la carte
    l(centerLat);
    l(centerLon);
    l(approxRadiusKm);

    
    this.setTarget(centerLat, centerLon, approxRadiusKm*1000);
    this.refreshView(true);
    
    for (let i = 0 ; i < positions.length ; i++ )
    {
      l(positions[i]);
      this.addMarker (positions[i].lon, positions[i].lat, 'user');
    }
    
    
  }


/**
 * Exemple de setter (à adapter à ton moteur de rendu)
 */
setView(lat, lon, radiusKm = 10) {
  l('setview');
  this.homePos = `${lat},${lon}`;
  this.zoom = this.computeZoomForRadius(radiusKm);
  this.render(); // ou ta méthode de rafraîchissement existante
}
// Init. du rendu SVG ---
  initsvgrender(width = 500, height = 500) {
    /*
    const container = document.getElementById("map") || document.body;
    
    */
    const container = this.container || document.body;
        l('this.container:');
        
    l(this.container);
        l('container:');
    l(container);
    
    const svgNS = "http://www.w3.org/2000/svg";

    this.svgrender = document.createElementNS(svgNS, "svg");
    this.svgrender.setAttribute("width", width);
    this.svgrender.setAttribute("height", height);
    this.svgrender.setAttribute("viewBox", `0 0 ${width} ${height}`);
    this.svgrender.style.border = "1px solid rgba(0,0,0,0.08)";
    this.svgrender.style.display = "block";
    this.svgrender.style.background = "#0000";

    container.innerHTML = "";
    container.appendChild(this.svgrender);
    
    this.gGnd = document.createElementNS(svgNS, "g");
    this.gGnd.setAttribute("class", "top-layer");
    this.svgrender.appendChild(this.gGnd);
    this.gTop = document.createElementNS(svgNS, "g");
    this.gTop.setAttribute("class", "top-layer");
    this.svgrender.appendChild(this.gTop);
  }
// Init. du panneau de contrôle ---
  initCtrlPanel() {
  if (!this.svgrender) {
    console.warn("⚠️ Le rendu SVG doit être initialisé avant le panneau de contrôle.");
    return;
  }

  const container = this.svgrender.parentElement;
  container.style.position = "relative";

  // --- Création du panneau principal
  const panel = document.createElement("div");
  panel.className = "lightmap-panel state-hidden";

  // --- Contenu
  const content = document.createElement("div");
  content.className = "lightmap-panel-content";
  content.innerHTML = `<b>Contrôles carte</b><br>État : <span class="panel-state-label">Masqué</span>`;
  panel.appendChild(content);

  // --- Bouton flottant
  const toggleBtn = document.createElement("div");
  toggleBtn.className = "lightmap-toggle-btn";
  toggleBtn.innerHTML = '<i class="icon-cog"></i>';
  toggleBtn.title = "Changer mode panneau";
  container.appendChild(toggleBtn);

  // --- Logique des 3 états
  const states = ["state-hidden", "state-compact", "state-full"];
  let current = 0; // 0 = caché
  const label = content.querySelector(".panel-state-label");

  const nextState = () => {
    // retire ancien état
    panel.classList.remove(states[current]);
    // passe à l’état suivant
    current = (current + 1) % states.length;
    panel.classList.add(states[current]);

    const name = ["Masqué", "Compact", "Plein écran"][current];
    label.textContent = name;
    toggleBtn.style.transform =
      current === 2 ? "rotate(90deg)" : current === 1 ? "rotate(45deg)" : "rotate(0deg)";
  };

  toggleBtn.addEventListener("click", nextState);

  container.appendChild(panel);
  this.ctrlPanel = panel;
  this.ctrlPanelContent = content;
  console.log("🧭 Panneau de contrôle 3 états initialisé");
}
// Projection Mercator simple ---
  mercatorProject(lon, lat) {
    const λ = lon * Math.PI / 180;
    const φ = lat * Math.PI / 180;
    const x = λ;
    const y = Math.log(Math.tan(Math.PI / 4 + φ / 2));
    return { x, y };
  }
// Conversion bbox géographique -> Mercator ---
  getTargetBBoxProjected() {
    const parts = this.targetbbox.string.split(',').map(Number);
    const [minLat, minLon, maxLat, maxLon] = parts.length === 4
      ? [parts[0], parts[1], parts[2], parts[3]]
      : [49.296985, 1.423731, 49.318446, 1.440597];

    const p1 = this.mercatorProject(minLon, minLat);
    const p2 = this.mercatorProject(maxLon, maxLat);

    return {
      minX: Math.min(p1.x, p2.x),
      maxX: Math.max(p1.x, p2.x),
      minY: Math.min(p1.y, p2.y),
      maxY: Math.max(p1.y, p2.y),
      minLon, maxLon, minLat, maxLat
    };
  }
// Projection pour dessin SVG ---
  getProjToSvg(width, height, padding = 10) {
    const { minX, maxX, minY, maxY } = this.bbox;
    const viewW = width - 2 * padding;
    const viewH = height - 2 * padding;
    return (lon, lat) => {
      const p = this.mercatorProject(lon, lat);
      const nx = (p.x - minX) / (maxX - minX || 1);
      const ny = (p.y - minY) / (maxY - minY || 1);
      const sx = padding + nx * viewW;
      const sy = padding + (1 - ny) * viewH;
      return { x: sx, y: sy };
    };
  }
// Outil de conversion en chemin SVG ---
  lineStringToPath(coords, projToSvg) {
    return coords.map((c, i) => {
      const p = projToSvg(c[0], c[1]);
      return (i === 0 ? "M" : "L") + p.x.toFixed(2) + " " + p.y.toFixed(2);
    }).join(" ");
  }
// Fetch avec retry ---
  async fetchWithRetry(url, maxAttempts = 3, delay = 1500) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP " + res.status);
        return await res.json();
      } catch (err) {
        console.warn(`⚠️ Tentative ${attempt}/${maxAttempts} échouée: ${err.message}`);
        if (attempt < maxAttempts) await new Promise(r => setTimeout(r, delay * attempt));
        else throw new Error("❌ Échec de la requête Overpass après " + maxAttempts + " essais");
      }
    }
  }
// Clé de cache ---
  getCacheKey() {
    return `LightMapCache_${this.targetbbox.string}`;
  }
// Requête Overpass combinée avec cache
  async fetchGeoData(forceRefresh = false) {
  const key = this.getCacheKey();

  // --- Vérifie le cache IndexedDB ---
  if (!forceRefresh) {
    const cached = await this.dbGet("geoCache", key);
    if (cached) {
      console.log("📦 Chargement depuis cache IndexedDB");
      this.geoData = cached;
      return cached;
    }
  }

  // --- Construction dynamique (ta version avec ou sans bâtiments) ---
  const { minLat, maxLat, minLon, maxLon } = this.targetbbox.lat
    ? {
        minLat: this.targetbbox.lat.min,
        maxLat: this.targetbbox.lat.max,
        minLon: this.targetbbox.long.min,
        maxLon: this.targetbbox.long.max,
      }
    : { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 };

  const diagKm = Math.hypot(maxLat - minLat, maxLon - minLon) * 111;
  const includeBuildings = diagKm < 2.0;
  console.log(`🧭 Étendue ≈ ${diagKm.toFixed(2)} km → bâtiments: ${includeBuildings ? "✔" : "❌"}`);

  const query = `
    [out:json][timeout:25];
    (
      way["highway"](${this.targetbbox.string});
      ${includeBuildings ? `way["building"](${this.targetbbox.string});` : ""}
      way["landuse"~"forest|meadow|grass|vineyard|orchard|farmland"](${this.targetbbox.string});
      way["natural"~"water|wetland|wood|beach|sand"](${this.targetbbox.string});
      way["leisure"~"park|garden|nature_reserve"](${this.targetbbox.string});
      node["place"~"city|town|village"](${this.targetbbox.string});
    );
    out geom;
  `;
  const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);

  console.log("🌐 Récupération Overpass combinée...");
  const overpass = await this.fetchWithRetry(url);
  console.log("✅ Données combinées :", overpass);

  this.geoData = overpass;

  try {
    await this.dbSet("geoCache", key, overpass);
  } catch (err) {
    console.warn("⚠️ Échec du cache IndexedDB :", err.message);
  }

  return overpass;
}
// --- 🏙️ Récupération des polygones d'agglomération ---
  async fetchAgglomerationData() {
    console.log("🏙️ Récupération des polygones d’agglomération...");
    const query = `
      [out:json][timeout:25];
      (
        relation["admin_level"="8"](${this.targetbbox.string});
        way["place"~"city|town|village"](${this.targetbbox.string});
      );
      out geom;
    `;
    const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
  
    try {
      const res = await this.fetchWithRetry(url);
      this.agglomerationData = res;
      console.log(`✅ ${res.elements.length} polygones d’agglomération récupérés`);
      return res;
    } catch (err) {
      console.warn("⚠️ Impossible de récupérer les polygones d’agglomération :", err);
      this.agglomerationData = null;
      return null;
    }
  }
// --- Effacer le cache ---
  clearGeoCache() {
    localStorage.removeItem(this.getCacheKey());
  }
// --- Interface de contrôle des calques ---
 addLayerControls(container = this.container) {
  if (!container || !this.svgrender) return;

  // 🔹 Création du conteneur
  const ctrl = document.createElement("div");
  ctrl.className = "lightmap-controls";
  ctrl.style.cssText = `
    font-family: sans-serif;
    background: #fff8;
    border: 1px solid #0002;
    border-radius: .5em;
    padding: .5em .8em;
    margin-top: .5em;
    display: flex;
    flex-wrap: wrap;
    gap: .5em;
  `;

  // 🔹 Liste des calques à gérer
  const layers = [
    { key: "road", label: "Routes" },
    { key: "building", label: "Bâtiments" },
    { key: "nature", label: "Nature" },
    { key: "place", label: "Villes" },
    { key: "marker", label: "Marqueurs" },
  ];

  // 🔹 Création des cases à cocher
  layers.forEach(l => {
    const label = document.createElement("label");
    label.style.cssText = "cursor:pointer; user-select:none;";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = true;
    input.style.marginRight = ".3em";
    label.appendChild(input);
    label.appendChild(document.createTextNode(l.label));

    // gestion du clic → toggle visibilité des calques correspondants
    input.addEventListener("change", () => {
      const visible = input.checked ? "visible" : "hidden";
      this.toggleLayerVisibility(l.key, visible);
    });

    ctrl.appendChild(label);
  });

  // 🔹 Insertion sous la carte
  container.appendChild(ctrl);
}

// --- Méthode utilitaire pour afficher/masquer un calque ---
toggleLayerVisibility(typeKey, visibility = "hidden") {
  if (!this.svgrender) return;
  const sel = {
    road: "path[stroke]",
    building: "path[fill='#999']",
    nature: "path[fill='#6c6'], path[fill='#66c'], path[fill='#385'], path[fill='#eec']",
    place: "circle[stroke='#a00'], text[font-family='Permanent']",
    marker: "g.custom-marker"
  }[typeKey];

  if (!sel) return;
  this.svgrender.querySelectorAll(sel).forEach(el => {
    el.style.visibility = visibility;
  });
}

// --- Bouton flottant pour la position GPS ---
  initLocateButton() {
  if (!this.svgrender) {
    console.warn("⚠️ Le rendu SVG doit être initialisé avant le bouton GPS.");
    return;
  }

  const container = this.svgrender.parentElement;
  container.style.position = "relative";

  // 🔹 Création du bouton
  const locateBtn = document.createElement("div");
  locateBtn.className = "lightmap-locate-btn";
  locateBtn.innerHTML = '<i class="icon-target"></i>'; // ou 🧭
  locateBtn.title = "Localiser ma position";



  locateBtn.addEventListener("mouseenter", () => (locateBtn.style.transform = "scale(1.1)"));
  locateBtn.addEventListener("mouseleave", () => (locateBtn.style.transform = "scale(1.0)"));

  // 🔹 Au clic → géolocalisation + ajout d’un marqueur
 /* locateBtn.addEventListener("click", async () => {
  locateBtn.style.transform = "scale(0.9)";
  setTimeout(() => (locateBtn.style.transform = "scale(1)"), 200);

  const pos = await this.getCurrentPosition();
  if (!pos) {
    alert("Impossible de récupérer la position GPS.");
    return;
  }

  // 🔹 Log avec coordonnées en string dans details
  if (typeof logUserEvenmt === "function") {
    const coords = `${pos.lat.toFixed(6)},${pos.lon.toFixed(6)}`;
    let fmtev = '[locate] '+ coords;
    l(fmtev);
    logUserEvenmt(fmtev);
  }

  // --- Recentrer automatiquement entre homePos et GPS ---
  const routeInfo = await this.centerBetweenHomeAndCurrent();
  if (!routeInfo) return;

  const { from, to } = routeInfo;
  console.log("🧭 Calcul d'itinéraire entre :", from, to);

  // ... suite OSRM
});*/
  locateBtn.addEventListener("click", async () => {
  locateBtn.style.transform = "scale(0.9)";
  setTimeout(() => (locateBtn.style.transform = "scale(1)"), 200);

  // --- 1️⃣ Recentrer automatiquement entre homePos et GPS ---
  const routeInfo = await this.centerBetweenHomeAndCurrent();

  if (!routeInfo) {
    alert("Impossible de récupérer la position GPS.");
    return;
  }

  const { from, to } = routeInfo;
  console.log("🧭 Calcul d'itinéraire entre :", from, to);

  // --- 2️⃣ Appel à l’API de routage (OSRM) ---
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erreur HTTP " + res.status);

    const data = await res.json();
    if (!data.routes || !data.routes[0]) throw new Error("Pas de route trouvée.");

    console.log(`🛣️ Itinéraire reçu (${(data.routes[0].distance / 1000).toFixed(2)} km)`);

    // --- 3️⃣ Tracé du parcours sur la carte ---
    this.drawRouteFromGeoJSON(data.routes[0].geometry, {
      color: "#f80",
      width: 4,
      opacity: 0.85
    });

    // --- 4️⃣ Ajout des marqueurs (facultatif) ---
    //49.309860,1.432272
    this.addMarker(from.lon, from.lat, "FleurePizza", { color: "#09f", stroke: "#000", radius: 5 });
    this.addMarker(to.lon, to.lat, "Vous", { color: "#0f0", stroke: "#000", radius: 6 });
    
  } catch (err) {
    console.error("⚠️ Erreur de routage :", err);
    alert("Impossible d’obtenir l’itinéraire.");
  }
});

  container.appendChild(locateBtn);
  console.log("📍 Bouton de localisation ajouté");
}
// --- Récupération de la position GPS du terminal ---
async getCurrentPosition(options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }) {
  if (!("geolocation" in navigator)) {
    console.warn("⚠️ Géolocalisation non supportée par ce terminal.");
    return null;
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude, accuracy, timestamp } = pos.coords;
        console.log(`📍 Position GPS : ${latitude}, ${longitude} (±${accuracy}m)`);
        resolve({ lat: latitude, lon: longitude, accuracy, timestamp });
      },
      err => {
        console.warn("⚠️ Erreur GPS :", err.message);
        resolve(null); // on ne rejette pas pour ne pas casser la chaîne
      },
      options
    );
  });
}
// --- Ajoute un marqueur GPS + label ---
  addMarker(lon, lat, label = "", options = {}) {
  if (!this.svgrender || !this.bbox) {
    console.warn("⚠️ Impossible d’ajouter le marqueur : rendu SVG ou bbox non initialisé.");
    return;
  }

  const {
    color = "#ff0",
    stroke = "#000",
    strokeWidth = 5,
    radius = 5,
    fontSize = 20,
    fontFamily = "Permanent",
    fontWeight = "bold",
    fontColor = "#fff",
    dy = -10 // décalage vertical du label
  } = options;

  const projToSvg = this.getProjToSvg(
    parseFloat(this.svgrender.getAttribute("width")),
    parseFloat(this.svgrender.getAttribute("height")),
    10
  );

  const pos = projToSvg(lon, lat);
  const svgNS = "http://www.w3.org/2000/svg";

  // 🔹 Groupe pour le marqueur et son label
  const g = document.createElementNS(svgNS, "g");
  g.setAttribute("class", "custom-marker");

  // 🔸 Cercle du marqueur
  const circle = document.createElementNS(svgNS, "circle");
  circle.setAttribute("cx", pos.x);
  circle.setAttribute("cy", pos.y);
  circle.setAttribute("r", radius);
  circle.setAttribute("fill", color);
  circle.setAttribute("stroke", stroke);
  circle.setAttribute("stroke-width", strokeWidth);
  g.appendChild(circle);

  // 🔸 Label
  if (label) {
    // halo noir pour lisibilité
    const halo = document.createElementNS(svgNS, "text");
    halo.setAttribute("x", pos.x + radius + 3);
    halo.setAttribute("y", pos.y + dy);
    halo.setAttribute("fill", "#000");
    halo.setAttribute("stroke", "#000");
    halo.setAttribute("stroke-width", "5");
    halo.setAttribute("paint-order", "stroke");
    halo.setAttribute("font-size", fontSize);
    halo.setAttribute("font-weight", fontWeight);
    halo.setAttribute("font-family", fontFamily);
    halo.textContent = label;
    g.appendChild(halo);

    // texte visible par-dessus
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", pos.x + radius + 3);
    text.setAttribute("y", pos.y + dy);
    text.setAttribute("fill", fontColor);
    text.setAttribute("font-size", fontSize);
    text.setAttribute("font-weight", fontWeight);
    text.setAttribute("font-family", fontFamily);
    text.textContent = label;
    g.appendChild(text);
  }
  //l(this);
  this.svgrender.appendChild(g);
  //this.gall.appendChild(g);
}

// --- 🌄 Calque d'élévation (altitude) ---
async fetchElevationGrid(step = 0.002) {
  console.log("📡 Récupération du relief...");
  const { minLat, maxLat, minLon, maxLon } = this.bbox;

  const points = [];
  for (let lat = minLat; lat <= maxLat; lat += step) {
    for (let lon = minLon; lon <= maxLon; lon += step) {
      points.push({ latitude: lat, longitude: lon });
    }
  }

  const url = "https://api.open-elevation.com/api/v1/lookup";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locations: points })
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();

  if (!json.results || !Array.isArray(json.results)) {
    throw new Error("Réponse API invalide");
  }

  this.elevations = json.results;
  console.log(`✅ Relief chargé (${this.elevations.length} points)`);
  
  l(this.elevations);
  return this.elevations;
}

// --- 🎨 Dessin du calque d'altitude ---
drawElevationLayer(width = 500, height = 500, padding = 10) {
  if (!this.elevations?.length) {
    console.warn("⚠️ Aucun relief à dessiner (fetchElevationGrid non appelé).");
    return;
  }

  const projToSvg = this.getProjToSvg(width, height, padding);
  const svgNS = "http://www.w3.org/2000/svg";
  const g = document.createElementNS(svgNS, "g");
  g.setAttribute("class", "elevation-layer");

  const minAlt = Math.min(...this.elevations.map(e => e.elevation));
  const maxAlt = Math.max(...this.elevations.map(e => e.elevation));

  this.elevations.forEach(pt => {
    const pos = projToSvg(pt.longitude, pt.latitude);
    const ratio = (pt.elevation - minAlt) / (maxAlt - minAlt || 1);
    const color = `hsl(${(120 - ratio * 120).toFixed(0)}, 50%, 60% )`; // vert → rouge
 //   const color = `#333`; // vert → rouge
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", pos.x);
    rect.setAttribute("y", pos.y);
    rect.setAttribute("width", 12);
    rect.setAttribute("height", 18);
    rect.setAttribute("fill", color);
 //   rect.setAttribute("opacity", ratio);
    rect.setAttribute("opacity", 0.3);
    g.appendChild(rect);
  });

  this.svgrender.appendChild(g);
  console.log("🌄 Calque relief ajouté");
}

// --- ⚙️ Extension de l'interface de contrôle ---
addReliefControl(container = this.container) {
  const ctrl = container.querySelector(".lightmap-controls");
  if (!ctrl) return;

  const label = document.createElement("label");
  label.style.cssText = "cursor:pointer; user-select:none;";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.style.marginRight = ".3em";
  label.appendChild(input);
  label.appendChild(document.createTextNode("Relief"));
  ctrl.appendChild(label);

  input.addEventListener("change", async () => {
    if (input.checked) {
      try {
        if (!this.elevations) await this.fetchElevationGrid();
        this.drawElevationLayer();
      } catch (err) {
        console.error("⚠️ Erreur relief :", err);
      }
    } else {
      this.svgrender.querySelectorAll(".elevation-layer").forEach(el => el.remove());
    }
  });
}
// --- 🗺️ Dessin du calque des agglomérations ---
drawAgglomerationLayer(width = 500, height = 500, padding = 10) {
  if (!this.agglomerationData?.elements?.length) {
    console.warn("⚠️ Aucun polygone d’agglomération à dessiner.");
    return;
  }

  const projToSvg = this.getProjToSvg(width, height, padding);
  const svgNS = "http://www.w3.org/2000/svg";
  const g = document.createElementNS(svgNS, "g");
  g.setAttribute("class", "agglomeration-layer");

  this.agglomerationData.elements.forEach(e => {
    if (!e.geometry || e.geometry.length < 3) return;

    const d = this.lineStringToPath(
      e.geometry.map(pt => [pt.lon, pt.lat]),
      projToSvg
    ) + " Z";

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", d);

    // Couleurs selon le type
    let fill = "#ccc"; // défaut
    if (e.tags.place === "city") fill = "#c55";
    else if (e.tags.place === "town") fill = "#d77";
    else if (e.tags.place === "village") fill = "#fbb";
    else if (e.tags.admin_level === "8") fill = "#ddd";

    path.setAttribute("fill", fill);
    path.setAttribute("opacity", 0.25);
    path.setAttribute("stroke", "#000");
    path.setAttribute("stroke-width", 0.2);
    g.appendChild(path);
  });

  this.svgrender.appendChild(g);
  console.log("🏙️ Calque d’agglomération ajouté");
}
  // --- Dessin global depuis cache ---
  async drawAllLayersFromCache(container, width = 500, height = 500, padding = 10) {
    const data = this.geoData || {};
    const elements = data.elements || [];
    const projToSvg = this.getProjToSvg(width, height, padding);
    const svgNS = "http://www.w3.org/2000/svg";

    const gAll = document.createElementNS(svgNS, "g");
    gAll.setAttribute("class", "combined-layers");
    

// --- ROUTES : filtrées selon l'étendue visible ---
const diagKm = Math.hypot(
  this.targetbbox.lat.max - this.targetbbox.lat.min,
  this.targetbbox.long.max - this.targetbbox.long.min
) * 111;

// --- Liste complète (hiérarchisée)
const highwayLevels = {
  main: ["motorway", "trunk", "primary", "secondary", "tertiary"],
  local: ["unclassified", "residential", "living_street", "service", "road"],
  rural: ["track", "path", "footway", "cycleway", "bridleway"],
  special: ["busway"]
};

// --- Filtrage selon la distance affichée (LOD)
let allowedHighways = [];
if (diagKm > 60) {
  allowedHighways = highwayLevels.main.slice(0, 2); // motorway + trunk
} else if (diagKm > 20) {
  allowedHighways = [...highwayLevels.main]; // routes principales
} else if (diagKm > 5) {
  allowedHighways = [...highwayLevels.main, ...highwayLevels.local];
} else {
  allowedHighways = [
    ...highwayLevels.main,
    ...highwayLevels.local,
    ...highwayLevels.rural,
    ...highwayLevels.special
  ];
}

elements
  .filter(e => e.tags?.highway && allowedHighways.includes(e.tags.highway))
  .forEach(f => {
    const d = this.lineStringToPath(
      f.geometry.map(g => [g.lon, g.lat]),
      projToSvg
    );
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", "none");

    // --- Style selon type ---
    let stroke = "#fff", width = 1.2, opacity = 0.9;
    switch (f.tags.highway) {
      case "motorway": stroke = "#f60"; width = 3; break;
      case "trunk": stroke = "#fd4"; width = 2.6; break;
      case "primary": stroke = "#fff"; width = 2.2; break;
      case "secondary": stroke = "#eee"; width = 1.8; break;
      case "tertiary": stroke = "#ddd"; width = 1.4; break;
      case "residential": stroke = "#bbb"; width = 1; opacity = 0.7; break;
      case "service": stroke = "#aaa"; width = 0.9; opacity = 0.6; break;
      case "unclassified": stroke = "#999"; width = 0.9; opacity = 0.6; break;
      case "track": stroke = "#775"; width = 0.8; opacity = 0.5; break;
      case "path":
      case "footway":
      case "cycleway":
      case "bridleway": stroke = "#484"; width = 0.6; opacity = 0.4; break;
      case "busway": stroke = "#08f"; width = 1.2; opacity = 0.8; break;
    }

    p.setAttribute("stroke", stroke);
    p.setAttribute("stroke-width", width);
    p.setAttribute("opacity", opacity);
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("stroke-linejoin", "round");

    this.gGnd.appendChild(p);
  });

    // BÂTIMENTS
    elements.filter(e => e.tags?.building).forEach(f => {
      const d = this.lineStringToPath(f.geometry.map(g => [g.lon, g.lat]), projToSvg) + " Z";
      const p = document.createElementNS(svgNS, "path");
      p.setAttribute("d", d);
      p.setAttribute("fill", "#999");
      p.setAttribute("stroke", "#333");
      p.setAttribute("stroke-width", "0.3");
      p.setAttribute("opacity", "0.7");
      this.gGnd.appendChild(p);
    });

    // NATURE
    elements.filter(e =>
      e.tags?.natural || e.tags?.landuse || e.tags?.leisure
    ).forEach(f => {
      const d = this.lineStringToPath(f.geometry.map(g => [g.lon, g.lat]), projToSvg) + " Z";
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", d);
      let fill = "#6c6";
      if (f.tags.natural === "water") fill = "#66c";
      else if (f.tags.landuse === "forest") fill = "#385";
      else if (f.tags.natural === "beach" || f.tags.natural === "sand") fill = "#eec";
      path.setAttribute("fill", fill);
      path.setAttribute("opacity", "0.4");
      this.gGnd.appendChild(path);
    });

// --- VILLES : affichage hiérarchique selon la taille de la zone ---


elements
  .filter(e => e.type === "node" && e.tags?.place)
  .forEach(t => {
    const type = t.tags.place;
    if (!["city", "town", "village"].includes(type)) return;

    // 🔹 Filtrage selon la distance affichée
    if (diagKm > 40 && type !== "city") return;       // >20 km → seulement city
  //  if (diagKm > 25 && type === "village") return;     // 5–20 km → city + town

    const pos = projToSvg(t.lon, t.lat);
    const c = document.createElementNS(svgNS, "circle");
    c.setAttribute("cx", pos.x);
    c.setAttribute("cy", pos.y);
    c.setAttribute("r", type === "city" ? 6 : type === "town" ? 4 : 3);
    c.setAttribute("fill", "#fff");
    c.setAttribute("stroke",
      type === "city" ? "#a00" : type === "town" ? "#a55" : "#a77"
    );
    c.setAttribute("stroke-width", "0.6");
    this.gGnd.appendChild(c);

    if (t.tags.name) {
      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("x", pos.x + 5);
      text.setAttribute("y", pos.y - 5);
      text.setAttribute("fill", "#111");
      text.setAttribute(
        "font-size",
        type === "city" ? 24 : type === "town" ? 18 : 14
      );
      text.setAttribute("font-family", "Roboto");
      text.setAttribute("font-weight", "bold");
      text.textContent = t.tags.name;
      this.gGnd.appendChild(text);
    }
  });

  //  this.svgrender.appendChild(gAll);
    this.svgrender.appendChild(this.gTop);
  }
  // --- 🧰 Gestion du cache : affichage et purge ---
async addCacheManagerPanel(container = this.ctrlPanelContent) {
  if (!container) return;

  // Conteneur du module
  const div = document.createElement("div");
  div.className = "cache-manager";
  div.style.cssText = `
    margin-top: 1em;
    padding: .5em .8em;
    border-top: 1px solid #0002;
    font-family: monospace;
    font-size: .9em;
    background: #fff5;
    border-radius: .3em;
  `;

  // Titre
  const title = document.createElement("div");
  title.textContent = "💾 Gestion du cache";
  title.style.cssText = "font-weight:bold; margin-bottom:.4em;";
  div.appendChild(title);

  // Zone d’infos
  const info = document.createElement("div");
  info.textContent = "Chargement…";
  info.style.cssText = "margin-bottom:.4em;";
  div.appendChild(info);

  // Bouton de suppression
  const btn = document.createElement("button");
  btn.textContent = "🗑️ Vider le cache";
  btn.style.cssText = `
    background:#c33;
    color:#fff;
    border:none;
    border-radius:.3em;
    padding:.3em .8em;
    cursor:pointer;
  `;
  div.appendChild(btn);

  container.appendChild(div);

  // --- Fonction de mise à jour ---
  const updateInfo = async () => {
    const stats = await this.getIndexedDBStats();
    info.innerHTML = `
      <b>${stats.count}</b> zone(s) en cache<br>
      ${stats.totalMB} Mo utilisés
    `;
  };
  await updateInfo();

  // --- Gestion du clic : purge complète ---
  btn.addEventListener("click", async () => {
    if (!confirm("Effacer toutes les zones en cache ?")) return;
    await this.dbClear("geoCache");
    info.textContent = "Cache vidé ✔️";
    console.log("🧹 Cache vidé manuellement");
    setTimeout(updateInfo, 1200); // rafraîchit après 1,2s
  });
}
  // --- 💾 Stockage persistant via IndexedDB ---
  async openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("LightMapDB", 1);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("geoCache")) {
          db.createObjectStore("geoCache");
        }
      };
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e);
    });
  }
  async dbSet(storeName, key, value) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      store.put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = e => reject(e);
    });
  }
  async dbGet(storeName, key) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = e => reject(e);
    });
  }
  async dbDelete(storeName, key) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      tx.objectStore(storeName).delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = e => reject(e);
    });
  }
  async dbClear(storeName) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      tx.objectStore(storeName).clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = e => reject(e);
    });
  }
  // --- 🧮 Informations sur le cache local ---
  getCacheStats() {
  const stats = {
    totalBytes: 0,
    items: []
  };

  // Parcours de toutes les clés localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    const bytes = new Blob([value]).size;
    stats.items.push({ key, bytes });
    stats.totalBytes += bytes;
  }

  // Conversion lisible
  stats.totalKB = (stats.totalBytes / 1024).toFixed(1);
  stats.totalMB = (stats.totalBytes / 1024 / 1024).toFixed(2);

  return stats;
}


  async getIndexedDBStats() {
    const db = await this.openDB();
    const tx = db.transaction("geoCache", "readonly");
    const store = tx.objectStore("geoCache");
  
    const keys = await new Promise((resolve, reject) => {
      const req = store.getAllKeys();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = reject;
    });
  
    const values = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = reject;
    });
  
    let total = 0;
    values.forEach(v => (total += new Blob([JSON.stringify(v)]).size));
  
    return {
      count: keys.length,
      totalKB: (total / 1024).toFixed(1),
      totalMB: (total / 1024 / 1024).toFixed(2),
    };
  }
// --- 🔍 Vérifie aussi la capacité disponible ---
  async getStorageEstimate() {
  if (!('storage' in navigator && 'estimate' in navigator.storage)) {
    console.warn("⚠️ API navigator.storage.estimate() non supportée.");
    return null;
  }

  const estimate = await navigator.storage.estimate();
  const used = estimate.usage || 0;
  const quota = estimate.quota || 0;

  return {
    usedBytes: used,
    quotaBytes: quota,
    usedMB: (used / 1024 / 1024).toFixed(2),
    quotaMB: (quota / 1024 / 1024).toFixed(2),
    percent: ((used / quota) * 100).toFixed(1)
  };
}
  showCacheInfo(container = document.body) {
 // const stats = this.getIndexedDBStats();
  const stats = this.getCacheStats();
  const div = document.createElement("div");
  div.style.cssText = `
    font-family: monospace;
    background:#fff8;
    border:1px solid #0002;
    padding:.5em;
    border-radius:.5em;
    margin-top:.5em;
  `;
  div.innerHTML = `
    <b>Cache LightMap</b><br>
    ${stats.totalMB} Mo<br>
    <ul style="margin:.3em 0; padding-left:1em;">
      ${stats.items.map(i => `<li>${i.key} – ${(i.bytes/1024).toFixed(1)} KB</li>`).join("")}
    </ul>
  `;
  container.appendChild(div);
}
// --- 🔄 Mise à jour de la zone cible ---
setTarget(lat, lon, size = 300) {
  const earthRadius = 6378137;
  const pCenter = this.mercatorProject(lon, lat);
  const delta = size / earthRadius;

  const mercatorUnproject = (x, y) => {
    const lon = x * 180 / Math.PI;
    const lat = (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180 / Math.PI;
    return { lon, lat };
  };

  const minX = pCenter.x - delta, maxX = pCenter.x + delta;
  const minY = pCenter.y - delta, maxY = pCenter.y + delta;

  const sw = mercatorUnproject(minX, minY);
  const ne = mercatorUnproject(maxX, maxY);

  this.targetbbox = {
    string: [sw.lat.toFixed(6), sw.lon.toFixed(6), ne.lat.toFixed(6), ne.lon.toFixed(6)].join(','),
    lat: { min: sw.lat, max: ne.lat },
    long: { min: sw.lon, max: ne.lon }
  };

  this.bbox = this.getTargetBBoxProjected();
  console.log("🎯 Nouvelle zone cible :", this.targetbbox.string);
}

// --- 🔁 Rafraîchit la carte sur la nouvelle zone ---
async refreshView(forceRefresh = true) {
  if (!this.svgrender) {
    console.warn("⚠️ Le rendu SVG n'est pas encore prêt.");
    return;
  }

  const container = this.svgrender.parentElement || document.getElementById("map") || document.body;

  console.log("🔁 Rafraîchissement de la carte...");
  
  this.svgrender.innerHTML = ""; // nettoie la carte actuelle
  const svgNS = "http://www.w3.org/2000/svg";
this.gGnd = document.createElementNS(svgNS, "g");
    this.gGnd.setAttribute("class", "top-layer");
    this.svgrender.appendChild(this.gGnd);
    this.gTop = document.createElementNS(svgNS, "g");
    this.gTop.setAttribute("class", "top-layer");
    this.svgrender.appendChild(this.gTop);
  try {
    await this.fetchGeoData(forceRefresh);
    await this.drawAllLayersFromCache(container, 500, 500, 10);
    console.log("✅ Carte mise à jour");
  } catch (err) {
    console.error("❌ Erreur lors du rafraîchissement :", err);
  }
}

// --- 🎯 Recentrage sur un point donné ---
async centerOn(lat, lon, size = 300) {
  console.log(`📍 Recentrement sur ${lat}, ${lon}`);
  this.setTarget(lat, lon, size);
  await this.refreshView(true);
}
// --- 🎯 Recentrer la vue entre homePos et la position actuelle ---
async centerBetweenHomeAndCurrent(scaleFactor = 700, minSize = 300) {
  if (!this.homePos) {
    console.warn("⚠️ homePos non définie.");
    return;
  }
  const pos = await this.getCurrentPosition();
  if (!pos) {
    console.warn("⚠️ Position actuelle indisponible.");
    return;
  }
  
  if (typeof logUserEvenmt === "function") {
    const coords = `${pos.lat.toFixed(6)},${pos.lon.toFixed(6)}`;
    let fmtev = '[locate] '+ coords;
    l(fmtev);
    logUserEvenmt(fmtev);
  }
  
  
  const [latHome, lonHome] = this.homePos.split(',').map(Number);
  const { lat: latCurrent, lon: lonCurrent } = pos;

  // --- Centre géographique (moyenne simple)
  const latCenter = (latHome + latCurrent) / 2;
  const lonCenter = (lonHome + lonCurrent) / 2;

  // --- Distance en km (formule de Haversine)
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(latCurrent - latHome);
  const dLon = toRad(lonCurrent - lonHome);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(latHome)) * Math.cos(toRad(latCurrent)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  // --- Taille d’affichage dérivée de la distance
  const sizeMeters = Math.max(distanceKm * scaleFactor, minSize);

  console.log(
    `📍 home→current: ${distanceKm.toFixed(2)} km | centre ${latCenter.toFixed(6)}, ${lonCenter.toFixed(6)} | champ ${sizeMeters.toFixed(0)} m`
  );
  // marge
  let mrg = sizeMeters * .1;
  if ( mrg > 1000 ) mrg = 1000;
  // --- Met à jour la carte
  this.setTarget(latCenter, lonCenter, sizeMeters+mrg);
  await this.refreshView(true);

  // Retourne aussi les deux points pour usage avec API de routage
  return {
    from: { lat: latHome, lon: lonHome },
    to: { lat: latCurrent, lon: lonCurrent },
    distanceKm,
    center: { lat: latCenter, lon: lonCenter },
    sizeMeters
  };
}
// --- 🛣️ Dessine un itinéraire à partir d'une géométrie GeoJSON ---
drawRouteFromGeoJSON(geojson, options = {}) {
  if (!this.svgrender || !geojson) {
    console.warn("⚠️ Impossible de dessiner la route : SVG ou géométrie manquante.");
    return;
  }

  const { color = "#0af", width = 3, opacity = 0.9, dashed = false } = options;

  const svgNS = "http://www.w3.org/2000/svg";
  const projToSvg = this.getProjToSvg(
    parseFloat(this.svgrender.getAttribute("width")),
    parseFloat(this.svgrender.getAttribute("height")),
    10
  );

  // --- Gère LineString ou MultiLineString ---
  const lines = [];
  if (geojson.type === "LineString") {
    lines.push(geojson.coordinates);
  } else if (geojson.type === "MultiLineString") {
    lines.push(...geojson.coordinates);
  } else if (geojson.type === "Feature" && geojson.geometry) {
    return this.drawRouteFromGeoJSON(geojson.geometry, options);
  } else if (geojson.type === "FeatureCollection") {
    geojson.features.forEach(f => this.drawRouteFromGeoJSON(f, options));
    return;
  } else {
    console.warn("⚠️ Type GeoJSON non supporté :", geojson.type);
    return;
  }

  // --- Groupe des routes
  const g = document.createElementNS(svgNS, "g");
  g.setAttribute("class", "route-layer");

  // --- Création des chemins
  lines.forEach(coords => {
    const pathData = coords
      .map((c, i) => {
        const { x, y } = projToSvg(c[0], c[1]);
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", width);
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("opacity", opacity);
    if (dashed) path.setAttribute("stroke-dasharray", "6,3");
    g.appendChild(path);
  });

  this.svgrender.appendChild(g);
  console.log(`🛣️ Route tracée (${lines.length} segment(s))`);
}
}
class Userland {
  constructor(domdest) {
    if (!(domdest instanceof Element)) {
      console.error("❌ Userland: domdest invalide");
      return;
    }

    this.domdest = domdest;

    // 🔹 Conteneur racine
    this.root = mkdiv('', 'userland');
    domdest.appendChild(this.root);

    // 🔹 Bouton de fermeture
    this.closeBtn = mkdiv('fermer', 'userland-close', '×', 'click', () => this.close());
    // this.root.appendChild(this.closeBtn); // optionnel

    // 🔹 Laisser le DOM peindre avant d’animer l’ouverture
    requestAnimationFrame(() => this.root.classList.add('open'));

    // --- Carte principale (QR, identifiant, scan) ---
    const cardSection = mkdiv('', 'userland-section');
    this.root.appendChild(cardSection);
    this.renderCard(cardSection);

    // --- Section Mémo ---
    window.memo = new Memo();
    window.memo.buildUserlandSection(this.root);

    // --- Section Paramètres ---
    const configSection = mkdiv('<i class="icon-cog"></i> Paramètres', 'userland-section');
    this.root.appendChild(configSection);

    window.userland = this;
  }


// ======================================================
  // Mise à jour de l'icône utilisateur (badge mémo)
  // ======================================================


  // ======================================================
  // Effet rebond / tilt sur l'icône utilisateur
  // ======================================================
  
  // ======================================================
  // Rendu de la carte utilisateur (QR + Scan)
  // ======================================================
  renderCaard(domdest) {
    const card = mkdiv('', 'userland-card');

    // --- QR code principal ---
    const qrDiv = mkdiv('', 'userland-qr', 'readero');
    card.appendChild(qrDiv);

    new QRCode(qrDiv, {
      text: window.suid,
      width: 160,
      height: 160,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.L
    });

    // --- Bouton de scan ---
    const scan = mkdiv('<i class="icon-videocam"></i>', 'userland-scan-btn');
    scan.addEventListener('click', this.qrscaner.bind(this), false);
    card.appendChild(scan);

    // --- Identifiant utilisateur ---
    const idSection = mkdiv('visiteur #' + window.suid, 'card-label');
    card.appendChild(idSection);

    // --- Intégration dans la section ---
    domdest.appendChild(card);
  }
  renderCard(domdest) {
    // --- Carte principale ---
    const card = mkdiv('', 'userland-card');
  
    // --- État condensé (icône QR) ---
    const collapsed = mkdiv('<i class="icon-qrcode"></i>', 'card-collapsed');
    card.appendChild(collapsed);
  
    // --- Contenu complet (étendu) ---
    const expanded = mkdiv('', 'card-expanded hidden');
    card.appendChild(expanded);
  
    // --- QR code principal ---
    const qrDiv = mkdiv('', 'userland-qr', 'readero');
    expanded.appendChild(qrDiv);
  
    new QRCode(qrDiv, {
      text: window.suid,
      width: 160,
      height: 160,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.L
    });
  
    // --- Bouton scan ---
    const scan = mkdiv('<i class="icon-videocam"></i>', 'userland-scan-btn');
    scan.addEventListener('click', this.qrscaner.bind(this), false);
    expanded.appendChild(scan);
  
    // --- Identifiant utilisateur ---
    const idSection = mkdiv('visiteur #' + window.suid, 'card-label');
    expanded.appendChild(idSection);
  
    // --- Bascule d’état ---
    card.addEventListener('click', e => {
      // si on clique sur le bouton scan, ne pas fermer la carte
      if (e.target.closest('.userland-scan-btn')) return;
  
      const isExtended = card.classList.toggle('extended');
      expanded.classList.toggle('hidden', !isExtended);
      collapsed.classList.toggle('hidden', isExtended);
    });
  
    domdest.appendChild(card);
  }
  // ======================================================
  // Scanner de QR code
  // ======================================================
  qrscaner() {
    // éviter plusieurs scanners simultanés
    if (document.getElementById('qr-ui')) return;

    const readerUI = mkflathack({ id: 'qr-ui' });
    const coreReader = mkdiv('', '', 'reader');
    const shutBtn = mkdiv('<i class="icon-cancel"></i> Fermer', 'btn shutscanbtn');

    readerUI.appendChild(coreReader);
    readerUI.appendChild(shutBtn);

    const config = { fps: 10, qrbox: { width: 200, height: 200 } };
    const html5QrCode = new Html5Qrcode('reader');

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      l("lu :", decodedText, decodedResult);

      html5QrCode.stop();
      readerUI.remove();

      const rslt = mkflathack({ id: 'res' });
      rslt.appendChild(mkdiv(decodedText));

      const payload = {
        terminalKey: localStorage.getItem('terminalKey'),
        suid: decodedText
      };

      Utils.apiPost("api/get_suid.php", payload)
        .then(result => {
          const node = mkdiv('', 'suid-result');
          if (result && result.success) {
            node.innerHTML = `<pre>${JSON.stringify(result.user, null, 2)}</pre>`;
          } else {
            node.textContent = "Erreur : " + (result?.error || "Réponse vide");
          }
          rslt.appendChild(node);
        })
        .catch(err => {
          console.error("Erreur réseau / exception :", err);
          rslt.appendChild(mkdiv("Erreur réseau : " + String(err)));
        });
    };

    html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);

    shutBtn.addEventListener('click', () => {
      html5QrCode.stop();
      readerUI.remove();
    });
  }

  // ======================================================
  // Fermeture de l'interface
  // ======================================================
  close() {
    if (!this.root) return;

    this.root.classList.remove('open');

    // Transition CSS de fermeture
    this.root.addEventListener('transitionend', () => {
      if (this.root?.parentNode) this.root.remove();
      this.root = null;
    }, { once: true });
  }
}
class Shoplandland {
  constructor(domdest) {
    if (!(domdest instanceof Element)) {
      console.error("❌ Userland: domdest invalide");
      return;
    }

    this.domdest = domdest;

    // conteneur racine
    this.root = mkdiv('', 'userland');
    domdest.appendChild(this.root);

    // bouton fermeture
    this.closeBtn = mkdiv('fermer', 'userland-close', '×', 'click', () => this.close());
  //  this.root.appendChild(this.closeBtn);

    // petit délai pour laisser le DOM peindre avant d'ajouter "open"
    requestAnimationFrame(() => {
      this.root.classList.add('open');
    });
   // this.qrSection();
    this.renderCard();
    
    
  let memoSection = mkdiv('<i class="icon-attach"></i> Mémos', 'userland-section');
  this.root.appendChild(memoSection);
  let configSection = mkdiv('<i class="icon-cog"></i> Paramètres', 'userland-section');
  this.root.appendChild(configSection);
  

  }
  renderCard(terminalKey, userName = "Invité") {
  // carte principale
  const card = mkdiv('', 'userland-card');
  let textContent = 'https://fleurepizza27.fr/app/index.php';
  //?terminalkey='+getTerminalKey();
  // zone QR
  const qrDiv = mkdiv('', 'userland-qr', 'readero');
  card.appendChild(qrDiv);

  // génération du QR Code
  new QRCode(qrDiv, {
    text: textContent,
    //text: window.suid,
    width: 160,
    height: 160,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.L
  });

  // nom utilisateur
  
  l(window.user);
  const scan = mkdiv('<i class="icon-videocam"></i>', 'userland-scan-btn');
  scan.addEventListener('click', 
      this.qrscaner.bind(this), false);
    card.appendChild(scan);
    let idSection = mkdiv('visiteur #'+ window.suid, 'card-label');
  card.appendChild(idSection);
    // on ajoute la carte au root
    this.root.appendChild(card);
  }
  qrscaner() {
    let reader = mkflathack({id:'qr-ui'});
    let corereader = mkdiv('', '', 'reader');
    let shutscanbtn = mkdiv('<i class="icon-cancel"></i> Fermer', 'btn shutscanbtn');
    
    let tmpel = document.getElementById('qr-ui');
    tmpel.appendChild(corereader);
    tmpel.appendChild(shutscanbtn);
    
    const config = { fps: 10, qrbox: { width: 200, height: 200 } };
    const html5QrCode = new Html5Qrcode('reader');
    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
   
      let jsn = decodedText;
      //JSON.parse(decodedText);
          l(`lu :`);
          l(decodedText);
          l(decodedResult);
       //   l(JSON.parse(jsn));
          html5QrCode.stop();
          tmpel.remove();
          l('process');
          // j'ai besoin ici d'un appel api afin de récupérer les informations relatives au suid. commence par ecrire la route php, seul group root obtiendra une reponse
          let rslt = mkflathack({id:'res'});
          rslt.appendChild(mkdiv(decodedText));
          
          const payload = { terminalKey: localStorage.getItem('terminalKey'), suid: decodedText };

Utils.apiPost("api/get_suid.php", payload)
  .then(result => {
    if (result && result.success) {
      const node = mkdiv(JSON.stringify(result.user, null, 2));
      rslt.appendChild(node);
    } else {
      console.error("Erreur get_suid :", result ? result.error : "réponse vide");
      rslt.appendChild(mkdiv("Erreur : " + (result ? result.error : "réponse vide")));
    }
  })
  .catch(err => {
    console.error("Erreur réseau / exception :", err);
    rslt.appendChild(mkdiv("Erreur réseau : " + String(err)));
  });

          
        };
      html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback );
      shutscanbtn.addEventListener('click', function () {
        html5QrCode.stop();
        tmpel.remove();
      }.bind(this), false)
  }
  close() {
    if (!this.root) return;

    // retire la classe open pour déclencher l’animation de fermeture
    this.domdest.classList.remove('open');

    // on écoute la fin de la transition CSS
    this.root.addEventListener('transitionend', () => {
      if (this.root && this.root.parentNode) {
        this.root.remove();
      }
      if (this.domdest && this.domdest.parentNode) {
        this.domdest.remove();
      }
      this.root = null;
    }, { once: true });
  }
}
/*________ App _________*/
class App {
  constructor(domdest) {
    if (!(domdest instanceof Element)) {
      console.error("❌ App: domdest invalide");
      domdest = document.body;
      l(domdest)
      //return;
    }
    this.memo = new Memo();
    window.memo = this.memo;
    //memo.clear();
      this.terminalKey = getTerminalKey();
    
  document.addEventListener("smartcontent-ready", e => {
  console.log("🎉 Contenu complet prêt :", e.detail.source);
  // ex. : activer le dock ou lancer une animation
});
    this.context = 'content';
    Utils.generateCellShadingClasses();
    this.domdest = domdest;
    this.domdest.innerHTML = "";
    this.nav = {};
    // 🔹 Création de l’arborescence principale
    this.root = mkdiv("", "", "root-ground");
    l(this.root.offsetWidth);
    //this.domdest.appendChild(this.root);
    document.body.appendChild(this.root);

    // 🔹 Hauteur adaptative
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // 🔹 Animation de lancement
    terminalKey = getTerminalKey();
    this.registerTerminal();
    this.getData(this.init.bind(this));
    
    
  }
  init () {
 //   setThemeColor('#a00');
    this.launchAnimation();
    this.mkbranding();
    this.mkphoneblock();
   // this.mknavdock();
    this.mkcontent();
    this.mkfooter();
    
  }
  resize() {
    this.root.style.height = window.innerHeight + "px";
  }
  launchAnimation() {
    this.root.style.opacity = "0";
    this.root.style.transform = "scale(0.95)";
    this.root.style.transition = "opacity 0.6s ease, transform 1.6s ease";

    requestAnimationFrame(() => {
      this.root.style.opacity = "1";
      this.root.style.transform = "scale(1)";
    });
  }
  mkbranding () {
    this.branding = mkdiv('<i class="icon-icfleure"></i> FleurePizza', 'cellshade-4', 'branding');
    this.root.appendChild(this.branding);
  }
  mkphoneblock () {
    this.phoneblock = mkdiv('<i class="icon-phone"></i> 02 32 51 03 55', 'cellshade-2', 'phone-block');
    this.phoneblock.addEventListener('click', () => {
    window.location.href = 'tel:+33232510355';
  });
  
  // Optionnel : ajouter un attribut pour l'accessibilité
  this.phoneblock.setAttribute('role', 'button');
  this.phoneblock.setAttribute('aria-label', 'Appeler le 02 32 51 03 55');
  
    this.root.appendChild(this.phoneblock);
  }
  mkcontent () {
    this.content = mkdiv('', '', 'content');
    this.root.appendChild(this.content);
    let targetWidth = 250;
    let nCol = (this.content.offsetWidth - this.content.offsetWidth%targetWidth)/targetWidth;
    l(this.content.offsetWidth);
    l(window.visualViewport);
    new SmartContent(this.content);
 //   new PizzaOverview("content", "classique", "senior", nCol);
   // new SandwichOverview("content", "menu", 1);
 //   new PizzaOverview("content", "classique", "senior", 1);
   // new GlobalOverview("content", "overview", 1);
  }
  mkfooter () {
    
    this.footerPanel = mkdiv('', '', 'footer-ext-panel');
    this.footer = mkdiv('', '', 'footer');
    this.root.appendChild(this.footerPanel);
    this.root.appendChild(this.footer);
    
    this.userSwitch = mkdiv('<i class="icon-user"></i>', '', 'user-switch-btn');
    this.footer.appendChild(this.userSwitch);
    this.cgvSwitch = mkdiv('', '', 'cgv-switch-btn');
    this.cgvSwitchLeft = mkdiv('<i class="icon-icfleure"></i>FleurePizza<br> Conditions générales de vente', 'cgv-link-side', '');
    this.cgvSwitchRight = mkdiv('<i class="icon-location"></i>', 'location-side', '');
    
    this.cgvSwitch.appendChild(this.cgvSwitchLeft);
    this.cgvSwitch.appendChild(this.cgvSwitchRight);
    this.footer.appendChild(this.cgvSwitch);
    
    this.userSwitch.addEventListener('click', this.toggleUserland.bind(this), false);
    
    this.cgvSwitch.addEventListener('click', this.toggleShopland.bind(this), false);
    memo.updateIconUser();
  }
  mknavdock () {
    this.navdock = mkdiv('', '', 'navdock');
    this.root.appendChild(this.navdock);
    
    this.nav.formules = mkdiv('<i class="icon-icformule"></i>');
    this.navdock.appendChild(this.nav.formules);
    this.nav.pizzas = mkdiv('<i class="icon-icpizza"></i>', 'cellshade-2');
    this.navdock.appendChild(this.nav.pizzas);
    this.nav.burgers = mkdiv('<i class="icon-icburger"></i>');
    this.navdock.appendChild(this.nav.burgers);
    this.nav.plats = mkdiv('<i class="icon-icplat"></i>');
    this.navdock.appendChild(this.nav.plats);
    this.nav.desserts = mkdiv('<i class="icon-icdessert"></i>');
    this.navdock.appendChild(this.nav.desserts);
    this.nav.boissons = mkdiv('<i class="icon-icboisson"></i>');
    this.navdock.appendChild(this.nav.boissons);
    }
  mknavdock () {
    this.navdock = mkdiv('', '', 'navdock');
    this.root.appendChild(this.navdock);
    
    this.nav.formules = mkdiv('<i class="icon-icformule"></i>');
    this.navdock.appendChild(this.nav.formules);
    this.nav.pizzas = mkdiv('<i class="icon-icpizza"></i>', 'cellshade-2');
    this.navdock.appendChild(this.nav.pizzas);
    this.nav.burgers = mkdiv('<i class="icon-icburger"></i>');
    this.navdock.appendChild(this.nav.burgers);
    this.nav.plats = mkdiv('<i class="icon-icplat"></i>');
    this.navdock.appendChild(this.nav.plats);
    this.nav.desserts = mkdiv('<i class="icon-icdessert"></i>');
    this.navdock.appendChild(this.nav.desserts);
    this.nav.boissons = mkdiv('<i class="icon-icboisson"></i>');
    this.navdock.appendChild(this.nav.boissons);
    }
  toggleShopland() { this.setcontext('shopland'); }
  toggleUserland() { this.setcontext('userland'); }
  
  setcontext(contextstring) {
    if (window.activityMonitor) {
      clearTimeout(activityMonitor);
      activityMonitor = null;
    }
    this.navdock = document.getElementById('navdock');
    this.navdock;
  // --- Étape 1 : Réinitialisation complète du contexte
  this.footer.classList.remove('extended');
  this.content.classList.remove('fadeOut', 'fade-out');
  this.navdock.classList.remove('fadeOut');
  this.footerPanel.innerHTML = '';
  this.mapsection = null;
  this.map = null;

  // --- Déterminer si on revient au contexte neutre
  const previous = this.context;
  if (this.context === contextstring) {
    this.context = 'content';
    l('reset to content');
    // Événement "context-reset"
    window.dispatchEvent(new CustomEvent('context-reset', {
      detail: { from: previous, to: this.context }
    }));
    return;
  }

  // --- Étape 2 : Appliquer le nouveau contexte
  this.context = contextstring;
  l('→ setcontext', this.context);

  switch (contextstring) {

    case 'shopland':
      this.footer.classList.add('extended');
      this.content.classList.add('fadeOut', 'fade-out');
      this.navdock.classList.add('fadeOut');
      this.mapsection = mkdiv('', 'map-section');
      this.map = mkdiv('', 'map-ctnr', 'map');
      this.mapsection.appendChild(this.map);
      this.footerPanel.appendChild(this.mapsection);

  const map = new LightMap(document.getElementById("map"), "49.309860,1.432272", 16000);
  window.lightmap = map;

    map.addMarker(1.432272, 49.309860, "FleurePizza", { color: "#09f", stroke: "#000", radius: 5 });

      break;

    case 'userland':
      this.footer.classList.add('extended');
      this.content.classList.add('fadeOut', 'fade-out');
      this.navdock.classList.add('fadeOut');
     // window.userland = 
     new Userland(this.footerPanel);
      break;

    default:
      this.context = 'content';
      console.warn('⚠️ Contexte inconnu, retour au content');
  }

  // --- Étape 3 : Émission d’un événement global
  const evtName = `context-${this.context}`;
  //logUserEvent(evtName);
  const event = new CustomEvent(evtName, {
    detail: {
      from: previous,
      to: this.context,
      timestamp: Date.now(),
      source: this
    }
  });
  window.dispatchEvent(event);
  l(`📢 événement "${evtName}" émis`);
}
  async registerTerminal() {
    const result = await Utils.apiPost("api/register.php", { terminalKey });
    if (result.success) {
      
      l('Log SUID '+result.userSuid);
      l('Réponse: ' + result.message);
      l('terminalKey: ' + result.terminalKey);
      l( 'Privilèges: '+ result.grade);
      if (result.message == "allocateTerminal") {
        localStorage.setItem("terminalKey", result.terminalKey);
      }
      
      if (result.jsadd) {
      l('jsadd');
      //l(result.jsadd);
    
      // Création d’un élément <script>
      const script = document.createElement("script");
      script.type = "text/javascript";
    
      // Si jsadd contient du code brut
      script.text = result.jsadd;
    
      // Injection dans le DOM (en général dans <head>)
      document.head.appendChild(script);
    }
      window.suid = result.userSuid;
      window.permissions = result.grade;
      
    } else {
      console.error("❌ Erreur API registerTerminal :", result.error);
    }
  }
  async getData(callback) {
    const result = await Utils.apiGet("api/getData.php");
    if (result.success) {
      window.data = result.data;
      //console.log("✅ Données récupérées :", result.data);
      callback();
    } else {
      console.error("❌ Erreur API getData :", result.error);
    }
  }
}
class Appr {
  constructor(root = document.body) {
    this.space = mkdiv('', 'app-space');
    root.appendChild(this.space);
    Utils.generateCellShadingClasses();
    this.views = [];
    this.activeIndex = 0;

    this.memo = new Memo();
    window.memo = this.memo;

    this.terminalKey = getTerminalKey();
    terminalKey = getTerminalKey();

    this.init(); // crée les vues (vide pour l’instant)
    this.registerTerminal().then(() => this.loadDataAndMount());

    this.bindGestures();
  }

  async loadDataAndMount() {
    const result = await this.getData();
    if (result && result.success) {
      // maintenant qu'on a data, on peut monter SmartContent
      const homeView = this.views.find(v => v instanceof HomeView);
      if (homeView) homeView.mountContent();
    }
  }
  async registerTerminal() {
    const result = await Utils.apiPost("api/register.php", { terminalKey });
    if (!result.success) {
      console.error("❌ Erreur API registerTerminal :", result.error);
      return;
    }

    l('Log SUID ' + result.userSuid);
    l('Réponse: ' + result.message);
    if (result.message === "allocateTerminal") {
      localStorage.setItem("terminalKey", result.terminalKey);
    }

    if (result.jsadd) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.text = result.jsadd;
      document.head.appendChild(script);
    }

    window.suid = result.userSuid;
    window.permissions = result.grade;
  }
  async getData() {
    const result = await Utils.apiGet("api/getData.php");
    if (result.success) {
      window.data = result.data;
      l("✅ Données récupérées :", result.data);
      return result;
    } else {
      console.error("❌ Erreur API getData :", result.error);
      return null;
    }
  }
  init () {
        // Créons nos vues
    this.addView(new UserView(this));
    this.addView(new HomeView(this));
    this.addView(new ShopView(this));

    // Initial position
    this.updateTransform();
    this.showView(1);
  }
  addView(view) {
    const index = this.views.length;
    view.setIndex(index);
    this.views.push(view);
    this.space.appendChild(view.el);
  }
  showView(index, animate = true) {
    if (index < 0 || index >= this.views.length) return;
    this.activeIndex = index;
    this.updateTransform(animate);
  }
  updateTransform(animate = true) {
    const offset = -this.activeIndex * 100;
    this.space.style.transition = animate ? "transform 0.5s ease" : "none";
    this.space.style.transform = `translate3d(${offset}vw, 0, 0)`;
  }
  bindGestures() {
    const footer = document.querySelector('.footer') || document.body;
    let startX = 0;
    footer.addEventListener("touchstart", e => startX = e.touches[0].clientX);
    footer.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (dx > 80) this.showView(this.activeIndex - 1);
      else if (dx < -80) this.showView(this.activeIndex + 1);
    });
  }
}
class AppView {
  constructor(app, name) {
    this.app = app;
    this.name = name;
    this.el = mkdiv('', 'app-view');
    this.el.classList.add(`view-${name}`);
  }

  setIndex(index) {
    this.index = index;
    this.el.style.left = `${index * 100}vw`;
  }
}
class HomeView_0 extends AppView {
  constructor(app) {
    super(app, 'home');
    this.el.innerHTML = '';
    //new SmartContent(this.el);
  }
  mountContent () {
    //new SmartContent(this.el);
  }
}
class HomeView extends AppView {
  constructor(app) {
    super(app, 'home');
    this.el.innerHTML = '';
    
    this.branding = mkdiv('<i class="icon-icfleure"></i> FleurePizza', 'cellshade-4', 'branding');
    this.el.appendChild(this.branding);
    this.content = mkdiv('', '', 'content');
    this.el.appendChild(this.content);
    this.dock = mkdiv('', '', 'navdock');
    this.el.appendChild(this.dock);
  }

  mountContent() {
    if (!window.data) {
      console.warn("⚠️ Impossible de monter SmartContent : data non chargé");
      return;
    }
    new SmartContent(this.content);
  }
}
class ShopView extends AppView {
  constructor(app) {
    super(app, 'shop');
  
    this.mapsection = mkdiv('', 'map-section');
    this.map = mkdiv('', 'map-ctnr', 'map');
    this.mapsection.appendChild(this.map);
    this.el.appendChild(this.mapsection);
      const map = new LightMap(this.map, "49.309860,1.432272", 16000);
  
      
  }
}
class UserView extends AppView {
  constructor(app) {
    super(app, 'user');
    this.el.innerHTML = `
      <div class="view-inner">
        <h1>Espace Utilisateur</h1>
        <button id="goHome">← Accueil</button>
      </div>`;
    this.el.querySelector("#goHome").onclick = () => app.showView(0);
  }
}
class PerfMonitor {
  constructor(options = {}) {
    this.fps = 0;
    this.ms = 0;

    this.frames = 0;
    this.lastTime = performance.now();
    this.lastFrame = this.lastTime;

    // Options
    this.options = Object.assign({
      position: 'top-left', // top-left | top-right | bottom-left | bottom-right
      bg: 'rgba(0,0,0,0.7)',
      color: '#0f0',
      font: '12px monospace',
      zIndex: 9999,
      visible: true
    }, options);

    // DOM
    this.dom = document.createElement('div');
    this.dom.style.cssText = `
      position: fixed;
      ${this.options.position.includes('top') ? 'top:0;' : 'bottom:0;'}
      ${this.options.position.includes('left') ? 'left:0;' : 'right:0;'}
      background:${this.options.bg};
      color:${this.options.color};
      font:${this.options.font};
      padding:4px 6px;
      z-index:${this.options.zIndex};
      pointer-events:none;
      user-select:none;
      display:${this.options.visible ? 'block' : 'none'};
    `;
    this.dom.textContent = "FPS: 0 | MS: 0";
    document.body.appendChild(this.dom);

    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  _loop(now) {
    const delta = now - this.lastFrame;
    this.lastFrame = now;
    this.ms = delta;

    this.frames++;
    if (now - this.lastTime >= 1000) {
      this.fps = (this.frames * 1000) / (now - this.lastTime);
      this.frames = 0;
      this.lastTime = now;

      if (this.options.visible) {
        this.dom.textContent = `FPS: ${this.fps.toFixed(1)} | MS: ${this.ms.toFixed(1)}`;
      }
    }
    requestAnimationFrame(this._loop);
  }

  getFPS() {
    return this.fps;
  }

  getMS() {
    return this.ms;
  }

  destroy() {
    if (this.dom && this.dom.parentNode) {
      this.dom.parentNode.removeChild(this.dom);
    }
  }
}
/*____ Dinamic grid ____*/
const PictoTemplates = {
  pizzas: [
    // --- Bases ---
    "base tomate",
    "base crème",
    "crème fraiche",

    // --- Fromages ---
    "fromage",
    "4 fromages différents",
    "chèvre",
    "gorgonzola",
    "Boursin",
    "maroilles",
    "fromage à raclette",
    "cheddar",

    // --- Épices / herbes ---
    "origan",

    // --- Légumes / fruits ---
    "poivrons",
    "tomate fraiche",
    "oignons",
    "olive",
    "ananas",
    "pommes de terres",
    "piment fort",

    // --- Sauces ---
    "sauce BBQ",
    "Sauce chili tai",
    "miel",

    // --- Viandes / poissons ---
    "jambon",
    "chorizo",
    "pepperoni",
    "kebab",
    "poulet",
    "merguez",
    "viande hachée",
    "anchois",
    "saumon",

    // --- Autres ---
    "oeuf",
    "champignons"
  ],

  burgers: [
    "pain burger",
    "steak haché",
    "cheddar",
    "oignons",
    "cornichons",
    "salade",
    "tomate fraiche",
    "sauce BBQ",
    "sauce burger",
    "miel"
  ],

  paniza: [
    "base tomate",
    "fromage",
    "jambon",
    "origan"
  ],

  tacos: [
    "poulet",
    "merguez",
    "viande hachée",
    "sauce fromagère",
    "Sauce chili tai",
    "frites",
    "fromage"
  ],

  salade: [
    "salade",
    "tomate fraiche",
    "olive",
    "chèvre",
    "oignons",
    "poulet",
    "crème fraiche"
  ],

  panini: [
    "pain panini",
    "mozzarella",
    "tomate fraiche",
    "jambon",
    "chèvre",
    "sauce BBQ"
  ]
};
class PictoGrid {
  constructor(options = {}) {
    this.options = options;
    this.available = [];

    // --- Gestion via PictoTemplates ---
    if (options.template && PictoTemplates[options.template]) {
      this.available = [...PictoTemplates[options.template]];
    }

    // --- Paramètres écrasants ---
    if (Array.isArray(options.available)) {
      this.available = options.available;
    }

    this.default = Array.isArray(options.default) ? options.default : [];
    this.added   = Array.isArray(options.added) ? options.added : [];

    // --- Affichage ---
    this.labels = options.labels || 'bottom';
    this.ncol   = options.ncol || 3;

    // --- DOM ---
    this.container = options.container || document.body;
    this.el = document.createElement('div');
    this.el.className = 'picto-grid';
    this.container.appendChild(this.el);

    // --- Rendu temporaire ---
    this.render();
  }

  render() {
    l('grid-0');
    l(this.el);
  // Nettoyage du conteneur
  this.el.innerHTML = '';

  // ✅ Config de grille (ncol)
  this.el.style.display = 'grid';
  this.el.style.gridTemplateColumns = `repeat(${this.ncol}, 1fr)`;
  this.el.style.gap = '.5em';
  this.el.style.textAlign = 'center';

  // ✅ Gestion des labels regroupés (top / bottom / integrated)
  const hasGlobalLabels = (this.labels === 'top' || this.labels === 'bottom');
  let labelContainer = null;

  if (hasGlobalLabels) {
    labelContainer = document.createElement('div');
    labelContainer.className = `picto-labels-${this.labels}`;
    labelContainer.textContent = this.available.join(', ');
    if (this.labels === 'top') this.el.before(labelContainer);
    else if (this.labels === 'bottom') this.el.after(labelContainer);
  }
    l('grid-1');

  // ✅ Génération des pictogrammes
  this.default.forEach(name => {
    const data = buttonData[name];
    if (!data) {
      console.warn(`⚠️ Pictogramme introuvable: ${name}`);
      return;
    }
    l('grid-2');

    const card = document.createElement('div');
    card.className = 'picto-card';

    // Différenciation visuelle des "added"
    if (this.added.includes(name)) card.classList.add('added');

    // --- Image ---
    const img = document.createElement('img');
    img.src = data.img;
    img.alt = data.label;
    img.className = 'picto-img';

    // --- Label individuel ---
    if (this.labels === 'integrated') {
      const label = document.createElement('div');
      label.className = 'picto-label';
      label.textContent = data.label;
      card.appendChild(img);
      card.appendChild(label);
    } else {
      card.appendChild(img);
    }

    this.el.appendChild(card);
  });
}
}
/*____ Modal Product ___*/
class ModalProduct {
  constructor(product, callerEl = null, activeFilters = {}) {
    if (!product) throw new Error("❌ ModalProduct: produit manquant");
    
    this.product = product;
    this.cat = product.category;
    this.baseName = product.name;
    this.callerEl = callerEl;
    this.activeFilters = activeFilters;
    this.ingrList = Array.isArray(product.ingr) ? product.ingr : [];
    
    // Initialisation de la catégorie et navigation
    this._initializeCategory(product);
    
    // Initialisation des variantes et filtres
    this._initializeVariants();
    
    // Construction de l'interface
    this.createModal();
    this.buildSelectors();
    this.renderVariant();
    this.refreshIngredientGrid();
    this.show();
    this._emitUserEvent ('zoom', this.baseName);
  }

  // =================================
  // INITIALISATION
  // =================================
  _initializeCategory(product) {
    this.categoryName = product.category || null;
    this.categoryData = null;
    this.categoryIndex = -1;

    if (window.sdata?.categories && this.categoryName) {
      this.categoryData = window.sdata.categories.find(
        cat => cat.name === this.categoryName
      ) || null;

      if (this.categoryData?.items) {
        this.categoryIndex = this.categoryData.items.findIndex(
          item => item.name === product.name
        );
      }
    }
  }
  _initializeVariants() {
    this.allVariants = Object.values(window.data)
      .filter(p => p.name === this.baseName)
      .map(p => structuredClone(p));
    
    this.currentVariant = {};
    this.selectedSize = this.activeFilters.size || null;
    this.selectedPate = this.activeFilters.pate || null;
    this.selectedFormule = this.activeFilters.formule || null;
  }
  _emitUserEvent(type, details = "") {
    const label = `[${type}] ${details}`;
    if (typeof logUserEvent === "function") logUserEvent(label);
    else console.log("📋 UserEvent:", label);
  }
  // =================================
  // CRÉATION DE L'INTERFACE
  // =================================
  createModal() {
    this._createOverlay();
    this._createContainer();
    this._createHeader();
    this._createSections();
    this._createFooter();
    this._assembleModal();
  }
  _createOverlay() {
    this.overlay = document.createElement("div");
    this.overlay.className = "modal-overlay";
    this.overlay.addEventListener("click", () => this.close());
  }
  _createContainer() {
    this.container = document.createElement("div");
    this.container.className = "modal-product";
    this.container.addEventListener("click", e => e.stopPropagation());

    const closeBtn = document.createElement("button");
    closeBtn.className = "modal-close";
    closeBtn.innerHTML = `<i class="icon-cancel"></i>`;
    closeBtn.onclick = () => this.close();
    
    this.container.appendChild(closeBtn);
  }
  _createHeader() {
    this.imgBox = document.createElement("div");
    this.imgBox.className = "modal-img";

    this.headerBox = document.createElement("div");
    this.headerBox.className = "modal-header";

    this.title = document.createElement("h2");
    this.title.className = "modal-title";

    this.price = document.createElement("div");
    this.price.className = "modal-price";

    this.headerBox.append(this.title, this.price);
  }
  _createSections() {
    this.selectors = document.createElement("div");
    this.selectors.className = "modal-selectors";

    this.ingrBox = document.createElement("div");
    this.ingrBox.className = "modal-ingr";
  }
  _createFooter() {
    this.footer = document.createElement("div");
    this.footer.className = "modal-footer";
    this.footer.innerHTML = `
      <div class="modal-nav">
        <button class="btn-primary">
          <i class="icon-attach"></i> Ajouter au mémo
        </button>
      </div>
    `;

    const addBtn = this.footer.querySelector('button');
let addConfirmTimeout = null;

addBtn.onclick = () => {
  // Si déjà en mode confirmation → on valide l’ajout
  if (addBtn.classList.contains("confirm")) {
    addBtn.textContent = "Ajouté ✅";
    addBtn.disabled = true;

    // --- Génération de la ligne et ajout au mémo ---
    const order = this.generateOrderLine();
    if (order) {
    //  window.memo.addOrderline(order, order.price || 0);
      window.memo.buildUserlandSection(window.userland.root);
    }

    // Restauration visuelle après une seconde
    setTimeout(() => {
      addBtn.disabled = false;
      addBtn.classList.remove("confirm");
      addBtn.textContent = "Ajouter au mémo";
      addBtn.style.backgroundColor = "";
    }, 1000);
    return;
  }

  // --- Passe en mode confirmation ---
  addBtn.classList.add("confirm");
  addBtn.textContent = "Confirmer";
  addBtn.style.transition = "background-color 0.4s ease";
  addBtn.style.backgroundColor = "#000";

  // --- Timeout pour retour auto ---
  clearTimeout(addConfirmTimeout);
  addConfirmTimeout = setTimeout(() => {
    addBtn.classList.remove("confirm");
    addBtn.textContent = "Ajouter au mémo";
    addBtn.style.backgroundColor = "";
  }, 2500);
};
  }
  _assembleModal() {
    this.container.append(this.imgBox, this.headerBox, this.selectors);
    
    if (this.ingrList.length > 0) {
      this.container.append(this.ingrBox);
    }
    
    this.container.append(this.footer);
    this.overlay.appendChild(this.container);
    document.body.appendChild(this.overlay);
  }
  // =================================
  // SÉLECTEURS ET FILTRES
  // =================================
  buildSelectors() {
    const optionDefs = [
      { key: "size", label: "Taille", selected: "selectedSize" },
      { key: "pate", label: "Pâte", selected: "selectedPate" },
      { key: "formule", label: "Formule", selected: "selectedFormule" }
    ];

    const frag = document.createDocumentFragment();

    for (const opt of optionDefs) {
      const selector = this._createSelector(opt);
      if (selector) frag.appendChild(selector);
    }

    this.selectors.innerHTML = "";
    this.selectors.appendChild(frag);
  }
  _createSelector(opt) {
    const hasOpt = this.allVariants.some(v => v[opt.key]);
    if (!hasOpt) return null;

    const values = [...new Set(
      this.allVariants.map(v => v[opt.key]).filter(Boolean)
    )];
    
    if (values.length < 2) return null;

    const init = this[opt.selected] || values[0];
    this[opt.selected] = init;

    const sel = Utils.mkSelect(values, init, value => {
      this[opt.selected] = value;
      this.updateCurrentVariant();
      this.renderVariant();
    });

    const box = document.createElement("div");
    box.className = "selector-box";
    const label = document.createElement("div");
    label.className = "selector-label";
    label.textContent = opt.label;
    box.append(sel);

    return box;
  }
  // =================================
  // GESTION DES VARIANTES
  // =================================
  updateCurrentVariant() {
    const variant = this.allVariants.find(v =>
      (!this.selectedSize || v.size === this.selectedSize) &&
      (!this.selectedPate || v.pate === this.selectedPate) &&
      (!this.selectedFormule || v.formule === this.selectedFormule)
    ) || this.allVariants[0];

    this.currentVariant = structuredClone(variant);
    return this.currentVariant;
  }
  renderVariant() {
    const v = this.updateCurrentVariant();
    
    this.title.textContent = v.name;
    this.updatePriceDisplay();
    this.imgBox.style.backgroundImage = `url('/app${v.picture || "/icons/noimg.png"}')`;
    this.refreshIngredientGrid();
  }
  updatePriceDisplay() {
    const v = this.currentVariant;
    
    if (v.price == null) {
      this.price.textContent = "";
      this.price.title = "";
      return;
    }

    const base = parseFloat(v.price) || 0;
    const addon = parseFloat(v.addonPrice) || 0;
    const addedCount = Array.isArray(v.added) ? v.added.length : 0;
    const total = base + (addedCount * addon);

    this.price.textContent = Number.isInteger(total)
      ? `${total} €`
      : `${total.toFixed(2).replace('.', ',')} €`;

    this.price.title = addedCount > 0 && addon > 0
      ? `Prix de base ${base}€ + ${addedCount} supplément(s) à ${addon}€`
      : `Prix de base ${base}€`;
  }
  // =================================
  // GESTION DES INGRÉDIENTS
  // =================================
  refreshIngredientGrid() {
    if (!this.ingrBox) return;
    
    this.ingrBox.innerHTML = "";

    if (this.currentVariant.addonPrice) {
      this._createAddButton();
    }

    this._renderBaseIngredients();
    this._renderAddedIngredients();
  }
  _createAddButton() {
    const addBtn = document.createElement("div");
    addBtn.className = "icon-button icon-button-add";
    addBtn.innerHTML = `
      <div class="icon-btn-picto">➕</div>
      <div class="icon-btn-label">${this.currentVariant.addonPrice}€</div>
    `;
    
    addBtn.addEventListener("click", e => {
      e.stopPropagation();
      const addons = this.currentVariant.addons?.length > 0
        ? this.currentVariant.addons
        : pizzaAddons;
      this.fadeToAdder(addons);
    });
    
    this.ingrBox.appendChild(addBtn);
  }
  _renderBaseIngredients() {
    if (!Array.isArray(this.currentVariant.ingr)) return;

    this.currentVariant.ingr.forEach(key => {
      const btn = createIconButton(key, this.ingrBox);
      if (btn) {
        btn.addEventListener("click", e => {
          e.stopPropagation();
          btn.classList.toggle("disabled");
        });
      }
    });
  }
  _renderAddedIngredients() {
    if (!Array.isArray(this.currentVariant.added)) return;

    this.currentVariant.added.forEach(key => {
      const btn = createIconButton(key, this.ingrBox);
      if (btn) {
        btn.classList.add("added");
        btn.addEventListener("click", e => {
          e.stopPropagation();
          this.removeIngredientFromProduct(key);
        });
      }
    });
  }
  addIngredientToProduct(key) {
    if (!this.currentVariant) return;
    if (!this.currentVariant.added) this.currentVariant.added = [];
    if (this.currentVariant.added.includes(key)) return;

    this.currentVariant.added.push(key);
    this.refreshIngredientGrid();
    this.updatePriceDisplay();
    
    console.log(`✅ Ingrédient ajouté : ${key}`);
  }
  removeIngredientFromProduct(key) {
    if (!this.currentVariant?.added) return;

    this.currentVariant.added = this.currentVariant.added.filter(k => k !== key);
    this.refreshIngredientGrid();
    this.updatePriceDisplay();
    
    console.log(`❎ Ingrédient retiré : ${key}`);
  }
  fadeToAdder(ingrList = []) {
    const modal = this.container;
    if (!modal) return;

    const fadeLayer = this._createFadeLayer(ingrList);
    modal.appendChild(fadeLayer);

    requestAnimationFrame(() => {
      fadeLayer.style.opacity = "1";
      modal.classList.add("mode-adder");
    });
  }
  _createFadeLayer(ingrList) {
    const fadeLayer = document.createElement("div");
    fadeLayer.className = "modal-fade-layer";
    fadeLayer.style.opacity = "0";
    fadeLayer.style.transition = "opacity 0.4s ease";

    const addPanel = document.createElement("div");
    addPanel.className = "modal-adder-panel";
    addPanel.innerHTML = `
      <div class="ingr-grid"></div>
      <button class="btn-cancel">Annuler</button>
    `;

    const grid = addPanel.querySelector(".ingr-grid");
    this._populateAdderGrid(grid, ingrList, fadeLayer);

    addPanel.querySelector(".btn-cancel").addEventListener("click", () => {
      this._closeFadeLayer(fadeLayer);
    });

    fadeLayer.appendChild(addPanel);
    return fadeLayer;
  }
  _populateAdderGrid(grid, ingrList, fadeLayer) {
    if (!Array.isArray(ingrList) || !ingrList.length) {
      grid.textContent = "Aucun ingrédient disponible.";
      return;
    }

    ingrList.forEach(key => {
      const btn = createIconButton(key, grid);
      if (btn) {
        btn.addEventListener("click", e => {
          e.stopPropagation();
          this.addIngredientToProduct(key);
          this._closeFadeLayer(fadeLayer);
        });
      }
    });
  }
  _closeFadeLayer(fadeLayer) {
    this.container.removeChild(fadeLayer);
    this.container.classList.remove("mode-adder");
  }
  // =================================
  // NAVIGATION
  // =================================
  getNeighborProduct(dir) {
    if (!this.categoryData?.items) return null;
    
    const list = this.categoryData.items;
    if (list.length === 0) return null;

    let newIndex = (this.categoryIndex + dir + list.length) % list.length;
    const newItem = list[newIndex];

    return this._resolveProductFromItem(newItem);
  }
  _resolveProductFromItem(item) {
    if (typeof item === "string") {
      return Object.values(window.data).find(p => p.name === item);
    }
    
    if (item?.name) {
      const match = Object.values(window.data).find(p => p.name === item.name);
      return match || item;
    }
    
    return null;
  }
  navigate(dir) {
    const nextProduct = this.getNeighborProduct(dir);
    
    if (nextProduct) {
      this.categoryIndex = (this.categoryIndex + dir + this.categoryData.items.length) 
        % this.categoryData.items.length;
      this.refresh(nextProduct);
    }
  }
  refresh(product) {
    this.baseName = product.name;
    this.allVariants = Object.values(window.data)
      .filter(p => p.name === this.baseName)
      .map(p => structuredClone(p));

    this.buildSelectors();
    this.renderVariant();

    this.container.classList.add("refreshing");
    setTimeout(() => this.container.classList.remove("refreshing"), 250);
  }
  // =================================
  // GÉNÉRATION DE COMMANDE
  // =================================
  generateOrderLinee() {
    l(this.currentVariant);
    const name = this.title?.textContent?.trim() || this.baseName || "Produit";
    const price = this.price?.textContent?.trim() || "";

    const parts = [name];

    this._addFiltersToParts(parts);
    //parts.push(price);
    this._addIngredientsToParts(parts);

    let sentence = parts.join(", ");
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    if (!sentence.endsWith(".")) sentence += ".";
    // Ajouter une ligne
  //  memo.addOrderline(sentence, parseFloat(this.price), this.cat);
    memo.addOrderline2(this.currentVariant);
    
    // Afficher le modal
   // memo.showModal();
    // Écouter les événements
/* 
window.addEventListener("memo-event", e => {
      console.log("Événement reçu:", e.detail.message);
    });*/
    this.closeToUserIcon();
    memo.updateIconUser();
    return sentence;
  }
  generateOrderLine() {
    l(this.currentVariant);
    const name = this.title?.textContent?.trim() || this.baseName || "Produit";
    const price = this.price?.textContent?.trim() || "";
  
    const parts = [name];
  
    this._addFiltersToParts(parts);
    this._addIngredientsToParts(parts);
  
    // --- Ajoute le champ 'without' à la variante courante ---
    if (this.ingrBox) {
      const disabledNodes = this.ingrBox.querySelectorAll(".icon-button.disabled .icon-btn-label");
      const without = Array.from(disabledNodes)
        .map(el => el.textContent.trim())
        .filter(Boolean);
      this.currentVariant.without = without;
    } else {
      this.currentVariant.without = [];
    }
  
    // --- Construit la phrase descriptive ---
    let sentence = parts.join(", ");
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    if (!sentence.endsWith(".")) sentence += ".";
  
    // --- Envoie au mémo ---
    memo.addOrderline2(this.currentVariant);
  
    // --- Animation de fermeture ---
    this.closeToUserIcon();
  
    // --- Mise à jour de l'icône utilisateur ---
    memo.updateIconUser();
  
    return sentence;
  }
  _addFiltersToParts(parts) {
    if (this.selectedSize) {
      parts.push(this.selectedSize.toLowerCase());
    }
    if (this.selectedPate) {
      parts.push(`pâte ${this.selectedPate.toLowerCase()}`);
    }
    if (this.selectedFormule) {
      parts.push(this.selectedFormule.toLowerCase());
    }
  }
  _addIngredientsToParts(parts) {
    const ingrEls = this.ingrBox?.querySelectorAll(".icon-button") || [];
    const disabled = [];
    const added = [];

    ingrEls.forEach(el => {
      const label = el.querySelector(".icon-btn-label")?.textContent?.trim();
      if (!label) return;
      
      if (el.classList.contains("added")) {
        added.push(label.toLowerCase());
      } else if (el.classList.contains("disabled")) {
        disabled.push(label.toLowerCase());
      }
    });

    if (disabled.length) {
      parts.push(`sans ${disabled.join(", ")}`);
    }

    if (added.length) {
      const prefix = added.length > 1 ? "suppléments" : "supplément";
      parts.push(`${prefix} ${added.join(", ")}`);
    }
  }
  // =================================
  // AFFICHAGE / FERMETURE
  // =================================
  show() {
    requestAnimationFrame(() => {
      this.overlay.classList.add("visible");
      this.container.classList.add("show");
    });
  }
  close() {
    this.overlay.classList.remove("visible");
    this.container.classList.remove("show");
    setTimeout(() => this.overlay.remove(), 400);
  }
  closeToUserIcon() {
    const target = document.querySelector('#user-switch-btn');
    if (!target) {
      console.warn("⚠️ closeToUserIcon: icône utilisateur introuvable, fallback vers close()");
      return this.close();
    }
  
    const modal = this.container;
    const overlay = this.overlay;
    const rectModal = modal.getBoundingClientRect();
    const rectTarget = target.getBoundingClientRect();
  
    // Calcul de la translation vers l’icône
    const dx = rectTarget.left - rectModal.left + rectTarget.width / 2 - rectModal.width / 2;
    const dy = rectTarget.top - rectModal.top + rectTarget.height / 2 - rectModal.height / 2;
  
    // Animation CSS inline (transition courte)
    modal.style.transition = "transform 0.5s ease, opacity 0.8s ease";
    modal.style.transformOrigin = "center center";
    modal.style.willChange = "transform, opacity";
    modal.style.pointerEvents = "none";
  
    // Lance la transition
    requestAnimationFrame(() => {
      modal.style.transform = `translate(${dx}px, ${dy}px) scale(0.1)`;
      modal.style.opacity = "0";
      overlay.style.backgroundColor = "rgba(0,0,0,0)";
    });
  
    // Suppression après l'animation
    setTimeout(() => overlay.remove(), 500);
  }
}
class Memo {
  constructor(storageKey = "userMemo") {
    this.storageKey = storageKey;
    this.orders = this.load() || [];
    l('this.orders');
    l(this.orders);
  }
  // --- Ajoute une ligne de commande

  updateIconUser() {
    
    const icon = document.querySelector('#user-switch-btn');
    if (!icon) return;

    // 🔸 Lecture du nombre de lignes depuis l’objet memo
    const lineCount = this?.orders?.length || 0;

    // 🔸 Création / mise à jour du badge
    let badge = icon.querySelector('.memo-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'memo-badge';
      icon.appendChild(badge);
    }

    // 🔸 Comparaison avec l’ancien affichage
    const prevValue = parseInt(badge.dataset.value || "0");
    if (prevValue !== lineCount) {
      badge.dataset.value = lineCount;
      badge.textContent = lineCount > 0 ? lineCount : "";
    //  this.tiltIconUser(icon);
      this.jumpIcon(badge);
    }
  }
  tiltIconUser(iconEl) {
    if (!iconEl) return;

    iconEl.classList.remove('tilt');
    // Forcer le reflow pour relancer l'animation si déjà jouée
    void iconEl.offsetWidth;
    iconEl.classList.add('tilt');

    // Suppression automatique à la fin de l'animation
    iconEl.addEventListener('animationend', () => {
      iconEl.classList.remove('tilt');
    }, { once: true });
  }
  jumpIcon(iconEl) {
    if (!iconEl) return;

    iconEl.classList.remove('jump');
    // Forcer le reflow pour relancer l'animation si déjà jouée
    void iconEl.offsetWidth;
    iconEl.classList.add('jump');

    // Suppression automatique à la fin de l'animation
    iconEl.addEventListener('animationend', () => {
      iconEl.classList.remove('jump');
    }, { once: true });
  }
  addOrderline2(v) {
    this.orders.push(v);
    this.save();
   // this.emitEvent();
   
  }
  // Supprime une ligne par index
  removeOrderline(index) {
    if (index >= 0 && index < this.orders.length) {
      this.orders.splice(index, 1);
      this.save();
      this.emitEvent();
    }
  }
  // --- Vide complètement le mémo ---
  clear() {
    this.orders = [];
    this.save();
    this.emitEvent();
  }
  // Sauvegarde dans le localStorage
  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.orders));
    this.shareMemo();
  }
  // --- Charge depuis le localStorage
  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.warn("⚠️ Erreur de chargement Memo:", err);
      return [];
    }
  }
  // --- Calcule le total ---
  getTotal() {
  const getLineTotal = (o) => {
    const base = Number(o.price) || 0;
    const addonUnit = Number(o.addonPrice) || 0;
    const addedCount = Array.isArray(o.added) ? o.added.length : 0;
    return base + addonUnit * addedCount;
  };

  // --- Total brut ---
  const totalBrut = this.orders.reduce((acc, o) => acc + getLineTotal(o), 0);

  // --- 🟢 Initialiser les drapeaux sur chaque ligne ---
  this.orders.forEach(o => {
    o.basePrice = Number(o.price) || 0;
    o.isFree = false;
    o.discountRate = 0;
    o.tva = siteCfg.categories[o.category].taxes;
    
    // --- Calculs HT / TVA / TTC par ligne ---
const taxRate = siteCfg?.categories?.[o.category]?.taxes || 0;
const addedCount = Array.isArray(o.added) ? o.added.length : 0;
const addonsTotal = addedCount * (Number(o.addonPrice) || 0);

// Prix total TTC (base + suppléments, déjà incluant les taxes)
const totalTTC = (Number(o.basePrice) || 0) + addonsTotal;

// Conversion TTC -> HT
const totalHT = totalTTC / (1 + taxRate / 100);

// TVA réelle
const taxes = totalTTC - totalHT;

// 🧾 Enregistrement sur la ligne
o.totalHT = Number(totalHT.toFixed(2));
o.taxes = Number(taxes.toFixed(2));
o.totalTTC = Number(totalTTC.toFixed(2));
  });

  // --- Filtrer uniquement les pizzas concernées ---
  const pizzas = this.orders.filter(o =>
    o.category === "pizza" &&
    ["senior", "mega", "méga", "super méga", "supermega", "super-mega"].includes(
      (o.size || "").toLowerCase()
    ) &&
    !(o.name || "").toLowerCase().includes("margarita") &&   // ❌ exclut les Margherita
    !(o.name || "").toLowerCase().includes("margherita")     // (double orthographe)
  );

  // --- Regrouper les pizzas par taille ---
  const groups = {};
  pizzas.forEach(p => {
    const size = (p.size || "").toLowerCase();
    if (!groups[size]) groups[size] = [];
    groups[size].push({ ...p }); // copie pour éviter de modifier l’original
  });

  let totalDiscount = 0;
  this.appliedDiscounts = [];

  // --- Application des offres par taille ---
  for (const size in groups) {
    const group = groups[size];
    const count = group.length;
    if (count < 2) continue;

    // Trier du plus cher au moins cher
    group.sort((a, b) => getLineTotal(b) - getLineTotal(a));

    // Calcul du nombre d'offres applicables
    const freeCount = Math.floor(count / 3); // 1 offerte par tranche de 3
    const halfCount = Math.floor((count % 3) / 2); // 1 à -50% pour un duo restant

    // Appliquer les offres sur les moins chères du groupe
    const eligibleForDiscount = [...group].reverse(); // du moins cher au plus cher

    // --- Offertes ---
    for (let i = 0; i < freeCount && i < eligibleForDiscount.length; i++) {
      const pizza = eligibleForDiscount[i];
      const discount = getLineTotal(pizza);
      totalDiscount += discount;
      this.appliedDiscounts.push({
        size,
        type: "offerte",
        product: pizza.name,
        value: discount
      });

      // 🟢 Marquer la pizza correspondante dans this.orders
      const match = this.orders.find(o => o.id === pizza.id);
      if (match) {
        match.taxes = 0;
        match.isFree = true;
        match.discountRate = 100;
        
      }
    }

    // --- À moitié prix ---
    for (let i = freeCount; i < freeCount + halfCount && i < eligibleForDiscount.length; i++) {
      const pizza = eligibleForDiscount[i];
      const discount = getLineTotal(pizza) * 0.5;
      totalDiscount += discount;
      this.appliedDiscounts.push({
        size,
        type: "demi",
        product: pizza.name,
        value: discount
      });

      // 🟢 Marquer la pizza correspondante dans this.orders
      
      const match = this.orders.find(o => o.id === pizza.id);
      if (match) {
        match.taxes = match.taxes*0.5
        match.isFree = false;
        match.discountRate = 50;
      }
    }
  }

  this.currentDiscount = totalDiscount;

  // --- Génération du résumé textuel des offres ---
  if (this.appliedDiscounts.length > 0) {
    const summaryByType = {};
    this.appliedDiscounts.forEach(d => {
      const key = `${d.type}_${d.size}`;
      if (!summaryByType[key]) summaryByType[key] = { type: d.type, size: d.size, count: 0 };
      summaryByType[key].count++;
    });

    const parts = Object.values(summaryByType).map(entry => {
      const n = entry.count;
      const size = entry.size;
      if (entry.type === "offerte") {
        return `${n} pizza${n > 1 ? "s" : ""} offerte${n > 1 ? "s" : ""} (${size})`;
      } else {
        return `${n} pizza${n > 1 ? "s" : ""} à moitié prix (${size})`;
      }
    });

    this.discountDetail = parts.join(", ");
  } else {
    this.discountDetail = "";
  }

  console.info("🎁 Remises appliquées :", this.appliedDiscounts);
  return totalBrut - totalDiscount;
}
  // Résumé textuel de la commande
  getSummary() {
    const lines = this.orders.map(o => o.orderline).join(", ");
    const total = this.getTotal().toFixed(2);
    return `${lines} (${total} €)`;
  }
  // Émet un événement global lisible
  emitEvent() {
    const message = `[memo] // ${this.getSummary()}`;
    window.dispatchEvent(new CustomEvent("memo-event", {
      detail: { message, data: this.orders }
    }));
    console.log(message);
  }
  // --- Affiche le modal du mémo ---
  showModal() {
    // Supprime tout modal existant
    const existing = document.querySelector(".modal-overlay.memo");
    if (existing) existing.remove();

    // Overlay
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay memo";
    overlay.onclick = () => overlay.remove();

    // Conteneur
    const modal = document.createElement("div");
    modal.className = "modal-memo";
    modal.onclick = e => e.stopPropagation();

    // Titre
    const header = document.createElement("div");
    header.className = "memo-header";
    header.innerHTML = `<h2>🗒 Mémo de commande</h2>`;
    modal.appendChild(header);

    // Liste
    const list = document.createElement("div");
    list.className = "memo-list";
    if (this.orders.length === 0) {
      list.innerHTML = `<p class="memo-empty">Aucune commande enregistrée.</p>`;
    } else {
      this.orders.forEach((o, i) => {
        const line = document.createElement("div");
        line.className = "memo-line";
        line.innerHTML = `
          <span class="memo-order">${o.orderline}</span>
          <span class="memo-price">${o.price} €</span>
        `;
        const delBtn = document.createElement("button");
        delBtn.className = "memo-del";
        delBtn.innerHTML = `<i class="icon-cancel"></i>`;
        delBtn.onclick = () => {
          this.removeOrderline(i);
          overlay.remove();
          this.showModal();
        };
        line.appendChild(delBtn);
        list.appendChild(line);
      });
    }
    modal.appendChild(list);

    // Footer
    const footer = document.createElement("div");
    footer.className = "memo-footer";
    footer.innerHTML = `
      <div class="memo-total"><strong>Total :</strong> ${this.getTotal().toFixed(2)} €</div>
      <div class="memo-actions">
        <button class="memo-btn clear"><i class="icon-trash"></i> Vider</button>
        <button class="memo-btn send"><i class="icon-mail"></i> Envoyer</button>
        <button class="memo-btn close"><i class="icon-cancel"></i> Fermer</button>
      </div>
    `;
    modal.appendChild(footer);

    // Boutons d'action
    footer.querySelector(".memo-btn.clear").onclick = () => {
      if (confirm("Vider le mémo ?")) {
        this.clear();
        overlay.remove();
      }
    };
    footer.querySelector(".memo-btn.send").onclick = () => {
      this.emitEvent();
      alert("📝 Mémo envoyé !");
    };
    footer.querySelector(".memo-btn.close").onclick = () => overlay.remove();

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }
  /**
   * Crée l’élément DOM à injecter dans la section userLand
   * @param {HTMLElement} root - conteneur principal (ex: window.userland.root)
   */
  setSid(sid) {
    l(this);
    
    window.memosid = sid;
    let tmp = document.getElementById('memo-sid');
    tmp.textContent = sid;
    Utils.jumpEl(tmp)
  }
  
   buildUserlandSection(root) {
     let total = this.getTotal().toFixed(2);
  // Supprimer toute ancienne section
  let old = root.querySelector(".userland-section.memo");
  if (old) old.remove();

  // --- Conteneur principal ---
  const section = document.createElement("div");
  section.className = "userland-section memo fullview";

  // --- En-tête ---
  const header = document.createElement("div");
  header.className = "memo-header-line";
  header.innerHTML = `
    <i class="icon-attach"></i>
    <strong>Mémo </strong>
    <strong id=\"memo-sid\"> ${window.memosid ?? ""} </strong>


  `;
  section.appendChild(header);

  // --- Liste complète ---
  const list = document.createElement("div");
  list.className = "memo-full-list";

  if (this.orders.length === 0) {
    list.innerHTML = `<div class="memo-empty">Aucun mémo enregistrée.</div>`;
  } else {
    this.orders.forEach((o, i) => {
      const line = document.createElement("div");
      line.className = "memo-line";

// --- Construction du texte principal ---
let details = [];

// Nom du produit
if (o.name) details.push(`<strong>${o.name}</strong>`);

// Taille et pâte
if (o.size) details.push(o.size);
if (typeof o.pate === "string" && /cheesy|cheezy/i.test(o.pate)) {
  details.push(`<span class="memo-pate-cheesy">cheesy</span>`);
}

if (o.formule) details.push(o.formule);

// Ingrédients

// Suppléments ajoutés
if (Array.isArray(o.added) && o.added.length > 0) {
  const addons = o.added.map(a => a.name || a).join(" <i class=\"icon-plus\"></i>");
  details.push(`<br><span class="memo-addons"> <i class=\"icon-plus\"></i>${addons}</span>`);
} 
// 🔹 Ingrédients retirés (without)
if (Array.isArray(o.without) && o.without.length > 0) {
  const removed = o.without.map(w => w.name || w).join("<i class=\"icon-minus\"></i>");
  details.push(
    `<br><span class="memo-without"><i class="icon-cancel"></i>${removed}</span>`
  );
}
// --- Calcul du prix total (base + suppléments éventuels) ---
// --- Calcul du prix total (base + suppléments sélectionnés via "added") ---
const basePrice = Number(o.price) || 0;
const addonPrice = Number(o.addonPrice) || 0;
const addedCount = Array.isArray(o.added) ? o.added.length : 0;
const totalLinePrice = basePrice + (addonPrice * addedCount);

// --- Construction du bloc final ---
line.innerHTML = `
  <span class="memo-order">
    <i class="icon-ic${o.category || 'box'}"></i>
    ${details.join(", ")}
  </span>
  <span class="memo-price">${totalLinePrice.toFixed(2)} €</span>
`;
// --- Interaction : suppression au clic ---
line.addEventListener("click", () => {
  // On évite que les lignes de remise soient interactives
  if (line.classList.contains("discount")) return;

  // Sauvegarde du contenu original
  const originalHTML = line.innerHTML;

  // Création du bloc de confirmation inline
  line.classList.add("confirming");
  line.innerHTML = `
    <div class="memo-confirm">
      <span>Supprimer “${o.name || "Produit"}” ?</span>
      <div class="memo-confirm-actions">
        <button class="memo-btn-cancel">Annuler</button>
        <button class="memo-btn-delete">Supprimer</button>
      </div>
    </div>
  `;

  // --- Bouton annuler ---
  line.querySelector(".memo-btn-cancel").onclick = (e) => {
    e.stopPropagation();
    line.classList.remove("confirming");
    line.innerHTML = originalHTML;
  };

  // --- Bouton supprimer ---
  line.querySelector(".memo-btn-delete").onclick = (e) => {
    e.stopPropagation();
    this.removeOrderline(i);
    this.buildUserlandSection(root);
  };
});
      list.appendChild(line);
      
    });
    // --- Ligne de remise si applicable ---
    l(this.currentDiscount);
    l(this);
    
  }
  section.appendChild(list);

  // --- Total ---
  const totalBox = document.createElement("div");
  totalBox.className = "memo-total-box";
  totalBox.innerHTML = `<strong>Total :</strong> ${total} €`;
  if (this.currentDiscount && this.currentDiscount > 0) {
  l('remise !')
  const discountLine = document.createElement("div");
  discountLine.className = "memo-line discount";
  discountLine.innerHTML = `
    <span class="memo-order"><i class="icon-gift red"></i> ${this.discountDetail}</span>
    <span class="memo-price">- ${this.currentDiscount.toFixed(2)} €</span>
  `;
  section.appendChild(discountLine);
}
  section.appendChild(totalBox);

  // --- Boutons d’action ---
  const actions = document.createElement("div");
  actions.className = "memo-mini-actions";
  actions.innerHTML = `
    <!--button class="memo-mini-btn view"><i class="icon-eye"></i> Voir</button>
    <button class="memo-mini-btn send"><i class="icon-mail"></i> Envoyer</button-->
    <button class="memo-mini-btn clear"><i class="icon-trash"></i> Effacer</button>
  `;
  section.appendChild(actions);

  // --- Actions JS ---
 // actions.querySelector(".view").onclick = () => this.showModal();
//  actions.querySelector(".send").onclick = () => this.shareMemo();
  
  const clearBtn = actions.querySelector(".clear");
let clearConfirmTimeout = null;

clearBtn.onclick = () => {
  // --- Si déjà en mode confirmation ---
  if (clearBtn.classList.contains("confirm")) {
    clearBtn.textContent = "Vidage...";
    clearBtn.disabled = true;
    this.clear();
    this.buildUserlandSection(root);
    return;
  }

  // --- Passe en mode confirmation ---
  clearBtn.classList.add("confirm");
  clearBtn.textContent = "Confirmer";

  // --- Transition de couleur (vers noir) ---
  clearBtn.style.transition = "background-color 0.4s ease";
  clearBtn.style.backgroundColor = "#000";

  // --- Timeout pour revenir à l'état normal ---
  clearConfirmTimeout = setTimeout(() => {
    clearBtn.classList.remove("confirm");
    clearBtn.textContent = "Vider";
    clearBtn.style.backgroundColor = "";
  }, 2500);
};

  // --- Injection dans le panneau ---
  root.appendChild(section);
  this.updateIconUser();
  if(this.orders.length > 0)
    this.shareMemo();
}
   async shareMemo() {
     this.getTotal();
     const res = await fetch("api/share_memo.php", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    terminalKey: localStorage.getItem("terminalKey"),
    memo: window.memo || { lines: 3, total: 27.5 }
  })
});

const data = await res.json();
if (data.success) {
  console.log("📝 Mémo partagé :", data.id);
  this.setSid(data.id);
} else {
  console.warn("❌ attention :", data.error);
}
   }
  

}
// --- Exemple d’instanciation ---
//window.memo = new Memo();
/*_ PWA install bouton _*/
function setupPWAInstall() {
  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById("installBtn");
    if (!installBtn) return;
    installBtn.style.display = "inline-block";
    installBtn.addEventListener("click", async () => {
      installBtn.style.display = "none";
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Résultat de l'installation : ${outcome}`);
      deferredPrompt = null;
    }, { once: true });
  });
}
/*______ Boot ______*/
document.addEventListener("DOMContentLoaded", () => {
  setupPWAInstall();
  window.app = new App();
});
