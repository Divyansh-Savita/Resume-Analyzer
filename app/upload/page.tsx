"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
  console.log("HANDLER CALLED");

  if (!file) return alert("Select a file");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/resume/upload", {
    method: "POST",
    body: formData,
  });

  console.log("Response status:", res.status);

  const data = await res.json();
  console.log(data);
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-3xl font-bold">Upload Resume</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
      type="button"
        onClick={handleUpload}
        className="bg-black text-white px-6 py-2 rounded"
      >
        Upload
      </button>
    </div>
  );
}
