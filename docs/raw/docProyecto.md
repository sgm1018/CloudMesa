# Documentación del Proyecto CloudMesa

## 1. Introducción

CloudMesa es un servicio de almacenamiento en la nube diseñado para ofrecer una solución segura y privada para la gestión de archivos y contraseñas. Este proyecto implementa tecnologías de cifrado de extremo a extremo (E2E), zero knowledge y zero trust, asegurando que los datos de los usuarios permanezcan confidenciales y accesibles únicamente por los propietarios o aquellos con permisos explícitos. Esta documentación tiene como objetivo proporcionar una guía técnica y estructural para el desarrollo del proyecto, detallando su arquitectura, procesos operativos y consideraciones clave antes de iniciar su construcción.

## 2. Objetivos del Sistema

- **Seguridad:** Garantizar la protección de archivos y contraseñas mediante cifrado E2E.
- **Privacidad:** Asegurar que el servidor no tenga conocimiento ni acceso a los datos en claro (zero knowledge).
- **Confianza mínima:** Operar bajo un modelo de zero trust, sin depender de la infraestructura del servidor para la seguridad.
- **Compartición segura:** Permitir a los usuarios compartir archivos y contraseñas manteniendo el cifrado E2E.
- **Control de acceso:** Facilitar permisos granulares y revocación de acceso a datos compartidos.
- **Usabilidad:** Ofrecer una experiencia de usuario intuitiva y funcional para la gestión de archivos y contraseñas.

## 3. Arquitectura del Sistema

### 3.1 Componentes Principales

- **Cliente (Frontend - Angular):**
    - Generación y gestión de claves asimétricas (pública y privada).
    - Ejecución de operaciones de cifrado y descifrado localmente.
    - Interfaz de usuario para la interacción con el sistema.
- **Servidor (Backend - NestJS):**
    - Almacenamiento de datos cifrados y metadatos.
    - Gestión de autenticación y distribución de claves públicas.
    - Facilitación de la compartición entre usuarios.
- **Base de Datos (MongoDB):**
    - Almacenamiento de metadatos de usuarios, archivos y contraseñas.
- **Caché (Redis):**
    - Optimización del rendimiento mediante almacenamiento temporal de datos frecuentes.

### 3.2 Tecnologías

- **Backend:** NestJS (1 contenedor).
- **Frontend:** Angular (1 contenedor).
- **Base de Datos:** MongoDB (1 contenedor).
- **Caché:** Redis (1 contenedor).
- **Despliegue:** Docker con Docker Compose.

Despliegue con un solo comando => docker compose up -d

### 3.3 Entorno

- **Desarrollo:** Uso de un archivo .env en cada aplicación para configurar variables de entorno.
- **Producción:** Las variables de entorno se pasarán a través del archivo docker-compose.yml como parte del sistema operativo de los contenedores Linux.

## 4. Core del Proyecto

### 4.1 Autenticación de Usuario

- **Registro:**
    - Al registrarse, el cliente genera un par de claves asimétricas (KP: clave pública, KR: clave privada).
    - La clave pública (KP) se envía al servidor para su almacenamiento.
    - La clave privada (KR) debe ser almacenada de forma segura por el usuario y nunca se comparte con el servidor.
- **Seguridad:** Todas las operaciones de cifrado y descifrado se realizan en el cliente, garantizando que el servidor no tenga acceso a los datos en claro.

### 4.2 Cifrado y Almacenamiento

- **Proceso:**
    - Cada archivo o contraseña se cifra con una clave simétrica aleatoria (KC) utilizando AES-256-GCM.
    - KC se cifra con la clave pública del usuario (KP), generando una "envoltura" (KCA).
    - El servidor almacena el contenido cifrado, KCA y un vector de inicialización (IV).
- **Zero Knowledge:** El servidor no conoce el contenido ni la clave KC en claro.

### 4.3 Compartición

- **Mecanismo:**
    - El usuario A desea compartir con el usuario B.
    - A descarga KCA y lo descifra con su clave privada (KRA) para obtener KC.
    - El servidor proporciona la clave pública de B (KPB).
    - A cifra KC con KPB, creando KCB, y lo sube al servidor.
- **Resultado:** Tanto A como B tienen acceso al contenido mediante sus respectivas envolturas (KCA y KCB).
- **Permisos:** Se asignan permisos de lectura y/o escritura al compartir.

### 4.4 Revocación de Acceso

- **Proceso:** El usuario A solicita al servidor eliminar KCB, lo que impide que B acceda al contenido.

## 5. Utilidades del Proyecto

### 5.1 Buscador

- Permite buscar archivos, carpetas, contraseñas y grupos de contraseñas por nombre o metadatos cifrados.

### 5.2 Ficheros

- Crear carpetas.
- Subir archivos.
- Compartir directorios o archivos con permisos específicos.
- Denegar acceso a usuarios previamente autorizados.
- Selección múltiple para operaciones masivas.
- Eliminar carpetas y archivos.
- Modificar rutas de archivos o directorios.
- Arrastrar y soltar para reorganizar rutas.

### 5.3 Contraseñas

- Crear grupos de contraseñas (similares a carpetas).
- Generar contraseñas automáticamente de forma aleatoria.
- Crear contraseñas manualmente.
- Denegar acceso a usuarios compartidos.
- Compartir contraseñas o grupos con permisos.
- Selección múltiple para operaciones masivas.
- Eliminar contraseñas o grupos.
- Modificar rutas de contraseñas o grupos.
- Arrastrar y soltar para reorganizar rutas.

## 6. Sistema de Cifrado de Extremo a Extremo con Zero Knowledge

### 6.1 Tipos de Cifrado

- **Simétrico:** AES-256-GCM para cifrar contenido.
- **Asimétrico:** RSA-4096 o ECC para cifrar KC.
- **Cifrado Sobre:** KC cifra el contenido, y KC se cifra con KP.

### 6.2 Conceptos Clave

- **KP (Clave Pública):** Usada para cifrar, compartida con el servidor.
- **KR (Clave Privada):** Usada para descifrar, almacenada solo por el usuario.
- **KC (Clave de Contenido):** Clave simétrica aleatoria para cifrar archivos o contraseñas.
- **KCX:** KC cifrada con la clave pública de un usuario X (ej. KCA, KCB).
- **IV (Vector de Inicialización):** Valor aleatorio para asegurar unicidad en el cifrado AES.

### 6.3 Procesos Operativos

### 6.3.1 Creación y Cifrado Inicial

- Generar KC y cifrar el contenido con AES-256-GCM y un IV.
- Cifrar KC con KP, creando KCA.
- Subir al servidor: contenido cifrado, KCA e IV.

### 6.3.2 Compartición

- Obtener KPB del servidor.
- Descifrar KCA con KRA para obtener KC.
- Cifrar KC con KPB, creando KCB.
- Subir KCB al servidor.

### 6.3.3 Acceso

- Descargar contenido cifrado, KCX (ej. KCB) e IV.
- Descifrar KCX con KR para obtener KC.
- Descifrar el contenido con KC e IV.

### 6.3.4 Revocación

- Eliminar KCX del servidor para revocar acceso.

## 7. Estructura de Almacenamiento

### 7.1 Modelo de Datos en el Servidor

- **Usuarios:** ID, nombre, clave pública (KP).
- **Archivos:** ID, nombre cifrado, contenido cifrado, IV, envolturas (KCA, KCB, etc.).
- **Contraseñas:** ID, nombre cifrado, contenido cifrado, IV, envolturas.
- **Carpetas/Grupos:** ID, nombre cifrado, referencias a archivos o contraseñas.

### 7.2 Almacenamiento en el Cliente

- Par de claves asimétricas (KP/KR).
- Caché temporal de KC para acceso reciente.

## 8. Consideraciones de Implementación

### 8.1 Algoritmos

- **Cifrado Simétrico:** AES-256-GCM.
- **Cifrado Asimétrico:** RSA-4096 o ECC.
- **Hash:** SHA-256 para integridad.

### 8.2 Gestión de Claves

- Proteger KR con contraseñas o biometría.
- Implementar recuperación con Shamir's Secret Sharing (SSS).
- Rotar claves periódicamente.

### 8.3 Seguridad

- Usar TLS para comunicaciones.
- Verificar claves públicas contra ataques Man-in-the-Middle.
- Firmar digitalmente los archivos para autenticidad.

## 9. Ventajas

- Privacidad total gracias a zero knowledge.
- Compartición segura con E2E.
- Flexibilidad en permisos y revocación.
- Seguridad incluso si el servidor es comprometido.

## 10. Limitaciones

- Impacto en rendimiento por cifrado.
- Pérdida de KR implica pérdida de datos.
- Complejidad en la gestión de claves.

## 11. Conclusión

CloudMesa ofrece una solución robusta y segura para el almacenamiento y compartición de archivos y contraseñas. Su diseño basado en cifrado E2E, zero knowledge y zero trust asegura la privacidad y control total del usuario sobre sus datos, sirviendo como una guía técnica sólida para su implementación.

```tsx

// DTOs
export interface EntityDto {
  id: string;
  dateCreation: Date;
  dateUpdate: Date;
  userCreator: string;
  userUpdater: string;
}

export interface UserDto extends EntityDto {
  name: string;
  surname: string;
  email: string;
  passwordHash: Uint8Array;
  passwordSalt: Uint8Array;
  avatar?: string;
}

export interface ItemDto extends EntityDto {
  name: string;
  type: 'file' | 'folder' | 'password' | 'group';
  size?: string;
  shared: boolean;
  owner: string;
  sharedWith?: SharedConfigDto[];
  parentId?: string;
  mimeType?: string;
  path: string;
  encryption: EncryptionDto;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
}

export interface SharedConfigDto {
  userId: string;
  permissions: PermissionDto;
  encryption: EncryptionDto;
}

export interface PermissionDto {
  readPermission: boolean;
  writePermission: boolean;
}

export interface EncryptionDto {
  key: string;
  iv: string;
}

export interface ShareSettings {
  id: string;
  fileId: string;
  type: 'public' | 'protected' | 'private';
  password?: string;
  expiresAt?: Date;
  allowedUsers?: string[];
  link?: string;
  permissions?: 'read' | 'write';
  notifyByEmail?: boolean;
}

export interface StorageQuota {
  used: number;
  total: number;
  unit: 'MB' | 'GB' | 'TB';
}

export interface SearchResult {
  type: 'password' | 'file' | 'folder' | 'password-group';
  item: ItemDto | PasswordEntry | PasswordGroup;
  matchScore: number;
  icon: string;
}

export interface FileOperation {
  type: 'move' | 'copy' | 'delete' | 'share';
  sourceIds: string[];
  targetId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface PasswordGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  sharedWith?: PasswordShare[];
}

export interface PasswordShare {
  userId: string;
  accessLevel: 'view' | 'edit';
  expiresAt?: Date;
  createdAt: Date;
  lastAccessed?: Date;
}

export interface PasswordEntry {
  id: string;
  groupId?: string;
  name: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastAccessed?: Date;
  ownerId: string;
  sharedWith?: PasswordShare[];
}

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

export interface ShareActivity {
  id: string;
  itemId: string;
  itemType: 'password' | 'group';
  action: 'shared' | 'unshared' | 'accessed';
  userId: string;
  targetUserId: string;
  timestamp: Date;
  details?: string;
}

export interface TabInfo {
  id: string;
  label: string;
  icon: string;
}

export interface SearchFilters {
  types: ('password' | 'file' | 'folder' | 'password-group')[];
  query: string;
  owner?: string;
  shared?: boolean;
}
Cambios principales:
```

```tsx
// DTOs base
export interface EntityDto {
  id: string;
  dateCreation: Date;
  dateUpdate: Date;
  userCreator: string;
  userUpdater: string;
}

export interface UserDto extends EntityDto {
  name: string;
  surname: string;
  email: string;
  passwordHash: Uint8Array;  // Solo almacena hash de la contraseña de autenticación
  passwordSalt: Uint8Array;
  avatar?: string;
  publicKey: string;  // Clave pública del usuario (KP)
}

// Información de cifrado mejorada
export interface EncryptionDto {
  iv: string;  // Vector de inicialización para AES-256-GCM
  algorithm: string;  // Por defecto "AES-256-GCM"
}

// Clave de contenido cifrada para un usuario específico
export interface EncryptionKeyDto {
  userId: string;
  encryptedKey: string;  // KC cifrada con la clave pública del usuario (KP)
}

// Metadatos cifrados
export interface EncryptedMetadataDto {
  name: string;  // Nombre cifrado en base64
  size?: string;  // Tamaño cifrado en base64
  mimeType?: string;  // Tipo MIME cifrado en base64
  path?: string;  // Ruta cifrada en base64
  notes?: string;  // Notas cifradas en base64
  username?: string;  // Nombre de usuario cifrado en base64
  password?: string;  // Contraseña cifrada en base64
  url?: string;  // URL cifrada en base64
  description?: string;  // Descripción cifrada en base64
  color?: string;  // Color cifrado en base64
  icon?: string;  // Icono cifrado en base64
}

// Referencia al almacenamiento físico del contenido cifrado
export interface StorageReferenceDto {
  path?: string;  // Ruta en el sistema de archivos o almacenamiento de objetos
  encryptedContent?: string;  // Contenido cifrado en base64 (para archivos pequeños)
}

export interface PermissionDto {
  read: boolean;
  write: boolean;
}

export interface SharedConfigDto {
  userId: string;
  permissions: PermissionDto;
  dateShared: Date;
  lastAccessed?: Date;
}

// DTO principal para ítems (archivos, carpetas, contraseñas, grupos)
export interface ItemDto extends EntityDto {
  type: 'file' | 'folder' | 'password' | 'group';
  
  // Metadatos básicos sin cifrar
  ownerId: string;
  parentId?: string;
  shared: boolean;
  encryptedMetadata: EncryptedMetadataDto;
  encryption: EncryptionDto;
  encryptionKeys: EncryptionKeyDto[];
  storageReference?: StorageReferenceDto;
  sharedWith?: SharedConfigDto[];
}

// DTOs específicos para la interfaz de usuario
export interface ShareSettings {
  id: string;
  fileId: string;
  type: 'public' | 'protected' | 'private';
  password?: string;
  expiresAt?: Date;
  allowedUsers?: string[];
  link?: string;
  permissions?: 'read' | 'write';
  notifyByEmail?: boolean;
}

export interface StorageQuota {
  used: number;
  total: number;
  unit: 'MB' | 'GB' | 'TB';
}

export interface SearchResult {
  type: 'password' | 'file' | 'folder' | 'password-group';
  item: ItemDto;
  matchScore: number;
  icon: string;
}

export interface FileOperation {
  id: string;
  type: 'move' | 'copy' | 'delete' | 'share';
  sourceIds: string[];
  targetId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  startTime: Date;
  endTime?: Date;
  userId: string;
}

// Interfaz para la generación de contraseñas
export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

// Registro de actividad de compartición
export interface ShareActivity {
  id: string;
  itemId: string;
  itemType: 'file' | 'folder' | 'password' | 'group';
  action: 'shared' | 'unshared' | 'accessed' | 'modified';
  userId: string;
  targetUserId: string;
  timestamp: Date;
  details?: string;
}

export interface TabInfo {
  id: string;
  label: string;
  icon: string;
}

export interface SearchFilters {
  types: ('password' | 'file' | 'folder' | 'password-group')[];
  query: string;
  owner?: string;
  shared?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}
```