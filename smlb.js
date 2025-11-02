let pizzaAddons = ["ananas","boursin","courgettes","gorgonzola","maroilles","pepperoni","piment fort","sauce chili tai","kebab","poivrons","tomte fraiche","chèvre","sauce bbq","crème fraiche","pomme de terres","pomme de terre","olive","anchois","oignons","oeuf","miel","cheddar","jambon","mozzarella","champignons","chorizzo","lardons","fromage à raclette","merguez","poulet","viande hachée","origan"];
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
  
    const imgUrl = v.picture && typeof v.picture === "string"
      ? `/app${v.picture}`
      : "";
  
    // Si pas de chemin → on masque tout de suite
    if (!imgUrl) {
      this._hideImageBox();
      this.refreshIngredientGrid();
      return;
    }
  
    // Vérifie si l'image existe vraiment
    const testImg = new Image();
    testImg.onload = () => {
      // ✅ Image valide : on l'affiche
      this.imgBox.style.display = "block";
      this.imgBox.style.backgroundImage = `url('${imgUrl}')`;
      this.imgBox.classList.remove("no-image");
    };
    testImg.onerror = () => {
      // ❌ Image inexistante : on masque
      this._hideImageBox();
    };
  
    // Déclenche le test de chargement
    testImg.src = imgUrl;
  
    this.refreshIngredientGrid();
  }

// --- petite méthode utilitaire ---
_hideImageBox() {
  this.imgBox.style.display = "none";
  this.imgBox.style.backgroundImage = "";
  this.imgBox.classList.add("no-image");
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