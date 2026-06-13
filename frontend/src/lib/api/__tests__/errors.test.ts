import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { ApiError, getErrorMessage, toApiError } from "@/lib/api/errors";

function createAxiosError(
  data: unknown,
  status = 400,
  message = "Request failed"
): AxiosError {
  const config = {} as InternalAxiosRequestConfig;
  const response = {
    data,
    status,
    statusText: "Bad Request",
    headers: {},
    config,
  } as AxiosResponse;

  return new AxiosError(message, String(status), config, undefined, response);
}

describe("getErrorMessage", () => {
  it("returns ApiError message", () => {
    expect(getErrorMessage(new ApiError("Unauthorized", 401))).toBe(
      "Unauthorized"
    );
  });

  it("returns string message from axios response", () => {
    const error = createAxiosError({ message: "Invalid credentials" });
    expect(getErrorMessage(error)).toBe("Invalid credentials");
  });

  it("joins array messages from NestJS validation", () => {
    const error = createAxiosError({
      message: ["email must be an email", "password is too short"],
    });
    expect(getErrorMessage(error)).toBe(
      "email must be an email, password is too short"
    );
  });

  it("returns generic message for unknown errors", () => {
    expect(getErrorMessage("oops")).toBe("Something went wrong");
  });
});

describe("toApiError", () => {
  it("wraps axios errors with status", () => {
    const result = toApiError(
      createAxiosError({ message: "Not found" }, 404)
    );

    expect(result).toBeInstanceOf(ApiError);
    expect(result.status).toBe(404);
    expect(result.message).toBe("Not found");
  });
});
