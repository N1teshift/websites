import React, { memo } from "react";

interface ArchivesEmptyStateProps {
  isAuthenticated: boolean;
  onAddClick: () => void;
  onSignInClick: () => void;
}

const ArchivesEmptyState: React.FC<ArchivesEmptyStateProps> = memo(
  ({
    isAuthenticated: _isAuthenticated,
    onAddClick: _onAddClick,
    onSignInClick: _onSignInClick,
  }) => {
    return (
      <div className="text-center py-12">
        <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-8">
          <h3 className="font-medieval-brand text-2xl text-amber-400">No Archives Yet</h3>
        </div>
      </div>
    );
  }
);

ArchivesEmptyState.displayName = "ArchivesEmptyState";

export default ArchivesEmptyState;
