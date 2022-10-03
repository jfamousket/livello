import { StatusCodes } from "http-status-codes";

export class ServerError extends Error {
  constructor(public status: StatusCodes, public message: string) {
    super();
  }
  toJSON() {
    return {
      status: this.status,
      message: this.message,
    }
  }
}
