import UserController from "#Modules/Controllers/User.controller.js";
import Node from "#Node";
import middleware from "#Middleware/middleware";

Node.Router.route("/users").get(middleware.adminOnly, UserController.list);
Node.Router.route("/sign-in").post(UserController.signIn);

export default Node.Router;

