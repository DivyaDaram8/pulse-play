import React, { useState } from "react";
import api from "../utils/api";

export default function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Pick a file");
    const fd = new FormData();
    fd.append("video", file);
    setUploading(true);
    try {
      const res = await api.post("/api/videos/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) =>
          setProgress(Math.round((p.loaded / p.total) * 100)),
      });
      onUploaded(res.data.video);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h3 className="font-medium mb-2">Upload Video</h3>
      <form onSubmit={submit} className="flex gap-2 items-center">
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button
          disabled={uploading}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Upload
        </button>
      </form>
      {uploading && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Uploading: {progress}%
          </div>
        </div>
      )}
    </div>
  );
}
