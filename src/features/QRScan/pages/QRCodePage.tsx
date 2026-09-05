import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store/store";
import { useGetQRCode } from "@/shared/queries/users";
import WithNavbar from "@/shared/components/hoc/WithNavbar";
import toast from "react-hot-toast";
import { BsCheckCircleFill, BsArrowClockwise } from "react-icons/bs";
import { FaUserCircle, FaShieldAlt } from "react-icons/fa";
import MediaDisplayModal from "@/shared/components/media/MediaDisplayModal";
import logo from "@/assets/TCCD_logo.svg";
import { isAttendee, ATTENDEE_ROLES } from "@/shared/utils/access";

const QRCodePage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [isMediaDisplayOpen, setIsMediaDisplayOpen] = useState(false);

    const userId = user?.id || "";
    const isVolunteer = isAttendee(user);
    // Badge shows the attendee role the user ACTUALLY holds (was a hardcoded
    // "Volunteer Member" string, mislabeling heads/students/etc.)
    const attendeeBadgeLabel = (
        user?.roles?.find((role) => ATTENDEE_ROLES.includes(role)) ?? "VolunteerMember"
    ).replace(/([a-z])([A-Z])/g, "$1 $2");
    const {
        data: apiResponseData,
        isLoading,
        isError,
        dataUpdatedAt
    } = useGetQRCode(userId);


    const lastUpdatedAtRef = useRef<number | null>(null);

    useEffect(() => {
        if (lastUpdatedAtRef.current === null) {
            lastUpdatedAtRef.current = dataUpdatedAt;
            return;
        }

        if (dataUpdatedAt !== lastUpdatedAtRef.current && dataUpdatedAt > 0) {
            lastUpdatedAtRef.current = dataUpdatedAt;
        }
    }, [dataUpdatedAt]);

    useEffect(() => {
        if (isError) {
            toast.error("Failed to load QR Code. Click refresh to retry.");
        }
    }, [isError]);


    return (
        <WithNavbar>
            <img
                src={logo}
                alt="TCCD Logo"
                className="w-24 md:w-28 h-auto mx-auto pt-6"
            />
            <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 space-y-6 text-center">
                {/* Full screen Media Display Modal */}
                <MediaDisplayModal
                    isOpen={isMediaDisplayOpen}
                    onClose={() => setIsMediaDisplayOpen(false)}
                    imageSrc={apiResponseData || ""}
                    title={`${user?.name || "Member"}'s QR Code`}
                    subtitle="Present this QR code at attendance checkpoints."
                />

                {/* volunteer & users headers */}
                <div className="space-y-3 flex flex-col items-center">
                    {isVolunteer ? (
                        <>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-text-title tracking-tight">
                                    Welcome to TCCD
                                </h1>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-text-title tracking-tight">
                                    Your QR
                                </h1>
                            </div>
                        </>
                    )}
                </div>

                {/* Member Profile Card */}
                {user && (
                    <div className="bg-surface-glass-bg border border-dashboard-card-border dark:border-dashboard-border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                        <div className="flex items-center gap-3">
                            {user.profileImageUrl ? (
                                <img
                                    src={user.profileImageUrl}
                                    alt={user.name}
                                    className="w-12 h-12 rounded-full object-cover border border-secondary/30"
                                />
                            ) : (
                                <FaUserCircle size={44} className="text-secondary opacity-80" />
                            )}
                            <div>
                                <p className="font-semibold text-text-title text-base">{user.name || "Volunteer Member"}</p>
                                <p className="text-xs text-text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {isVolunteer ? (
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                                    <FaShieldAlt size={12} />
                                    {attendeeBadgeLabel}
                                </span>
                            ) : (
                                user.roles?.map((role) => (
                                    <span
                                        key={role}
                                        className="px-3 py-1 text-xs font-semibold rounded-full bg-secondary/10 text-secondary border border-secondary/20"
                                    >
                                        {role}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>
                )}



                {/* Main QR Code Card */}
                <div className="bg-surface-glass-bg border border-dashboard-card-border dark:border-dashboard-border rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur space-y-6">
                    <div className="flex flex-col items-center justify-center gap-4 border-b border-dashboard-border pb-4">
                        <p className="text-text-muted-foreground text-sm max-w-md mx-auto text-center font-medium">
                            This is your personal QR code. You can use it for attendance, vest collection, and catering services.
                        </p>
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs sm:text-sm font-semibold">
                            <BsCheckCircleFill className="text-green-500" size={18} />
                            Verified & Approved QR
                        </span>
                    </div>

                    {/* QR Container */}
                    <div className="flex flex-col items-center justify-center space-y-4 py-2">
                        {isLoading ? (
                            <div className="w-56 h-56 flex flex-col items-center justify-center gap-3 bg-dashboard-border/30 rounded-2xl animate-pulse">
                                <BsArrowClockwise className="animate-spin text-secondary" size={32} />
                                <span className="text-xs text-text-muted-foreground font-medium">Loading QR Code...</span>
                            </div>
                        ) : userId ? (
                            <div
                                onClick={() => setIsMediaDisplayOpen(true)}
                                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md transform hover:scale-105 transition-all duration-200 cursor-pointer"
                            >
                                <img
                                    src={apiResponseData}
                                    alt="Member QR Code"
                                    className="w-52 h-52 object-contain"
                                />
                            </div>
                        ) : (
                            <div className="w-56 h-56 flex items-center justify-center bg-red-50 dark:bg-red-950/20 text-red-600 rounded-2xl text-xs">
                                No user ID found in session.
                            </div>
                        )}
                    </div>

                    {!isLoading && userId && (
                        <p className="text-xs sm:text-sm text-text-muted-foreground font-medium text-center">
                            Please present this QR code at the attendance checkpoint when requested.
                        </p>
                    )}

                </div>
            </div>
        </WithNavbar>
    );
};

export default QRCodePage;