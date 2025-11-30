import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Global Error Handlers
window.onerror = function (message, source, lineno, colno, error) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="color:red; background:black; padding:20px; z-index:9999; position:fixed; top:0; left:0; width:100%; height:100%; overflow:auto;">
      <h1 style="font-size:24px; margin-bottom:10px;">Global Error</h1>
      <pre style="white-space:pre-wrap;">${message}\n${source}:${lineno}:${colno}\n${error?.stack || ''}</pre>
    </div>`;
  }
};

window.onunhandledrejection = function (event) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="color:orange; background:black; padding:20px; z-index:9999; position:fixed; top:0; left:0; width:100%; height:100%; overflow:auto;">
      <h1 style="font-size:24px; margin-bottom:10px;">Unhandled Promise Rejection</h1>
      <pre style="white-space:pre-wrap;">${event.reason}</pre>
    </div>`;
  }
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-red-500 p-8 font-mono overflow-auto">
          <h1 className="text-2xl mb-4 font-bold">Application Crashed</h1>
          <div className="mb-4">
            <h2 className="text-xl text-white mb-2">Error:</h2>
            <pre className="bg-zinc-900 p-4 rounded border border-red-900/50 whitespace-pre-wrap">
              {this.state.error?.toString()}
            </pre>
          </div>
          <div>
            <h2 className="text-xl text-white mb-2">Stack Trace:</h2>
            <pre className="bg-zinc-900 p-4 rounded border border-red-900/50 text-xs whitespace-pre-wrap">
              {this.state.error?.stack}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
console.log("Mounting React App...");

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);