// src/pages/AdminPage.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  getPendingEvents,
  approvePendingById,
  rejectPendingById,
} from "../lib/eventStorage";

function Field({ label, children }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="font-medium min-w-20">{label}</span>
      <span className="opacity-80">{children}</span>
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);

  const refresh = useCallback(() => setPending(getPendingEvents()), []);

  useEffect(() => { refresh(); }, [refresh]);

  const onApprove = useCallback((id) => { approvePendingById(id); refresh(); }, [refresh]);
  const onReject  = useCallback((id) => { rejectPendingById(id);  refresh(); }, [refresh]);

  const handleLogout = useCallback(() => {
    ["adminAuthed", "isAdmin", "admin", "adminToken"].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Admin • Pending Events</h1>
        <div className="flex gap-2">
          {/* <button className="btn btn-ghost" onClick={() => navigate("/search")}>Back to Explore</button> */}
          <button className="btn btn-outline" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="alert">No pending submissions.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pending.map((evt) => (
            <div key={evt.id} className="card bg-base-100 shadow">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <h2 className="card-title">{evt.name}</h2>
                  <span className="badge">
                    {evt.submittedAt ? new Date(evt.submittedAt).toLocaleDateString() : "—"}
                  </span>
                </div>

                {evt.images?.length > 0 && (
                  <div className="mt-2 carousel carousel-center w-full rounded-box bg-base-200 p-1 space-x-2">
                    {evt.images.map((src, i) => (
                      <div key={i} className="carousel-item">
                        <img src={src} alt="" className="h-36 object-contain rounded-box" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 space-y-2">
                  <Field label="Address">{evt.address}</Field>
                  <Field label="Date">{evt.date}</Field>
                  {evt.time && <Field label="Time">{evt.time}</Field>}
                  {evt.price && <Field label="Price">{evt.price}</Field>}
                  {evt.website && (
                    <Field label="Website">
                      <a className="link link-primary" href={evt.website} target="_blank" rel="noreferrer">
                        {evt.website}
                      </a>
                    </Field>
                  )}
                  {evt.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {evt.tags.map((t) => <span key={t} className="badge badge-outline">{t}</span>)}
                    </div>
                  )}
                  {(evt.bio || evt.description) && (
                    <div>
                      <div className="font-medium mb-1">About</div>
                      <p className="text-sm opacity-80 leading-relaxed">{evt.bio || evt.description}</p>
                    </div>
                  )}
                </div>

                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-outline btn-error" onClick={() => onReject(evt.id)}>Reject</button>
                  <button className="btn btn-primary" onClick={() => onApprove(evt.id)}>Approve</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
