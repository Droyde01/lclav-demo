/* L' Clav site settings. Everything Nily/Diego may need to change lives here.
   Empty strings = not set yet; the site hides what depends on them. */
window.LCLAV = {
  whatsapp: "",            // international format, digits only, e.g. "13055550000"
  instagram: "",           // handle without @

  citaHoras: ["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],

  // Entry frames (door → hallway → room). Mobile gets its own set when it exists.
  entryManifest: "assets/entry/manifest.json",
  entryManifestMobile: "assets/entry_m/manifest.json",
  // Room loop (smoke once → chill → back to the start), full frame, crossfaded at the loop point.
  roomLoop: "assets/room_loop.mp4",
  // Camera moves into a rack before its shop opens (and back out when it closes).
  transitions: {
    tops: { in: "assets/to_tops.mp4", back: "assets/to_tops_back.mp4" },
    especiales: { in: "assets/to_tops.mp4", back: "assets/to_tops_back.mp4" },
    bottoms: { in: "assets/to_bottoms.mp4", back: "assets/to_bottoms_back.mp4" }
  },
  transitionRate: 1.35,     // play the 4 s camera moves a bit faster
  // Phones show this horizontal slice of the room art (Nily + racks + pool table) without swiping.
  // Phones: the full-screen room drifts slowly between Nily and the racks (art x of the screen centre).
  mobilePan: [1400, 1990],
  enterSeconds: 11,         // ENTER autoplay duration (Diego: slower)

  loaderTips: [
    "Toca los percheros de arriba para ver los tops.",
    "El rack de abajo tiene los bottoms.",
    "Habla con Nily: pulsa E.",
    "¿No ves lo que buscas? Deja una nota en la nevera.",
    "El cuadro rojo esconde las piezas especiales."
  ],

  // Room art is 2752 x 1536. Polygons are "x,y x,y ..."; anchor = where the blip sits.
  hotspots: [
    { id: "tops", label: "Tops", key: "T", open: "tops",
      points: "1740,500 1800,440 1900,380 2050,330 2240,285 2265,335 2200,425 2180,465 1900,505 1760,540",
      anchor: [1990, 400] },
    { id: "bottoms", label: "Bottoms", key: "B", open: "bottoms",
      points: "1790,900 1880,800 2240,790 2250,860 2170,960 2170,1300 2080,1385 1950,1375 1830,1300 1790,1150",
      anchor: [2010, 1060] },
    { id: "especiales", label: "Piezas especiales", key: "P", open: "especiales",
      points: "1985,570 2150,570 2150,820 1985,820",
      anchor: [2070, 690] },
    { id: "nily", label: "Hablar con Nily", key: "E", open: "nily",
      points: "1295,700 1350,688 1420,718 1432,830 1500,870 1540,1080 1660,1090 1730,1380 1650,1425 1450,1432 1350,1300 1280,1400 1200,1300 1170,1100 1120,1000 1180,880 1300,830",
      anchor: [1360, 640] },
    { id: "billar", label: "Billar", key: "8", open: "billar",
      points: "770,990 800,910 1100,900 1125,960 1105,1000 1120,1180 840,1270 790,1200",
      anchor: [930, 1080] },
    { id: "nota", label: "Deja una nota", key: "M", open: "pedido",
      points: "380,80 760,80 770,1380 470,1430 380,1300",
      anchor: [570, 640] }
  ]
};
