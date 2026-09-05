interface EventStatusBadgeProps {
  status: "Upcoming" | "Running" | "Past";
}

const EventStatusBadge = ({ status }: EventStatusBadgeProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case "Upcoming":
        return "bg-secondary text-white border-secondary";
      case "Running":
        return "bg-green-600 text-white border-green-600";
      case "Past":
        return "bg-gray-400 text-white border-gray-400";
      default:
        return "bg-gray-300 text-gray-600 border-gray-300";
    }
  };

  return (
    <span
      className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[11px] md:text-xs font-bold border shadow-sm ${getStatusStyles()}`}
    >
      {status}
    </span>
  );
};

export default EventStatusBadge;
