//tiny client DB + helper funcs

const KEY = "amf_posts";
export const POSTS_EVENT = "amf_posts_updated";

// Read all
export function getAllPosts() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// Read one
export function getPost(id) {
  return getAllPosts().find(p => p.id === id);
}

// Create
export function savePost(post) {
  const posts = getAllPosts();
  posts.unshift(post);
  localStorage.setItem(KEY, JSON.stringify(posts));
  window.dispatchEvent(new Event(POSTS_EVENT));
}

// Update (optional, for edits)
export function updatePost(id, partial) {
  const posts = getAllPosts().map(p => (p.id === id ? { ...p, ...partial } : p));
  localStorage.setItem(KEY, JSON.stringify(posts));
  window.dispatchEvent(new Event(POSTS_EVENT));
}

// Delete
export function deletePost(id) {
  const posts = getAllPosts().filter(p => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(posts));
  window.dispatchEvent(new Event(POSTS_EVENT));
}

// (Dev convenience) expose a global helper in dev builds
if (import.meta?.env?.DEV) {
  window.amfPosts = {
    getAllPosts,
    getPost,
    updatePost,
    deletePost,
    subscribe(fn) {
      const handler = () => fn(getAllPosts());
      window.addEventListener(POSTS_EVENT, handler);
      return () => window.removeEventListener(POSTS_EVENT, handler);
    }
  };
}

// Resize an image file to a max side (keeps aspect ratio) and return a dataURL
export async function fileToDataURLResized(file, maxSide = 768) {
  const dataURL = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = e => resolve(e.target.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataURL;
  });

  const { width, height } = img;
  const maxDim = Math.max(width, height);
  if (!maxDim || maxDim <= maxSide) return dataURL; // no need to scale

  const scale = maxSide / maxDim;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

