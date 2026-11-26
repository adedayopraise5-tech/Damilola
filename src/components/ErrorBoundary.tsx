import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('Application ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      let friendly = 'We encountered a temporary issue loading this view.';
      try {
        const parsed = JSON.parse(this.state.errorMessage);
        if (parsed?.error) {
          friendly = `Access or connection notice: ${parsed.error}`;
        }
      } catch {
        if (this.state.errorMessage) {
          friendly = this.state.errorMessage;
        }
      }

      return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#141210] flex items-center justify-center px-6">
          <div className="max-w-lg w-full border border-[#E8DFD1] bg-[#F3EDE2]/60 p-10 text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-[#B69354] mb-3">
              Fragrance Chamber Concept
            </p>
            <h1 className="font-serif text-3xl font-medium mb-4">
              A Moment of Pause
            </h1>
            <p className="text-sm text-[#2B211B]/80 leading-relaxed mb-8">
              {friendly}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                window.location.hash = '#/';
                window.location.reload();
              }}
              className="px-6 py-3 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] hover:bg-[#2B211B] transition-colors cursor-pointer"
            >
              Return to Boutique
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
