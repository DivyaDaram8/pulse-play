import React, { useState } from "react";
import api, { setAuthToken } from "../utils/api";
import { useNavigate, Link } from "react-router-dom";

export default function Signup({ onAuthChange }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("editor"); // default to editor because you'll need upload rights
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/api/auth/register", { name, email, password, role });
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
      <h2 className="text-xl font-semibold mb-4">Sign up</h2>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 border rounded" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" required />
        <input className="w-full p-2 border rounded" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" type="email" required />
        <input className="w-full p-2 border rounded" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" type="password" required />
        <div>
          <label className="text-sm mr-2">Role:</label>
          <select value={role} onChange={(e)=>setRole(e.target.value)} className="p-1 border rounded">
            <option value="viewer">viewer</option>
            <option value="editor">editor</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div className="flex justify-between items-center">
          <button className="px-4 py-2 bg-green-600 text-white rounded">Create</button>
          <Link to="/login" className="text-sm text-blue-600 underline">Have an account?</Link>
        </div>
      </form>
    </div>
  );
}
