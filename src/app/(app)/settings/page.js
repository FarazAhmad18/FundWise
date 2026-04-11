export default function SettingsPage() {
  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title">Settings</h1>
        <p className="text-text-sec mt-1.5">
          Manage your profile, AI configuration, and preferences.
        </p>
      </div>

      <div className="max-w-2xl stagger-children">
        {/* Profile */}
        <div className="card mb-5">
          <h2 className="text-[15px] font-semibold text-text mb-4">Profile</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-text-sec mb-1.5">Name</label>
              <input type="text" className="input-field" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-sec mb-1.5">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" disabled />
            </div>
          </div>
        </div>

        {/* AI Configuration */}
        <div className="card mb-5">
          <h2 className="text-[15px] font-semibold text-text mb-4">AI Configuration</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-text">LLM Provider</p>
                <p className="text-xs text-text-muted">Current language model provider</p>
              </div>
              <span className="badge bg-accent-light text-accent-text">Groq</span>
            </div>
            <div className="border-t border-border-light" />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-text">Financial Data</p>
                <p className="text-xs text-text-muted">Market data provider</p>
              </div>
              <span className="badge bg-blue-light text-blue">Alpha Vantage</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-danger/20">
          <h2 className="text-[15px] font-semibold text-danger mb-4">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">Delete Account</p>
              <p className="text-xs text-text-muted">Permanently remove your account and all data</p>
            </div>
            <button className="text-sm font-medium text-danger hover:underline">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
