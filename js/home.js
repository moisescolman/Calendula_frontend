// js/script.js
document.addEventListener('DOMContentLoaded', () => {
  const botonHamburguesa = document.querySelector('.boton-hamburguesa');
  const navMovil = document.querySelector('.nav-movil');

  botonHamburguesa.addEventListener('click', () => {
    navMovil.classList.toggle('oculta');
  });
});
