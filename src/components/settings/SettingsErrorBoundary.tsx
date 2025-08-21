import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class SettingsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Settings page error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <span className="text-red-500 text-2xl">⚠️</span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                  Něco se pokazilo
                </h2>
                <p className="text-red-700 dark:text-red-300 mb-4">
                  Při načítání nastavení došlo k neočekávané chybě. Zkuste to prosím znovu.
                </p>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mb-4">
                    <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer hover:text-red-500 dark:hover:text-red-300">
                      Zobrazit technické detaily
                    </summary>
                    <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/40 rounded text-xs font-mono text-red-800 dark:text-red-200 overflow-auto">
                      <div className="font-bold mb-2">Chyba:</div>
                      <div className="mb-2">{this.state.error.message}</div>
                      <div className="font-bold mb-2">Stack trace:</div>
                      <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                      {this.state.errorInfo && (
                        <>
                          <div className="font-bold mb-2 mt-4">Component stack:</div>
                          <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                        </>
                      )}
                    </div>
                  </details>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={this.handleRetry}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    Zkusit znovu
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    Obnovit stránku
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SettingsErrorBoundary;