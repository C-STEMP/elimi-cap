import { store, persistor } from "@/store";
import { logout } from "@/store/slices/authSlice";
import { clearTokens } from "@/lib/auth-storage";

export const handleLogout = () => {
  try {
    clearTokens();
    store.dispatch(logout());
    if (persistor && typeof persistor.purge === "function") {
      persistor.purge();
    }
  } catch (err) {
    console.error("Error during logout cleanup:", err);
  }

  if (typeof window !== "undefined") {
    window.location.href = "/signin";
  }
};
