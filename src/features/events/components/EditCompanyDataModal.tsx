import { useEffect, useState } from "react";
import { Button, InputField, Modal } from "tccd-ui";
import toast from "react-hot-toast";
import { useUpdateCompany } from "@/shared/queries/companies";
import type { Company } from "@/shared/types/company";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EditCompanyDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  company: Company | null;
}

const EditCompanyDataModal = ({
  isOpen,
  onClose,
  eventId,
  company,
}: EditCompanyDataModalProps) => {
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const updateCompanyMutation = useUpdateCompany();

  useEffect(() => {
    if (company && isOpen) {
      setCompanyName(company.name);
      setCompanyEmail(company.email || "");
      setCompanyLogo(company.logo || "");
      return;
    }

    if (!isOpen) {
      setCompanyName("");
      setCompanyEmail("");
      setCompanyLogo("");
    }
  }, [company, isOpen]);

  const handleClose = () => {
    setCompanyName("");
    setCompanyEmail("");
    setCompanyLogo("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!company) {
      return;
    }

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
      await updateCompanyMutation.mutateAsync({
        eventId,
        companyId: company.id,
        payload: {
          name: trimmedName,
          email: trimmedEmail,
          logo: trimmedLogo,
        },
      });
      toast.success("Company updated successfully");
      handleClose();
    } catch {
      toast.error("Failed to update company");
    }
  };

  return (
    <Modal title="Edit Company" isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col gap-4 p-1">
        <InputField
          label="Company Name"
          id="edit-company-name"
          value={companyName}
          placeholder="Enter company name"
          onChange={(event) => setCompanyName(event.target.value)}
        />

        <InputField
          label="Company Email"
          id="edit-company-email"
          value={companyEmail}
          placeholder="Enter company email"
          onChange={(event) => setCompanyEmail(event.target.value)}
        />

        <InputField
          label="Company Logo URL"
          id="edit-company-logo"
          value={companyLogo}
          placeholder="Enter logo URL (optional)"
          onChange={(event) => setCompanyLogo(event.target.value)}
        />

        <div className="flex justify-center gap-2 mt-4">
          <Button
            onClick={handleClose}
            buttonText="Cancel"
            type="secondary"
            disabled={updateCompanyMutation.isPending}
            width="auto"
          />
          <Button
            onClick={handleSubmit}
            buttonText="Save"
            loading={updateCompanyMutation.isPending}
            type="primary"
            width="auto"
          />
        </div>
      </div>
    </Modal>
  );
};

export default EditCompanyDataModal;
