import { Component, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import i18n from "@/lib/i18n";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundaryClass extends Component<Props & { t: (key: string) => string }, State> {
  constructor(props: Props & { t: (key: string) => string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    toast({
      variant: "destructive",
      description: i18n.t("errorBoundary.toastMessage"),
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { t } = this.props;

      return (
        <div className="flex min-h-100 flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="text-6xl">😵</div>
          <h2 className="text-xl font-semibold">{t("errorBoundary.title")}</h2>
          <p className="text-muted-foreground max-w-md">{t("errorBoundary.description")}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={this.handleRetry}>
              {t("errorBoundary.retry")}
            </Button>
            <Button onClick={this.handleGoHome}>{t("errorBoundary.goHome")}</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary({ children, fallback }: Props) {
  const { t } = useTranslation();
  return (
    <ErrorBoundaryClass t={t} fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  );
}
