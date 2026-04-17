import React, { useEffect, useState } from "react";

interface SnackbarProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: "success" | "info" | "warning" | "error";
  duration?: number;
}

export const Snackbar: React.FC<SnackbarProps> = ({
  message,
  isVisible,
  onClose,
  type = "info",
  duration = 5000,
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const handleAnimationEnd = () => {
    if (!isVisible) setShouldRender(false);
  };

  if (!shouldRender) return null;

  const getIcon = () => {
    switch (type) {
      case "success": return "✅";
      case "warning": return "⚠️";
      case "error": return "❌";
      default: return "🔔";
    }
  };

  const getColors = () => {
    switch (type) {
      case "success": return { bg: "rgba(46, 125, 50, 0.9)", border: "#4caf50" };
      case "warning": return { bg: "rgba(245, 127, 23, 0.9)", border: "#ffeb3b" };
      case "error": return { bg: "rgba(211, 47, 47, 0.9)", border: "#f44336" };
      default: return { bg: "rgba(26, 26, 46, 0.9)", border: "#4a90e2" };
    }
  };

  const colors = getColors();

  return (
    <div
      onAnimationEnd={handleAnimationEnd}
      style={{
        ...styles.container,
        backgroundColor: colors.bg,
        borderLeft: `5px solid ${colors.border}`,
        animation: isVisible ? "slideIn 0.4s ease-out" : "slideOut 0.4s ease-in forwards",
      }}
    >
      <div style={styles.content}>
        <span style={styles.icon}>{getIcon()}</span>
        <span style={styles.message}>{message}</span>
      </div>
      <button onClick={onClose} style={styles.closeBtn}>×</button>
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(120%); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    top: "24px",
    right: "24px",
    padding: "16px 20px",
    borderRadius: "12px",
    color: "#fff",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: "300px",
    maxWidth: "450px",
    zIndex: 10000,
    gap: "12px",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  content: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  icon: {
    fontSize: "20px",
  },
  message: {
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "1.4",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "22px",
    cursor: "pointer",
    padding: "0 4px",
    lineHeight: 1,
    transition: "color 0.2s",
  },
};
