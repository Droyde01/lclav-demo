/* Spanish / English. Static text: data-i18n (text), data-i18n-html, data-i18n-aria, data-i18n-alt.
   Dynamic text in app.js: t("key"). Language: ?lang=en|es, then the visitor's last choice, then the browser. */
(() => {
  const S = {
    es: {
      "meta.desc": "Entra a L' Clav: toca la puerta, pasa al cuarto, habla con Nily y escoge tu ropa.",
      "nav.sub": "Miami · Solo con cita", "nav.home": "L' Clav, volver a la puerta", "nav.shop": "Tienda",
      "nav.tops": "Tops", "nav.bottoms": "Bottoms", "nav.pieces": "Piezas", "nav.book": "Cita", "nav.bag": "Bolsa de apartados",
      "menu.shop": "Tienda", "menu.special": "Piezas especiales", "menu.bag": "Mi bolsa", "menu.contact": "Contacto",
      "menu.book": "Agendar cita", "menu.request": "Pedido especial · mensaje", "menu.extra": "Extra",
      "menu.pool": "Jugar billar", "menu.door": "Volver a la puerta",
      "lang.switch": "EN", "lang.switchLabel": "English", "lang.name": "Español",
      "hero.knock": "TOC TOC", "hero.label": "Tocar la puerta", "hero.scroll": "o haz scroll", "intro": "Entrada",
      "room": "El cuarto de L' Clav", "room.alt": "Nily sentada en la esquina de L' Clav, con la ropa a la derecha",
      "room.hint": "Toca la ropa", "room.hint2": "↓ desliza para más",
      "keys.talk": "Hablar", "keys.book": "Cita",
      "ctrl.label": "Qué quieres ver", "ctrl.line": "Hey, bienvenid@ a L' Clav. Toca la ropa o escoge aquí.",
      "ctrl.pieces": "Piezas", "ctrl.book": "Cita", "ctrl.more": "¿Buscas algo específico? <u>Pídeselo a Nily</u>",
      "nily.head": "La dueña", "nily.role": "Dueña · Estilista · L' Clav",
      "nily.lead": "Escoge contigo, te arma el outfit y si no está en el rack, te lo consigue.",
      "nily.alt": "Hoja de personaje de Nily: frente, tres cuartos, perfil, espalda y cara",
      "btn.book": "AGENDAR CITA", "btn.request": "Pedido especial", "btn.door": "Volver a la puerta ↑",
      "how.head": "Cómo funciona",
      "how.1h": "Escoge", "how.1p": "Mira tops, bottoms y piezas especiales y aparta lo que te guste.",
      "how.2h": "Agenda", "how.2p": "Escoge día y hora. Nily te confirma por mensaje.",
      "how.3h": "Pruébatelo", "how.3p": "Ven al cuarto, pruébate todo y llévate tu outfit.",
      "cta.huge": "TE ESPERAMOS<br>EN EL CUARTO", "foot.made": "Hecho por DGO Enterprises",
      "store.brand": "L' CLAV · Tienda", "store.cats": "Categorías", "back": "Volver", "close": "Cerrar",
      "bag.title": "Tu bolsa",
      "tips": ["Toca los percheros de arriba para ver los tops.", "El rack de abajo tiene los bottoms.", "Habla con Nily: pulsa E.",
               "¿No ves lo que buscas? Deja una nota en la nevera.", "El cuadro rojo esconde las piezas especiales."],
      "hs.tops": "Tops", "hs.bottoms": "Bottoms", "hs.especiales": "Piezas especiales", "hs.nily": "Hablar con Nily",
      "waHello": "Hola Nily", "hs.billar": "Billar", "hs.nota": "Deja una nota",
      "nily.hola": "Hey, bienvenid@ a L' Clav. Ponte cómodo. ¿Qué andas buscando hoy?",
      "nily.again": "Dime. Si no lo ves en el rack, te lo consigo.",
      "opt.tops": "Tops", "opt.bottoms": "Bottoms", "opt.special": "Algo especial", "opt.book": "Agendar cita",
      "opt.seeTops": "Ver tops", "opt.seeBottoms": "Ver bottoms", "opt.request": "Pedido especial",
      "pool": "La mesa de billar abre pronto. Ve practicando.",
      "cat.tops": "Tops", "cat.bottoms": "Bottoms", "cat.especiales": "Piezas especiales",
      "size": "Talla", "all": "Todas", "piece": "pieza", "pieces": "piezas", "filterBy": "Filtrar por talla",
      "empty": "No hay piezas en esa talla ahora mismo.", "help": "¿No ves tu talla o lo que buscas?", "askNily": "Pídeselo a Nily",
      "photoSoon": "Foto pronto", "ask": "Consultar",
      "desc.default": "Pieza de ejemplo: aquí va la descripción real de Nily (tela, fit y cómo combinarla).",
      "pickSize": "Escoge tu talla", "pickSizeFirst": "Escoge tu talla primero",
      "addBag": "AÑADIR A LA BOLSA", "viewBag": "VER MI BOLSA", "tryOn": "Pruébatelo: agenda una cita", "askWa": "Preguntar por WhatsApp",
      "acc.howT": "Cómo funciona apartar",
      "acc.howP": "Añade tus piezas a la bolsa y apártalas. Nily te escribe para confirmar y te las guarda para que te las pruebes en el cuarto o las recojas.",
      "acc.sizeT": "Tallas y medidas", "acc.sizeP": "Si tienes dudas con la talla, pídele a Nily las medidas exactas o pruébatela en tu cita.",
      "added": "Añadido a tu bolsa", "bagEmpty": "Tu bolsa está vacía.", "seeTops": "VER TOPS", "remove": "Quitar",
      "f.name": "Nombre", "f.contact": "WhatsApp o teléfono", "f.day": "Día", "f.time": "Hora",
      "f.note": "Nota (opcional)", "f.notePh": "Algo que Nily deba saber…", "f.how": "Cómo lo quieres",
      "f.tryRoom": "Probármelo en el cuarto", "f.pickup": "Solo recoger",
      "f.reserve1": "APARTAR 1 PIEZA", "f.reserveN": "APARTAR {n} PIEZAS",
      "f.lookingFor": "¿Qué buscas? (opcional)", "f.lookingPh": "Outfit para un evento, tallas, estilo…",
      "f.piece": "Pieza", "f.piecePh": "Ej: chaqueta de cuero vintage", "f.sizePh": "Ej: M / 32",
      "f.budget": "Presupuesto (opcional)", "f.budgetPh": "Ej: hasta $150", "f.msg": "Mensaje", "f.msgPh": "Color, estilo, para cuándo lo necesitas…",
      "f.book": "RESERVAR", "f.send": "ENVIAR",
      "ph.book": "Agendar cita", "ph.request": "Pedido especial",
      "ph.bookLead": "Ven al cuarto a probarte la ropa con Nily. Escoge día y hora y te confirma por mensaje.",
      "ph.requestLead": "¿Buscas algo específico? Cuéntale a Nily y te lo consigue.",
      "tryOnMsg": "Quiero probarme: {p}", "tryOnSize": " (talla {s})", "waInterest": "Hola Nily, me interesa: {p}",
      "sent": "ENVIADO", "sent.cita": "Nily te escribe para confirmar la cita.", "sent.pedido": "Nily recibió tu pedido y te escribe pronto.",
      "sent.apartado": "Listo. Nily te escribe para confirmar tus piezas.", "sent.demo": "Modo demo: este formulario todavía no envía los datos.",
      "sent.wa": "Mandarlo también por WhatsApp", "sendFail": "No se pudo enviar. Intenta otra vez."
    },
    en: {
      "meta.desc": "Step into L' Clav: knock on the door, walk into the room, talk to Nily and pick your clothes.",
      "nav.sub": "Miami · By appointment only", "nav.home": "L' Clav, back to the door", "nav.shop": "Shop",
      "nav.tops": "Tops", "nav.bottoms": "Bottoms", "nav.pieces": "Pieces", "nav.book": "Book", "nav.bag": "Your bag",
      "menu.shop": "Shop", "menu.special": "Special pieces", "menu.bag": "My bag", "menu.contact": "Contact",
      "menu.book": "Book a visit", "menu.request": "Special request · message", "menu.extra": "Extra",
      "menu.pool": "Play pool", "menu.door": "Back to the door",
      "lang.switch": "ES", "lang.switchLabel": "Español", "lang.name": "English",
      "hero.knock": "KNOCK KNOCK", "hero.label": "Knock on the door", "hero.scroll": "or scroll", "intro": "Entrance",
      "room": "The L' Clav room", "room.alt": "Nily sitting in the corner of L' Clav, with the clothes on the right",
      "room.hint": "Tap the clothes", "room.hint2": "↓ scroll for more",
      "keys.talk": "Talk", "keys.book": "Book",
      "ctrl.label": "What do you want to see", "ctrl.line": "Hey, welcome to L' Clav. Tap the clothes or pick here.",
      "ctrl.pieces": "Pieces", "ctrl.book": "Book", "ctrl.more": "Looking for something specific? <u>Ask Nily</u>",
      "nily.head": "The owner", "nily.role": "Owner · Stylist · L' Clav",
      "nily.lead": "She picks with you, builds your outfit, and if it's not on the rack, she'll find it.",
      "nily.alt": "Nily's character sheet: front, three-quarter, profile, back and face",
      "btn.book": "BOOK A VISIT", "btn.request": "Special request", "btn.door": "Back to the door ↑",
      "how.head": "How it works",
      "how.1h": "Pick", "how.1p": "Browse tops, bottoms and special pieces and reserve what you like.",
      "how.2h": "Book", "how.2p": "Choose a day and time. Nily confirms by message.",
      "how.3h": "Try it on", "how.3p": "Come to the room, try everything on and take your outfit home.",
      "cta.huge": "SEE YOU<br>IN THE ROOM", "foot.made": "Made by DGO Enterprises",
      "store.brand": "L' CLAV · Shop", "store.cats": "Categories", "back": "Back", "close": "Close",
      "bag.title": "Your bag",
      "tips": ["Tap the racks up top to see the tops.", "The rack below has the bottoms.", "Talk to Nily: press E.",
               "Can't find it? Leave a note on the fridge.", "The red frame hides the special pieces."],
      "hs.tops": "Tops", "hs.bottoms": "Bottoms", "hs.especiales": "Special pieces", "hs.nily": "Talk to Nily",
      "waHello": "Hi Nily", "hs.billar": "Pool", "hs.nota": "Leave a note",
      "nily.hola": "Hey, welcome to L' Clav. Make yourself comfortable. What are you looking for today?",
      "nily.again": "Tell me. If it's not on the rack, I'll find it for you.",
      "opt.tops": "Tops", "opt.bottoms": "Bottoms", "opt.special": "Something special", "opt.book": "Book a visit",
      "opt.seeTops": "See tops", "opt.seeBottoms": "See bottoms", "opt.request": "Special request",
      "pool": "The pool table opens soon. Start practicing.",
      "cat.tops": "Tops", "cat.bottoms": "Bottoms", "cat.especiales": "Special pieces",
      "size": "Size", "all": "All", "piece": "piece", "pieces": "pieces", "filterBy": "Filter by size",
      "empty": "Nothing in that size right now.", "help": "Can't find your size or what you're after?", "askNily": "Ask Nily",
      "photoSoon": "Photo soon", "ask": "Price on request",
      "desc.default": "Sample piece: Nily's real description goes here (fabric, fit and how to style it).",
      "pickSize": "Pick your size", "pickSizeFirst": "Pick your size first",
      "addBag": "ADD TO BAG", "viewBag": "VIEW MY BAG", "tryOn": "Try it on: book a visit", "askWa": "Ask on WhatsApp",
      "acc.howT": "How reserving works",
      "acc.howP": "Add your pieces to the bag and reserve them. Nily messages you to confirm and holds them so you can try them on in the room or pick them up.",
      "acc.sizeT": "Sizes and measurements", "acc.sizeP": "Not sure about the size? Ask Nily for the exact measurements or try it on at your visit.",
      "added": "Added to your bag", "bagEmpty": "Your bag is empty.", "seeTops": "SEE TOPS", "remove": "Remove",
      "f.name": "Name", "f.contact": "WhatsApp or phone", "f.day": "Day", "f.time": "Time",
      "f.note": "Note (optional)", "f.notePh": "Anything Nily should know…", "f.how": "How do you want it",
      "f.tryRoom": "Try it on in the room", "f.pickup": "Just pick up",
      "f.reserve1": "RESERVE 1 PIECE", "f.reserveN": "RESERVE {n} PIECES",
      "f.lookingFor": "What are you looking for? (optional)", "f.lookingPh": "Outfit for an event, sizes, style…",
      "f.piece": "Piece", "f.piecePh": "E.g. vintage leather jacket", "f.sizePh": "E.g. M / 32",
      "f.budget": "Budget (optional)", "f.budgetPh": "E.g. up to $150", "f.msg": "Message", "f.msgPh": "Color, style, when you need it…",
      "f.book": "BOOK", "f.send": "SEND",
      "ph.book": "Book a visit", "ph.request": "Special request",
      "ph.bookLead": "Come to the room and try clothes on with Nily. Pick a day and time and she'll confirm by message.",
      "ph.requestLead": "Looking for something specific? Tell Nily and she'll find it.",
      "tryOnMsg": "I'd like to try on: {p}", "tryOnSize": " (size {s})", "waInterest": "Hi Nily, I'm interested in: {p}",
      "sent": "SENT", "sent.cita": "Nily will message you to confirm the visit.", "sent.pedido": "Nily got your request and will message you soon.",
      "sent.apartado": "Done. Nily will message you to confirm your pieces.", "sent.demo": "Demo mode: this form doesn't send anything yet.",
      "sent.wa": "Also send it on WhatsApp", "sendFail": "Couldn't send. Please try again."
    }
  };

  const pick = () => {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "en" || q === "es") return q;
    try { const s = localStorage.getItem("lclav_lang"); if (s === "en" || s === "es") return s; } catch {}
    return "es";                                  // Spanish is the store's language; English via the toggle or ?lang=en
  };
  let lang = pick();

  const t = (key, vars) => {
    let v = (S[lang] && S[lang][key]) ?? S.es[key] ?? key;
    if (vars && typeof v === "string") v = v.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
    return v;
  };
  function apply(root = document) {
    document.documentElement.lang = lang;
    root.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    root.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    root.querySelectorAll("[data-i18n-alt]").forEach((el) => { el.setAttribute("alt", t(el.dataset.i18nAlt)); });
    const d = document.querySelector('meta[name="description"]'); if (d) d.setAttribute("content", t("meta.desc"));
  }
  function set(l) {
    lang = l === "en" ? "en" : "es";
    try { localStorage.setItem("lclav_lang", lang); } catch {}
    const u = new URL(location.href); u.searchParams.set("lang", lang); history.replaceState(history.state, "", u);
    apply();
    window.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
  }
  window.I18N = { t, apply, set, get lang() { return lang; } };
})();
