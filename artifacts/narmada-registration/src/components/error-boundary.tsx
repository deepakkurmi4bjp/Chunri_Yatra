import {
  Component,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from 'react';

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent?: ComponentType<ErrorFallbackProps>;
  /** Changing this clears a caught error. Pass the route to recover on navigation. */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }
  if (typeof value === 'string') {
    return new Error(value);
  }
  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error(String(value));
  }
}

function DefaultFallback({ error, resetError }: ErrorFallbackProps) {
  const handleClearCacheAndReload = () => {
    try {
      localStorage.removeItem('narmada-registration-records');
      sessionStorage.clear();
    } catch (_) {}
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#02120e] text-[#f8f6ec] p-6">
      <div className="max-w-lg w-full text-center bg-[#06261d] border border-[#f5c431]/40 rounded-2xl p-6 shadow-2xl">
        <div className="text-3xl mb-2">🚩</div>
        <h1 className="text-xl font-bold text-[#ffe270]">
          श्री माँ नर्मदा चुनरी यात्रा पोर्टल
        </h1>
        <p className="mt-2 text-sm text-[#b5cbbe]">
          पेज लोड करते समय एक अप्रत्याशित समस्या हुई।
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg bg-black/40 border border-red-500/30 p-3 text-left text-xs text-red-300 font-mono">
          {error.message || String(error)}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={resetError}
            className="rounded-full bg-[#f5c431] px-5 py-2.5 text-sm font-semibold text-[#02120e] hover:bg-[#ffe270] transition-colors"
          >
            पुनः प्रयास करें (Try again)
          </button>
          <button
            type="button"
            onClick={handleClearCacheAndReload}
            className="rounded-full bg-white/10 border border-white/20 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition-colors"
          >
            कैश साफ़ कर रीलोड करें
          </button>
        </div>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: toError(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error(
      'ErrorBoundary caught an error:',
      toError(error),
      info.componentStack,
    );
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.state.error !== null &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.resetError();
    }
  }

  resetError = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error === null) {
      return this.props.children;
    }
    const Fallback = this.props.FallbackComponent ?? DefaultFallback;
    return <Fallback error={error} resetError={this.resetError} />;
  }
}
