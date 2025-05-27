// Obtener los platos desde la variable global que Hugo inyecta
function obtenerPlatos() {
    return window.recetasData || [];
  }
  
  // Cargar el tema guardado o usar el tema claro por defecto
  function cargarTema() {
    const temaGuardado = localStorage.getItem("tema");
    if (temaGuardado === "dark") {
      document.body.classList.add("dark-theme");
      document.getElementById("theme-toggle").innerHTML = '<i class="fas fa-sun"></i>';
    }
  }
  
  // Cambiar entre tema claro y oscuro
  function cambiarTema() {
    const botonTema = document.getElementById("theme-toggle");
  
    if (document.body.classList.contains("dark-theme")) {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("tema", "light");
      botonTema.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      document.body.classList.add("dark-theme");
      localStorage.setItem("tema", "dark");
      botonTema.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }
  
  // Filtrar tarjetas de platos (mostrar/ocultar las existentes)
  function filtrarTarjetasPlatos(platos) {
    const todasLasTarjetas = document.querySelectorAll('.dish-card');
    const contenedor = document.getElementById("dishes-container");
  
    if (platos.length === 0) {
      contenedor.innerHTML = `
        <div class="no-results">
          <h3>No se encontraron platos</h3>
          <p>Intenta con otra búsqueda o filtro</p>
        </div>
      `;
      return;
    }
  
    // Restaurar todas las tarjetas si hay resultados
    if (contenedor.querySelector('.no-results')) {
      location.reload(); // Recargar para restaurar las tarjetas originales
      return;
    }
  
    // Ocultar todas las tarjetas
    todasLasTarjetas.forEach(tarjeta => {
      tarjeta.style.display = 'none';
    });
  
    // Mostrar solo las tarjetas que coinciden
    platos.forEach(plato => {
      const tarjeta = document.querySelector(`[data-id="${plato.id}"]`);
      if (tarjeta) {
        tarjeta.style.display = 'block';
      }
    });
  }
  
  // Traducir categoría a texto más amigable
  function traducirCategoria(categoria) {
    const traducciones = {
      entrada: "Entrada",
      caldo: "Caldo", 
      principal: "Plato Fuerte",
      postre: "Postre",
      bebida: "Bebida",
    };
  
    return traducciones[categoria] || categoria;
  }
  
  // Filtrar platos por categoría
  function filtrarPlatosPorCategoria(categoria) {
    const platos = obtenerPlatos();
  
    if (categoria === "all") {
      return platos;
    }
  
    return platos.filter((plato) => plato.categoria === categoria);
  }
  
  // Buscar platos por nombre
  function buscarPlatos(termino) {
    const platos = obtenerPlatos();
  
    if (!termino.trim()) {
      return platos;
    }
  
    const terminoLower = termino.toLowerCase();
  
    return platos.filter(
      (plato) =>
        plato.nombre.toLowerCase().includes(terminoLower) ||
        plato.descripcion.toLowerCase().includes(terminoLower) ||
        plato.ingredientes.some((ingrediente) => ingrediente.toLowerCase().includes(terminoLower))
    );
  }
  
  // Variables para el control de audio
  let speechSynthesis;
  let speechUtterance;
  let isPlaying = false;
  
  // Abrir modal con detalles del plato
  function abrirModal(plato) {
    const modal = document.getElementById("dish-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalImage = document.getElementById("modal-image");
    const modalCategory = document.querySelector(".modal-category");
    const modalDescription = document.querySelector(".modal-description");
    const modalIngredients = document.getElementById("modal-ingredients");
    const modalPreparation = document.getElementById("modal-preparation");
    const playButton = document.getElementById("play-button");
  
    modalTitle.textContent = plato.nombre;
    modalImage.src = plato.imagen;
    modalImage.alt = plato.nombre;
    modalCategory.textContent = traducirCategoria(plato.categoria);
    modalCategory.dataset.category = plato.categoria;
    modalDescription.textContent = plato.descripcion;
  
    // Limpiar listas anteriores
    modalIngredients.innerHTML = "";
    modalPreparation.innerHTML = "";
  
    // Agregar ingredientes
    plato.ingredientes.forEach((ingrediente) => {
      const li = document.createElement("li");
      li.textContent = ingrediente;
      modalIngredients.appendChild(li);
    });
  
    // Agregar pasos de preparación
    plato.preparacion.forEach((paso, index) => {
      const li = document.createElement("li");
      li.textContent = paso;
      modalPreparation.appendChild(li);
    });
  
    // Detener cualquier reproducción anterior
    detenerReproduccion();
  
    // Configurar el botón de reproducción
    playButton.innerHTML = '<i class="fas fa-play"></i>';
    playButton.classList.remove("playing");
    playButton.onclick = () => reproducirInformacionPlato(plato);
  
    // Mostrar modal con animación
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  
  // Reproducir información del plato
  function reproducirInformacionPlato(plato) {
    const playButton = document.getElementById("play-button");
  
    if (isPlaying) {
      detenerReproduccion();
      return;
    }
  
    let textoCompleto = `${plato.nombre}. ${plato.descripcion}. Ingredientes: `;
  
    plato.ingredientes.forEach((ingrediente, index) => {
      textoCompleto += `${ingrediente}. `;
    });
  
    textoCompleto += "Preparación: ";
    plato.preparacion.forEach((paso, index) => {
      textoCompleto += `Paso ${index + 1}: ${paso}. `;
    });
  
    speechSynthesis = window.speechSynthesis;
    speechUtterance = new SpeechSynthesisUtterance(textoCompleto);
  
    const voces = speechSynthesis.getVoices();
    const vozEspanol = voces.find((voz) => voz.lang.includes("es"));
    if (vozEspanol) {
      speechUtterance.voice = vozEspanol;
    }
  
    speechUtterance.onstart = () => {
      isPlaying = true;
      playButton.innerHTML = '<i class="fas fa-pause"></i>';
      playButton.classList.add("playing");
    };
  
    speechUtterance.onend = () => {
      isPlaying = false;
      playButton.innerHTML = '<i class="fas fa-play"></i>';
      playButton.classList.remove("playing");
    };
  
    speechUtterance.onerror = () => {
      isPlaying = false;
      playButton.innerHTML = '<i class="fas fa-play"></i>';
      playButton.classList.remove("playing");
      alert("Hubo un error al reproducir el audio.");
    };
  
    speechSynthesis.speak(speechUtterance);
  }
  
  // Detener reproducción
  function detenerReproduccion() {
    if (speechSynthesis && isPlaying) {
      speechSynthesis.cancel();
      isPlaying = false;
      const playButton = document.getElementById("play-button");
      playButton.innerHTML = '<i class="fas fa-play"></i>';
      playButton.classList.remove("playing");
    }
  }
  
  // Cerrar modal
  function cerrarModal() {
    const modal = document.getElementById("dish-modal");
    modal.classList.remove("show");
    document.body.style.overflow = "";
    detenerReproduccion();
  }
  
  // Inicializar la aplicación
  function inicializarApp() {
    const platos = obtenerPlatos();
  
    cargarTema();
  
    // Agregar eventos de clic a las tarjetas existentes
    document.querySelectorAll('.dish-card').forEach(tarjeta => {
      tarjeta.addEventListener('click', () => {
        const platoId = parseInt(tarjeta.dataset.id);
        const plato = platos.find(p => p.id === platoId);
        if (plato) {
          abrirModal(plato);
        }
      });
    });
  
    document.getElementById("theme-toggle").addEventListener("click", cambiarTema);
    document.querySelector(".close-modal").addEventListener("click", cerrarModal);
  
    document.getElementById("dish-modal").addEventListener("click", (e) => {
      if (e.target === document.getElementById("dish-modal")) {
        cerrarModal();
      }
    });
  
    // Eventos para filtros de categoría
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
  
        const categoria = btn.dataset.filter;
        const platosFiltrados = filtrarPlatosPorCategoria(categoria);
        filtrarTarjetasPlatos(platosFiltrados);
      });
    });
  
    // Evento para búsqueda
    const searchInput = document.getElementById("search");
    const searchBtn = document.getElementById("search-btn");
  
    const realizarBusqueda = () => {
      const termino = searchInput.value;
      const platosBuscados = buscarPlatos(termino);
  
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      document.querySelector('.filter-btn[data-filter="all"]').classList.add("active");
  
      filtrarTarjetasPlatos(platosBuscados);
    };
  
    searchBtn.addEventListener("click", realizarBusqueda);
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        realizarBusqueda();
      }
    });
  
    if ("speechSynthesis" in window) {
      speechSynthesis = window.speechSynthesis;
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
          console.log("Voces cargadas:", speechSynthesis.getVoices().length);
        };
      }
      speechSynthesis.getVoices();
    }
  
    window.addEventListener("beforeunload", detenerReproduccion);
  }
  
  document.addEventListener("DOMContentLoaded", inicializarApp);