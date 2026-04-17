import Node from "#Node";
import { Res } from "#Types/ExpressTypes";
import { HTTP_STATUS_CODE } from "./index";

interface HttpErrorProp {
  message: string;
  HTTP_ERROR_CODE: {
    status: number;
    message: string;
  };
  name: string;
}
class HttpResponse {
  constructor(res: Res, [HTTP_STATUS_CODE, data]: any[], message: string) {
    let response = {
      data: data ? data : {},
      message: message ? message + " " : "" + HTTP_STATUS_CODE.message,
    };
    res.status(HTTP_STATUS_CODE.status).json(response);
  }
}

class HttpError extends Error {
  HTTP_ERROR_CODE: {
    status: number;
    message: string;
  };

  constructor({ message, HTTP_ERROR_CODE, name }: HttpErrorProp) {
    super(message);
    this.HTTP_ERROR_CODE = HTTP_ERROR_CODE;
    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack;
    }
    this.name = name;
  }
}

class SocketResponse {
  constructor([HTTP_STATUS_CODE, data]: any[], message: string = "") {
    return {
      data: data ? data : {},
      message: message ? message + " " : "" + HTTP_STATUS_CODE.message,
    };
  }
}

function ErrorResponse(error: Error) {
  if (error instanceof HttpError) {
    return [{ status: error.HTTP_ERROR_CODE.status, message: error.message }];
  }
  return [HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR];
}

Node.HttpResponse = { HttpResponse, SocketResponse, ErrorResponse, HttpError };
export { ErrorResponse, HttpError, HttpResponse, SocketResponse };
