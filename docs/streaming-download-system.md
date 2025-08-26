# Sistema de Descarga Streaming - CloudMesa

## Descripción General

Este sistema implementa una solución moderna de descarga de archivos con streaming, progreso en tiempo real, cancelación y soporte para las últimas APIs del navegador.

## Arquitectura

### Backend (NestJS)
- **StreamingDownloadService**: Servicio principal para streaming de archivos
- **Endpoint**: `GET /items/:id/download` - Descarga streaming con soporte Range requests
- **Endpoint**: `GET /items/:id/metadata` - Obtiene metadatos sin descargar

### Frontend (React/TypeScript)
- **StreamingDownloadService**: Servicio de descarga con streams modernos
- **ItemService**: Integración con cifrado y descarga
- **useStreamingDownload**: Hook personalizado para React
- **Componentes**: SimpleDownloadButton, StreamingDownloadComponent

## Características Principales

### ✅ Streaming Real
- Uso de ReadableStream y TransformStream
- Buffer optimizado (64KB chunks)
- Sin cargar todo el archivo en memoria

### ✅ Progreso en Tiempo Real
- Seguimiento de bytes descargados
- Porcentaje de progreso
- Información de velocidad

### ✅ Cancelación
- AbortController para cancelar descargas
- Cleanup automático de recursos
- Manejo de estados de cancelación

### ✅ APIs Modernas del Navegador
- File System Access API (Chrome 86+)
- Fallback automático a método tradicional
- Detección de capacidades del navegador

### ✅ Manejo de Errores
- Retry automático configurable
- Manejo de errores de red
- Validación de estados

### ✅ Range Requests (HTTP 206)
- Soporte para pausar/reanudar (backend)
- Descarga parcial de archivos
- Optimización de bandwidth

## Uso Básico

### 1. Botón de Descarga Simple

```tsx
import { SimpleDownloadButton } from './components/files/SimpleDownloadButton';

<SimpleDownloadButton
  item={fileItem}
  privateKey={userPrivateKey}
  onSuccess={() => console.log('Download completed!')}
>
  Download File
</SimpleDownloadButton>
```

### 2. Hook Personalizado

```tsx
import { useStreamingDownload } from './hooks/useStreamingDownload';

const MyComponent = () => {
  const {
    isDownloading,
    downloadProgress,
    downloadAdvanced,
    cancelDownload,
    capabilities
  } = useStreamingDownload({
    onComplete: () => alert('Done!'),
    autoRetry: true,
    maxRetries: 3
  });

  const handleDownload = () => {
    downloadAdvanced(item, privateKey, 'custom-name.pdf');
  };

  return (
    <div>
      <button onClick={handleDownload} disabled={isDownloading}>
        {isDownloading ? 'Downloading...' : 'Download'}
      </button>
      
      {isDownloading && (
        <button onClick={cancelDownload}>Cancel</button>
      )}
      
      {downloadProgress && (
        <progress value={downloadProgress.percentage} max="100" />
      )}
    </div>
  );
};
```

### 3. Componente Completo

```tsx
import { StreamingDownloadComponent } from './components/files/StreamingDownloadComponent';

<StreamingDownloadComponent
  item={fileItem}
  privateKey={userPrivateKey}
  onDownloadComplete={() => console.log('Download finished')}
  onError={(error) => console.error('Download failed:', error)}
/>
```

### 4. Descarga Programática

```tsx
import { itemService } from './services/ItemService';

// Descarga simple con progreso
await itemService.downloadItem(item, privateKey, (progress) => {
  console.log(`${progress.percentage}% downloaded`);
});

// Descarga avanzada con cancelación
const abortController = new AbortController();

await itemService.downloadItemAdvanced(item, privateKey, {
  onProgress: (progress) => updateProgressBar(progress),
  onDecryptProgress: (stage) => showStatus(stage),
  signal: abortController.signal,
  suggestedName: 'my-file.pdf'
});

// Cancelar descarga
abortController.abort();
```

## Configuración del Backend

### 1. Agregar al módulo

```typescript
// item.module.ts
import { StreamingDownloadService } from './services/streaming-download.service';

@Module({
  providers: [ItemsService, StreamingDownloadService],
  // ...
})
```

### 2. Inyectar en el controlador

```typescript
// item.controller.ts
constructor(
  private readonly streamingDownloadService: StreamingDownloadService
) {}

@Get(':id/download')
async downloadFileStream(
  @User() user: UserDecoratorClass,
  @Param('id') itemId: string,
  @Req() request: Request,
  @Res() response: Response
): Promise<void> {
  await this.streamingDownloadService.downloadFileStreamWithRange(
    user.userId,
    itemId,
    response,
    request.headers.range
  );
}
```

## Capacidades del Navegador

El sistema detecta automáticamente las capacidades:

```typescript
const capabilities = itemService.getDownloadCapabilities();

// Verificar soporte
if (capabilities.supportsStreaming) {
  // Usar streaming download
} else {
  // Fallback a descarga tradicional
}

if (capabilities.supportsFileSystemAccess) {
  // Permitir al usuario elegir ubicación de descarga
}

if (capabilities.supportsCancellation) {
  // Mostrar botón de cancelar
}
```

## Mejores Prácticas

### 1. Manejo de Memoria
- El sistema usa streams para evitar cargar archivos grandes en memoria
- Los buffers se liberan automáticamente
- Cleanup de URLs de blob tras descarga

### 2. UX Optimizada
- Progreso visual durante descarga y descifrado
- Mensajes descriptivos de estado
- Posibilidad de cancelar operaciones largas

### 3. Compatibilidad
- Detección automática de capacidades del navegador
- Fallbacks para navegadores antiguos
- Graceful degradation

### 4. Seguridad
- Validación de permisos en backend
- Descifrado en el cliente
- Cleanup de datos temporales

## Ejemplo de Flujo Completo

```typescript
// 1. Verificar capacidades
const capabilities = itemService.getDownloadCapabilities();
console.log('Browser supports streaming:', capabilities.supportsStreaming);

// 2. Iniciar descarga
const download = useStreamingDownload({
  onComplete: () => console.log('Success!'),
  onError: (error) => console.error('Failed:', error),
  autoRetry: true
});

// 3. Ejecutar descarga
await download.downloadAdvanced(item, privateKey);

// 4. Durante la descarga se ejecutan los callbacks:
// - onProgress: actualiza barra de progreso
// - onDecryptProgress: muestra etapa actual
// - La descarga puede cancelarse en cualquier momento

// 5. Al completar:
// - Se limpia el estado
// - Se ejecuta onComplete
// - El archivo se descarga automáticamente
```

## Debugging

### Logs del Backend
```bash
# Ver logs de descarga
tail -f logs/streaming-download.log
```

### Console del Frontend
```javascript
// Activar logs detallados
localStorage.setItem('debug-downloads', 'true');

// Ver descargas activas
console.log(streamingDownloadService.getActiveDownloads());

// Cancelar todas las descargas
streamingDownloadService.cancelAllDownloads();
```

## Solución de Problemas

### Error: "Stream not supported"
- Navegador muy antiguo
- Usar descarga tradicional como fallback

### Error: "Download cancelled"
- Usuario canceló o conexión perdida
- Implementar retry automático

### Error: "File not found"
- Verificar permisos en backend
- Comprobar que el archivo existe en disco

### Descarga muy lenta
- Verificar tamaño del buffer (64KB por defecto)
- Comprobar conexión de red
- Considerar usar Range requests para archivos grandes

## Dependencias

### Backend
- `@nestjs/common`
- `express`
- `fs` (Node.js built-in)
- `stream` (Node.js built-in)

### Frontend
- `React`
- `TypeScript`
- APIs modernas del navegador:
  - `ReadableStream`
  - `TransformStream` 
  - `AbortController`
  - `File System Access API` (opcional)

Este sistema proporciona una experiencia de descarga moderna, eficiente y user-friendly que aprovecha las últimas tecnologías web disponibles.
