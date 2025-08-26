# Métodos de Arreglos (Arrays) en JavaScript

Este tutorial resume los principales métodos de los arreglos en JavaScript: su concepto, cómo funcionan, ejemplos de uso frecuentes y comparativa con el enfoque tradicional (bucles for/while). Está pensado como referencia rápida y práctica.

## Checklist de lo que incluye este tutorial

- Conceptos básicos sobre Arrays
- Descripción y ejemplo de los métodos más usados (mutadores y no mutadores)
- Casos de uso frecuentes
- Ventajas y desventajas frente al enfoque tradicional (bucles)
- Buenas prácticas y advertencias

---

## 1. Conceptos básicos

- Un Array en JavaScript es una lista ordenada de valores (puede contener cualquier tipo). Internamente es un objeto con índices numéricos y la propiedad `length`.
- Los métodos de arreglo se dividen en: mutadores (modifican el arreglo original) y no mutadores (devuelven un nuevo arreglo o valor sin modificar el original).
- Muchos métodos reciben callbacks (funciones) que se ejecutan por elemento. Estos callbacks suelen recibir (elemento, índice, arreglo).

Ejemplo mínimo:

```js
const a = [1, 2, 3];
const b = a.map(x => x * 2); // [2,4,6] - map no muta `a`
```

---

## 2. Métodos comunes (con ejemplos)

### Mutadores (modifican el arreglo)

- push(...items): añade al final y devuelve la nueva length.
  - Uso: agregar elementos a una lista.
  - Ejemplo:

```js
const arr = [1,2];
arr.push(3); // arr = [1,2,3]
```

- pop(): elimina el último elemento y lo devuelve.

- unshift(...items): añade al inicio (cuidado: costoso en arrays grandes).

- shift(): elimina el primer elemento y lo devuelve.

- splice(start, deleteCount, ...items): elimina/insert y devuelve los elementos eliminados.
  - Muy flexible: puede insertar, reemplazar o borrar.

```js
const a = [1,2,3,4];
const removed = a.splice(1,2, 9, 10); // a = [1,9,10,4], removed = [2,3]
```

- fill(value, start?, end?): llena posiciones con un valor.

- reverse(): invierte el array in-place.

- sort([compareFn]): ordena in-place. Para números usar compareFn.

```js
[10,2,3].sort(); // ['10','2','3'] lexicográfico -> incorrecto para números
[10,2,3].sort((a,b) => a-b); // [2,3,10]
```

- copyWithin(target, start?, end?): copia parte del array dentro del mismo índice de destino (in-place).


### No mutadores (no cambian el original)

- map(fn): transforma cada elemento, devuelve nuevo array.
  - Uso: aplicar transformación y mantener inmutabilidad.

```js
const res = [1,2,3].map(x => x * 2); // [2,4,6]
```

- filter(fn): devuelve un nuevo array con elementos que cumplen la condición.

```js
const evens = [1,2,3,4].filter(x => x % 2 === 0); // [2,4]
```

- reduce(fn, initial): acumula valores en un solo resultado.
  - Muy usado para sumar, agrupar, transformar a objetos.

```js
const sum = [1,2,3].reduce((acc, x) => acc + x, 0); // 6
```

- forEach(fn): itera ejecutando `fn` por cada elemento. Devuelve `undefined`.
  - Útil para efectos secundarios (log, estado), no para transformar.

- find(fn): devuelve el primer elemento que cumpla la condición o `undefined`.

- findIndex(fn): devuelve índice del primer elemento que cumpla la condición o -1.

- some(fn): true si al menos un elemento cumple la condición.

- every(fn): true si todos los elementos cumplen la condición.

- includes(value): true si el valor está presente (usa ===).

- indexOf(value)/lastIndexOf(value): índices basados en ===.

- concat(...arraysOrValues): concatena y devuelve un nuevo array.

- slice(start?, end?): obtiene subarray (no muta).

- join(separator): concatena elementos a string.

- flat(depth) / flatMap(fn): aplanan subarrays.

- entries()/keys()/values(): iteradores para usar con for..of.

---

## 3. Funcionamiento y semántica del callback

- Map/Filter/Reduce y otros pasan al callback estos parámetros: (element, index, array).
- Si el callback modifica el array en curso, el comportamiento puede variar y causar inconsistencias: evitar mutar durante la iteración.
- Algunos métodos (como sort) esperan una función de comparación que devuelva <0, 0 o >0.

Ejemplo reduce para agrupar elementos:

```js
const users = [
  {id:1, role:'admin'},
  {id:2, role:'user'},
  {id:3, role:'user'}
];
const byRole = users.reduce((acc, u) => {
  (acc[u.role] = acc[u.role] || []).push(u);
  return acc;
}, {});
// { admin: [{...}], user: [{...},{...}] }
```

---

## 4. Casos de uso frecuentes

- Transformaciones de datos para UI: map para renderizar listas.
- Filtrado y búsqueda: filter, find, some.
- Agregación y resúmenes: reduce para sumas, promedios, conteos.
- Composición de pipelines: arr.filter(...).map(...).slice(...) para operaciones declarativas.
- Eliminación/Inserción de elementos en arrays locales: splice/push/pop.
- Conversión y combinación: concat, join, flatMap.

Ejemplo típico en React:

```js
const visible = items
  .filter(i => i.visible)
  .map(i => ({ ...i, label: i.name.toUpperCase() }));
```

---

## 5. Ventajas vs enfoque tradicional (for / while)

Ventajas de los métodos de arreglo:
- Declarativos: el código expresa "qué" se quiere hacer, no "cómo".
- Menos código repetitivo y menos posibilidad de errores con índices.
- Facilitan composición (pipe-like) y encadenamiento.
- Mejor integración con métodos funcionales (map/filter/reduce).
- Potencial para optimizaciones internas en motores JS.

Desventajas / cuando preferir el enfoque tradicional:
- Overhead: en escenarios críticos de performance, los bucles for optimizados pueden ser más rápidos (aunque en la práctica moderno JS engines optimizan mucho).
- Mutaciones implícitas: algunos métodos mutan el array (splice, push); con for puedes controlar con exactitud.
- Legibilidad para operaciones muy complejas: a veces reduce con callback complejo se vuelve menos legible que un bucle bien nombrado.
- Necesidad de breaking early: for/while permiten `break` fácilmente. Con métodos como forEach no puedes romper; con some/find sí puedes emular "early exit".

Resumen práctico:
- Para transformaciones y filtrados preferir métodos funcionales (map/filter/reduce).
- Para operaciones ultra-performantes en bucles grandes y críticas en tiempo, medir y considerar for clásico.

---

## 6. Pautas, buenas prácticas y advertencias

- Evitar mutar el arreglo que se está iterando. Si necesitas mutarlo, haz una copia primero o usa métodos inmutables.

```js
const newArr = oldArr.slice();
newArr.splice( ... );
```

- Usar `map` si vas a devolver una misma longitud con transformación. Usar `filter` para reducir elementos.
- Preferir `const` para referencias a arrays; `const arr = []` permite mutaciones internas pero evita reasignaciones.
- Para orden numérico siempre pasar `compareFn` a `sort`.
- Evitar `forEach` si necesitas transformar o componer valores. `forEach` es solo para efectos secundarios.
- Cuidado con arrays "sparse" (huecos). Muchos métodos saltan índices vacíos; `for` los visita explícitamente.

---

## 7. Edge cases y rendimiento

- Sparse arrays (ej. `Array(5)`): métodos no siempre se comportan igual — algunos ignoran huecos.
- Métodos que crean nuevos arrays (map/filter/concat) consumen memoria; en cadenas largas puede ser un problema.
- `splice` y `unshift` mueven memoria y son más costosos que `push`/`pop`.
- Para datos masivos, considera estructuras más eficientes (Typed Arrays, Streams, chunking).

---

## 8. Ejemplos prácticos y patrones

1) Eliminar duplicados:

```js
const unique = arr.filter((v, i, a) => a.indexOf(v) === i);
// o con Set:
const unique2 = [...new Set(arr)];
```

2) Contar ocurrencias:

```js
const counts = arr.reduce((acc, x) => { acc[x] = (acc[x] || 0) + 1; return acc; }, {});
```

3) Promises encadenadas sobre arrays (usar Promise.all con map):

```js
const results = await Promise.all(users.map(u => fetchProfile(u.id)));
```

4) Early exit equivalente a break usando `some`:

```js
const found = arr.some(x => {
  if (complexCheck(x)) return true; // termina la iteración
  return false;
});
```

---

## 9. Resumen rápido (cheat sheet)

- Transformar: map
- Filtrar: filter
- Iterar para efectos: forEach
- Reducir/Agregar: reduce
- Buscar: find / findIndex
- Comprobar condiciones: some / every
- Ordenar: sort
- Añadir/Quitar: push/pop/shift/unshift/splice
- Copiar subarray: slice
- Concatenar: concat / spread ([...a, ...b])

---

## 10. Conclusión

Los métodos de arreglo en JavaScript proporcionan una forma poderosa y declarativa de trabajar con colecciones. Para la mayoría de las tareas cotidianas (transformación de datos, filtrado, agregación) son preferibles al enfoque imperativo por su legibilidad y composabilidad. Sin embargo, conocer las implicaciones de rendimiento y el comportamiento (mutación vs inmutabilidad, sparse arrays, callbacks) es esencial para escribir código seguro y eficiente.

Si quieres, puedo:
- Generar ejemplos ejecutables y pequeños tests para practicar cada método.
- Crear una versión rápida en formato PDF o presentación.

---

### Créditos
Basado en la especificación de ECMAScript y las prácticas habituales en la comunidad JavaScript.
