import { ErrorResponse } from "#HttpResponse/Response";
import Node from "#Node";
import { Req } from "#Types/ExpressTypes";
import { Request } from "express";

export function generateToken(payload: object | string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  try {
    return Node.Jwt.sign(payload, secret, {
      expiresIn: "7d",
      algorithm: "HS256",
    });
  } catch (error: any) {
    ErrorResponse(error);
    throw new Error("Error generating token.");
  }
}

export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  try {
    const payload = Node.Jwt.verify(token, secret, { algorithms: ["HS256"] });
    return { status: 200, data: payload };
  } catch (error: any) {
    ErrorResponse(error);
    return { status: 400, data: error };
  }
}

export function r(req: Request): Req {
  return req as unknown as Req;
}
