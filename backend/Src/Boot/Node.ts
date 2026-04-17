import type express from "express";
import type mongoose from "mongoose";
import type http from "http";
import type fs from "fs";
import type path from "path";
import type url from "url";
import type joi from "joi";
import type bcrypt from "bcrypt";
import type jwt from "jsonwebtoken";
import type aggregatePaginate from "mongoose-aggregate-paginate-v2";
export interface INode {
  Express: ReturnType<typeof express>;
  Router: ReturnType<typeof express.Router>;
  Mongoose: typeof mongoose;
  HttpServer: http.Server;
  Fs: typeof fs;
  Path: typeof path;
  URL: typeof url;
  DB_URI: string;
  JOI: typeof joi;
  Jwt: typeof jwt;
  AggregatePaginate: typeof aggregatePaginate;
  filename: string;
  Bcrypt: typeof bcrypt;
  dirname: string;
  ROLES: Record<string, string>;
  UNPROTECTED: string[];
  HTTP_ERRORS: Record<string, any>;
  HttpResponse: Record<string, any>;
  USER_ROLES: Record<string, string>;
  TASK_STATUS: string[];
  Initialize: (port?: string) => Promise<void>;
  Socket?: any;
}

const Node: INode = {
  Express: {} as ReturnType<typeof express>,
  Router: {} as ReturnType<typeof express.Router>,
  Mongoose: {} as typeof mongoose,
  HttpServer: {} as http.Server,
  Fs: {} as typeof fs,
  Path: {} as typeof path,
  URL: {} as typeof url,
  DB_URI: "",
  JOI: {} as typeof joi,
  Jwt: {} as typeof jwt,
  AggregatePaginate: {} as typeof aggregatePaginate,
  filename: "",
  dirname: "",
  ROLES: {
    ADMIN: "ADMIN",
    USER: "USER",
  },
  UNPROTECTED: ["/sign-in"],
  HTTP_ERRORS: {} as Record<string, string>,
  HttpResponse: {} as Record<string, string>,
  USER_ROLES: {} as Record<string, string>,
  TASK_STATUS: ["todo", "in-progress", "done"],
  Initialize: async (port?: string): Promise<void> => {},
  Socket: {} as any,
  Bcrypt:{} as typeof bcrypt
};

export default Node;
