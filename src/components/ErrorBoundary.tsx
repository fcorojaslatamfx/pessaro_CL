import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log error to monitoring service (if available)
    // You can integrate with services like Sentry, LogRocket, etc.
    if (typeof window !== 'undefined') {
      // Store current URL before redirecting to error page
      sessionStorage.setItem('previousUrl', window.location.href);
      
      // Store error info in sessionStorage for the error page
      sessionStorage.setItem('lastError', JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      }));
    }
  }

  public render() {
    if (this.state.hasError) {
      // Redirect to error page
      return <Navigate to={ROUTE_PATHS.ERROR} replace />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;