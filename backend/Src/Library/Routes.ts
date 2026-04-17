import middleware from "#Middleware/middleware";
import TaskRoute from "#Modules/Routes/Task.routes.js";
import UserRoute from "#Modules/Routes/User.routes.js";
import Node from "#Node";

Node.Express.use("/", middleware.authMiddleware, UserRoute);
Node.Express.use("/task", middleware.authMiddleware, TaskRoute);
