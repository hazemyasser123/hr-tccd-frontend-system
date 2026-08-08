import { useState } from "react";
import { Button, InputField, Modal } from "tccd-ui";
import toast from "react-hot-toast";
import { useAddCompany } from "@/shared/queries/companies";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

const AddCompanyModal = ({ isOpen, onClose, eventId }: AddCompanyModalProps) => {
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const addCompanyMutation = useAddCompany();

  const handleClose = () => {
    setCompanyName("");
    setCompanyEmail("");
    setCompanyLogo("");
    onClose();
  };

  const handleAddCompany = async () => {
    const trimmedName = companyName.trim();
    const trimmedEmail = companyEmail.trim();
    const trimmedLogo = companyLogo.trim();

    if (!trimmedName) {
      toast.error("Please enter a company name");
      return;
    }

    if (!trimmedEmail) {
      toast.error("Please enter a company email");
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      toast.error("Please enter a valid company email");
      return;
    }

    try {
      await addCompanyMutation.mutateAsync({
        eventId,
        payload: {
          name: trimmedName,
          email: trimmedEmail,
          logo: trimmedLogo,
        },
      });
      toast.success("Company added successfully");
      handleClose();
    } catch {
      toast.error("Failed to add company");
    }
  };

  return (
    <Modal title="Add Company" isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col gap-4 p-1">
        <InputField
          label="Company Name"
          id="company-name"
          value={companyName}
          placeholder="Enter company name"
          onChange={(event) => setCompanyName(event.target.value)}
        />

        <InputField
          label="Company Email"
          id="company-email"
          value={companyEmail}
          placeholder="Enter company email"
          onChange={(event) => setCompanyEmail(event.target.value)}
        />

        <InputField
          label="Company Logo URL"
          id="company-logo"
          value={companyLogo}
          placeholder="Enter logo URL (optional)"
          onChange={(event) => setCompanyLogo(event.target.value)}
        />

        <div className="flex justify-center gap-2 mt-4">
          <Button
            onClick={handleClose}
            buttonText="Cancel"
            type="secondary"
            disabled={addCompanyMutation.isPending}
            width="auto"
          />
          <Button
            onClick={handleAddCompany}
            buttonText="Add"
            loading={addCompanyMutation.isPending}
            type="primary"
            width="auto"
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddCompanyModal;
