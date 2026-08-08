import { Modal, Button, ButtonTypes } from "tccd-ui";
import { useLogout } from "@/shared/queries/users";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

export default function LogoutModal({
  showLogoutModal,
  setShowLogoutModal,
}: {
  showLogoutModal: boolean;
  setShowLogoutModal: (value: boolean) => void;
}) {
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.promise(logoutMutation.mutateAsync(), {
      loading: "Logging out...",
      success: () => {
        setShowLogoutModal(false);
        setTimeout(() => navigate("/login"), 1500);
        return "Logged out successfully!";
      },
      error: (error) => {
        console.error("Logout failed:", error);
        return "Logout failed. Please try again.";
      },
    });
  };

  if (!showLogoutModal) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* backdrop - covers whole viewport and closes on click */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => setShowLogoutModal(false)}
      />
      {/* modal container - centered and above backdrop */}
      <div className="relative z-[10000] w-full max-w-lg mx-4">
        <Modal
          isOpen={true}
          onClose={() => setShowLogoutModal(false)}
          title="Confirm Logout"
        >
          <div className="p-2">
            <p className="text-sm text-text-muted-foreground mb-4 text-center">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-center gap-[4%]">
              {logoutMutation.isLoading ? (
                <Button
                  loading={true}
                  type={ButtonTypes.PRIMARY}
                  onClick={() => {}}
                />
              ) : (
                <>
                  <Button
                    buttonText="Cancel"
                    onClick={() => setShowLogoutModal(false)}
                    type={ButtonTypes.SECONDARY}
                  />
                  <Button
                    buttonText="Logout"
                    onClick={() => handleLogout()}
                    type={ButtonTypes.PRIMARY}
                  />
                </>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
