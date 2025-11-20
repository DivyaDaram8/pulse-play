import React from "react";

export default function VideoCard({ v }) {
  return (
    <div className="p-3 bg-white rounded shadow mb-3">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium">{v.originalName || v.filename}</div>
          <div className="text-sm text-gray-500">
            Status: {v.status} · Progress: {v.processingProgress || 0}%
          </div>
        </div>
        <div>
          {v.status === "safe" && (
            <a
              className="px-3 py-1 bg-indigo-600 text-white rounded"
              href={`/api/videos/stream/${v._id}`}
              target="_blank"
            >
              Play
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
