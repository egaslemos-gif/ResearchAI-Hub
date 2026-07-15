"use client";
import { useEffect, useState } from "react";

export default function DebugPage() {
  const [data, setData] = useState<string>("");

  useEffect(() => {
    const raw = localStorage.getItem("raihub:v2:workspaces");
    if (raw) {
      setData(raw);
    } else {
      setData("NO DATA FOUND");
    }
  }, []);

  return (
    <pre style={{ fontSize: "10px", whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: "100vh", overflow: "auto" }}>
      {data}
    </pre>
  );
}
