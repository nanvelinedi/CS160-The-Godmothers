// shows all posts as JSON at /dev/posts
// at least it should idk i didn't test this....

import { useEffect, useState } from "react";
import { getAllPosts, POSTS_EVENT } from "../lib/postStore";

export default function DevPostsJson() {
  const [json, setJson] = useState("");

  const refresh = () => setJson(JSON.stringify(getAllPosts(), null, 2));

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener(POSTS_EVENT, onUpdate);
    return () => window.removeEventListener(POSTS_EVENT, onUpdate);
  }, []);

  const download = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "posts.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">All Posts (JSON)</h1>
        <div className="flex gap-2">
          <button className="btn btn-sm" onClick={refresh}>Refresh</button>
          <button className="btn btn-sm btn-primary" onClick={download}>Download posts.json</button>
        </div>
      </div>
      <pre className="mockup-code overflow-auto max-h-[70vh]">
        <code>{json}</code>
      </pre>
    </div>
  );
}
