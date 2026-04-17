import { apiHandler } from "@/api/apiHandler";
import { TASK_STATUS, USER_ROLES } from "@/Utils/constants";
import { decrypt } from "@/Utils/helpers";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { Snackbar } from "../../components/Snackbar";
import { useSocket } from "../../hooks/useSocket";
import { logout, selectUser } from "../../redux/slices/authSlice";

export interface Task {
  _id: string;
  task: string;
  status: (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
  assignedTo: { _id: string; userName: string } | string;
  createdAt: string;
}

const PAGE_SIZE = 5;

const STATUS_STYLE: Record<Task["status"], React.CSSProperties> = {
  [TASK_STATUS.TODO]: { background: "#e8eaf6", color: "#3949ab" },
  [TASK_STATUS.IN_PROGRESS]: { background: "#fff8e1", color: "#f57f17" },
  [TASK_STATUS.DONE]: { background: "#e8f5e9", color: "#2e7d32" },
};

const STATUS_LABELS: Record<Task["status"], string> = {
  [TASK_STATUS.TODO]: "To Do",
  [TASK_STATUS.IN_PROGRESS]: "In Progress",
  [TASK_STATUS.DONE]: "Done",
};

export default function TaskList() {
  const token = decrypt(Cookies.get("token") || "");

  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const navigate = useNavigate();

  const { notification, setNotification, newTaskAssigned, setNewTaskAssigned } = useSocket(user?.user_id);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (newTaskAssigned) {
      fetchTasks();
      setNewTaskAssigned(null);
    }
  }, [newTaskAssigned]);

  useEffect(() => {
    if (!user || !token) {
      navigate("/sign-in");
      return;
    }
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, status } = await apiHandler.task.list();
      if ([200, 201].includes(status)) {
        setTasks(data?.data?.docs || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong while fetching tasks");
    } finally {
      setLoading(false);
    }
  };

  const onUpdateStatus = async (task: Task) => {
    const newStatus = task.status === TASK_STATUS.TODO ? TASK_STATUS.IN_PROGRESS : TASK_STATUS.DONE;
    const oldStatus = task.status;

    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t)));

    try {
      await apiHandler.task.update(task._id, { status: newStatus });
      setNotification({ message: `Task status updated to ${newStatus}`, type: "success" });
    } catch (err: any) {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: oldStatus } : t)));
      setNotification({
        message: err.response?.data?.message || "Failed to update task status",
        type: "error",
      });
      console.error("Failed to update task status", err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    Cookies.remove("token");
    Cookies.remove("role");
    navigate("/sign-in");
  };

  const totalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));
  const paginated = tasks?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const assigneeName = (t: Task) => (typeof t.assignedTo === "object" ? t.assignedTo.userName : t.assignedTo);

  return (
    <div style={styles.wrapper}>
      <Snackbar
        message={notification?.message || ""}
        isVisible={!!notification}
        onClose={() => setNotification(null)}
        type={notification?.type || "info"}
      />

      <div style={styles.headerRow}>
        <div style={styles.userDetails}>
          <h2 style={styles.title}>
            Tasks <span style={styles.count}>{tasks.length}</span>
          </h2>
          <p style={styles.userAndTask}>
            Welcome <strong>{user?.userName}</strong>, you have {tasks.length} tasks assigned
          </p>
        </div>
        <div style={styles.filters}>
          {user?.role === USER_ROLES.ADMIN && (
            <Link
              to="/task/create"
              style={{ ...styles.filterBtn, background: "#1a1a2e", color: "white", textDecoration: "none" }}
            >
              Create Task
            </Link>
          )}
          <button
            onClick={handleLogout}
            style={{ ...styles.filterBtn, background: "#d32f2f", color: "#fff", border: "none" }}
          >
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <p style={styles.center}>Loading tasks…</p>
      ) : error ? (
        <p style={{ ...styles.center, color: "#d32f2f" }}>{error}</p>
      ) : paginated.length === 0 ? (
        <div style={styles.empty}>
          <p>No tasks found.</p>
        </div>
      ) : (
        <>
          <div style={styles.table}>
            <div style={{ ...styles.row, ...styles.thead }}>
              <span style={{ ...styles.cell, flex: 3 }}>Description</span>
              {user?.role === USER_ROLES.ADMIN && <span style={{ ...styles.cell, flex: 2 }}>Assignee</span>}
              <span style={{ ...styles.cell, flex: 1.5 }}>Status</span>
              <span style={{ ...styles.cell, flex: 1.5 }}>Created</span>
              {user?.role === USER_ROLES.USER && (
                <span style={{ ...styles.cell, flex: 1, textAlign: "right" }}>Action</span>
              )}
            </div>

            {paginated.map((task) => (
              <div key={task._id} style={styles.row}>
                <span style={{ ...styles.cell, flex: 3, fontWeight: 500, color: "#111" }}>{task.task}</span>
                {user?.role === USER_ROLES.ADMIN && (
                  <span style={{ ...styles.cell, flex: 2, color: "#555" }}>{assigneeName(task)}</span>
                )}
                <span style={{ ...styles.cell, flex: 1.5 }}>
                  <span style={{ ...styles.statusPill, ...STATUS_STYLE[task.status] }}>
                    {STATUS_LABELS[task.status]}
                  </span>
                </span>
                <span style={{ ...styles.cell, flex: 1.5, color: "#888", fontSize: 12 }}>
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
                {user?.role === USER_ROLES.USER && (
                  <span style={{ ...styles.cell, flex: 1, textAlign: "right" }}>
                    <button
                      onClick={() => onUpdateStatus(task)}
                      disabled={task.status === TASK_STATUS.DONE}
                      style={styles.updateBtn}
                    >
                      {task.status === TASK_STATUS.TODO
                        ? "Start Progress"
                        : task.status === TASK_STATUS.DONE
                          ? "Completed"
                          : "Complete"}
                    </button>
                  </span>
                )}
              </div>
            ))}
          </div>

          <div style={styles.pagination}>
            <span style={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <div style={styles.pageButtons}>
              <button style={styles.pageBtn} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  style={{
                    ...styles.pageBtn,
                    ...(p === page ? styles.pageBtnActive : {}),
                  }}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button style={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    padding: "24px 16px",
    fontFamily: "'Segoe UI', sans-serif",
    maxWidth: 860,
    margin: "0 auto",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  userDetails: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#111",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  userAndTask: {
    margin: 0,
  },
  count: {
    fontSize: 13,
    fontWeight: 600,
    background: "#e0e0e0",
    color: "#555",
    padding: "2px 8px",
    borderRadius: 20,
  },
  filters: {
    display: "flex",
    gap: 6,
  },
  filterBtn: {
    padding: "6px 12px",
    borderRadius: 20,
    border: "1px solid #ddd",
    background: "#fafafa",
    color: "#666",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
  },
  table: {
    border: "1px solid #eee",
    borderRadius: 8,
    overflow: "hidden",
  },
  thead: {
    background: "#f7f7f8",
    borderBottom: "1px solid #eee",
  },
  row: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #f0f0f0",
    transition: "background 0.1s",
  },
  cell: {
    fontSize: 13,
    color: "#444",
    fontWeight: 500,
    paddingRight: 12,
  },
  statusPill: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
  },
  updateBtn: {
    padding: "5px 12px",
    borderRadius: 6,
    border: "1px solid #1a1a2e",
    background: "transparent",
    color: "#1a1a2e",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  center: {
    textAlign: "center",
    color: "#888",
    padding: "40px 0",
  },
  empty: {
    textAlign: "center",
    padding: "48px 0",
    color: "#aaa",
    fontSize: 14,
    border: "1px dashed #ddd",
    borderRadius: 8,
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  pageInfo: {
    fontSize: 13,
    color: "#888",
  },
  pageButtons: {
    display: "flex",
    gap: 4,
  },
  pageBtn: {
    padding: "5px 10px",
    borderRadius: 6,
    border: "1px solid #ddd",
    background: "#fff",
    color: "#555",
    fontSize: 12,
    cursor: "pointer",
  },
  pageBtnActive: {
    background: "#1a1a2e",
    color: "#fff",
    border: "1px solid #1a1a2e",
  },
};
