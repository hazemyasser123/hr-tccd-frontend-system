import { FaQuestionCircle, FaAsterisk } from "react-icons/fa";

export default function FormLoadingComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-[#f8f6f1] dark:from-background-primary dark:via-background-primary dark:to-background-primary">
      <div className="w-full md:w-2/3 lg:w-1/3 m-auto rounded-xl shadow-md p-5 flex flex-col gap-4">
        {/* Form Title Loading */}
        <div className="p-4">
          <div className="h-8 md:h-10 lg:h-12 bg-background-contrast rounded-lg animate-pulse mb-2"></div>
          <div className="h-4 md:h-5 lg:h-6 bg-background-contrast rounded-lg animate-pulse w-3/4"></div>
        </div>

        {/* Form Description Loading */}
        <div className="px-4 mb-6">
          <div className="h-4 md:h-5 lg:h-6 bg-background-contrast rounded-lg animate-pulse mb-2"></div>
          <div className="h-4 md:h-5 lg:h-6 bg-background-contrast rounded-lg animate-pulse w-2/3"></div>
        </div>

        {/* Question Cards Loading */}
        {[1, 2, 3].map((index) => (
          <div key={index} className="mb-6">
            <div className="bg-white dark:bg-surface-glass-bg rounded-xl shadow-md p-5 flex flex-col gap-4">
              {/* Question Header */}
              <div className="flex items-start gap-3">
                <div className="text-gray-200 text-lg mt-1 flex-shrink-0 animate-pulse">
                  <FaQuestionCircle />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 bg-background-contrast rounded-lg animate-pulse w-3/4"></div>
                    <div className="text-gray-200 text-xs animate-pulse">
                      <FaAsterisk />
                    </div>
                  </div>
                </div>
              </div>

              {/* Answer Field Loading */}
              <div className="space-y-3">
                {/* Simulate different question types */}
                {index === 1 && (
                  // Short answer field
                  <div className="h-10 bg-background-contrast rounded-lg animate-pulse"></div>
                )}
                {index === 2 && (
                  // Long answer field (textarea)
                  <div className="h-24 bg-background-contrast rounded-lg animate-pulse"></div>
                )}
                {index === 3 && (
                  // Multiple choice options
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center gap-3"
                      >
                        <div className="w-4 h-4 bg-background-contrast rounded-full animate-pulse"></div>
                        <div className="h-5 bg-background-contrast rounded-lg animate-pulse flex-1"></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Debug info placeholder */}
                <div className="h-3 bg-background-contrast rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>
        ))}

        {/* Submit Button Loading */}
        <div className="flex justify-end mt-8">
          <div className="h-10 w-24 bg-background-contrast rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
