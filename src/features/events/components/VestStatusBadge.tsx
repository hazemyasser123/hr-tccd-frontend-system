interface VestStatusBadgeProps {
    status: "NotReceived" | "Received" | "Returned";
}

const VestStatusBadge = ({ status }: VestStatusBadgeProps) => {
    let text = "";
    let styles = "";

    switch (status) {
        case "NotReceived":
            text = "Not Received";
            styles = "bg-primary text-white border-primary";
            break;
        case "Returned":
            text = "Returned";
            styles = "bg-secondary text-white border-secondary";
            break;
        case "Received":
            text = "Received";
            styles = "bg-green-600 text-white border-green-600";
            break;
        default:
            text = "Unknown";
            styles = "bg-gray-500 text-white border-gray-500";
    }

    return (
        <span
            className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[11px] md:text-xs font-bold capitalize border shadow-sm ${styles}`}
        >
            {text}
        </span>
    );
};

export default VestStatusBadge;