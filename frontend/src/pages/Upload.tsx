import * as React from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface SuccessRecord {
  id: number;
  name: string;
  email: string;
  age: number | null;
}

interface RowError {
  row: number;
  details: {
    name?: string;
    email?: string;
    age?: string;
  };
}

interface UploadResponse {
  success: SuccessRecord[];
  errors: RowError[];
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = React.useState<File | null>(null);
  const [result, setResult] = React.useState<UploadResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [editableErrors, setEditableErrors] = React.useState<
    Record<number, { name: string; email: string; age: string }>
  >({});
  const [users, setUsers] = React.useState<User[]>([]);
  const [loadingRole, setLoadingRole] = React.useState<number | null>(null);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError("");
    }
  }

  async function handleUpload() {
    if (!file) {
      setError("Please, add only CSV archive");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data.data);

      const initialEditable: Record<
        number,
        { name: string; email: string; age: string }
      > = {};
      response.data.data.errors.forEach((err: RowError) => {
        initialEditable[err.row] = { name: "", email: "", age: "" };
      });

      setEditableErrors(initialEditable);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error upload file");
    } finally {
      setLoading(false);
    }
  }

  function handleFieldChange(row: number, field: string, value: string) {
    setEditableErrors((prev) => ({
      ...prev,
      [row]: { ...prev[row], [field]: value },
    }));
  }

  async function handleRetry(rowError: RowError) {
    const edited = editableErrors[rowError.row];

    try {
      await api.post("/register", {
        name: edited.name || "",
        email: edited.email || "",
        age: edited.age ? Number(edited.age) : undefined,
        password: "TempPassword123!",
      });
      setResult((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          errors: prev.errors.filter((e) => e.row !== rowError.row),
        };
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Error retrying");
    }
  }

  function handleNewFile() {
    setFile(null);
    setResult(null);
    setError("");
    setEditableErrors({});
  }

  async function fetchUsers() {
    try {
      const response = await api.get("/users");
      setUsers(response.data.data);
    } catch (err) {
      console.error("Error users get");
    }
  }

  async function handleRoleChange(id: number, currentRole: string) {
    const newRole = currentRole === "user" ? "admin" : "user";
    setLoadingRole(id);

    try {
      await api.patch(`/users/${id}/role`, { role: newRole });
      await fetchUsers();
    } catch (error) {
      console.error("Error change rol");
    } finally {
      setLoadingRole(null);
    }
  }

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    api.get("/me").then((response) => {
      const user = response.data?.data?.user;
      if (user) {
        setCurrentUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      }
    }).catch(() => {
      localStorage.removeItem("user");
      navigate("/login");
    });

    fetchUsers();
  }, [navigate]);

  return (
    <div className="upload-container">
      <h1>Sistema de Carga de Datos</h1>
      {currentUser && (
        <p className="user-badge">Sesión activa: {currentUser.name} ({currentUser.role})</p>
      )}

      {!result ? (
        <div className="upload-box">
          <p>Selecciona un archivo de carga</p>
          <input type="file" accept=".csv" onChange={handleFileChange} />
          {error && <p className="error-message">{error}</p>}
          <button onClick={handleUpload} disabled={loading || !file || currentUser?.role !== "admin"}>
            {loading ? "Subiendo..." : "Upload File"}
          </button>
        </div>
      ) : (
        <div className="results-box">
          <div className="results-header">
            <div className="success-banner">
              ✓ {result.success.length} registros cargados exitosamente
            </div>
            <button onClick={handleNewFile}>New File</button>
          </div>

          {result.errors.length > 0 && (
            <div className="errors-section">
              <p>
                Los ({result.errors.length}) registros listados a continuación
                encontraron errores. Por favor corrígelos y reintenta.
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Fila</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((rowError) => (
                    <tr key={rowError.row}>
                      <td>{rowError.row}</td>
                      <td>
                        <input
                          type="text"
                          value={editableErrors[rowError.row]?.name || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              rowError.row,
                              "name",
                              e.target.value,
                            )
                          }
                          className={rowError.details.name ? "input-error" : ""}
                        />
                        {rowError.details.name && (
                          <span className="error-message">
                            {rowError.details.name}
                          </span>
                        )}
                      </td>
                      <td>
                        <input
                          type="email"
                          value={editableErrors[rowError.row]?.email || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              rowError.row,
                              "email",
                              e.target.value,
                            )
                          }
                          className={
                            rowError.details.email ? "input-error" : ""
                          }
                        />
                        {rowError.details.email && (
                          <span className="error-message">
                            {rowError.details.email}
                          </span>
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editableErrors[rowError.row]?.age || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              rowError.row,
                              "age",
                              e.target.value,
                            )
                          }
                          className={rowError.details.age ? "input-error" : ""}
                        />
                        {rowError.details.age && (
                          <span className="error-message">
                            {rowError.details.age}
                          </span>
                        )}
                      </td>
                      <td>
                        <button onClick={() => handleRetry(rowError)}>
                          Retry
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {currentUser?.role === "admin" && (
      <div className="users-section">
        <h2>Gestión de usuarios</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    onClick={() => handleRoleChange(user.id, user.role)}
                    disabled={loadingRole === user.id}
                  >
                    {loadingRole === user.id
                      ? "Cambiando..."
                      : user.role === "user"
                        ? "Hacer admin"
                        : "Hacer user"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
