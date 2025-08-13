// full post page (deep link, delete)

import { useParams, Link, useNavigate } from "react-router-dom";
import { getPost, deletePost } from "../lib/postStore";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = getPost(id);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="mb-4">Post not found.</p>
        <Link to="/profile" className="btn">Back to Profile</Link>
      </div>
    );
  }

  const handleDelete = () => {
    const ok = confirm("Delete this post? This cannot be undone.");
    if (!ok) return;
    deletePost(post.id);
    navigate("/profile");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Link to="/profile" className="btn btn-ghost">← Back</Link>
        <button className="btn btn-error btn-outline" onClick={handleDelete}>Delete Post</button>
      </div>

      {/* Main image(s) */}
      {post.images?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {post.images.map((src, i) => (
            <div key={i} className="overflow-hidden rounded-xl border">
              <img src={src} alt={`post-${i}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Bio + tags */}
      <div className="bg-base-100 p-4 rounded-xl border">
        {post.bio && <p className="mb-2">{post.bio}</p>}
        {post.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((t, i) => (
              <span key={i} className="badge badge-outline">{t}</span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
