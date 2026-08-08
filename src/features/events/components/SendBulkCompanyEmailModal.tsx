import { useState, useMemo, useEffect } from "react";
import { Button, Modal, SearchField } from "tccd-ui";
import { useBulkSendCompanyCateringAllocationsEmail } from "@/shared/queries/companies";
import type { Company } from "@/shared/types/company";
import toast from "react-hot-toast";

interface SendBulkCompanyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  companies: Company[];
}

const SendBulkCompanyEmailModal = ({
  isOpen,
  onClose,
  eventId,
  companies,
}: SendBulkCompanyEmailModalProps) => {
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(
    new Set()
  );
  const [companySearchQuery, setCompanySearchQuery] = useState("");

  const sendBulkEmailMutation = useBulkSendCompanyCateringAllocationsEmail();

  useEffect(() => {
    if (!isOpen) {
      setSelectedCompanyIds(new Set());
      setCompanySearchQuery("");
    }
  }, [isOpen]);

  const filteredCompanies = useMemo(() => {
    if (!companySearchQuery.trim()) {
      return companies;
    }
    const query = companySearchQuery.toLowerCase();
    return companies.filter((company) =>
      company.name.toLowerCase().includes(query)
    );
  }, [companies, companySearchQuery]);

  const handleSendEmail = async () => {
    if (selectedCompanyIds.size === 0) {
      toast.error("Please select at least one company");
      return;
    }

    try {
      const companyIds = Array.from(selectedCompanyIds);
      const result = await sendBulkEmailMutation.mutateAsync({
        eventId,
        companyIds,
      });

      toast.success(
        `Emails sent successfully! Requested: ${result.requestedCount}, Sent: ${result.sentCount}`
      );
      onClose();
      setSelectedCompanyIds(new Set());
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send bulk emails");
    }
  };

  const handleToggleAll = () => {
    if (selectedCompanyIds.size === companies.length) {
      setSelectedCompanyIds(new Set());
    } else {
      setSelectedCompanyIds(new Set(companies.map((c) => c.id)));
    }
  };

  const handleToggle = (id: string) => {
    const newSelection = new Set(selectedCompanyIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedCompanyIds(newSelection);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Bulk Emails">
      <div className="space-y-4 p-4 max-h-[80vh] overflow-y-auto">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select the companies to send catering allocation emails to.
        </p>

        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">
              Select Companies
              {selectedCompanyIds.size > 0 && (
                <span className="text-sm font-normal text-primary ml-2">
                  ({selectedCompanyIds.size} selected)
                </span>
              )}
            </h3>
            <button
              onClick={handleToggleAll}
              className="text-sm px-3 py-1 rounded-md text-primary cursor-pointer hover:brightness-110"
            >
              {selectedCompanyIds.size === companies.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>

          <SearchField
            placeholder="Search companies..."
            value={companySearchQuery}
            onChange={(value) => setCompanySearchQuery(value)}
            className="mb-3"
          />

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredCompanies.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                {companySearchQuery ? "No companies found" : "No companies available"}
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => handleToggle(company.id)}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedCompanyIds.has(company.id)
                      ? "bg-primary/15"
                      : "bg-white dark:bg-surface-glass-bg border border-gray-200 dark:border-gray-600 hover:border-primary dark:hover:border-primary"
                  }`}
                >
                  <p className="text-sm font-medium">{company.name}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button buttonText="Cancel" onClick={onClose} type="secondary" />
          <Button
            buttonText={`Send (${selectedCompanyIds.size})`}
            onClick={handleSendEmail}
            type="primary"
            disabled={
              sendBulkEmailMutation.isPending || selectedCompanyIds.size === 0
            }
          />
        </div>
      </div>
    </Modal>
  );
};

export default SendBulkCompanyEmailModal;
