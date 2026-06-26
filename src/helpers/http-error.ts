export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const getErrorResponse = (error: unknown, fallbackMessage: string) => {
  if (error instanceof HttpError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: string }).code;

    if (code === "P2002") {
      return {
        statusCode: 409,
        message: "Record already exists",
      };
    }

    if (code === "P2025") {
      return {
        statusCode: 404,
        message: "Record not found",
      };
    }
  }

  return {
    statusCode: 500,
    message: fallbackMessage,
  };
};
