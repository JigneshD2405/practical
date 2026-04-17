import { USER_ROLES } from "#Common/Constants";
import { HTTP_ERRORS, HTTP_STATUS_CODE } from "#HttpResponse/index";
import { ErrorResponse, HttpResponse } from "#HttpResponse/Response";
import UserModel from "#Modules/Models/User.model.js";
import { UserSchema } from "#Modules/Validator/User.validator.js";
import Node from "#Node";
import { Req } from "#Types/ExpressTypes";
import { generateToken } from "#Utils/index";
import type { Request, Response } from "express";

const Keyword = "User";

(async function () {
  try {
    const count = await UserModel.countDocuments();
    if (count > 0) return;

    const salt = await Node.Bcrypt.genSalt(10);
    const password = await Node.Bcrypt.hash("password", salt);
    let usersArr = [
      {
        userName: "Admin",
        role: USER_ROLES.ADMIN,
        password: password,
      },
      {
        userName: "user_1",
        role: USER_ROLES.USER,
        password: password,
      },
      {
        userName: "user_2",
        role: USER_ROLES.USER,
        password: password,
      },
    ];
    await UserModel.insertMany(usersArr);
  } catch (error) {
    console.error("Error seeding users:", error);
  }
})();

export default {
  signIn: async (req: Request, res: Response) => {
    try {
      const { error, value } = UserSchema.validate(req.body || {});
      if (error) {
        throw new HTTP_ERRORS.CustomError(error.details[0].message);
      }
      let user = await UserModel.findOne({ userName: value.userName });
      if (!user) throw new HTTP_ERRORS.NotFoundError(Keyword);

      const isValidPassword = await Node.Bcrypt.compare(value.password, user.password);
      if (!isValidPassword) throw new HTTP_ERRORS.CustomError("Invalid User Credentials");

      const token = await generateToken({
        _id: user._id,
        role: user.role,
      });

      user = await UserModel.findOneAndUpdate({ _id: user._id }, { $push: { tokens: token } }, { new: true });

      let payload = {
        token: token,
        role: user?.role,
        user_id: user?._id,
        userName: user?.userName,
      };
      return new HttpResponse(res, [HTTP_STATUS_CODE.OK, payload], "Sign in");
    } catch (error: any) {
      console.error("Sign-in error:", error);
      return new HttpResponse(res, ErrorResponse(error as Error), "");
    }
  },

  list: async (req: Request, res: Response) => {
    try {
      const r = req as Req;
      let payload = await UserModel.aggregate([
        {
          $match: {
            role: { $ne: USER_ROLES.ADMIN },
          },
        },
        {
          $sort: {
            userName: 1,
          },
        },
      ]);
      return new HttpResponse(res, [HTTP_STATUS_CODE.LIST, payload], Keyword);
    } catch (error: any) {
      return new HttpResponse(res, ErrorResponse(error as Error), "");
    }
  },
};
