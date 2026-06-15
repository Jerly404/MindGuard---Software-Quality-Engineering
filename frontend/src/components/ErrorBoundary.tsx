import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 max-w-lg">
            <h1 className="text-3xl font-black text-rose-600 mb-4">Algo salió mal</h1>
            <p className="text-slate-600 mb-8 text-sm leading-relaxed">
              La aplicación ha detectado un error inesperado en este componente. Hemos registrado el incidente para solucionarlo.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl text-left font-mono text-xs text-slate-500 overflow-auto max-h-40 mb-8">
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
