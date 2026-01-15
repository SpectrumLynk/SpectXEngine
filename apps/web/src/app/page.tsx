export default function HomePage(): JSX.Element {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
                <h1 className="text-4xl font-bold text-center mb-8">
                    Unified Enterprise Web Kernel
                </h1>
                <p className="text-center text-lg mb-4">
                    🚀 AI-governed, enterprise-grade monorepo foundation
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <FeatureCard
                        title="🔒 Security First"
                        description="MFA mandatory, RBAC, rate limiting, audit logging"
                    />
                    <FeatureCard
                        title="🤖 AI Integrated"
                        description="Governed system actor with JSON compliance"
                    />
                    <FeatureCard
                        title="⚡ Performance"
                        description="<250KB initial, <2s TTI, bundle budgets enforced"
                    />
                    <FeatureCard
                        title="📱 PWA Ready"
                        description="Installable, offline support, service worker"
                    />
                </div>
            </div>
        </main>
    );
}

function FeatureCard({ title, description }: { title: string; description: string }): JSX.Element {
    return (
        <div className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    );
}
