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
    console.log("🔑 Clé introuvable :");
  } else {
    console.log("🔑 Clé existante :", key);
  }
  return key;
  }
let terminalKey = null;
let pizzaAddons = ["ananas","boursin","courgettes","gorgonzola","maroilles","pepperoni","piment fort","sauce chili tai","kebab","poivrons","tomte fraiche","chèvre","sauce bbq","crème fraiche","pomme de terres","pomme de terre","olive","anchois","oignons","oeuf","miel","cheddar","jambon","mozzarella","champignons","chorizzo","lardons","fromage à raclette","merguez","poulet","viande hachée","origan"];
let gameassets = ["ananas","Boursin","courgettes","gorgonzola","maroilles","pepperoni","piment fort","sauce chili tai","kebab","poivrons","tomate fraiche","chèvre","sauce BBQ","crème fraiche","pommes de terres","olive","anchois","oignons","oeuf","miel","cheddar","jambon","mozzarella","champignons","chorizzo","lardons","fromage à raclette","merguez","poulet","viande hachée","origan"];

window.userland = {};
class SmartContent {
  /**
   * @param {HTMLElement} container  Élément DOM cible où afficher le contenu.
   * @param {Object} [data=window.data]  Base de données des produits.
   */
  constructor(container, data = window.data, siteCfg = window.data[0] || {}) {
     window.siteCfg = window.data[0];
 /*
 let dataEnr =  addPizzaAddonsWithReport(window.data);
     l('dataEnr.database :');
     l(dataEnr.database);
     saveSite(dataEnr.database);*/
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
    this.updateDockActive("pizza");
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
  let browseTimeout = null;

  const onScroll = () => {
    const scrollTop = container.scrollTop || window.scrollY;
    const idx = this.colorIndex;

    const currentStep = step > 0 ? Math.floor(scrollTop / step) : -1;
    if (step > 0 && currentStep === lastStep) return;
    lastStep = currentStep;

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

    const activeCat = t < 0.5 ? lower.category : upper.category;

    // 🔸 Mise à jour immédiate du dock (sans debounce)
    this.updateDockActive(activeCat);

    // 🔸 Événement browse avec debounce
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
// 🔹 Nouvelle méthode pour mettre à jour le dock
  updateDockActive(categoryName) {
  const dock = document.querySelector("#navdock");
  if (!dock) return;

  const icons = dock.querySelectorAll(".dock-icon");
  icons.forEach(icon => {
    // Récupérer la catégorie associée à cette icône
    const section = this.container.querySelector(`.cat-section[data-cat]`);
    // On cherche l'icône qui correspond à la catégorie active
    const isActive = icon.dataset.category === categoryName;
    icon.classList.toggle("active", isActive);
  });
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
    
  }
  createDock() {
  const dock = mkdiv("", "", "navdock");
  const siteCfg = this.siteCfg?.categories || window.site?.categories || {};

  const sortedCats = [...this.sdata.categories].sort((a, b) => {
    const aOrder = siteCfg[a.name]?.order ?? 999;
    const bOrder = siteCfg[b.name]?.order ?? 999;
    if (aOrder === bOrder) return a.name.localeCompare(b.name);
    return aOrder - bOrder;
  });

  sortedCats.forEach(cat => {
    const siteCat = siteCfg[cat.name] || {};
    if (siteCat.visible === false) return;

    const dockel = mkdiv(siteCat.icon, 'dock-icon');
    dockel.dataset.category = cat.name; // 🔸 Stockage de la catégorie
    
    dockel.addEventListener("click", () => {
      const section = this.container.querySelector(`.cat-section[data-cat="${cat.name}"]`);
      if (!section) return;

      section.scrollIntoView({ behavior: "smooth", block: "start" });
      
      // L'état actif sera géré automatiquement par observeScrollTheme
    });

    dock.appendChild(dockel);
  });

  this.container.after(dock);
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
  updateLoaderProgress(done, total)
  {
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

      
      this.el.addEventListener("click", e => {
  e.stopPropagation();  // empêche la remontée de l’événement
  this.onClick();
});
      
    } else {
      this.el.classList.add("disabled");
      // 🔹 Style spécifique pour les cartes indicatives / fake
      this.el.classList.add("indic-card");
    }
    if (product.fake || product.indic) {
      this.el.classList.add("indic-card");
    }
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
  // Compter les occurrences de chaque ingrédient
  const counts = {};
  p.ingr.forEach(ingr => {
    counts[ingr] = (counts[ingr] || 0) + 1;
  });
  
  // Créer le texte avec les multiplicateurs
  const prefixes = ["", "double ", "triple ", "quadruple "];
  const items = Object.entries(counts).map(([ingr, count]) => {
    if (count <= 4) {
      return prefixes[count - 1] + ingr;
    } else {
      return count + "x " + ingr;
    }
  });
  
  let txt = items.join(", ") + ".";
  txt = txt.charAt(0).toUpperCase() + txt.slice(1);
  ctnt.textContent = txt;
}
      const desc = document.createElement("div");
      desc.className = "card-desc";
      if (p.description) {
        let txt = p.description;
        txt = txt.charAt(0).toUpperCase() + txt.slice(1);
        desc.textContent = txt;
      }
  
      // --- Prix
      const price = document.createElement("div");
      price.className = "card-price";
      price.textContent = p.price ? `${p.price} €` : "";
  
      // 🔹 Composition du corps
      body.append(title, iconsRow, ctnt, desc, price);
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
    
    l('card click');
    app.lockMagneticScrollEvents();
    if (document.querySelector(".modal-product")) return;

    const cat = this.data.category;
    let activeFilters = window.smartContent?.activeFilters?.[cat] || {};

    /* Effet visuel rapide
    this.el.classList.add("clicked");
    setTimeout(() => this.el.classList.remove("clicked"), 150);*/

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
class Userland {
  constructor(domdest) {
    if (!(domdest instanceof Element)) {
      console.error("❌ Userland: domdest invalide");
      return;
    }

    this.domdest = domdest;
    l('userland');
    l('->');
    l(this.domdest);
    // 🔹 Conteneur racine
    this.root = mkdiv('', 'userland');
    domdest.appendChild(this.root);



    // --- Carte principale (QR, identifiant, scan) ---
    
    this.backSwitch = mkdiv('retour <i class="icon-cancel"></i>', 'back-switch-btn', 'user-back-switch-btn');
    this.backSwitch.addEventListener('click', function () {
        app.showView(1, true, this);
    }.bind(this)) ;
    this.domdest.appendChild(this.backSwitch);
           const pizza = new PizzaSVG({
   size: 320,
   seed: "quatre-saisons-demo",
   toppings: ["mushroom","ham","olive","oliveGreen","artichoke","egg"]
 }).render();
// domdest.appendChild(pizza);

    const cardSection = mkdiv('', 'userland-section');
    this.domdest.appendChild(cardSection);
    this.renderCard(cardSection);

    // --- Section Mémo ---

    // --- Section Paramètres ---
    

    window.userland = this;
  }
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
/*________ App _________*/
class App {
  constructor(root = document.body) {
    this.space = mkdiv('', 'app-space')
   //setupPWAInstall();
    root.appendChild(this.space);
   // Utils.generateCellShadingClasses();
   // Utils.generateRedCellShadingClasses();
    this.views = [];
    this.activeIndex = 0;

    

    this.terminalKey = getTerminalKey();
    terminalKey = getTerminalKey();

    this.init(); // crée les vues (vide pour l’instant)
    this.mkfooter();
    this.registerTerminal().then(() => this.loadDataAndMount());

    this.bindGestures();
  //  this.enableMagneticScroll();
    window.app = this;
  }
  lockMagneticScrollEvents() {
  const space = this.space;
  if (!space) return;

  // Indique à enableMagneticScroll qu'on est verrouillé
  this.magneticScrollDisabled = true;

  // Bloque la propagation des événements tactiles horizontaux
  const preventTouch = e => {
    e.stopPropagation();
  };

  // On bloque tous les touch events horizontaux à la racine
  space.addEventListener("touchstart", preventTouch, { passive: true });
  space.addEventListener("touchmove", preventTouch, { passive: true });
  space.addEventListener("touchend", preventTouch, { passive: true });

  // On garde une référence pour pouvoir retirer plus tard
  this._magneticLockListeners = preventTouch;
}

  async loadDataAndMount() {
  const result = await this.getData();
  if (result && result.success) {
  const homeView = this.views.find(v => v instanceof HomeView);
  if (homeView) homeView.mountContent();
  const userView = this.views.find(v => v instanceof UserView);
  if (userView) userView.mountContent();
  const hiddenView = this.views.find(v => v instanceof HiddenView);
  if (hiddenView) hiddenView.mountContent();
  
  l('getdata');
  l(this);
  this.onDataReady();
}
}
  async registerTerminal() {
    l('--------');
    l('log user');
    l('--------');
    const result = await Utils.apiPost("api/logterminal.php", { terminalKey });
    if (!result.success) {
      console.error("❌ Erreur API registerTerminal :", result.error);
      return;
    }
    l('Log SUID ' + result.userSuid);
    l('Réponse: ' + result.message);
    window.suid = result.userSuid;
    window.permissions = result.grade;
    if (result.message === "allocateTerminal") {
      localStorage.setItem("terminalKey", result.terminalKey);
    }
    if (result.jsadd) {
      l('addddddd');
      //l(result.jsadd);
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.text = result.jsadd;
      document.head.appendChild(script);
    }
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
    this.addView(new HiddenView(this));
    this.addView(new HomeView(this));
    this.addView(new ShopView(this));

    // Initial position
    this.updateTransform();
    this.showView(2, true, this);
  }
  addView(view) {
    const index = this.views.length;
    view.setIndex(index);
    this.views.push(view);
    this.space.appendChild(view.el);
  }
  showView(index, animate = true, caller) {
    
    l('VVVVVVVVV');
    l('show viem');
    
    l('index ' + index);
    l('caller');
    l(caller);
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
      if (dx > 80) this.showView(this.activeIndex - 1, true, this);
      else if (dx < -80) this.showView(this.activeIndex + 1, true, this);
    });
  }
  bindGestures2() {
  const footer = document.querySelector('.footer') || document.body;
  let startX = 0;
  footer.addEventListener("touchstart", e => startX = e.touches[0].clientX);
  footer.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) < 80) return; // seuil

    const nextIndex = this.activeIndex + (dx < 0 ? 1 : -1);
    const currentView = this.views[this.activeIndex]?.el;
    const nextView = this.views[nextIndex]?.el;

    if (!nextView) return;

    // --- Effet de transition ---
    currentView.style.transition = "transform 0.4s ease, opacity 0.4s ease";
    nextView.style.transition = "transform 0.4s ease, opacity 0.4s ease";
    nextView.style.transform = `scale(0.9)`;
    nextView.style.opacity = "0";
    nextView.style.zIndex = "2";

    // Forcer affichage avant animation
    nextView.style.display = "block";
    requestAnimationFrame(() => {
      currentView.style.transform = `scale(0.9)`;
      currentView.style.opacity = "0";
      nextView.style.transform = "scale(1)";
      nextView.style.opacity = "1";
    });

    setTimeout(() => {
      currentView.style.display = "none";
      currentView.style.transform = "";
      currentView.style.opacity = "";
      nextView.style.transform = "";
      nextView.style.opacity = "";
      this.activeIndex = nextIndex;
      this.updateTransform?.(); // si utilisée ailleurs
    }, 400);
  });
}
  bindGestures3() {
  const footer = document.querySelector('.footer') || document.body;
  let startX = 0;

  footer.addEventListener("touchstart", e => startX = e.touches[0].clientX);

  footer.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) < 80) return;

    const direction = dx < 0 ? 1 : -1;
    const nextIndex = this.activeIndex + direction;
    const currentView = this.views[this.activeIndex]?.el;
    const nextView = this.views[nextIndex]?.el;
    if (!nextView) return;

    // --- Styles initiaux ---
    currentView.style.transition = "transform 0.45s linear";
    nextView.style.transition = "transform 0.45s linear";
    nextView.style.display = "block";
    nextView.style.transform = `translateX(${direction * 100}%) scale(0.92)`;
    nextView.style.zIndex = "2";

    // --- Animation ---
    requestAnimationFrame(() => {
      currentView.style.transform = `translateX(${-direction * 30}%) scale(0.92)`; // léger recul
      nextView.style.transform = "translateX(0%) scale(1)";
    });

    // --- Nettoyage après anim ---
    setTimeout(() => {
      currentView.style.display = "none";
      currentView.style.transform = "";
      nextView.style.transform = "";
      this.activeIndex = nextIndex;
      this.updateTransform?.();
    }, 450);
  });
}
  enableMagneticSccroll() {
  const space = this.space;
  let startX = 0;
  let currentX = 0;
  let translateX = 0;
  let isDragging = false;
  let lastDelta = 0;

  const getViewWidth = () => space.clientWidth;

  // --- Démarrage du drag ---
  space.addEventListener("touchstart", e => {
    isDragging = true;
    startX = e.touches[0].clientX;
    space.style.transition = "none";
  });

  // --- Déplacement en cours ---
  space.addEventListener("touchmove", e => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
    const dx = currentX - startX;
    lastDelta = dx;
    const viewWidth = getViewWidth();
    const baseX = -this.activeIndex * viewWidth;
    translateX = baseX + dx;
    space.style.transform = `translateX(${translateX}px) scale(1)`; // léger dezoom pendant le drag
  });

  // --- Fin du drag ---
  space.addEventListener("touchend", () => {
    if (!isDragging) return;
    isDragging = false;
    const viewWidth = getViewWidth();
    const threshold = viewWidth * 0.2; // seuil de changement de page
    let nextIndex = this.activeIndex;

    if (lastDelta < -threshold) nextIndex++;
    else if (lastDelta > threshold) nextIndex--;

    nextIndex = Math.max(0, Math.min(this.views.length - 1, nextIndex));

    // --- Magnétisme ---
    space.style.transition = "transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)";
    space.style.transform = `translateX(${-nextIndex * viewWidth}px) scale(1)`;

    this.activeIndex = nextIndex;
    this.updateTransform?.();
  });

  window.addEventListener("resize", () => {
    // recalcule la position si on redimensionne
    const viewWidth = getViewWidth();
    space.style.transform = `translateX(${-this.activeIndex * viewWidth}px)`;
  });
}
  enableMagneeticScroll() {
  const space = this.space;
  let startX = 0, startY = 0;
  let currentX = 0;
  let translateX = 0;
  let isDragging = false;
  let isVerticalScroll = false;
  let lastDelta = 0;

  const getViewWidth = () => space.clientWidth;

  // 🔐 Variables de verrouillage global
  this.magneticEnabled = true;

  // --- Démarrage du drag ---
  space.addEventListener("touchstart", e => {
    if (!this.magneticEnabled) return; // désactivé manuellement
    isDragging = true;
    isVerticalScroll = false;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    space.style.transition = "none";
  });

  // --- Déplacement en cours ---
  space.addEventListener("touchmove", e => {
    if (!isDragging || !this.magneticEnabled) return;

    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    // Détection du scroll vertical → on sort
    if (!isVerticalScroll && Math.abs(dy) > Math.abs(dx)) {
      isVerticalScroll = true;
      return;
    }
    if (isVerticalScroll) return;

    lastDelta = dx;
    const viewWidth = getViewWidth();
    const baseX = -this.activeIndex * viewWidth;
    translateX = baseX + dx;
    space.style.transform = `translateX(${translateX}px) scale(1)`;
    e.preventDefault();
  }, { passive: false });

  // --- Fin du drag ---
  space.addEventListener("touchend", () => {
    if (!isDragging || isVerticalScroll || !this.magneticEnabled) return;
    isDragging = false;

    const viewWidth = getViewWidth();
    const threshold = viewWidth * 0.2;
    let nextIndex = this.activeIndex;

    if (lastDelta < -threshold) nextIndex++;
    else if (lastDelta > threshold) nextIndex--;

    nextIndex = Math.max(0, Math.min(this.views.length - 1, nextIndex));

    space.style.transition = "transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)";
    space.style.transform = `translateX(${-nextIndex * viewWidth}px) scale(1)`;

    this.activeIndex = nextIndex;
    this.updateTransform?.();
  });

  window.addEventListener("resize", () => {
    const viewWidth = getViewWidth();
    space.style.transform = `translateX(${-this.activeIndex * viewWidth}px)`;
  });
}

  enableMagneticScroll() {
  const space = this.space;
  if (this.magneticScrollDisabled) return; // 👈 ignore si désactivé
  
  
  let startX = 0, startY = 0;
  let currentX = 0;
  let translateX = 0;
  let isDragging = false;
  let isVerticalScroll = false;
  let lastDelta = 0;

  const getViewWidth = () => space.clientWidth;

  // --- Démarrage du drag ---
  space.addEventListener("touchstart", e => {
    isDragging = true;
    isVerticalScroll = false;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    space.style.transition = "none";
  });

  // --- Déplacement en cours ---
  space.addEventListener("touchmove", e => {
    if (!isDragging) return;

    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    // 🔒 Détection du scroll vertical → on annule la capture horizontale
    if (!isVerticalScroll && Math.abs(dy) > Math.abs(dx)) {
      isVerticalScroll = true;
      return; // on laisse le scroll vertical natif
    }
    if (isVerticalScroll) return; // on ne fait rien tant que l’utilisateur scrolle verticalement

    lastDelta = dx;
    const viewWidth = getViewWidth();
    const baseX = -this.activeIndex * viewWidth;
    translateX = baseX + dx;
    space.style.transform = `translateX(${translateX}px) scale(1)`;
    e.preventDefault(); // empêche le scroll de page accidentel
  }, { passive: false });

  // --- Fin du drag ---
  space.addEventListener("touchend", () => {
    
    if (!isDragging || isVerticalScroll) return;
    isDragging = false;

    const viewWidth = getViewWidth();
    const threshold = viewWidth * 0.2;
    let nextIndex = this.activeIndex;

    if (lastDelta < -threshold) nextIndex++;
    else if (lastDelta > threshold) nextIndex--;

    nextIndex = Math.max(0, Math.min(this.views.length - 1, nextIndex));
    
    

    // --- Magnétisme ---
    space.style.transition = "transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)";
    space.style.transform = `translateX(${-nextIndex * viewWidth}px) scale(1)`;

    this.activeIndex = nextIndex;
    l(this.activeIndex);
    this.updateTransform?.();
    this.showView(this.activeIndex, true, this);
    
  });

  window.addEventListener("resize", () => {
    const viewWidth = getViewWidth();
    space.style.transform = `translateX(${-this.activeIndex * viewWidth}px)`;
  });
}
// 🚫 Désactive explicitement le scroll horizontal magnétique
disableMagneticScroll() {
  this.magneticScrollDisabled = true;
}

// ✅ Réactive le scroll horizontal magnétique
enableMagneticScrollManual() {
  this.magneticScrollDisabled = false;
}
// ✅ Activation manuelle
enableMagnetic() {
  this.magneticEnabled = true;
}

// 🚫 Désactivation manuelle
disableMagnetic() {
  this.magneticEnabled = false;
}
  mkfooter () {
    
    this.footerPanel = mkdiv('', '', 'footer-ext-panel');
    this.footer = mkdiv('', '', 'footer');
    document.body.appendChild(this.footer);
    
    this.userSwitch = mkdiv('<i class="icon-user"></i>', '', 'user-switch-btn');
    this.userSwitch.addEventListener('click', function () {
        this.showView(0, true, this);
    }.bind(this)) ;
    
    this.footer.appendChild(this.userSwitch);
    this.cgvSwitch = mkdiv('', '', 'cgv-switch-btn');
    this.cgvSwitchLeft = mkdiv('<i class="icon-icfleure"></i>FleurePizza<br> Conditions générales de vente', 'cgv-link-side', '');
    this.cgvSwitchLeft.addEventListener('click', function () {
        this.showView(2, true, this);
    }.bind(this)) ;
    this.cgvSwitchRight = mkdiv('<i class="icon-location"></i>', 'location-side', '');
    this.cgvSwitchRight.addEventListener('click', function () {
        this.showView(3, true, this);
    }.bind(this)) ;
    
    this.cgvSwitch.appendChild(this.cgvSwitchLeft);
    this.cgvSwitch.appendChild(this.cgvSwitchRight);
    this.footer.appendChild(this.cgvSwitch);
    
  }
  async onDataReady() {
    this.memo = new Memo(this.views[0].el);
    window.memo = this.memo;
   memo.updateIconUser();
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
class HomeView extends AppView {
  constructor(app) {
    super(app, 'home');
    this.el.innerHTML = '';
    
    this.branding = mkdiv('<i class="icon-icfleure"></i> FleurePizza', 'cellshade-4', 'branding');
    this.el.appendChild(this.branding);
    this.phoning = mkdiv('<i class="icon-phone"></i> 02 32 51 03 55', 'redcellshade-3', 'phone-block');
    this.phoning.addEventListener('click', () => {
      window.location.href = 'tel:+33232510355';
    });
    this.el.appendChild(this.phoning);
    
    this.content = mkdiv('', '', 'content');
    this.el.appendChild(this.content);
    this.dock = mkdiv('', '', 'navdock');
   // this.el.appendChild(this.dock);
  }

  mountContent() {
    if (!window.data) {
      console.warn("⚠️ Impossible de monter SmartContent : data non chargé");
      return;
    }
    l ('wwwwwwwwwwww');
    l ('mountContent');
    l ('mmmmmmmmmmmm');
    new SmartContent(this.content);
  }
}
class ShopView extends AppView {
  constructor(app) {
    super(app, 'shop');
  
      
    this.backSwitch = mkdiv('retour <i class="icon-cancel"></i>', 'back-switch-btn', 'user-back-switch-btn');
    this.backSwitch.addEventListener('click', function () {
        app.showView(1, true, this);
    }.bind(this)) ;
    this.el.appendChild(this.backSwitch);
  
    this.mapsection = mkdiv('', 'map-section');
    this.map = mkdiv('', 'map-ctnr', 'map');
    this.mapsection.appendChild(this.map);
    this.el.appendChild(this.mapsection);
      const map = new LightMap(this.map, "49.309860,1.432272", 16000);
      
    this.cgv_livraison = mkdiv('', 'cgu-ctnr', 'cgv_livraison');
    this.el.appendChild(this.cgv_livraison);
   // injectMarkdown("/app.v2/cgv_livraison.md", this.cgv_livraison);
    
    this.cgu = mkdiv('', 'cgu-ctnr', 'cgu');
    this.el.appendChild(this.cgu);
    injectMarkdown("/app.v2/cgu.md?v=9", this.cgu);

      
  }
}
class UserView extends AppView {
  constructor(app) {
    super(app, 'user');
    this.el.innerHTML = ``;
   // this.memo = new Memo(this.el);
   // window.memo = this.memo;


  }
  mountContent () {
    new Userland(this.el);
    
  }
}
class HiddenView extends AppView {
  constructor(app) {
    super(app, 'hidden');
    this.el.innerHTML = `<div id="panelContainer" class="panel-container"></div>`;
  }

  mountContent() {
    // Lancement du mini-jeu une seule fois
    if (this.game) return;

    const container = this.el.querySelector('#panelContainer');
   // this.game = new PanelDePon(container, 8, 14); // colonnes x lignes
    // Tirage aléatoire de 5 ingrédients distincts parmi pizzaAddons
const randomIngredients = gameassets
  .slice()                             // on clone pour ne pas altérer l’original
  .sort(() => Math.random() - 0.5)     // mélange simple
  .slice(0, 5);                        // on garde les 5 premiers
l(randomIngredients);
this.game = new PanelDePon(container, 7, 12, randomIngredients);
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
        this.dom.textContent = `FPS: ${this.fps.toFixed(1)} | MS: ${this.ms.toFixed(1)} i ${app.activeIndex}`;
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

/*____ Modal Product ___*/
class ModalProduct {
  constructor(product, callerEl = null, activeFilters = {}) {
   //  return;
    l('return');
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
  _createHeader2() {
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
     // window.memo.buildUserlandSection(window.userland.root);
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
  constructor(domdest, storageKey = "userMemo") {
    this.el = mkdiv();
    this.domdest = domdest;
    domdest.appendChild(this.el);
    this.storageKey = storageKey;
    this.orders = this.load() || [];
    l('this.orders');
    l(this.orders);
    this.buildDom();
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
  
  buildDom() {
     let total = this.getTotal().toFixed(2);

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
            };
          });
      list.appendChild(line);
      
    });
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
    //this.buildUserlandSection(root);
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
  this.el.appendChild(section);
  //this.domdest.appendChild(this.el);
  //this.updateIconUser();
  
}
  updateDom () {
    this.el.innerHTML = '';
    this.buildDom();
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
  this.updateDom();
} else {
  console.warn("❌ attention :", data.error);
}
   }
  

}

class PanelDePon {
  constructor(container, cols = 6, rows = 12, ingredients = null) {
    this.container = container;
    this.cols = cols;
    this.rows = rows;
    this.nhits = 0;
    // Liste des ingrédients à utiliser
    this.ingredients = ingredients || [
       "tomate fraiche", "champignons", "sauce BBQ", 
      "chorizo", "crème fraiche"
    ];
    
    this.grid = [];
    this.selected = null;
    this.isAnimating = false;
    this.init();
    this.render();
  }

  init() {
    // Génère une grille sans matches au départ
    do {
      this.grid = Array.from({ length: this.rows }, () =>
        Array.from({ length: this.cols }, () => this.randIngredient())
      );
    } while (this.hasMatches());
  }
  // Création du contexte audio (une seule instance globale)
  initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }
  // --- Affiche un effet "Combo xN" au centre du groupe détruit ---
  showComboEffect(toRemove, n) {
    // convertir les coordonnées
    const coords = [...toRemove].map(k => k.split(",").map(Number));
    const avgX = coords.reduce((s, c) => s + c[0], 0) / coords.length;
    const avgY = coords.reduce((s, c) => s + c[1], 0) / coords.length;
  
    const comboText = document.createElement("div");
    comboText.className = "combo-text";
    comboText.textContent = `x${n}`;
  
    // position absolue par rapport à la grille
    const cellSize = 42; // hauteur bloc + gap
    comboText.style.left = `${avgX * cellSize + 10}px`;
    comboText.style.top  = `${avgY * cellSize + 10}px`;
  
    this.container.appendChild(comboText);
  
    // disparition automatique
    setTimeout(() => comboText.remove(), 1200);
  }
  // Lecture d'un petit "pop" 
  playPop(frequency = 440) {
    this.initAudio();
  
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
  
    osc.type = "square";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }
  playComboPop(count = 1) {
  this.initAudio();
  const ctx = this.audioCtx;

  // Chaque pop aura une hauteur un peu plus haute et un léger délai
  for (let i = 0; i < count; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const startTime = ctx.currentTime + i * 0.08; // délai entre pops
    const freq = 300 + i * 80 + Math.random() * 50; // fréquence montante

    osc.type = "square";
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.15);
  }
}
  randIngredient() {
    const ingredient = this.ingredients[Math.floor(Math.random() * this.ingredients.length)];
    return ingredient;
  }

  hasMatches() {
    for (let y = 0; y < this.rows; y++) {
      let streak = 1;
      for (let x = 1; x < this.cols; x++) {
        if (this.grid[y][x] === this.grid[y][x - 1] && this.grid[y][x] !== null) {
          streak++;
          if (streak >= 3) return true;
        } else {
          streak = 1;
        }
      }
    }
    for (let x = 0; x < this.cols; x++) {
      let streak = 1;
      for (let y = 1; y < this.rows; y++) {
        if (this.grid[y][x] === this.grid[y - 1][x] && this.grid[y][x] !== null) {
          streak++;
          if (streak >= 3) return true;
        } else {
          streak = 1;
        }
      }
    }
    return false;
  }

  render() {
    this.container.innerHTML = "";
    this.container.className = "panel-grid";
    this.grid.forEach((row, y) => {
      row.forEach((ingredient, x) => {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.x = x;
        cell.dataset.y = y;
        
        // Ajoute l'image de l'ingrédient
        if (ingredient && buttonData[ingredient]) {
          const img = document.createElement("img");
          img.src = buttonData[ingredient].img;
          img.alt = buttonData[ingredient].label;
          img.className = "ingredient-img";
          cell.appendChild(img);
        }
        
        cell.addEventListener("click", () => this.onClick(x, y));
        this.container.appendChild(cell);
      });
    });
  }

  onClick(x, y) {
    if (!this.audioCtx) this.initAudio();
    if (this.isAnimating) return;

    if (!this.selected) {
      this.selected = { x, y };
      this.highlight(x, y);
      return;
    }

    const dx = Math.abs(this.selected.x - x);
    const dy = Math.abs(this.selected.y - y);
    
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      this.swap(this.selected.x, this.selected.y, x, y);
      this.selected = null;
      this.render();
      this.processMatches();
    } else {
      this.selected = { x, y };
      this.render();
      this.highlight(x, y);
    }
  }

  highlight(x, y) {
    const idx = y * this.cols + x;
    if (this.container.children[idx]) {
      this.container.children[idx].classList.add("selected");
    }
  }

  swap(x1, y1, x2, y2) {
    [this.grid[y1][x1], this.grid[y2][x2]] = [this.grid[y2][x2], this.grid[y1][x1]];
    this.nhits = 0;
    this.combocount = 0;
    this.rmcount = 0
  }

  processMatches() {
    this.isAnimating = true;
    const matched = this.checkMatches();
    
    if (matched) {
      setTimeout(() => {
        this.applyGravity();
      }, 400);
    } else {
      this.isAnimating = false;
    }
  }

  checkMatches() {
    const toRemove = new Set();

    // Détection horizontale
    for (let y = 0; y < this.rows; y++) {
      let streak = 1;
      for (let x = 1; x < this.cols; x++) {
        if (this.grid[y][x] !== null && this.grid[y][x] === this.grid[y][x - 1]) {
          streak++;
        } else {
          if (streak >= 3) {
            for (let i = 0; i < streak; i++) {
              toRemove.add(`${x - 1 - i},${y}`);
            }
          }
          streak = 1;
        }
      }
      if (streak >= 3) {
        for (let i = 0; i < streak; i++) {
          toRemove.add(`${this.cols - 1 - i},${y}`);
        }
      }
    }

    // Détection verticale
    for (let x = 0; x < this.cols; x++) {
      let streak = 1;
      for (let y = 1; y < this.rows; y++) {
        if (this.grid[y][x] !== null && this.grid[y][x] === this.grid[y - 1][x]) {
          streak++;
        } else {
          if (streak >= 3) {
            for (let i = 0; i < streak; i++) {
              toRemove.add(`${x},${y - 1 - i}`);
            }
          }
          streak = 1;
        }
      }
      if (streak >= 3) {
        for (let i = 0; i < streak; i++) {
          toRemove.add(`${x},${this.rows - 1 - i}`);
        }
      }
    }

    if (toRemove.size) {
      
      this.nhits++;
      this.rmcount+=toRemove.size
      this.combocount = this.rmcount*this.nhits*100;
    
      this.playComboPop(toRemove.size);
      this.showComboEffect(toRemove,this.combocount);
      const cells = this.container.querySelectorAll(".cell");
      toRemove.forEach(k => {
        const [x, y] = k.split(",").map(Number);
        const idx = y * this.cols + x;
        const cell = cells[idx];
        if (cell) cell.classList.add("pop");
        this.playPop(220 + Math.random() * 400);
       
        this.playComboPop(3);
        this.grid[y][x] = null;
      });
      return true;
    }
    return false;
  }

  applyGravity() {
    for (let x = 0; x < this.cols; x++) {
      let col = [];
      for (let y = this.rows - 1; y >= 0; y--) {
        const v = this.grid[y][x];
        if (v !== null) col.push(v);
      }
      const missing = this.rows - col.length;
      for (let i = 0; i < missing; i++) {
        col.push(this.randIngredient());
      }
      col.reverse();
      for (let y = 0; y < this.rows; y++) {
        this.grid[y][x] = col[y];
      }
    }

    this.render();
    
    setTimeout(() => {
      if (this.hasMatches()) {
        this.processMatches();
      } else {
        this.isAnimating = false;
      }
    }, 300);
  }
}

// Exemple d'utilisation:
// const container = document.getElementById('game');
// const game = new PanelDePon(container, 6, 12);
// 
// Ou avec des ingrédients personnalisés:
// const game = new PanelDePon(container, 6, 12, ["mozzarella", "tomate fraiche", "champignons", "jambon", "chorizo"]);
// --- Exemple d’instanciation ---
//window.memo = new Memo();
/*_ PWA install bouton _*/
function setupPWAInstaill() {
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
function setupPWAInstall() {
  let deferredPrompt;
  
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Créer le bandeau d'installation
    const banner = document.createElement("div");
    banner.id = "pwa-install-banner";
    banner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      z-index: 9999;
      animation: slideUp 0.3s ease-out;
    `;
    
    // Ajouter l'animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    
    // Contenu du bandeau
    banner.innerHTML = `
      <div style="flex: 1;">
        <strong style="display: block; margin-bottom: 4px;">Installer l'application</strong>
        <span style="font-size: 14px; opacity: 0.9;">Accédez rapidement à notre application depuis votre écran d'accueil</span>
      </div>
      <div style="display: flex; gap: 10px; align-items: center;">
        <button id="pwa-install-btn" style="
          background: white;
          color: #667eea;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s;
        ">
          Installer
        </button>
        <button id="pwa-close-btn" style="
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.5);
          padding: 10px 15px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        ">
          ✕
        </button>
      </div>
    `;
    
    // Injecter dans le body
    document.body.appendChild(banner);
    
    // Gestion du bouton d'installation
    const installBtn = document.getElementById("pwa-install-btn");
    installBtn.addEventListener("mouseenter", () => {
      installBtn.style.transform = "scale(1.05)";
    });
    installBtn.addEventListener("mouseleave", () => {
      installBtn.style.transform = "scale(1)";
    });
    
    installBtn.addEventListener("click", async () => {
      banner.style.animation = "slideUp 0.3s ease-out reverse";
      setTimeout(() => banner.remove(), 300);
      
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Résultat de l'installation : ${outcome}`);
      deferredPrompt = null;
    });
    
    // Gestion du bouton de fermeture
    const closeBtn = document.getElementById("pwa-close-btn");
    closeBtn.addEventListener("mouseenter", () => {
      closeBtn.style.background = "rgba(255,255,255,0.1)";
    });
    closeBtn.addEventListener("mouseleave", () => {
      closeBtn.style.background = "transparent";
    });
    
    closeBtn.addEventListener("click", () => {
      banner.style.animation = "slideUp 0.3s ease-out reverse";
      setTimeout(() => banner.remove(), 300);
    });
  });
}
/*______ Boot ______*/
document.addEventListener("DOMContentLoaded", () => {
  //setupPWAInstall();
  window.app = new App();
});

// pizza-svg.js
// Petit moteur SVG "Borderlands-ish" pour pizzas modulaires
// API principale:
//   new PizzaSVG({ size: 640, seed: "4saisons", toppings: ["mushroom","ham","olive","artichoke","egg"] }).render()

class PizzaSVG {
  constructor(opts = {}) {
    this.size     = opts.size ?? 640;         // pixels
    this.seed     = opts.seed ?? "pizza";
    this.toppings = opts.toppings ?? ["mushroom","ham","olive","artichoke","egg"];
    this.colors   = {
      ink: "#1f1208",
      crust: "#e6a25a",
      crustDark: "#b8742b",
      sauce: "#c5351b",
      cheese: "#f3d57a",
      cheeseShadow: "#e2b94a",
      plate: "#e9e6df",
      tableShadow: "rgba(0,0,0,.25)",
      olive: "#10161b",
      oliveGreen: "#2e3f1f",
      ham: "#d56a6a",
      hamDark: "#b14c4c",
      shroom: "#f0e7cf",
      shroomDark: "#a88d67",
      artichoke: "#c9d089",
      artichokeDark: "#7a864a",
      eggWhite: "#fff7e6",
      eggYolk: "#f19a1a",
      yolkDark: "#b86e12",
    };
    this.rng = mulberry32(hashStr(this.seed));
  }

  render() {
    const S = this.size;
    const svg = el("svg", {
      viewBox: `0 0 ${S} ${S}`, width: S, height: S,
      xmlns: "http://www.w3.org/2000/svg", "vector-effect": "non-scaling-stroke"
    });

    // Ombre portée sous l’assiette (donne l’effet 3/4)
    const shadow = el("ellipse", {
      cx: S*0.52, cy: S*0.78, rx: S*0.42, ry: S*0.08,
      fill: this.colors.tableShadow, filter: "url(#blur2)"
    });

    // Définitions (hachures + blur léger pour l’ombre)
    svg.appendChild(this._defs());

    // Assiette
    const plate = el("ellipse", {
      cx: S*0.5, cy: S*0.58, rx: S*0.46, ry: S*0.2,
      fill: this.colors.plate, stroke: this.colors.ink, "stroke-width": S*0.012
    });

    // Pizza (ellipse pour perspective)
    const crustOuter = el("ellipse", {
      cx: S*0.5, cy: S*0.52, rx: S*0.44, ry: S*0.18,
      fill: this.colors.crust, stroke: this.colors.ink, "stroke-width": S*0.014
    });
    const crustInner = el("ellipse", {
      cx: S*0.5, cy: S*0.52, rx: S*0.39, ry: S*0.16,
      fill: this.colors.sauce, stroke: this.colors.ink, "stroke-width": S*0.010
    });

    // Fromage irrégulier (blob “cartoony”)
    const cheese = this._cheeseBlob(S*0.5, S*0.5, S*0.36, S*0.145);

    // Quelques craquelures / brûlures de croûte
    const crustInk = this._inkCrustStrokes();

    // Toppings
    const topsGroup = el("g", { "stroke-linejoin": "round" });
    const placers = this._scatterOnDisk( this.toppings.length, S*0.5, S*0.5, S*0.31, S*0.12 );

    this.toppings.forEach((name, i) => {
      const p = placers[i];
      topsGroup.appendChild(this._drawTopping(name, p.x, p.y, p.s, p.rot));
    });

    svg.append(shadow, plate, crustOuter, crustInner, cheese, crustInk, topsGroup);
    return svg;
  }

  // ---------- primitives de style ----------
  _defs() {
    const S = this.size;
    const defs = el("defs", {});
    // blur pour ombre table
    const blur = el("filter", { id: "blur2" });
    blur.appendChild(el("feGaussianBlur", { stdDeviation: S*0.01 }));
    defs.appendChild(blur);

    // Motif de hachures obliques (encre)
    const pat = el("pattern", { id:"hatch", width:8, height:8, patternUnits:"userSpaceOnUse", patternTransform:"rotate(-18)" });
    pat.appendChild(el("rect", { x:0,y:0,width:8,height:8, fill:"transparent" }));
    pat.appendChild(el("rect", { x:0,y:0,width:2,height:8, fill:this.colors.ink, opacity:.10 }));
    defs.appendChild(pat);

    return defs;
  }

  _cheeseBlob(cx, cy, rx, ry) {
    const g = el("g", {});
    const r = () => (this.rng() - .5);
    const n = 10, pts = [];
    for (let i=0;i<n;i++){
      const t = (i/n) * Math.PI*2;
      const wobble = 1 + r()*0.12;
      pts.push([ cx + Math.cos(t)*rx*wobble, cy + Math.sin(t)*ry*wobble ]);
    }
    const d = "M " + pts.map(p => p.join(",")).join(" L ") + " Z";
    g.appendChild(el("path", {
      d, fill: this.colors.cheese, stroke: this.colors.ink, "stroke-width": this.size*0.009
    }));
    // ombre interne pour volume
    g.appendChild(el("path", {
      d, fill: "url(#hatch)", opacity:.25
    }));
    return g;
  }

  _inkCrustStrokes() {
    const S = this.size;
    const g = el("g", { stroke: this.colors.ink, "stroke-width": S*0.008, fill:"none", "stroke-linecap":"round" });
    const addStroke = (aStart, aEnd, ryMul=1) => {
      const cx = S*0.5, cy = S*0.52, rx = S*0.44, ry = S*0.18*ryMul;
      const p = t => [ cx + rx*Math.cos(t), cy + ry*Math.sin(t) ];
      const N = 5 + Math.floor(this.rng()*5);
      for (let i=0;i<N;i++) {
        const t = aStart + (aEnd-aStart)*this.rng();
        const len = (0.02 + this.rng()*0.06) * Math.PI*2;
        const a1 = t - len/2, a2 = t + len/2;
        const [x1,y1] = p(a1), [x2,y2] = p(a2);
        g.appendChild(el("path", { d: `M ${x1},${y1} L ${x2},${y2}` }));
      }
    };
    addStroke(Math.PI*0.10, Math.PI*0.90, 1.02);
    addStroke(-Math.PI*0.05, Math.PI*0.15, 1.00);
    addStroke(Math.PI*0.95, Math.PI*1.10, 1.05);
    return g;
  }

  _scatterOnDisk(n, cx, cy, rx, ry) {
    const out = [];
    for (let i=0;i<n;i++){
      const a = this.rng()*Math.PI*2;
      const r = (0.25 + 0.75*Math.sqrt(this.rng())); // plus de points au bord
      out.push({
        x: cx + Math.cos(a)*rx*r,
        y: cy + Math.sin(a)*ry*r,
        s: 0.9 + this.rng()*0.3,
        rot: (this.rng()*60 - 30)
      });
    }
    return out;
  }

  _drawTopping(name, x, y, scale=1, rot=0) {
    const g = el("g", { transform:`translate(${x} ${y}) rotate(${rot}) scale(${scale})` });
    switch (name) {
      case "olive":      return g.appendChild(this._olive()), g;
      case "oliveGreen": return g.appendChild(this._olive(true)), g;
      case "ham":        return g.appendChild(this._ham()), g;
      case "mushroom":   return g.appendChild(this._mushroom()), g;
      case "artichoke":  return g.appendChild(this._artichoke()), g;
      case "egg":        return g.appendChild(this._egg()), g;
      default:           return g; // silencieux pour ingrédients non définis
    }
  }

  // ---------- dessins ingrédients ----------
  _olive(green=false) {
    const c = green ? this.colors.oliveGreen : this.colors.olive;
    const r = 20;
    const G = el("g", {});
    G.appendChild(el("ellipse", {
      cx:0, cy:0, rx:r, ry:r*0.75, fill:c, stroke:this.colors.ink, "stroke-width":3
    }));
    G.appendChild(el("ellipse", {
      cx:-5, cy:-6, rx:r*0.35, ry:r*0.25, fill:"white", opacity:.15
    }));
    return G;
  }

  _ham() {
    const G = el("g", {});
    const d = "M -50,-25 C -10,-45 50,-30 60,0 C 50,25 0,40 -40,25 C -55,15 -60,-5 -50,-25 Z";
    G.appendChild(el("path", { d, fill:this.colors.ham, stroke:this.colors.ink, "stroke-width":3 }));
    G.appendChild(el("path", { d, fill:"url(#hatch)", opacity:.2 }));
    // liseré plus sombre
    G.appendChild(el("path", { d, fill:"none", stroke:this.colors.hamDark, "stroke-width":4, opacity:.5 }));
    return G;
  }

  _mushroom() {
    const G = el("g", {});
    G.appendChild(el("path", {
      d:"M -32,-2 C -30,-30 30,-30 32,-2 Q 12,2 0,6 Q -12,2 -32,-2 Z",
      fill:this.colors.shroom, stroke:this.colors.ink, "stroke-width":3
    }));
    G.appendChild(el("rect", {
      x:-8, y:6, width:16, height:18, rx:6, fill:this.colors.shroom, stroke:this.colors.ink, "stroke-width":3
    }));
    G.appendChild(el("path", { d:"M -15,-6 Q 0,-14 15,-6", stroke:this.colors.shroomDark, "stroke-width":3, fill:"none", opacity:.6 }));
    return G;
  }

  _artichoke() {
    const G = el("g", {});
    const d = "M -34,10 L -10,-18 L 28,-6 L 18,20 Z";
    G.appendChild(el("path", { d, fill:this.colors.artichoke, stroke:this.colors.ink, "stroke-width":3 }));
    G.appendChild(el("path", { d, fill:"url(#hatch)", opacity:.2 }));
    // nervures
    G.appendChild(el("path", { d:"M -10,-18 L -2,6 L 18,20", stroke:this.colors.artichokeDark, "stroke-width":3, fill:"none", opacity:.7 }));
    return G;
  }

  _egg() {
    const G = el("g", {});
    G.appendChild(el("ellipse", { cx:0, cy:0, rx:40, ry:30, fill:this.colors.eggWhite, stroke:this.colors.ink, "stroke-width":3 }));
    G.appendChild(el("circle", { cx:4, cy:0, r:16, fill:this.colors.eggYolk, stroke:this.colors.ink, "stroke-width":3 }));
    G.appendChild(el("circle", { cx:4, cy:-4, r:10, fill:this.colors.yolkDark, opacity:.25 }));
    return G;
  }
}

// ---------- helpers ----------
function el(tag, attrs) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  return node;
}
function hashStr(str) { // petit hash stable
  let h = 2166136261 >>> 0;
  for (let i=0;i<str.length;i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a) { // RNG deterministe
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ----------- EXEMPLE D’USAGE -----------
// const pizza = new PizzaSVG({
//   size: 720,
//   seed: "quatre-saisons-demo",
//   toppings: ["mushroom","ham","olive","oliveGreen","artichoke","egg"]
// }).render();
// document.body.appendChild(pizza);
