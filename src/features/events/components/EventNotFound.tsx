import { useNavigate } from "react-router-dom";

interface EventNotFoundProps {
  message?: string;
  description?: string;
}

const EventNotFound = ({
  message = "Event Not Found",
  description = "The requested event could not be found.",
}: EventNotFoundProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-dashboard-heading hover:text-primary transition-colors"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-[#626468]">Event Details</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-dashboard-card-border p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              {message}
            </h2>
            <p className="text-gray-500">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventNotFound;
