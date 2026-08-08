interface TeamStatusBadgeProps {
  status?: "In Progress" | "Evaluated" | "Certified" | "InProgress";
}

const TeamStatusBadge = ({ status }: TeamStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "Certified":
        return "text-green-600 dark:text-green-400";
      case "Evaluated":
        return "text-green-600 dark:text-green-400";
      case "In Progress":
      case "InProgress":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-red-600 dark:text-red-400";
    }
  };

  const displayStatus =
    status === "InProgress" ? "In Progress" : status || "In Progress";

  return (
    <span className={`text-md font-bold capitalize ${getStatusConfig()}`}>
      {displayStatus}
    </span>
  );
};

export default TeamStatusBadge;
