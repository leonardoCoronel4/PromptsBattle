const textarea = document.getElementById('resizable-textarea');

// Función para ajustar el tamaño del texto
function adjustTextSize() {
  const maxFontSize = 24; // Tamaño máximo del texto
  const minFontSize = 8;  // Tamaño mínimo del texto
  const maxHeight = 150;  // Alto máximo del textarea
  
  let fontSize = maxFontSize;
  
  // Reducir el tamaño de la fuente hasta que el texto se ajuste
  while (textarea.scrollHeight > textarea.clientHeight && fontSize > minFontSize) {
    fontSize -= 1;
    textarea.style.fontSize = fontSize + 'px';
  }
  
  // Ajustar el alto del textarea basado en el contenido
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
}

textarea.addEventListener('input', adjustTextSize);
adjustTextSize(); // Inicializar en la carga de la página
