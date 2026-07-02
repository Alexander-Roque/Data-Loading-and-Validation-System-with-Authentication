import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../services/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [authorized, setAuthorized] = React.useState<boolean | null>(null);
  const location = useLocation();

  React.useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) {
      setAuthorized(false);
      return;
    }

    api
      .get("/me")
      .then(() => setAuthorized(true))
      .catch(() => {
        sessionStorage.removeItem("user");
        setAuthorized(false);
      });
  }, []);

  if (authorized === null) {
    return <p>Cargando...</p>;
  }

  if (!authorized) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
