// const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000/api/links";
const BASE_URL = import.meta.env.VITE_BASE_URL || "https://tinylink-backend-cyan.vercel.app/api/links";

async function request(path = "", options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const error = new Error(res.statusText);
    error.status = res.status;
    error.body = errorBody;
    throw error;
  }
  return res.json();
}

export async function getHealth() {
  try {
    const res = await fetch(`${BASE_URL}/healthz`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.error(err);
    return { status: 'down', uptime: 0 };
  }
}
// List all links
export const listLinks = () => request("/all");

// Create a new link
export const createLink = ({ target, code }) =>
  request("/", {
    method: "POST",
    body: JSON.stringify({ target, code }),
  });

// Delete a link
export const deleteLink = (code) =>
  request(`/${code}`, { method: "DELETE" });

// Get stats for a single code
export async function getLink(code) {
  const res = await fetch(`${BASE_URL}/${code}`);
  if (!res.ok) throw new Error('Link not found');
  return res.json();
}

// Preview target URL (optional)
export const previewLink = (code) => request(`/${code}/preview`);
// Increment click count
export const clickLink = (code) =>
  request(`/${code}/click`, { method: "POST" });
