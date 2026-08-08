const VestEventLoadingSkeleton = () => {
    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-6xl mx-auto">
                {/* Event Information Skeleton */}
                <div className="bg-white rounded-lg shadow-sm border border-dashboard-card-border p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="w-64 h-8 bg-gray-200 rounded animate-pulse mb-4"></div>

                    {/* Statistics Grid Skeleton */}
                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-dashboard-border">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-2 sm:p-3 lg:p-4">
                                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                                    <div className="w-12 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Attendees List Skeleton */}
                <div className="bg-white rounded-lg shadow-sm border border-dashboard-card-border overflow-hidden">
                    <div className="p-4 border-b border-dashboard-border">
                        <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>

                    {/* Desktop Table Skeleton */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    {[...Array(5)].map((_, index) => (
                                        <th key={index} className="px-4 py-3">
                                            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[...Array(5)].map((_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        <td className="px-4 py-4">
                                            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards Skeleton */}
                    <div className="lg:hidden divide-y divide-gray-100">
                        {[...Array(3)].map((_, cardIndex) => (
                            <div key={cardIndex} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                                        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    <div>
                                        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VestEventLoadingSkeleton;