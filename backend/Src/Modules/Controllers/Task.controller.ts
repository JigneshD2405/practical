import { USER_ROLES } from "#Common/Constants";
import { HTTP_ERRORS, HTTP_STATUS_CODE } from "#HttpResponse/index";
import { ErrorResponse, HttpResponse } from "#HttpResponse/Response";
import TaskModel from "#Modules/Models/task.model.js";
import { TaskSchema, TaskUpdateSchema } from "#Modules/Validator/Task.validator.js";
import Node from "#Node";
import { Req } from "#Types/ExpressTypes";
import type { Request as ExpressRequest, Response } from "express";

const Keyword = "Task";

export default {
  post: async (req: ExpressRequest, res: Response) => {
    const r = req as Req;
    try {
      const { error } = TaskSchema.validate(r.body);
      if (error) {
        throw new HTTP_ERRORS.CustomError(error.details[0].message);
      }
      let payload = await TaskModel.create(r.body);

      if (payload.assignedTo && Node.Socket) {
        Node.Socket.to(payload.assignedTo.toString()).emit("task_assigned", {
          message: "You have been assigned a new task.",
          task: payload,
        });
      }

      return new HttpResponse(res, [HTTP_STATUS_CODE.CREATED, payload], Keyword);
    } catch (error) {
      return new HttpResponse(res, ErrorResponse(error as Error), "");
    }
  },
  patch: async (req: ExpressRequest, res: Response) => {
    try {
      const taskId = new Node.Mongoose.Types.ObjectId(req?.params?.id as string);
      const { error, value } = TaskUpdateSchema.validate(req.body);
      if (error) {
        throw new HTTP_ERRORS.CustomError(error.details[0].message);
      }
      let payload = await TaskModel.findOneAndUpdate(
        { _id: taskId },
        { $set: { status: value?.status } },
        { new: true },
      );
      return new HttpResponse(res, [HTTP_STATUS_CODE.UPDATED, payload], Keyword);
    } catch (error: any) {
      console.error("Task patch error:", error);
      return new HttpResponse(res, ErrorResponse(error as Error), "");
    }
  },
  list: async (req: ExpressRequest, res: Response) => {
    try {
      const r = req as Req;
      let { page = 1, limit = 10 } = r.query;
      let filterObj: Record<string, any> = {};
      if (r.login_user.role === USER_ROLES.USER) {
        filterObj.assignedTo = new Node.Mongoose.Types.ObjectId(r.login_user._id);
      }
      let payload = await TaskModel.aggregatePaginate(
        [
          {
            $match: filterObj,
          },
          {
            $lookup: {
              from: "users",
              localField: "assignedTo",
              foreignField: "_id",
              as: "assignedTo",
            },
          },
          {
            $unwind: {
              path: "$assignedTo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
        ],
        {
          page: Number(page),
          limit: Number(limit),
        },
      );
      return new HttpResponse(res, [HTTP_STATUS_CODE.LIST, payload], Keyword);
    } catch (error: any) {
      return new HttpResponse(res, ErrorResponse(error as Error), "");
    }
  },
};
