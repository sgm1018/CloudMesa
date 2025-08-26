# RightClickElementModal - Componente Genérico de Menú Contextual

El `RightClickElementModal` es un componente genérico que maneja los menús contextuales (click derecho) para diferentes tipos de elementos en la aplicación CloudMesa.

## Características

- **Genérico**: Funciona con archivos, contraseñas y carpetas
- **Configurable**: Permite definir acciones personalizadas
- **Automático**: Genera acciones por defecto según el tipo de contexto
- **Accesible**: Maneja el cierre con Escape y clicks fuera del área

## Uso Básico

```tsx
import RightClickElementModal from '../shared/RightClickElementModal';

<RightClickElementModal
  isOpen={menuOpen}
  position={mousePosition}
  item={selectedItem}
  onClose={handleCloseMenu}
  contextType="file" // "file" | "password" | "folder"
  onShare={handleShare}
  onDownload={handleDownload}
  onDelete={handleDelete}
/>
```

## Props Principales

### Obligatorias
- `isOpen`: boolean - Controla si el modal está visible
- `position`: {top: number, left: number} | null - Posición del menú
- `item`: Item | null - Elemento seleccionado
- `onClose`: () => void - Función para cerrar el menú
- `contextType`: "file" | "password" | "folder" - Tipo de contexto

### Handlers Opcionales (se usan según el contexto)
- `onShare`: (item: Item) => void - Compartir elemento
- `onDownload`: (item: Item) => void - Descargar archivo
- `onEdit`: (item: Item) => void - Editar elemento
- `onDelete`: (item: Item) => void - Eliminar elemento
- `onRename`: (item: Item) => void - Renombrar elemento
- `onCopyUsername`: (item: Item) => void - Copiar usuario (solo passwords)
- `onCopyPassword`: (item: Item) => void - Copiar contraseña (solo passwords)
- `onVisitWebsite`: (item: Item) => void - Visitar sitio web (solo passwords)

## Acciones por Defecto por Contexto

### Archivos (`contextType="file"`)
- Download (si `onDownload` está definido)
- View Details (si `onViewDetails` está definido)
- Share (si `onShare` está definido)
- Rename (si `onRename` está definido)
- Delete (si `onDelete` está definido)

### Contraseñas (`contextType="password"`)
- Copy Username (si `onCopyUsername` está definido y el item tiene username)
- Copy Password (si `onCopyPassword` está definido y el item tiene password)
- Visit Website (si `onVisitWebsite` está definido y el item tiene URL)
- [Divisor]
- Share (si `onShare` está definido)
- Edit (si `onEdit` está definido)
- Delete (si `onDelete` está definido)

### Carpetas (`contextType="folder"`)
- Properties (si `onViewDetails` está definido)
- Share (si `onShare` está definido)
- Rename (si `onRename` está definido)
- Delete (si `onDelete` está definido)

## Acciones Personalizadas

También puedes pasar acciones completamente personalizadas usando la prop `actions`:

```tsx
const customActions = [
  {
    id: 'custom-action',
    label: 'Acción Personalizada',
    icon: <CustomIcon className="h-4 w-4 mr-2" />,
    onClick: (item) => handleCustomAction(item),
    className: 'text-blue-600',
    condition: (item) => item.type === 'special',
    dividerAfter: true
  }
];

<RightClickElementModal
  // ... otras props
  actions={customActions}
/>
```

## Integración con Componentes Existentes

El componente ya está integrado en:
- `FileGrid.tsx` - Para elementos de archivos
- `PasswordGrid.tsx` - Para elementos de contraseñas

Para integrar en otros componentes (como `FileList` o `PasswordList`):

1. Importar el componente
2. Agregar el estado para posición y elemento actual
3. Implementar el handler de click derecho
4. Agregar los handlers para las acciones
5. Reemplazar el menú contextual existente

## Ejemplo Completo

Ver `FileGrid.tsx` o `PasswordGrid.tsx` como ejemplos de implementación completa.
