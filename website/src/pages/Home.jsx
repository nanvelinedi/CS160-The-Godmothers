export default function Home() {
  return (
    <div className="space-y-6">
      <div className="alert alert-info">
        <span>Retro theme check</span>
      </div>

      <button className="btn btn-primary">Primary</button>
      <button className="btn btn-secondary">Secondary</button>

      <div className="card bg-base-100 shadow-xl max-w-md">
        <div className="card-body">
          <h2 className="card-title">Should look retro</h2>
          <p>If this looks plain gray/default, DaisyUI isn’t being applied.</p>
          <div className="card-actions justify-end">
            <button className="btn">Neutral</button>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-primary text-primary-content">
        This block uses theme tokens (primary).
      </div>
    </div>
  );
}
