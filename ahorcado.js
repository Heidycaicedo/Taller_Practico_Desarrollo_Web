document.addEventListener("DOMContentLoaded", () => {
  const categoriaSelect = document.getElementById("categoria");
  const btnNueva = document.getElementById("btn-nueva");
  const btnReset = document.getElementById("btn-reset");
  const contPalabra = document.getElementById("cont-palabra");
  const teclado = document.getElementById("teclado");
  const canvas = document.getElementById("pantalla");
  const ctx = canvas.getContext("2d");
  const pistaEl = document.getElementById("pista");
  const usedLettersEl = document.getElementById("used-letters");
  const historyEl = document.getElementById("history");
  const winsEl = document.getElementById("wins");
  const lossesEl = document.getElementById("losses");
  const errorsEl = document.getElementById("errors");

  const MAX_ERRORS = 6;
  let palabra = "";
  let pista = "";
  let oculto = [];
  let errores = 0;
  let usadas = [];

  const categorias = {
  Animales: [
    { word: "elefante", hint: "Animal terrestre grande con trompa" },
    { word: "perro", hint: "Mejor amigo del hombre" },
    { word: "gato", hint: "Felino doméstico" },
    { word: "mariposa", hint: "Insecto con alas de colores" },
    { word: "caballo", hint: "Animal usado para montar" },
    { word: "vaca", hint: "Animal que da leche" },
    { word: "leon", hint: "Rey de la selva" },
    { word: "tigre", hint: "Felino rayado muy fuerte" },
    { word: "oso", hint: "Animal grande que hiberna" },
    { word: "conejo", hint: "Animal pequeño con orejas largas" },
    { word: "jirafa", hint: "Animal con cuello largo" },
    { word: "zorro", hint: "Animal astuto de cola esponjosa" },
    { word: "canguro", hint: "Animal australiano que salta" },
    { word: "panda", hint: "Oso blanco y negro" },
    { word: "delfin", hint: "Mamífero marino muy inteligente" },
    { word: "ballena", hint: "El animal más grande del planeta" },
    { word: "tortuga", hint: "Reptil con caparazón" },
    { word: "loro", hint: "Ave que puede imitar sonidos" },
    { word: "aguila", hint: "Ave rapaz de gran visión" },
    { word: "serpiente", hint: "Reptil sin patas" }
  ],
  Frutas: [
    { word: "manzana", hint: "Roja o verde, muy común" },
    { word: "banano", hint: "Amarillo y curvo" },
    { word: "uva", hint: "Pequeña, puede ser morada o verde" },
    { word: "naranja", hint: "Cítrica y de color anaranjado" },
    { word: "fresa", hint: "Roja con semillas por fuera" },
    { word: "sandia", hint: "Grande, verde por fuera y roja por dentro" },
    { word: "melon", hint: "Parecido a la sandía pero de pulpa clara" },
    { word: "piña", hint: "Tropical con corona de hojas" },
    { word: "mango", hint: "Amarillo o verde, muy jugoso" },
    { word: "papaya", hint: "Fruta anaranjada con semillas negras" },
    { word: "kiwi", hint: "Pequeña, marrón por fuera y verde por dentro" },
    { word: "cereza", hint: "Pequeña y roja, a veces en pareja" },
    { word: "pera", hint: "Verde o amarilla, en forma de gota" },
    { word: "coco", hint: "Duro por fuera, agua dulce dentro" },
    { word: "granada", hint: "Fruta roja llena de semillas jugosas" },
    { word: "limon", hint: "Ácido y amarillo o verde" },
    { word: "guayaba", hint: "Aromática, rosada por dentro" },
    { word: "maracuya", hint: "Fruta ácida y amarilla por dentro" },
    { word: "durazno", hint: "Fruta aterciopelada y dulce" },
    { word: "mandarina", hint: "Parecida a la naranja pero más pequeña" }
  ],
  Paises: [
    { word: "colombia", hint: "Café, flores y esmeraldas" },
    { word: "mexico", hint: "Mariachi y tacos" },
    { word: "argentina", hint: "Tango y fútbol" },
    { word: "brasil", hint: "Carnaval y samba" },
    { word: "chile", hint: "Forma de cinta larga en Sudamérica" },
    { word: "peru", hint: "Machu Picchu" },
    { word: "ecuador", hint: "País de la mitad del mundo" },
    { word: "venezuela", hint: "Arepas y petróleo" },
    { word: "uruguay", hint: "País pequeño famoso por su carne y fútbol" },
    { word: "paraguay", hint: "Guaraní y tereré" },
    { word: "bolivia", hint: "Altiplano y salar de Uyuni" },
    { word: "espana", hint: "Toros y flamenco" },
    { word: "francia", hint: "Torre Eiffel" },
    { word: "italia", hint: "Pizza y pasta" },
    { word: "alemania", hint: "Oktoberfest y autos" },
    { word: "japon", hint: "Samuráis y tecnología" },
    { word: "china", hint: "Muralla y té" },
    { word: "india", hint: "Taj Mahal" },
    { word: "canada", hint: "Maple y hockey" },
    { word: "estadosunidos", hint: "Hollywood y Nueva York" }
  ]
};


  for (let c in categorias) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    categoriaSelect.appendChild(opt);
  }

  function nuevaPartida() {
    const cat = categoriaSelect.value || Object.keys(categorias)[0];
    const lista = categorias[cat];
    const obj = lista[Math.floor(Math.random() * lista.length)];
    palabra = obj.word.toUpperCase();
    pista = obj.hint;
    oculto = Array(palabra.length).fill("_");
    errores = 0;
    usadas = [];
    pistaEl.textContent = "Pista: " + pista;
    actualizarVista();
    dibujarBase();
  }

  function actualizarVista() {
    contPalabra.textContent = oculto.join(" ");
    errorsEl.textContent = errores;
    winsEl.textContent = localStorage.getItem("wins") || 0;
    lossesEl.textContent = localStorage.getItem("losses") || 0;
    renderTeclado();
    renderUsadas();
    renderHistorial();
  }

  function renderTeclado() {
    teclado.innerHTML = "";
    "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("").forEach(l => {
      const btn = document.createElement("button");
      btn.textContent = l;
      btn.disabled = usadas.includes(l);
      btn.addEventListener("click", () => manejarLetra(l));
      teclado.appendChild(btn);
    });
  }

  function renderUsadas() {
    usedLettersEl.textContent = usadas.join(", ");
  }


  function renderHistorial() {
    historyEl.innerHTML = localStorage.getItem("history") || "";
  }


  function manejarLetra(l) {
    if (usadas.includes(l)) return;
    usadas.push(l);
    if (palabra.includes(l)) {
      palabra.split("").forEach((c, i) => {
        if (c === l) oculto[i] = l;
      });
    } else {
      errores++;
      dibujarParte(errores);
    }
    verificarEstado();
    actualizarVista();
  }


  function verificarEstado() {
    if (!oculto.includes("_")) {
      alert("¡Ganaste! La palabra era " + palabra);
      incrementar("wins");
      guardarHistorial("Ganó", palabra);
      nuevaPartida();
    } else if (errores >= MAX_ERRORS) {
      alert("Perdiste :( La palabra era " + palabra);
      incrementar("losses");
      guardarHistorial("Perdió", palabra);
      nuevaPartida();
    }
  }

  function incrementar(key) {
    let val = parseInt(localStorage.getItem(key) || 0);
    localStorage.setItem(key, val + 1);
  }

  function guardarHistorial(resultado, palabra) {
    let hist = localStorage.getItem("history") || "";
    const line = `${new Date().toLocaleString()} — ${resultado}: ${palabra}<br>`;
    hist = line + hist;
    localStorage.setItem("history", hist);
    sessionStorage.setItem("history", hist);
  }

  function dibujarBase() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(50, 240);
    ctx.lineTo(200, 240);
    ctx.moveTo(125, 240);
    ctx.lineTo(125, 40);
    ctx.lineTo(300, 40);
    ctx.lineTo(300, 70);
    ctx.stroke();
  }

  function dibujarParte(num) {
    ctx.strokeStyle = "#333";
    ctx.beginPath();
    switch (num) {
      case 1: 
        ctx.arc(300, 100, 30, 0, Math.PI * 2);
        break;
      case 2: 
        ctx.moveTo(300, 130);
        ctx.lineTo(300, 190);
        break;
      case 3: 
        ctx.moveTo(300, 140);
        ctx.lineTo(260, 170);
        break;
      case 4: 
        ctx.moveTo(300, 140);
        ctx.lineTo(340, 170);
        break;
      case 5: 
        ctx.moveTo(300, 190);
        ctx.lineTo(270, 230);
        break;
      case 6: 
        ctx.moveTo(300, 190);
        ctx.lineTo(330, 230);
        break;
    }
    ctx.stroke();
  }

 
  btnReset.addEventListener("click", () => {
    if (confirm("¿Seguro que deseas borrar historial y contadores?")) {
      localStorage.clear();
      actualizarVista();
    }
  });
 
  btnNueva.addEventListener("click", nuevaPartida);

  
  document.addEventListener("keydown", e => {
    const l = e.key.toUpperCase();
    if (/^[A-ZÑ]$/.test(l)) manejarLetra(l);
  });

  nuevaPartida();
});
