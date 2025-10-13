import { BoardElement, Viewport } from '../types/board.types';

/**
 * Verifica si un elemento está visible en el viewport actual
 * Útil para virtualización de canvas
 */
export function isElementVisible(
  element: BoardElement,
  viewport: Viewport,
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 100 // Padding extra para pre-renderizar elementos cercanos
): boolean {
  // Calcular los límites visibles del viewport
  const viewLeft = -viewport.x / viewport.zoom;
  const viewTop = -viewport.y / viewport.zoom;
  const viewRight = viewLeft + canvasWidth / viewport.zoom;
  const viewBottom = viewTop + canvasHeight / viewport.zoom;

  // Calcular los límites del elemento con padding
  const elemLeft = element.x - padding;
  const elemTop = element.y - padding;
  const elemRight = element.x + (element.width || 0) + padding;
  const elemBottom = element.y + (element.height || 0) + padding;

  // Verificar intersección
  return !(
    elemRight < viewLeft ||
    elemLeft > viewRight ||
    elemBottom < viewTop ||
    elemTop > viewBottom
  );
}

/**
 * Filtra elementos visibles para renderizado optimizado
 */
export function getVisibleElements(
  elements: BoardElement[],
  viewport: Viewport,
  canvasWidth: number,
  canvasHeight: number
): BoardElement[] {
  // Si hay pocos elementos, renderizar todos
  if (elements.length < 100) {
    return elements;
  }

  // Para muchos elementos, filtrar por visibilidad
  return elements.filter(element =>
    isElementVisible(element, viewport, canvasWidth, canvasHeight)
  );
}

/**
 * Memoización de cálculos costosos de elementos
 */
const elementCache = new Map<string, any>();

export function memoizeElement<T>(
  key: string,
  generator: () => T,
  dependencies: any[]
): T {
  const cacheKey = `${key}-${JSON.stringify(dependencies)}`;
  
  if (elementCache.has(cacheKey)) {
    return elementCache.get(cacheKey);
  }

  const result = generator();
  elementCache.set(cacheKey, result);
  
  // Limpiar cache si crece mucho
  if (elementCache.size > 1000) {
    const firstKey = elementCache.keys().next().value;
    if (firstKey) {
      elementCache.delete(firstKey);
    }
  }

  return result;
}

/**
 * Limpia el cache de elementos
 */
export function clearElementCache(): void {
  elementCache.clear();
}

/**
 * Optimiza actualizaciones por lotes
 */
export class BatchUpdater<T> {
  private updates: T[] = [];
  private timer: NodeJS.Timeout | null = null;
  private callback: (updates: T[]) => void;
  private delay: number;

  constructor(callback: (updates: T[]) => void, delay: number = 50) {
    this.callback = callback;
    this.delay = delay;
  }

  add(update: T): void {
    this.updates.push(update);

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.flush();
    }, this.delay);
  }

  flush(): void {
    if (this.updates.length > 0) {
      this.callback([...this.updates]);
      this.updates = [];
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  destroy(): void {
    this.flush();
  }
}

/**
 * Monitoreo de performance para debugging
 */
export class PerformanceMonitor {
  private measurements: Map<string, number[]> = new Map();

  start(label: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (!this.measurements.has(label)) {
        this.measurements.set(label, []);
      }

      this.measurements.get(label)!.push(duration);

      // Mantener solo las últimas 100 mediciones
      const measurements = this.measurements.get(label)!;
      if (measurements.length > 100) {
        measurements.shift();
      }
    };
  }

  getStats(label: string): { avg: number; min: number; max: number } | null {
    const measurements = this.measurements.get(label);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return { avg, min, max };
  }

  logStats(): void {
    console.group('🎯 Performance Stats');
    for (const [label, measurements] of this.measurements) {
      const stats = this.getStats(label);
      if (stats) {
        console.log(
          `${label}: avg=${stats.avg.toFixed(2)}ms, min=${stats.min.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms (${measurements.length} samples)`
        );
      }
    }
    console.groupEnd();
  }

  clear(): void {
    this.measurements.clear();
  }
}

// Instancia global para usar en toda la aplicación
export const performanceMonitor = new PerformanceMonitor();
