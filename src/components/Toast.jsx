import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

let toastId = 0;

// Global toast manager
const toastListeners = new Set();
const addToast = (message, type = "success", duration = 3000) => {
  const id = toastId++;
  const toast = { id, message, type, duration };
  toastListeners.forEach((listener) => listener(toast));
  return id;
};

export const toast = {
  success: (message, duration) => addToast(message, "success", duration),
  error: (message, duration) => addToast(message, "error", duration),
  info: (message, duration) => addToast(message, "info", duration),
  warning: (message, duration) => addToast(message, "warning", duration),
};

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (newToast) => {
      setToasts((prev) => [...prev, newToast]);

      // Auto remove after duration
      if (newToast.duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, newToast.duration);
      }
    };

    toastListeners.add(listener);
    return () => toastListeners.delete(listener);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <XCircle size={20} />;
      case "warning":
        return <AlertCircle size={20} />;
      case "info":
        return <Info size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case "success":
        return "bg-gray-900 text-white border-l-4 border-gray-700";
      case "error":
        return "bg-gray-900 text-white border-l-4 border-gray-700";
      case "warning":
        return "bg-gray-900 text-white border-l-4 border-gray-700";
      case "info":
        return "bg-gray-900 text-white border-l-4 border-gray-700";
      default:
        return "bg-gray-900 text-white border-l-4 border-gray-700";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${getColors(
            t.type
          )} px-5 py-3 rounded-md shadow-lg flex items-center space-x-3 min-w-[300px] max-w-md animate-slide-in pointer-events-auto`}
          onClick={() => removeToast(t.id)}
        >
          <div className="flex-shrink-0">{getIcon(t.type)}</div>
          <span className="flex-1 text-sm font-medium">{t.message}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeToast(t.id);
            }}
            className="flex-shrink-0 text-white opacity-70 hover:opacity-100 transition"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
