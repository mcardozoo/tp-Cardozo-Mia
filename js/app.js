const API_URL = "https://rickandmortyapi.com/api/episode";

const formulario = document.querySelector("#formulario-busqueda");
const campoNombre = document.querySelector("#nombre");
const campoTemporada = document.querySelector("#temporada");
const botonBuscar = document.querySelector("#boton-buscar");
const mensaje = document.querySelector("#mensaje");
const resultados = document.querySelector("#resultados");
const contador = document.querySelector("#contador");
const CLAVE_ALMACENAMIENTO = "ultimaBusquedaEpisodios";

const mostrarMensaje = (texto, tipo = "") => {
  mensaje.textContent = texto;
  mensaje.className = "mensaje";
  if (tipo) mensaje.classList.add(tipo);
};

const limpiarResultados = () => {
  resultados.replaceChildren();
  contador.textContent = "";
};

const obtenerDato = (dato) => {
  if (dato === "" || dato === null || dato === undefined || dato === "unknown") {
    return "Desconocido";
  }
  return dato;
};

const crearTarjeta = (episodio) => {
  const tarjeta = document.createElement("article");
  tarjeta.classList.add("tarjeta");

  const etiqueta = document.createElement("span");
  etiqueta.classList.add("etiqueta");
  etiqueta.textContent = obtenerDato(episodio.episode);

  const titulo = document.createElement("h3");
  titulo.textContent = obtenerDato(episodio.name);

  const fecha = document.createElement("p");
  fecha.textContent = `Fecha de emisión: ${obtenerDato(episodio.air_date)}`;

  const personajes = document.createElement("p");
  personajes.textContent = `Cantidad de personajes: ${episodio.characters.length}`;

  tarjeta.append(etiqueta, titulo, fecha, personajes);
  return tarjeta;
};

const mostrarEpisodios = (lista) => {
  const tarjetas = lista.map((episodio) => crearTarjeta(episodio));
  resultados.replaceChildren(...tarjetas);
  contador.textContent = `${lista.length} episodio(s) encontrado(s)`;
};

const guardarBusqueda = (nombre, temporada) => {
  localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify({ nombre, temporada }));
};

const obtenerEpisodios = async (nombre, temporada) => {
  const url = new URL(API_URL);
  if (nombre.trim() !== "") url.searchParams.set("name", nombre.trim());
  if (temporada !== "") url.searchParams.set("episode", temporada);

  const respuesta = await fetch(url);
  if (respuesta.status === 404) return [];
  if (!respuesta.ok) throw new Error(`Error del servidor: ${respuesta.status}`);

  const datos = await respuesta.json();
  return datos.results;
};

const buscarEpisodios = async (nombre, temporada) => {
  if (nombre.trim() === "" && temporada === "") {
    limpiarResultados();
    mostrarMensaje("Escribí un nombre o elegí una temporada antes de buscar.", "error");
    return;
  }

  botonBuscar.disabled = true;
  botonBuscar.textContent = "Buscando...";
  mostrarMensaje("Buscando episodios...");
  limpiarResultados();

  try {
    guardarBusqueda(nombre, temporada);
    const episodios = await obtenerEpisodios(nombre, temporada);
    if (episodios.length === 0) {
      mostrarMensaje("No se encontraron episodios con esos criterios.", "error");
      return;
    }
    mostrarEpisodios(episodios);
    mostrarMensaje("Búsqueda completada.", "exito");
  } catch (error) {
    mostrarMensaje("No se pudo conectar con la API. Revisá tu conexión e intentá nuevamente.", "error");
    console.error("Error al buscar episodios:", error);
  } finally {
    botonBuscar.disabled = false;
    botonBuscar.textContent = "Buscar episodios";
  }
};

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  buscarEpisodios(campoNombre.value, campoTemporada.value);
});

const restaurarBusqueda = () => {
  const guardada = localStorage.getItem(CLAVE_ALMACENAMIENTO);
  if (!guardada) return;

  try {
    const busqueda = JSON.parse(guardada);
    campoNombre.value = busqueda.nombre || "";
    campoTemporada.value = busqueda.temporada || "";
    if (campoNombre.value.trim() !== "" || campoTemporada.value !== "") {
      buscarEpisodios(campoNombre.value, campoTemporada.value);
    }
  } catch (error) {
    localStorage.removeItem(CLAVE_ALMACENAMIENTO);
    console.error("No se pudo recuperar la búsqueda guardada:", error);
  }
};

restaurarBusqueda();
