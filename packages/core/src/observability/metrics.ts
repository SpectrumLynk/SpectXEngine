/**
 * Metrics collection for performance, errors, and AI decisions
 * System.json compliance: observability.metrics
 */

export interface Metric {
    name: string;
    value: number;
    timestamp: Date;
    tags?: Record<string, string>;
}

export enum MetricType {
    COUNTER = 'counter',
    GAUGE = 'gauge',
    HISTOGRAM = 'histogram',
}

class MetricsCollector {
    private metrics: Map<string, Metric[]> = new Map();

    record(name: string, value: number, tags?: Record<string, string>): void {
        const metric: Metric = {
            name,
            value,
            timestamp: new Date(),
            tags,
        };

        const existing = this.metrics.get(name) || [];
        existing.push(metric);
        this.metrics.set(name, existing);
    }

    // Performance metrics
    recordApiLatency(endpoint: string, latencyMs: number): void {
        this.record('api.latency', latencyMs, { endpoint });
    }

    recordBundleSize(size: number): void {
        this.record('bundle.size', size);
    }

    recordTimeToInteractive(timeMs: number): void {
        this.record('performance.tti', timeMs);
    }

    // Error metrics
    recordError(errorType: string, endpoint?: string): void {
        this.record('errors.count', 1, { type: errorType, endpoint });
    }

    // AI decision metrics
    recordAiDecision(operation: string, durationMs: number, success: boolean): void {
        this.record('ai.operation', durationMs, { operation, success: String(success) });
    }

    // Get metrics for reporting
    getMetrics(name?: string): Metric[] {
        if (name) {
            return this.metrics.get(name) || [];
        }
        return Array.from(this.metrics.values()).flat();
    }

    // Performance budget validation (system.json: 200ms p95, 500ms p99)
    validateApiPerformance(endpoint: string): { p95: number; p99: number; withinBudget: boolean } {
        const latencies = this.metrics
            .get('api.latency')
            ?.filter((m) => m.tags?.endpoint === endpoint)
            .map((m) => m.value)
            .sort((a, b) => a - b) || [];

        if (latencies.length === 0) {
            return { p95: 0, p99: 0, withinBudget: true };
        }

        const p95Index = Math.floor(latencies.length * 0.95);
        const p99Index = Math.floor(latencies.length * 0.99);

        const p95 = latencies[p95Index] || 0;
        const p99 = latencies[p99Index] || 0;

        // system.json budgets: p95 < 200ms, p99 < 500ms
        const withinBudget = p95 <= 200 && p99 <= 500;

        return { p95, p99, withinBudget };
    }

    clear(): void {
        this.metrics.clear();
    }
}

export const metrics = new MetricsCollector();
