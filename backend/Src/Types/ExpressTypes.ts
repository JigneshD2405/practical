import { type Response, NextFunction, Request } from "express";
import type { Types } from "mongoose";

export type Res = Response;
export type Next = NextFunction;

export interface Req extends Request {
  bypassMiddleware?: boolean;
  login_user: {
    _id: Types.ObjectId;
    role?: string;
    userName?: string;
    [key: string]: any;
  };
  token: string;
}