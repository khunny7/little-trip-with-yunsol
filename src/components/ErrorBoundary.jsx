import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #8e24aa 0%, #ffc107 100%)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '600px' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌟</h1>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600' }}>
              Oops! Something went wrong
            </h2>
            <p style={{ fontSize: '1rem', marginBottom: '2rem', opacity: 0.9 }}>
              We're sorry, but something unexpected happened. 
              Please refresh the page or try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid white',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background 0.3s',
                marginRight: '1rem'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              🔄 Refresh Page
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                background: 'white',
                border: 'none',
                color: '#8e24aa',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              🏠 Go Home
            </button>
            {typeof window !== 'undefined' && window.location.hostname === 'localhost' && this.state.error && (
              <details style={{ 
                marginTop: '2rem', 
                textAlign: 'left', 
                background: 'rgba(0,0,0,0.2)', 
                padding: '1rem',
                borderRadius: '8px'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                  Error Details (Development)
                </summary>
                <pre style={{ 
                  fontSize: '0.8rem', 
                  overflow: 'auto', 
                  marginTop: '1rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
