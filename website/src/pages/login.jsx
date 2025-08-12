// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // store error message

  const handleLogin = (e) => {
    e.preventDefault();

    // Dummy admin credentials
    if (email === "admin@example.com" && password === "password123") {
      setError(""); // clear any old error
      navigate("/admin");
    } else {
      setError("Invalid credentials — please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <form
        onSubmit={handleLogin}
        className="fieldset bg-base-100 border-base-300 rounded-box w-full max-w-xs border p-6 shadow"
      >
        <legend className="fieldset-legend text-lg font-bold mb-4">
          Admin Login
        </legend>

        {/* Error alert */}
        {error && (
          <div role="alert" className="alert alert-error mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <label className="label">
          <span className="label-text">Email</span>
        </label>
        <input
          type="email"
          className="input input-bordered w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="label mt-2">
          <span className="label-text">Password</span>
        </label>
        <input
          type="password"
          className="input input-bordered w-full"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="btn btn-primary w-full mt-4">
          Login
        </button>

        <p className="mt-4 text-xs text-center text-gray-500">
          Only for project demo — use{" "}
          <span className="font-mono">admin@example.com</span> /{" "}
          <span className="font-mono">password123</span>
        </p>
      </form>
    </div>
  );
}
