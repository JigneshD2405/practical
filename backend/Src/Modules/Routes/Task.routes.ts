import middleware from "#Middleware/middleware";
import TaskController from "#Modules/Controllers/Task.controller.js";
import Node from "#Node";

Node.Router.route("/")
  .post(
    middleware.adminOnly,

    TaskController.post,
  )
  .get(TaskController.list);
Node.Router.route("/:id").patch(TaskController.patch);

export default Node.Router;
