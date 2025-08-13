// form to create a post (photos required)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { savePost, fileToDataURLResized } from "../lib/postStore";

const MIN_BYTES = 50 * 1024;        // 50KB
const MAX_BYTES = 6 * 1024 * 1024;  // 6MB
const MIN_W = 400, MIN_H = 400;

export default function NewPost() {
  const [bio, setBio] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const checkDimensions = (file) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width >= MIN_W && img.height >= MIN_H);
    img.onerror = () => resolve(false);
    img.src = URL.createObjectURL(file);
  });

  const handleFiles = async (e) => {
    const list = Array.from(e.target.files || []);
    const errs = [], ok = [];
    for (const f of list) {
      if (f.size < MIN_BYTES) { errs.push(`${f.name}: too small (<50KB)`); continue; }
      if (f.size > MAX_BYTES) { errs.push(`${f.name}: too large (>6MB)`); continue; }
      if (!(await checkDimensions(f))) { errs.push(`${f.name}: min ${MIN_W}×${MIN_H}px`); continue; }
      ok.push(f);
    }
    setErrors(errs);
    setFiles(ok);
    setPreviews(ok.map(f => URL.createObjectURL(f)));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) { setErrors(["Please upload at least one photo."]); return; }

    setSubmitting(true);
    try {
      const images = [];
      for (const f of files) images.push(await fileToDataURLResized(f, 768));
      const id = crypto.randomUUID();
      const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
      savePost({
        id, createdAt: Date.now(),
        title: "",
        bio: bio.trim(),
        tags,
        images,
        coverThumb: images[0] || null,
        author: { id: "me", name: "New User" },
      });
      navigate("/profile#posts");
    } catch (err) {
      setErrors([`Failed to save post: ${String(err)}`]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* Darker background + perfectly centered card */
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl">
        <div className="card bg-base-100 shadow-2xl rounded-2xl">
          <div className="card-body p-8 md:p-10 space-y-6">
            <h1 className="text-3xl font-extrabold text-center">Create a New Post</h1>

            {errors.length > 0 && (
              <div className="alert alert-warning">
                <ul className="list-disc ml-5">{errors.map((e,i)=><li key={i}>{e}</li>)}</ul>
              </div>
            )}

            <form className="space-y-6" onSubmit={onSubmit}>
              {/* Upload photos */}
              <div className="form-control">
                <span className="block mb-2 text-sm font-medium">Upload photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="file-input file-input-bordered w-full"
                  onChange={handleFiles}
                />
                <span className="mt-1 block text-xs opacity-70">
                  Allowed: 50KB–6MB, min {MIN_W}×{MIN_H}px.
                </span>
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {previews.map((src, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-2xl ring-1 ring-base-300">
                      <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Bio (label above) */}
              <div className="form-control">
                <span className="block mb-2 text-sm font-medium">Bio</span>
                <textarea
                  className="textarea textarea-bordered"
                  rows={5}
                  value={bio}
                  onChange={(e)=>setBio(e.target.value)}
                  placeholder="Tell people about your style, commissions, etc."
                />
              </div>

              {/* Tags (label above + hint under input) */}
              <div className="form-control">
                <span className="block mb-2 text-sm font-medium">Tags</span>
                <input
                  className="input input-bordered"
                  value={tagsInput}
                  onChange={e=>setTagsInput(e.target.value)}
                  placeholder="chibi, kawaii, pastel"
                />
                <span className="mt-1 block text-xs opacity-70">Comma-separated</span>
              </div>

              {/* Submit */}
              <div className="pt-2 flex justify-center">
                <button
                  className={`btn btn-primary btn-wide ${submitting ? "loading" : ""}`}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Submit Post"}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
