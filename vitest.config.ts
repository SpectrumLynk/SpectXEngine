import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'dist/',
                '.next/',
                'tests/',
                '**/*.spec.ts',
                '**/*.test.ts',
            ],
        },
    },
    resolve: {
        alias: {
            '@web-kernel/core': path.resolve(__dirname, './packages/core/src'),
            '@web-kernel/db': path.resolve(__dirname, './packages/db/src'),
            '@web-kernel/auth': path.resolve(__dirname, './packages/auth/src'),
            '@web-kernel/ai': path.resolve(__dirname, './packages/ai/src'),
        },
    },
});
