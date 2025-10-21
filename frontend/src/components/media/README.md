# Media Service System

## Descripción

El `MediaService` es un servicio singleton que gestiona la visualización de diferentes tipos de archivos en CloudMesa. Permite abrir archivos en visualizadores especializados según su extensión.

## Estructura

### MediaService (`src/services/MediaService.ts`)
- **Patrón Singleton**: Una sola instancia compartida
- **Mapa de extensiones**: Mapea extensiones de archivo a funciones de visualización
- **Sistema de eventos**: Comunica con los componentes React mediante eventos personalizados

### Componentes de Visualización (`src/components/media/`)

#### ImageViewer
- **Extensiones soportadas**: jpg, jpeg, png, gif, bmp, webp, svg, ico, tiff
- **Características**:
  - Zoom (25% - 500%)
  - Rotación (90° increments)
  - Descarga
  - Navegación por teclado (Esc, +/-, R)

#### VideoViewer
- **Extensiones soportadas**: mp4, avi, mkv, mov, wmv, flv, webm, 3gp
- **Características**:
  - Controles de reproducción
  - Barra de progreso
  - Control de volumen
  - Pantalla completa
  - Navegación por teclado (Espacio, M, F, R, flechas)

#### TextViewer
- **Extensiones soportadas**: txt, md, json, xml, html, css, js, ts, py, java, etc.
- **Características**:
  - Resaltado de sintaxis básico
  - Búsqueda en el archivo
  - Modo wrap/no-wrap
  - Copia del contenido
  - Navegación por teclado (Ctrl+F, Ctrl+C, Esc)

#### AudioViewer
- **Extensiones soportadas**: mp3, wav, flac, aac, ogg, wma, m4a
- **Características**:
  - Controles de reproducción completos
  - Barra de progreso con seek
  - Control de volumen
  - Velocidad de reproducción (0.5x - 2x)
  - Modo loop
  - Saltar adelante/atrás (10 segundos)
  - Reiniciar pista
  - Interfaz visual con gradientes
  - Navegación por teclado (Espacio, M, L, R, flechas)

#### PdfViewer
- **Extensiones soportadas**: pdf
- **Características**:
  - Navegación página por página
  - Zoom (25% - 300%)
  - Rotación (90° increments)
  - Entrada directa de número de página
  - Navegación por teclado (flechas, +/-, R)
  - **Requiere PDF.js**: `npm install pdfjs-dist` o CDN

#### OfficeViewer (COMPLETAMENTE REDISEÑADO)
- **Extensiones soportadas**: doc, docx, xls, xlsx, ppt, pptx, odt, ods, odp, rtf
- **Características**:
  - 📄 **Visualización directa en la aplicación** - No más descargas obligatorias
  - 🔓 **Desencriptación automática** como otros visualizadores de media
  - 🎨 **UI moderna tipo documento** con diseño de papel limpio
  - 🔍 **Búsqueda de texto completa** con resaltado en tiempo real
  - 🔎 **Controles de zoom** (50% - 200%) con CSS transforms optimizado
  - 📱 **Modo pantalla completa** para lectura sin distracciones
  - 📚 **Parsing inteligente** con soporte para librerías externas:
    - **mammoth.js**: Renderizado completo de documentos Word (.docx)
    - **xlsx**: Soporte completo para hojas de cálculo (.xlsx, .xls)  
    - **Fallback inteligente**: Contenido simulado cuando las librerías no están disponibles
  - 📊 **Información de hojas de cálculo** con detalles de múltiples pestañas
  - ⚡ **Detección automática** de librerías instaladas
  - 🎯 **Experiencia consistente** con el resto del sistema de media
  - ⌨️ **Controles de teclado** completos (Ctrl+F, +/-, F11, Esc)

**Librerías Opcionales para Parsing Completo**:
- `mammoth.js` para documentos Word con formato completo
- `xlsx` para hojas de cálculo con datos reales
- Sin librerías: Muestra contenido simulado estructurado

**Controles de Teclado**:
- Ctrl+F: Buscar en documento
- +/-: Zoom in/out  
- F11: Pantalla completa
- Esc: Cerrar visor o búsqueda

#### MediaViewerManager
- Componente principal que gestiona todos los visualizadores
- Escucha eventos del MediaService y abre el visualizador apropiado

## Uso

### 1. Integración en FilesView

```typescript
import { mediaService } from '../../services/MediaService';
import MediaViewerManager from '../media/MediaViewerManager';

if (item.type === 'folder') {
  navigateToFolder(item._id);
} else {
  mediaService.showContent(item);
}

return (
  <div>
    <MediaViewerManager />
  </div>
);
```

### 2. Verificar si un archivo es visualizable

```typescript
const isViewable = mediaService.isViewable('jpg'); // true
const extensions = mediaService.getSupportedExtensions();
```

### 3. Añadir nuevos tipos de archivo

```typescript
// En MediaService.ts, añadir al mapa mediaHandlers:
private mediaHandlers: Record<string, MediaViewerFunction> = {
  // ...extensiones existentes
  'nuevaExtension': this.showNuevoViewer,
};

// Añadir método de manejo
private async showNuevoViewer(item: Item): Promise<void> {
  this.dispatchMediaEvent('nuevo-viewer-open', item);
}
```

### 4. Crear nuevo visualizador

```typescript
// Crear NuevoViewer.tsx
interface NuevoViewerProps {
  item: Item;
  isOpen: boolean;
  onClose: () => void;
}

// Añadir al MediaViewerManager
const handleNuevoViewer = (event: CustomEvent) => {
  setMediaState({
    currentItem: event.detail.item,
    viewerType: 'nuevo'
  });
};

mediaService.addEventListener('nuevo-viewer-open', handleNuevoViewer);
```

## Arquitectura del Sistema

```
FilesView (click en archivo)
    ↓
MediaService.showContent(item)
    ↓
mediaHandlers[extension](item)
    ↓
dispatchMediaEvent(type, item)
    ↓
MediaViewerManager (escucha evento)
    ↓
Abre el visualizador apropiado
    ↓
[ImageViewer|VideoViewer|TextViewer|etc.]
```

## Extensiones Soportadas

### Imágenes
- jpg, jpeg, png, gif, bmp, webp, svg, ico, tiff

### Videos  
- mp4, avi, mkv, mov, wmv, flv, webm, 3gp

### Audio
- mp3, wav, flac, aac, ogg, wma, m4a

### Documentos
- pdf

### Texto/Código
- txt, md, json, xml, html, css
- js, jsx, ts, tsx, py, java, cpp, c, cs, php, rb, go, rs, swift, kt, dart
- yaml, yml, toml, ini, env, log, sql
- sh, bash, bat, ps1

### Office
- doc, docx, xls, xlsx, ppt, pptx, odt, ods, odp, rtf

## Fallback

Para archivos no soportados, el sistema automáticamente iniciará la descarga del archivo.

## Seguridad

- Todos los archivos se descargan y descifran usando la clave privada del usuario
- Los archivos se muestran como Blobs en memoria, no se guardan en disco
- El acceso está protegido por el sistema de autenticación existente

## Controles de Teclado

### Globales
- **Esc**: Cerrar visualizador

### ImageViewer
- **+/=**: Zoom in
- **-**: Zoom out  
- **R**: Rotar 90°

### VideoViewer
- **Espacio**: Play/Pause
- **M**: Mute/Unmute
- **F**: Pantalla completa
- **R**: Reiniciar
- **← →**: Saltar 10s

### TextViewer
- **Ctrl+F**: Buscar
- **Ctrl+C**: Copiar contenido

### AudioViewer
- **Espacio**: Play/Pause
- **M**: Mute/Unmute
- **L**: Loop on/off
- **R**: Reiniciar pista
- **← →**: Saltar 10s atrás/adelante
- **↑ ↓**: Subir/bajar volumen

### PdfViewer
- **← →**: Página anterior/siguiente
- **+/-**: Zoom in/out
- **R**: Rotar página
- **Home/End**: Primera/última página

### OfficeViewer
- **Ctrl+F**: Buscar en documento
- **+/-**: Zoom in/out
- **F11**: Pantalla completa
- **Esc**: Cerrar visor o búsqueda
