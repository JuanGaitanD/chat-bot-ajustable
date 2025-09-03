# Chatcito-Jada 🤖

Una página web responsive para un chatbot inteligente con interfaz moderna y funcionalidad de configuración de contexto de IA.

## ✨ Características

### 🎨 Diseño
- **Interfaz moderna y responsive** con paleta de colores azules y neutros
- **Diseño armonioso** priorizando la experiencia visual
- **Animaciones suaves** y transiciones elegantes
- **Compatible con móviles** y tablets

### 💬 Funcionalidades del Chat
- **Chat interactivo** con indicador de escritura
- **Mensajes con avatares** diferenciados para usuario y bot
- **Auto-resize** del área de texto
- **Envío con Enter** (Shift+Enter para nueva línea)
- **Scroll automático** a nuevos mensajes
- **Timestamps** en cada mensaje

### ⚙️ Configuración de Contexto IA
- **Personalidad del asistente** - Define el tono y estilo de comunicación
- **Conocimiento específico** - Agrega información que el bot debe conocer
- **Instrucciones especiales** - Define comportamientos específicos
- **Ejemplos de respuestas** - Proporciona patrones de respuesta
- **Vista previa en tiempo real** del contexto configurado
- **Persistencia local** de la configuración

## 🚀 Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- No requiere servidor web - funciona completamente en el cliente

### Instalación
1. Clona o descarga este repositorio
2. Abre `index.html` en tu navegador
3. ¡Listo! El chatbot está funcionando

### Uso
1. **Navegación**: Usa los botones en el header para cambiar entre Chat y Contexto IA
2. **Chat**: Escribe mensajes y presiona Enter o el botón de enviar
3. **Configuración**: En la sección "Contexto IA", personaliza el comportamiento del bot
4. **Guardado**: Los cambios se guardan automáticamente en el navegador

## 📁 Estructura del Proyecto

```
chatbot_configurable/
├── index.html          # Página principal con Tailwind CSS
├── script.js           # Funcionalidad JavaScript
└── README.md           # Documentación
```

## 🎯 Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **Tailwind CSS** - Framework de utilidades CSS
- **JavaScript ES6+** - Funcionalidad interactiva
- **Font Awesome** - Iconos
- **Google Fonts** - Tipografía Inter

## 🎨 Paleta de Colores

- **Azul principal**: `#3498db` / `#2980b9`
- **Grises neutros**: `#2c3e50`, `#7f8c8d`, `#95a5a6`
- **Fondos**: `#f5f7fa`, `#f8f9fa`
- **Bordes**: `#e9ecef`

## 🔧 Personalización

### Modificar Colores
Edita las variables de color en la configuración de Tailwind en `index.html`:
```javascript
colors: {
    primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
    }
}
```

### Agregar Funcionalidades
El código está modularizado en la clase `ChatcitoJada` en `script.js`. Puedes:
- Integrar con APIs de IA reales
- Agregar más campos de contexto
- Implementar persistencia en servidor
- Agregar funcionalidades de archivos adjuntos

## 📱 Responsive Design

El diseño se adapta automáticamente a:
- **Desktop**: Layout completo con sidebar
- **Tablet**: Layout ajustado
- **Mobile**: Layout vertical optimizado

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**Chatcito-Jada** - Tu asistente inteligente personalizable. 🤖✨ 
