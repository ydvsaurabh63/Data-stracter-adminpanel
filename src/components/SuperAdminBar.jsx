import React from 'react';
import { Crown, ArrowLeft, Plus, ChevronDown, Building2, Store } from 'lucide-react';

export const SuperAdminBar = ({
  clients = [],
  activeClient,
  onSwitchClient,
  onBackToSuperAdmin,
  onOpenCreateClientModal,
}) => {
  return (
    <header className="super-admin-bar">
      <div className="super-admin-bar-left">
        <div className="super-admin-crown-badge">
          <Crown size={14} />
          <span>Super Admin</span>
        </div>

        <div className="super-admin-client-selector">
          <Store size={15} className="selector-icon" />
          <span className="selector-label">Workspace:</span>
          <select
            className="super-admin-select"
            value={activeClient?._id || ''}
            onChange={(e) => {
              const selected = clients.find((c) => c._id === e.target.value);
              if (selected) onSwitchClient(selected);
            }}
          >
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.plan || 'Pro'})
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="selector-arrow" />
        </div>
      </div>

      <div className="super-admin-bar-right">
        <button
          type="button"
          className="super-admin-action-btn secondary"
          onClick={onOpenCreateClientModal}
          title="Create New Restaurant Client"
        >
          <Plus size={14} />
          <span>New Client</span>
        </button>

        <button
          type="button"
          className="super-admin-action-btn primary"
          onClick={onBackToSuperAdmin}
          title="Return to Master Platform Admin Dashboard"
        >
          <ArrowLeft size={14} />
          <span>Exit to Master Admin</span>
        </button>
      </div>
    </header>
  );
};
