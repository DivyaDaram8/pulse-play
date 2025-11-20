import React, { useState } from "react";
import api, { setAuthToken } from "../utils/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ onAuthChange }) {
  const [email, setEmail] = useState("editor@test.com");
  const [password, setPassword] = useState("111111");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const token = res.data.token;
      if (!token) throw new Error("No token returned");
      localStorage.setItem("token", token);
      setAuthToken(token);
      onAuthChange?.(true);
      nav("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
        />
        <input
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          required
        />
        <div className="flex justify-between items-center">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Login</button>
          <Link to="/signup" className="text-sm text-blue-600 underline">Create account</Link>
        </div>
      </form>
      <p className="mt-3 text-sm text-gray-500">
        Tip: create an editor user via Postman (role: editor) or use your existing user.
      </p>
    </div>
  );
}
