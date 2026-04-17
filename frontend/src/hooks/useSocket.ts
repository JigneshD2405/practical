import { decrypt } from "@/Utils/helpers";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (userId: string | undefined) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "info" | "warning" | "error";
  } | null>(null);
  const [newTaskAssigned, setNewTaskAssigned] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;

    const token = decrypt(Cookies.get("token") || "");

    const backendUrl = process.env.VITE_BACKEND_API || "http://localhost:8080";

    const socketInstance = io(backendUrl, {
      auth: { token: `Bearer ${token}` },
      extraHeaders: { Authorization: `Bearer ${token}` },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to socket server");
    });

    socketInstance.on("task_assigned", (data: any) => {
      setNotification({
        message: `New task assigned: ${data.task.task}`,
        type: "info",
      });
      setNewTaskAssigned(data.task);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  return { socket, notification, setNotification, newTaskAssigned, setNewTaskAssigned };
};
