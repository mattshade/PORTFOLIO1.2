import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  errorMessage?: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error)
    return { hasError: true, errorMessage: message }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorMessage: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#a1a1aa', maxWidth: '42rem', margin: '0 auto' }}>
            <p style={{ margin: '0 0 1rem' }}>Something went wrong. Please refresh the page.</p>
            {import.meta.env.DEV && this.state.errorMessage && (
              <pre
                style={{
                  textAlign: 'left',
                  fontSize: '0.8rem',
                  color: '#fca5a5',
                  background: '#1c1917',
                  padding: '1rem',
                  borderRadius: '8px',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.errorMessage}
              </pre>
            )}
            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={this.handleRetry}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  background: '#27272a',
                  border: '1px solid #3f3f46',
                  color: '#e4e4e7',
                  borderRadius: '6px',
                }}
              >
                Try again (dev)
              </button>
            )}
          </div>
        )
      )
    }
    return this.props.children
  }
}
