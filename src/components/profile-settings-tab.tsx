"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";
import UsernameModal from "@/components/username-modal";

export default function ProfileSettingsTab() {
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium dark:text-white">
          Profile Settings
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your profile information
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium dark:text-white">Name</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {storage.getFirstname() || "Not set"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsUsernameModalOpen(true)}
          >
            Change
          </Button>
        </div>
      </div>

      <UsernameModal
        isOpen={isUsernameModalOpen}
        onClose={() => setIsUsernameModalOpen(false)}
        onSave={(newFirstname) => {
          storage.setFirstname(newFirstname);
          setIsUsernameModalOpen(false);
        }}
        title="Change Your Name"
        description="Enter your new name"
      />
    </div>
  );
}
