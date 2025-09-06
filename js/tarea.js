class Tarea {
  constructor(id, descripcion, fecha, completada = false) {
    this.id = id;                  
    this.descripcion = descripcion;
    this.fecha = fecha;            
    this.completada = completada;  
  }

  cambiarEstado() {
    this.completada = !this.completada;
  }
}