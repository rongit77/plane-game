import React from 'react';

type Props = { children: React.ReactNode; fallback?: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('GameCanvas error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111827',
          color: '#fff',
          padding: 24,
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: '#9ca3af', marginBottom: 16 }}>{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{ padding: '10px 20px', background: '#3b82f6', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
