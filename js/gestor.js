class GestorTareas {
  constructor() {
    this.tareas = [];
    this.cargar(); 
  }

  agregarTarea(tarea) {
    this.tareas.push(tarea);
    this.guardar();
  }

  eliminarTarea(id) {
    this.tareas = this.tareas.filter(t => t.id !== id);
    this.guardar();
  }

  cambiarEstado(id) {
    const tarea = this.tareas.find(t => t.id === id);
    if (tarea) {
      tarea.cambiarEstado();
      this.guardar();
    }
  }

  obtenerTareas(filtro = "todas", busqueda = "") {
    let resultado = [...this.tareas];

    // Filtro
    if (filtro === "pendientes") {
      resultado = resultado.filter(t => !t.completada);
    } else if (filtro === "completadas") {
      resultado = resultado.filter(t => t.completada);
    }

    // Búsqueda
    if (busqueda.trim() !== "") {
      resultado = resultado.filter(t =>
        t.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Orden cronológico por fecha
    resultado.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    return resultado;
  }

  contarPendientes() {
    return this.tareas.filter(t => !t.completada).length;
  }

  contarCompletadas() {
    return this.tareas.filter(t => t.completada).length;
  }

  guardar() {
    localStorage.setItem("tareas", JSON.stringify(this.tareas));
  }

  cargar() {
    const datos = localStorage.getItem("tareas");
    if (datos) {
      const tareasParseadas = JSON.parse(datos);
      this.tareas = tareasParseadas.map(
        t => new Tarea(t.id, t.descripcion, t.fecha, t.completada)
      );
    }
  }
}