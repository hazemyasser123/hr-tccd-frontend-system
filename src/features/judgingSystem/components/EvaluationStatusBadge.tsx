interface StatusBadgeProps {
  status: "Evaluated" | "Not evaluated" | "Not Evaluated";
}

const EvaluationStatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusStyles = () => {
    if (!status) return "text-text-muted-foreground";
    switch (status.toLowerCase()) {
      case "evaluated":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-primary";
    }
  };

  return (
    <span className={`text-md font-bold capitalize ${getStatusStyles()}`}>
      {status || "N/A"}
    </span>
  );
};

export default EvaluationStatusBadge;
