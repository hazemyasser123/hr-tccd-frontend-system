interface StatusBadgeProps {
  status: "Attended" | "Absent" | "Left" | "Late" | "Left & Late";
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case "attended":
        return "bg-green-500 text-white border-green-500";
      case "late":
        return "bg-yellow-500 text-white border-yellow-500";
      case "left":
        return "bg-blue-500 text-white border-blue-500";
      case "absent":
        return "bg-primary text-white border-primary";
      default:
        return "bg-gray-300 text-gray-600 border-gray-300";
    }
  };

  return (
    <span
      className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[11px] md:text-xs font-bold capitalize border ${getStatusStyles()} shadow-sm`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
