# OCR Demo con Tesseract.js

Este proyecto es una aplicación web interactiva desarrollada con React y Next.js que permite capturar imágenes directamente desde la cámara del dispositivo y extraer texto desde ellas utilizando [Tesseract.js](https://github.com/naptha/tesseract.js), una biblioteca OCR (Reconocimiento Óptico de Caracteres).

## Funcionalidades principales

1. **Acceso a la cámara:** Solicita permisos para acceder a la cámara y muestra el feed en tiempo real.
2. **Captura de fotos:** Permite tomar una foto del video en vivo.
3. **Reintento de captura:** Opción para tomar otra foto si la anterior no es adecuada.
4. **Lectura de texto (OCR):** Usa Tesseract.js para extraer texto de la imagen capturada.
5. **Gestión de permisos:** Maneja errores cuando no se otorgan permisos para la cámara.
6. **Detención de la cámara:** Optimiza recursos al detener la cámara tras la captura.

## Tecnologías utilizadas

- **React Hooks** (`useRef`, `useState`, `useEffect`)
- **Tailwind CSS**
- **Next.js**
- **Tesseract.js**

Este proyecto es ideal para demostrar la integración de OCR en aplicaciones web y puede servir como base para aplicaciones más avanzadas, como escaneo de documentos o validación de datos.

---

## Cómo empezar

### Requisitos previos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) en tu sistema.

### Instalación

Primero, clona este repositorio e instala las dependencias:

```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
npm install
