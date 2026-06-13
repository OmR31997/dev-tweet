import { AxiosError } from "axios";

export interface ApiErrorBody {
  message?: string | string[];
  statusCode?: number;
  error?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body?: ApiErrorBody;

  constructor(message: string, status: number, body?: ApiErrorBody) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorBody | undefined;
    const message = data?.message;

    if (Array.isArray(message)) {
      return message.join(", ");
    }

    if (typeof message === "string") {
      return message;
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof AxiosError) {
    // No response → network error / backend unreachable. Use status 0 so
    // callers can distinguish it from a real 5xx.
    const status = error.response?.status ?? 0;
    const data = error.response?.data as ApiErrorBody | undefined;
    const message = getErrorMessage(error);

    return new ApiError(message, status, data);
  }

  return new ApiError(getErrorMessage(error), 500);
}
