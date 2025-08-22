# Todo List


Primero de todo, comprobar clases de backend con frontend

## Pending Tasks
- [ ] Probar la subida de Files desde el frontend
        Comprobar que se genera:
            - la clave simetrica
            - calve de secreto compartido con cifrado con clave publica y secreta ephimera
            - cifrado de la clave simetrica con la clave del Secreto Compartido y el Nonce
        Comrpobar que el FILE se cifra correctamente con la clave simetrica
        Comrpobar que el Item se cifra correctamente la clase EncryptedMetadata con la clave simetrica
        Guardar en la BD este item cifrado
        Guardar en el DiskStorage del serve el File cifrado en /<userId>/<itemId>(es el fichero)

- [ ] Cargar Items en el frontend
        - Se debe de devolver el archivo cifrado y el documento Item correspondiente
        - Se debe de descrifrar directamente en el front, descifrando con la clave privada(la debe de cargar el usuario en en navegador), la clave publica del secreto compartido y el nonce ( estas dos ultimas se obtienen de la BD)
        - Una vez descrifrado, se mostrara el contenido del fichero y sus datos
        - Cuando se carga un parentId en el folder, se debe de descifrar solo el Encrypted data del Item
        - Solo se obtendra el fichero cifrado del DiskStorage del server, cuando se indique su descarga.
            - En caso de descarga, se obtiene el fichero cifrado en el front, se descifra y se descarga.

## In Progress

## Completed Tasks

## Notes
- Use `- [ ]` for pending tasks
- Use `- [x]` for completed tasks