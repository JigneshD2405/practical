import UserModel from "#Modules/Models/User.model.js";
import Node from "#Node";
import { verifyToken } from "#Utils/index";
import { Server } from "socket.io";
export const load = () => {
  try {
    console.info("Loading... Node Socket.");
    Node.Socket = new Server(Node.HttpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 10000,
    });
    Node.Socket.use(async (socket, next) => {
      try {
        const authHeader = socket.handshake.auth.token;

        if (!authHeader) {
          console.log("line 23");

          return next(new Error("Unauthorized user"));
        }
        const [type, token] = authHeader.split(" ");
        if (type !== "Bearer" || !token) {
          console.log("line 29");
          return next(new Error("Unauthorized user"));
        }
        const payload = verifyToken(token);
        if (!payload || payload.status === 400 || !payload.data?._id) {
          console.log("line 34");
          return next(new Error("Unauthorized user"));
        }

        const userId = new Node.Mongoose.Types.ObjectId(payload.data._id);

        const login_user = await UserModel.findOne({
          _id: userId,
        });

        if (!login_user) {
          console.log("line 46");
          return next(new Error("Unauthorized user"));
        }

        if (!Array.isArray(login_user?.tokens) || !login_user.tokens.some((stored) => stored.trim() === token.trim())) {
          console.log("line 51");
          return next(new Error("Unauthorized user"));
        }
        socket.data.login_user = login_user;
        socket.data.token = token;

        next();
      } catch (error) {
        console.log("Error in Load Socket Middleware!", error);
        return next(new Error("Internal Server Error"));
      }
    });
    Node.Socket.on("connection", (socket) => {
      console.info(`New client connected: ${socket.id}`);
      const login_user = socket.data.login_user;
      const roomId = login_user._id.toString();

      socket.join(roomId);
      if (socket.rooms.has(roomId)) {
        console.log(`✓ Socket ${socket.id} successfully joined room: ${roomId}`);
      } else {
        console.error(`✗ Failed to join room: ${roomId}`);
      }
      socket.on("error", (err) => {
        console.log("Error :- ", err);
        socket.disconnect();
      });
    });
  } catch (error) {
    console.log("Error occurred in Socket :- ", error);
  }
};
