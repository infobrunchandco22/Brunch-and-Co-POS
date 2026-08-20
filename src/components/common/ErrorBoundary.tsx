import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    (this as any).setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    const state = (this as any).state as State;
    const props = (this as any).props as Props;

    if (state.hasError) {
      if (props.fallback) {
        return props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#F6F1EB] flex items-center justify-center p-6">
          <div className="bg-[#FFFFFF] border border-[#000000]/10 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F6F1EB] border border-[#7a4900]/20 flex items-center justify-center mx-auto text-[#3d2500]">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-[#000000]">Something went wrong</h3>
              <p className="text-xs text-[#7a4900] mt-1 leading-relaxed">
                An unexpected error occurred while rendering this page. Please refresh to try again.
              </p>
              {state.error?.message && (
                <div className="mt-3 bg-[#F6F1EB] border border-[#000000]/10 rounded-xl p-2.5 text-[11px] text-rose-700 font-mono text-left truncate">
                  {state.error.message}
                </div>
              )}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full bg-[#000000] hover:bg-[#3d2500] text-[#FFFDF7] font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Page</span>
            </button>
          </div>
        </div>
      );
    }

    return props.children;
  }
}
