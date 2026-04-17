import { HTTP_STATUS_CODE } from "#HttpResponse/index";
import { HttpResponse } from "#HttpResponse/Response";
import UserModel from "#Modules/Models/User.model.js";
import Node from "#Node";
import type { Req } from "#Types/ExpressTypes";
import { verifyToken } from "#Utils/index";
import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import path from "path";

// ── Auth middleware ───── //

const middleware = {
  authMiddleware: async function (req: Request, res: Response, next: NextFunction) {
    try {
      const r = req as Req;
      r.bypassMiddleware = false;

      if (Node.UNPROTECTED.some((api: string) => req.path.startsWith(api))) {
        r.bypassMiddleware = true;
        return next();
      }

      const authHeader = req.headers.authorization;
      if (!authHeader) {
        const folder = req.path.split("/")[1] ?? "";
        if (["Assets", "Documents"].includes(folder)) {
          return res.status(403).sendFile(path.resolve("View/index.html"));
        }
        console.log("11");

        return new HttpResponse(res, [HTTP_STATUS_CODE.UNAUTHORIZED], "Unauthorized User");
      }

      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
        console.log("22");
        return new HttpResponse(res, [HTTP_STATUS_CODE.UNAUTHORIZED], "Invalid authorization format");
      }

      const token = parts[1];

      const result = verifyToken(token);
      if (!result || result.status === 400 || !(result.data as any)?._id) {
        console.log("33");
        return new HttpResponse(res, [HTTP_STATUS_CODE.UNAUTHORIZED], "Invalid or expired token");
      }

      const data = result.data as Record<string, any>;

      r.login_user = { ...data, _id: new Types.ObjectId(String(data["_id"])) };
      r.token = token;

      const login_user: any = await UserModel.findOne({ _id: new Node.Mongoose.Types.ObjectId(r.login_user._id) });
      if (!login_user) {
        console.log("55");
        return new HttpResponse(res, [HTTP_STATUS_CODE.UNAUTHORIZED], "User no longer exists");
      }

      r.login_user = login_user;

      const tokens: string[] = (login_user?.tokens as string[]) ?? [];
      if (!tokens.some((stored) => stored.trim() === token.trim())) {
        console.log("66");
        return new HttpResponse(res, [HTTP_STATUS_CODE.UNAUTHORIZED], "Session expired. Please log in again");
      }

      next();
    } catch (error) {
      return new HttpResponse(
        res,
        [HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR],
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.message,
      );
    }
  },
  adminOnly: async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    const r = req as Req;
    const role: string = r.login_user.role || "";

    if (role !== "ADMIN") {
      new HttpResponse(res, [HTTP_STATUS_CODE.FORBIDDEN, null], "Access restricted to Super Admins only");
      return;
    }
    next();
  },
  userOnly: async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    const r = req as Req;
    const role: string = r.login_user?.roleId?.["value_code"] ?? (r.login_user as any)?.role ?? "";
    if (role !== "USER") {
      new HttpResponse(res, [HTTP_STATUS_CODE.FORBIDDEN, null], "Access restricted to Admins only");
      return;
    }
    next();
  },
};

export default middleware;
