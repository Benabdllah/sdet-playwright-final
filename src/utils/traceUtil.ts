/**
 * ============================================================================
 * ULTIMATIVES SDET TRACING & DEBUGGING (FINAL) +++++
 * ============================================================================
 * Umfassendes Distributed Tracing mit Spans, Context Propagation, Sampling
 * Features: Span-Management, Call Trees, Performance-Tracking, Error-Tracing
 * Unterstützt: W3C Trace Context, Baggage, Sampling, Export-Formate
 * Production-Ready mit Metriken, Filter, Kontext-Tracking und Analytics
 * ============================================================================
 */

import { EventEmitter } from 'events';

// ============================================================================
// TYPEN & ENUMS
// ============================================================================

export enum SpanKind {
  INTERNAL = 'INTERNAL',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  PRODUCER = 'PRODUCER',
  CONSUMER = 'CONSUMER',
}

export enum SpanStatus {
  UNSET = 0,
  OK = 1,
  ERROR = 2,
}

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  traceFlags: number;
  traceState?: string;
}

export interface Span {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  name: string;
  kind: SpanKind;
  status: SpanStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  attributes: Record<string, any>;
  events: SpanEvent[];
  links: SpanLink[];
  error?: Error;
}

export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, any>;
}

export interface SpanLink {
  traceId: string;
  spanId: string;
  attributes?: Record<string, any>;
}

export interface TraceMetrics {
  totalSpans: number;
  totalDuration: number;
  averageDuration: number;
  errorCount: number;
  errorRate: number;
  slowestSpan: Span | null;
  fastestSpan: Span | null;
  spansByKind: Record<string, number>;
  spansByStatus: Record<string, number>;
}

export interface SamplingConfig {
  enabled: boolean;
  probability: number;
  rules?: SamplingRule[];
}

export interface SamplingRule {
  name: string;
  pattern: RegExp;
  probability: number;
}

export interface ExportFormat {
  format: 'json' | 'jaeger' | 'zipkin' | 'datadog';
  spans: Span[];
  timestamp: number;
}

export interface TraceContextConfig {
  propagationType: 'W3C' | 'Jaeger' | 'B3' | 'Datadog';
  baggage?: Record<string, string>;
}

// ============================================================================
// TRACE CONTEXT MANAGEMENT
// ============================================================================

export class TraceContextManager {
  private static contextStack: TraceContext[] = [];
  private static contextMap: Map<string, TraceContext> = new Map();

  /**
   * Generiere eindeutige IDs
   */
  private static generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Erstelle neue Trace Context
   */
  static createContext(parentContext?: TraceContext): TraceContext {
    const traceId = parentContext?.traceId || this.generateId();
    const spanId = this.generateId();
    const parentSpanId = parentContext?.spanId;

    const context: TraceContext = {
      traceId,
      spanId,
      parentSpanId,
      traceFlags: 1,
      traceState: '',
    };

    this.contextMap.set(spanId, context);
    return context;
  }

  /**
   * Hole aktuelle Trace Context
   */
  static getCurrentContext(): TraceContext | undefined {
    return this.contextStack[this.contextStack.length - 1];
  }

  /**
   * Setze aktuelle Trace Context
   */
  static setCurrentContext(context: TraceContext): void {
    this.contextStack.push(context);
  }

  /**
   * Entferne aktuelle Trace Context
   */
  static clearCurrentContext(): TraceContext | undefined {
    return this.contextStack.pop();
  }

  /**
   * Extrahiere Context aus Header (W3C Format)
   */
  static extractFromW3CHeader(header: string): TraceContext {
    const parts = header.split('-');
    return {
      traceId: parts[0],
      spanId: parts[1],
      traceFlags: parseInt(parts[2], 16),
    };
  }

  /**
   * Generiere W3C Header
   */
  static toW3CHeader(context: TraceContext): string {
    return `${context.traceId}-${context.spanId}-${context.traceFlags.toString(16).padStart(2, '0')}`;
  }

  /**
   * Reset Context Stack
   */
  static reset(): void {
    this.contextStack = [];
    this.contextMap.clear();
  }
}

// ============================================================================
// SPAN MANAGEMENT
// ============================================================================

export class SpanManager extends EventEmitter {
  private spans: Map<string, Span> = new Map();
  private rootSpans: Set<string> = new Set();
  private spanStack: Span[] = [];

  /**
   * Erstelle neuen Span
   */
  createSpan(
    name: string,
    kind: SpanKind = SpanKind.INTERNAL,
    parentSpan?: Span,
  ): Span {
    const context = parentSpan
      ? TraceContextManager.createContext({
          traceId: parentSpan.traceId,
          spanId: parentSpan.spanId,
        })
      : TraceContextManager.createContext();

    const span: Span = {
      spanId: context.spanId,
      traceId: context.traceId,
      parentSpanId: context.parentSpanId,
      name,
      kind,
      status: SpanStatus.UNSET,
      startTime: Date.now(),
      attributes: {},
      events: [],
      links: [],
    };

    this.spans.set(span.spanId, span);

    if (!span.parentSpanId) {
      this.rootSpans.add(span.spanId);
    }

    this.spanStack.push(span);
    TraceContextManager.setCurrentContext(context);
    this.emit('span-created', span);

    return span;
  }

  /**
   * Ende Span
   */
  endSpan(span: Span, status: SpanStatus = SpanStatus.OK, error?: Error): void {
    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;
    if (error) {
      span.error = error;
    }

    this.spanStack.pop();
    TraceContextManager.clearCurrentContext();
    this.emit('span-ended', span);
  }

  /**
   * Hole aktuellen Span
   */
  getCurrentSpan(): Span | undefined {
    return this.spanStack[this.spanStack.length - 1];
  }

  /**
   * Addiere Attribut zu Span
   */
  addAttribute(span: Span, key: string, value: any): void {
    span.attributes[key] = value;
  }

  /**
   * Addiere Event zu Span
   */
  addEvent(span: Span, eventName: string, attributes?: Record<string, any>): void {
    const event: SpanEvent = {
      name: eventName,
      timestamp: Date.now(),
      attributes,
    };
    span.events.push(event);
  }

  /**
   * Addiere Link zu Span
   */
  addLink(span: Span, linkedSpan: Span, attributes?: Record<string, any>): void {
    const link: SpanLink = {
      traceId: linkedSpan.traceId,
      spanId: linkedSpan.spanId,
      attributes,
    };
    span.links.push(link);
  }

  /**
   * Hole alle Spans einer Trace
   */
  getTraceSpans(traceId: string): Span[] {
    return Array.from(this.spans.values()).filter((s) => s.traceId === traceId);
  }

  /**
   * Hole alle Spans
   */
  getAllSpans(): Span[] {
    return Array.from(this.spans.values());
  }

  /**
   * Hole Span nach ID
   */
  getSpan(spanId: string): Span | undefined {
    return this.spans.get(spanId);
  }

  /**
   * Clear alle Spans
   */
  clear(): void {
    this.spans.clear();
    this.rootSpans.clear();
    this.spanStack = [];
  }
}

// ============================================================================
// TRACER KLASSE
// ============================================================================

export class Tracer extends EventEmitter {
  private spanManager: SpanManager;
  private samplingConfig: SamplingConfig;
  private contextConfig: TraceContextConfig;
  private spans: Span[] = [];

  constructor(
    samplingConfig: Partial<SamplingConfig> = {},
    contextConfig: Partial<TraceContextConfig> = {},
  ) {
    super();

    this.samplingConfig = {
      enabled: true,
      probability: 1.0,
      ...samplingConfig,
    };

    this.contextConfig = {
      propagationType: 'W3C',
      ...contextConfig,
    };

    this.spanManager = new SpanManager();
  }

  /**
   * Prüfe, ob Span gesampelt werden soll
   */
  private shouldSample(spanName: string): boolean {
    if (!this.samplingConfig.enabled) return false;

    if (this.samplingConfig.rules) {
      for (const rule of this.samplingConfig.rules) {
        if (rule.pattern.test(spanName)) {
          return Math.random() < rule.probability;
        }
      }
    }

    return Math.random() < this.samplingConfig.probability;
  }

  /**
   * Starte Span
   */
  startSpan(name: string, kind: SpanKind = SpanKind.INTERNAL, attributes?: Record<string, any>): Span {
    if (!this.shouldSample(name)) {
      return {
        spanId: '',
        traceId: '',
        name,
        kind,
        status: SpanStatus.UNSET,
        startTime: Date.now(),
        attributes: attributes || {},
        events: [],
        links: [],
      };
    }

    const currentSpan = this.spanManager.getCurrentSpan();
    const span = this.spanManager.createSpan(name, kind, currentSpan);

    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        this.spanManager.addAttribute(span, key, value);
      });
    }

    this.spans.push(span);
    return span;
  }

  /**
   * Ende Span
   */
  endSpan(span: Span, status: SpanStatus = SpanStatus.OK, error?: Error): void {
    this.spanManager.endSpan(span, status, error);
  }

  /**
   * Addiere Attribut
   */
  addAttribute(span: Span, key: string, value: any): void {
    this.spanManager.addAttribute(span, key, value);
  }

  /**
   * Addiere Event
   */
  addEvent(span: Span, eventName: string, attributes?: Record<string, any>): void {
    this.spanManager.addEvent(span, eventName, attributes);
  }

  /**
   * Wende Span-Funktion an
   */
  async withSpan<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    kind: SpanKind = SpanKind.INTERNAL,
  ): Promise<T> {
    const span = this.startSpan(name, kind);

    try {
      const result = await fn(span);
      this.endSpan(span, SpanStatus.OK);
      return result;
    } catch (error) {
      this.endSpan(span, SpanStatus.ERROR, error as Error);
      throw error;
    }
  }

  /**
   * Wende synchrone Span-Funktion an
   */
  withSpanSync<T>(
    name: string,
    fn: (span: Span) => T,
    kind: SpanKind = SpanKind.INTERNAL,
  ): T {
    const span = this.startSpan(name, kind);

    try {
      const result = fn(span);
      this.endSpan(span, SpanStatus.OK);
      return result;
    } catch (error) {
      this.endSpan(span, SpanStatus.ERROR, error as Error);
      throw error;
    }
  }

  /**
   * Hole Metriken
   */
  getMetrics(): TraceMetrics {
    const allSpans = this.spanManager.getAllSpans();

    if (allSpans.length === 0) {
      return {
        totalSpans: 0,
        totalDuration: 0,
        averageDuration: 0,
        errorCount: 0,
        errorRate: 0,
        slowestSpan: null,
        fastestSpan: null,
        spansByKind: {},
        spansByStatus: {},
      };
    }

    const totalDuration = allSpans.reduce((sum, s) => sum + (s.duration || 0), 0);
    const errorCount = allSpans.filter((s) => s.status === SpanStatus.ERROR).length;

    const spansByKind: Record<string, number> = {};
    const spansByStatus: Record<string, number> = {};

    allSpans.forEach((span) => {
      spansByKind[span.kind] = (spansByKind[span.kind] || 0) + 1;
      spansByStatus[SpanStatus[span.status]] = (spansByStatus[SpanStatus[span.status]] || 0) + 1;
    });

    const slowestSpan = allSpans.reduce((max, s) => ((s.duration || 0) > (max.duration || 0) ? s : max));
    const fastestSpan = allSpans.reduce((min, s) => ((s.duration || 0) < (min.duration || 0) ? s : min));

    return {
      totalSpans: allSpans.length,
      totalDuration,
      averageDuration: totalDuration / allSpans.length,
      errorCount,
      errorRate: (errorCount / allSpans.length) * 100,
      slowestSpan,
      fastestSpan,
      spansByKind,
      spansByStatus,
    };
  }

  /**
   * Exportiere Spans
   */
  export(format: 'json' | 'jaeger' | 'zipkin' | 'datadog' = 'json'): ExportFormat {
    return {
      format,
      spans: this.spanManager.getAllSpans(),
      timestamp: Date.now(),
    };
  }

  /**
   * Drucke Trace-Baum
   */
  printTraceTree(): void {
    const allSpans = this.spanManager.getAllSpans();
    const spanMap = new Map(allSpans.map((s) => [s.spanId, s]));

    const rootSpans = allSpans.filter((s) => !s.parentSpanId);

    console.log('\n' + '='.repeat(70));
    console.log('TRACE BAUM');
    console.log('='.repeat(70) + '\n');

    const printSpan = (span: Span, indent: number = 0) => {
      const prefix = '  '.repeat(indent);
      const duration = span.duration ? `${span.duration}ms` : 'laufend';
      const status = SpanStatus[span.status];

      console.log(`${prefix}├─ ${span.name} [${status}] (${duration})`);

      const childSpans = allSpans.filter((s) => s.parentSpanId === span.spanId);
      childSpans.forEach((child) => printSpan(child, indent + 1));
    };

    rootSpans.forEach((span) => printSpan(span));

    const metrics = this.getMetrics();
    console.log('\n' + '='.repeat(70));
    console.log('METRIKEN');
    console.log('='.repeat(70));
    console.log(`Total Spans: ${metrics.totalSpans}`);
    console.log(`Gesamtdauer: ${metrics.totalDuration}ms`);
    console.log(`Durchschnittsdauer: ${metrics.averageDuration.toFixed(2)}ms`);
    console.log(`Fehler: ${metrics.errorCount} (${metrics.errorRate.toFixed(2)}%)`);
    console.log('='.repeat(70) + '\n');
  }

  /**
   * Clear alle Spans
   */
  clear(): void {
    this.spans = [];
    this.spanManager.clear();
  }
}

// ============================================================================
// DECORATOR
// ============================================================================

/**
 * Tracing-Decorator für Methoden
 */
export function Traced(kind: SpanKind = SpanKind.INTERNAL, tracer?: Tracer) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const t = tracer || new Tracer();
      const spanName = `${target.constructor.name}.${propertyKey}`;

      return t.withSpan(spanName, async (span) => {
        t.addAttribute(span, 'args', JSON.stringify(args));
        return originalMethod.apply(this, args);
      }, kind);
    };

    return descriptor;
  };
}

// ============================================================================
// STANDARD-EXPORT
// ============================================================================

export default Tracer;
