import { ChangeEvent, useState } from "react";

import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { apiHandler } from "../../api/apiHandler";
import { setUser } from "../../redux/slices/authSlice";
import { encrypt } from "../../Utils/helpers";

interface Payload {
  userName: string;
  password: string;
}

const initialData: Payload = {
  userName: "",
  password: "",
};

export default function SignIn() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [payload, setPayload] = useState(initialData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, status } = await apiHandler.auth.signIn(payload);
      if ([200, 201].includes(status)) {
        const encryptedToken = encrypt(data?.data?.token || "");
        const encryptedUserType = encrypt(data?.data?.role || "");
        Cookies.set("token", encryptedToken, { expires: 10 });
        Cookies.set("role", encryptedUserType, { expires: 10 });
        dispatch(setUser(data?.data));
        navigate("/task");
      } else {
        setError(data?.message || "Invalid email or password");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPayload((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>TM</div>
          <h1 style={styles.title}>Task Manager</h1>
          <p style={styles.subtitle}>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>User Name</label>
            <input
              type="text"
              name="userName"
              value={payload.userName}
              onChange={handleInputChange}
              placeholder="enter user name"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={payload.password}
              onChange={handleInputChange}
              placeholder="enter password"
              required
              style={styles.input}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
    maxWidth: 380,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  header: {
    textAlign: "center",
    marginBottom: 28,
  },
  logo: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: 10,
    background: "#1a1a2e",
    color: "#fff",
    fontWeight: 700,
    fontSize: 16,
    marginBottom: 12,
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
    marginTop: 4,
    padding: "11px",
    borderRadius: 7,
    border: "none",
    background: "#1a1a2e",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  hint: {
    marginTop: 24,
    padding: "14px",
    background: "#f9f9f9",
    borderRadius: 7,
    border: "1px solid #eee",
  },
  hintTitle: {
    margin: "0 0 8px",
    fontSize: 12,
    fontWeight: 600,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  hintChip: {
    display: "inline-block",
    marginRight: 6,
    marginBottom: 4,
    padding: "4px 10px",
    borderRadius: 20,
    background: "#e8e8f0",
    border: "none",
    fontSize: 12,
    color: "#333",
    cursor: "pointer",
  },
};
