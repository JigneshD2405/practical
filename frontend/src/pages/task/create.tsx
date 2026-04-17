import { apiHandler } from "@/api/apiHandler";
import { USER_ROLES } from "@/Utils/constants";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";

export default function CreateTask() {
  const { user } = useSelector((state: any) => state.auth);

  const navigate = useNavigate();

  const [task, setTask] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.role === USER_ROLES.ADMIN) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const { data, status } = await apiHandler.user.list();
      if ([200, 201].includes(status)) {
        setUsers(data?.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { status } = await apiHandler.task.create({ task, assignedTo });
      if ([200, 201].includes(status)) {
        navigate("/task");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== USER_ROLES.ADMIN) {
    return (
      <div style={styles.unauthorized}>
        <h2>Unauthorized Access</h2>
        <p>Only administrators can create new tasks.</p>
        <Link to="/task" style={styles.link}>
          Return to Tasks
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create New Task</h2>
          <p style={styles.subtitle}>Assign a task to a user</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Task Description</label>
            <input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              required
              style={styles.input}
              placeholder="E.g., Complete UI overhaul"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Assign To</label>
            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} required style={styles.input}>
              <option value="" disabled>
                Select a user
              </option>
              {users?.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.userName} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button type="submit" disabled={loading} style={{ ...styles.button, flex: 1 }}>
              {loading ? "Creating..." : "Create Task"}
            </button>
            <Link
              to="/task"
              style={{
                ...styles.button,
                flex: 1,
                background: "#eee",
                color: "#333",
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  unauthorized: {
    padding: "60px 20px",
    textAlign: "center",
    fontFamily: "'Segoe UI', sans-serif",
  },
  link: {
    color: "#1a1a2e",
    textDecoration: "underline",
    fontWeight: 600,
  },
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f5",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 10,
    padding: "36px 32px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  header: {
    textAlign: "center",
    marginBottom: 28,
  },
  title: {
    margin: "0 0 4px",
    fontSize: 22,
    fontWeight: 700,
    color: "#111",
  },
  subtitle: {
    margin: 0,
    fontSize: 14,
    color: "#888",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#444",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 7,
    border: "1px solid #ddd",
    fontSize: 14,
    color: "#111",
    outline: "none",
    transition: "border-color 0.2s",
    background: "#fff",
  },
  error: {
    margin: 0,
    fontSize: 13,
    color: "#d32f2f",
    background: "#fff5f5",
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #ffcdd2",
  },
  button: {
    padding: "11px",
    borderRadius: 7,
    border: "none",
    background: "#1a1a2e",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
