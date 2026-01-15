/**
 * Distributed tracing implementation
 * System.json compliance: observability.tracing.distributed
 */

export interface Span {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    name: string;
    startTime: number;
    endTime?: number;
    attributes?: Record<string, unknown>;
}

class TracingService {
    private activeSpans: Map<string, Span> = new Map();

    generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    startSpan(name: string, traceId?: string, parentSpanId?: string): Span {
        const span: Span = {
            traceId: traceId || this.generateId(),
            spanId: this.generateId(),
            parentSpanId,
            name,
            startTime: Date.now(),
        };

        this.activeSpans.set(span.spanId, span);
        return span;
    }

    endSpan(spanId: string, attributes?: Record<string, unknown>): void {
        const span = this.activeSpans.get(spanId);
        if (span) {
            span.endTime = Date.now();
            span.attributes = attributes;
            this.activeSpans.delete(spanId);
        }
    }

    addAttribute(spanId: string, key: string, value: unknown): void {
        const span = this.activeSpans.get(spanId);
        if (span) {
            span.attributes = { ...span.attributes, [key]: value };
        }
    }

    getSpan(spanId: string): Span | undefined {
        return this.activeSpans.get(spanId);
    }
}

export const tracing = new TracingService();
