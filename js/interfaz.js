class Interfaz {
  constructor(gestor) {
    this.gestor = gestor;

    this.listaTareas = document.getElementById("lista-tareas");
    this.contadorPendientes = document.getElementById("contador-pendientes");
    this.contadorCompletadas = document.getElementById("contador-completadas");
    this.formulario = document.getElementById("formulario-tarea");
    this.descripcion = document.getElementById("descripcion");
    this.fecha = document.getElementById("fecha");
    this.buscador = document.getElementById("buscador");
    this.filtro = document.getElementById("filtro");

    this.conectarEventos();

    this.mostrarTareas();
  }

  conectarEventos() {
    this.formulario.addEventListener("submit", (e) => {
      e.preventDefault();
      const texto = this.descripcion.value.trim();
      const fecha = this.fecha.value;

      if (texto === "" || fecha === "") return;

      const id = Date.now(); 
      const nuevaTarea = new Tarea(id, texto, fecha);

      this.gestor.agregarTarea(nuevaTarea);
      this.formulario.reset();
      this.mostrarTareas();
    });

    this.filtro.addEventListener("change", () => {
      this.mostrarTareas();
    });

    this.buscador.addEventListener("input", () => {
      this.mostrarTareas();
    });
  }

  mostrarTareas() {
    this.listaTareas.innerHTML = "";

    const filtro = this.filtro.value;
    const busqueda = this.buscador.value;
    const tareas = this.gestor.obtenerTareas(filtro, busqueda);

    tareas.forEach((tarea) => {
      const li = document.createElement("li");
      if (tarea.completada) {
        li.classList.add("completada");
      }

      const spanDescripcion = document.createElement("span");
      spanDescripcion.textContent = `${tarea.descripcion} (📅 ${tarea.fecha})`;
      spanDescripcion.classList.add("descripcion");

      const botonEstado = document.createElement("button");
      botonEstado.textContent = tarea.completada ? "Desmarcar" : "Completar";
      botonEstado.classList.add("boton-estado");
      botonEstado.addEventListener("click", () => {
        this.gestor.cambiarEstado(tarea.id);
        this.mostrarTareas();
      });

      const botonEliminar = document.createElement("button");
      botonEliminar.textContent = "Eliminar";
      botonEliminar.classList.add("boton-eliminar");
      botonEliminar.addEventListener("click", () => {
        this.gestor.eliminarTarea(tarea.id);
        this.mostrarTareas();
      });

      li.appendChild(spanDescripcion);
      li.appendChild(botonEstado);
      li.appendChild(botonEliminar);

      this.listaTareas.appendChild(li);
    });

    this.actualizarContadores();
  }

  actualizarContadores() {
    this.contadorPendientes.textContent = this.gestor.contarPendientes();
    this.contadorCompletadas.textContent = this.gestor.contarCompletadas();
  }
}
