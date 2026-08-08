import { useState } from "react";
import type { MemberData } from "@/shared/types/attendance";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useRequestAttendance, useCheckAttendanceStatus, useRecordLateArrivalExcuse, useRecordLeaveEarly } from "@/shared/queries/events/eventQueries";
import { UserApi } from "@/shared/queries/users";
import { eventsApiInstance } from "@/shared/queries/events/eventApi";
import { getErrorMessage } from "@/shared/utils";
import toast from "react-hot-toast";
import type { CompanyQRScanResponse } from "../types/company";

export function useAttendanceFlow(eventId: string) {
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [companyData, setCompanyData] = useState<CompanyQRScanResponse | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<number | null>(null);
  const [lateReason, setLateReason] = useState("");
  const [leaveExcuse, setLeaveExcuse] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [attendanceConfirmed, setAttendanceConfirmed] = useState(false);
  const [eventType,setEventType]=useState('')

  const requestAttendance = useRequestAttendance();
  const checkAttendanceStatus = useCheckAttendanceStatus();
  const recordLateArrivalExcuse = useRecordLateArrivalExcuse();
  const recordLeaveEarly = useRecordLeaveEarly();

  // Fetch member and event data
  const fetchMemberData = async (userId: string) => {
    try {
      const userInstance = new UserApi();
      const userResponse = await userInstance.getMemberDetails(userId);
      const eventResponse = await eventsApiInstance.fetchEventById(eventId);
      // Get attendance status for this member/event
      const res = await checkAttendanceStatus.mutateAsync({
        memberId: userId,
        eventId,
      });
      setEventType(eventResponse.eventType)
      setAttendanceStatus(res.status);
      const eventStartDate = new Date(eventResponse.startDate);
      const eventStartTime = eventStartDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const currentTime = new Date();
      // Set status based on attendanceStatus code
      let status: "late" | "on-time" = "on-time";
      if (res.status === 2002) status = "late";
      else if (res.status === 2001) status = "on-time";
      setMemberData({
        ...userResponse,
        status,
        arrivalTime: currentTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        eventStartTime,
      });
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  // Handle QR scan
  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes.length > 0) {
      setIsScanning(false);
      try {
        const parsedData = JSON.parse(detectedCodes[0].rawValue);

        if (parsedData && typeof parsedData.UserId === "string") {
          await fetchMemberData(parsedData.UserId);
          // For company QR:
          // CompanyId: uuid
          // CompanyName: string
          // No need for any other data fetching
        } else if (parsedData && typeof parsedData.CompanyId === "string") {
            setCompanyData({
              companyId: parsedData.CompanyId,
              companyName: parsedData.Name
            })
        } else {
          setError("Invalid QR code format. Expected a user or a company");
        }
      } catch {
        setError("Invalid QR code data. Could not parse QR code.");
      }
    }
  };

  // Check attendance status
  const checkStatus = async (userId: string) => {
    try {
      const res = await checkAttendanceStatus.mutateAsync({
        memberId: userId,
        eventId,
      });
      setAttendanceStatus(res.status);
      return res.status;
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  // Confirm attendance
  const confirmAttendance = async (reasonOverride?: string, excuseOverride?: string) => {
    if (!memberData) return;
    setIsConfirming(true);
    const effectiveLateReason = reasonOverride ?? lateReason;
    const effectiveLeaveExcuse = excuseOverride ?? leaveExcuse;
    try {
      if (attendanceStatus === 2002) {
        // Late
        if (!effectiveLateReason.trim()) {
          setError("Please provide a reason for being late.");
          setIsConfirming(false);
          return;
        }
        await recordLateArrivalExcuse.mutateAsync({
          memberId: memberData.id,
          eventId,
          excuse: effectiveLateReason,
        });
      } else if (attendanceStatus === 2003) {
        // Early leave
        if (!effectiveLeaveExcuse.trim()) {
          setError("Please provide a reason for early leave.");
          setIsConfirming(false);
          return;
        }
        await recordLeaveEarly.mutateAsync({
          memberId: memberData.id,
          eventId,
          excuse: effectiveLeaveExcuse,
        });
      } else {
        // On time
        await requestAttendance.mutateAsync({
          memberId: memberData.id,
          eventId,
        });
      }
      setAttendanceConfirmed(true);
      toast.success("Attendance confirmed!");
      setEventType('')
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsConfirming(false);
    }
  };

  const reset = () => {
    setIsScanning(true);
    setError(null);
    setMemberData(null);
    setAttendanceStatus(null);
    setLateReason("");
    setLeaveExcuse("");
    setIsConfirming(false);
    setAttendanceConfirmed(false);
    setCompanyData(null);
  };

  return {
    isScanning,
    error,
    memberData,
    companyData,
    attendanceStatus,
    lateReason,
    setLateReason,
    leaveExcuse,
    setLeaveExcuse,
    isConfirming,
    attendanceConfirmed,
    handleScan,
    checkStatus,
    confirmAttendance,
    reset,
    setEventType,
    eventType
  };
}
