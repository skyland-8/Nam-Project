import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: 'white', padding: '2rem', fontFamily: 'monospace', position: 'relative', zIndex: 9999 }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '1rem' }}>Something went wrong.</h1>
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '0.25rem', border: '1px solid rgba(239,68,68,0.2)', overflow: 'auto' }}>
                        <h2 style={{ fontSize: '1.25rem', color: '#fca5a5', marginBottom: '0.5rem' }}>{this.state.error && this.state.error.toString()}</h2>
                        <pre style={{ fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'pre-wrap' }}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '1.5rem', padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
