import { AggregatePaginateModel, model, PipelineStage, Schema, Types } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import { USER_ROLES } from "#Common/Constants";

export interface IAdmin {
  _id: Types.ObjectId;
  userName: string;
  password: string;
  role: typeof USER_ROLES[keyof typeof USER_ROLES];
  tokens: string[];
}

const UserSchema = new Schema<IAdmin>(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: USER_ROLES.USER,
      enum: Object.values(USER_ROLES),
    },
    tokens: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

UserSchema.plugin(aggregatePaginate);
UserSchema.index({ userName: 1 });

const User = model<IAdmin, AggregatePaginateModel<IAdmin>>("users", UserSchema);

export default {
  create: async (data: Record<string, any>) => {
    return User.create(data);
  },
  insertMany: async (data: Record<string, any>) => {
    return User.insertMany(data);
  },
  findOne: async (condition = {}, options = {}) => {
    return User.findOne(condition, options).lean();
  },
  findByIdAndUpdate: async (condition = {}, data = {}, options = { new: true }) => {
    return User.findByIdAndUpdate(condition, data, options);
  },
  findOneAndUpdate: async <T extends Record<string, any>>(condition = {} as T, data = {} as T, options = {} as T) => {
    return User.findOneAndUpdate(condition, data, options);
  },
  find: (condition = {}) => {
    return User.find(condition);
  },
  countDocuments: async (condition = {}) => {
    return User.countDocuments(condition);
  },
  aggregatePaginate: async (query: PipelineStage[] = [], options: Record<string, number> = { page: 1, limit: 1 }) => {
    let aggregate = User.aggregate(query);
    return User.aggregatePaginate(aggregate, options);
  },
  aggregate: async (query: PipelineStage[] = []) => {
    return User.aggregate(query);
  },
};
