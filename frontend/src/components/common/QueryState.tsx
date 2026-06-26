import { Button, Typography } from "@/components/ui";
import { PAGE_GUTTER } from "@/components/common/PageLayout";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface QueryStateProps {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  isEmpty?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
}

export function QueryState({
  isLoading,
  isError,
  error,
  isEmpty = false,
  loadingMessage = "Loading…",
  emptyMessage = "No data found.",
  onRetry,
  children,
}: QueryStateProps) {
  if (isLoading) {
    return (
      <div className={cn(PAGE_GUTTER, "py-8 text-center")}>
        <Typography variant="body2" tone="muted" align="center">
          {loadingMessage}
        </Typography>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn(PAGE_GUTTER, "py-8")}>
        <StackMessage
          message={getErrorMessage(error)}
          action={
            onRetry ? (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Try again
              </Button>
            ) : null
          }
        />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={cn(PAGE_GUTTER, "py-8 text-center")}>
        <Typography variant="body2" tone="muted" align="center">
          {emptyMessage}
        </Typography>
      </div>
    );
  }

  return <>{children}</>;
}

function StackMessage({
  message,
  action,
}: {
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Typography variant="body2" tone="destructive">
        {message}
      </Typography>
      {action}
    </div>
  );
}
