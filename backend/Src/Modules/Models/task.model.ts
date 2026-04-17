import mongoose, {
  AggregatePaginateModel,
  model,
  PipelineStage,
  Schema,
  Types,
} from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import { TASK_STATUS } from "#Common/Constants";

export interface IAdmin {
  _id: Types.ObjectId;
  task:string;
  status: typeof TASK_STATUS[keyof typeof TASK_STATUS],
  assignedTo:Types.ObjectId
}

const TaskSchema = new Schema<IAdmin>(
  {
    task: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: TASK_STATUS.TODO,
      enum: Object.values(TASK_STATUS),
    },
    assignedTo: {
      type: Types.ObjectId,
      ref:"users"
    },
  },
  { timestamps: true },
);

TaskSchema.plugin(aggregatePaginate);

const Task = model<IAdmin, AggregatePaginateModel<IAdmin>>(
  "tasks",
  TaskSchema,
);

export default {
  create: async (data: Record<string, any>) => {
    return Task.create(data);
  },
  insertMany: async (data: Record<string, any>) => {
    return Task.insertMany(data);
  },
  findOne: async (condition = {}, options = {}) => {
    return Task.findOne(condition, options).lean();
  },
  findByIdAndUpdate: async (
    condition = {},
    data = {},
    options = { new: true },
  ) => {
    return Task.findByIdAndUpdate(condition, data, options);
  },
  findOneAndUpdate: async <T extends Record<string, any>>(
    condition = {} as T,
    data = {} as T,
    options = {} as T,
  ) => {
    return Task.findOneAndUpdate(condition, data, options);
  },
  find: (condition = {}) => {
    return Task.find(condition);
  },
  countDocuments: async (condition = {}) => {
    return Task.countDocuments(condition);
  },
  aggregatePaginate: async (
    query: PipelineStage[] = [],
    options: Record<string, number> = { page: 1, limit: 1 },
  ) => {
    let aggregate = Task.aggregate(query);
    return Task.aggregatePaginate(aggregate, options);
  },
};
