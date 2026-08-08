import WithNavbar from "@/shared/components/hoc/WithNavbar";
import TeamsPage from "./TeamPage";
import QuestionManagePage from "./QuestionManagePage";
import { useEvent } from "@/shared/queries/events";
import { useParams } from "react-router-dom";
import { LoadingPage, ErrorScreen } from "tccd-ui";
import { useState, Activity, useEffect } from "react";
import { useSelector } from "react-redux";
import ConditionalWrapper from "@/shared/utils/conditionalWrapper";
import logo from "@/assets/TCCD_logo.svg";
import JudgesPage from "./JudgePage";
import CertificatesTab from "../components/CertificatesTab";

export default function JudgingSystemHomePage() {
  const { eventId } = useParams();
  const userRoles = useSelector((state: any) => state.auth.user?.roles || []);
  const isJudge = userRoles.includes("Judge") && userRoles.length === 1;
  const [activeTab, setActiveTab] = useState<string>("teams");
  const { data: event, isLoading, isError } = useEvent(eventId!);
  const [hasInitializedTab, setHasInitializedTab] = useState(false);

  useEffect(() => {
    const storedTab = localStorage.getItem(`judgingSystemActiveTab_${eventId}`);
    
    setActiveTab(storedTab || "teams");
    setHasInitializedTab(true);
  }, [eventId]);

  useEffect(() => {
    if(!hasInitializedTab)
      return;

    localStorage.setItem(`judgingSystemActiveTab_${eventId}`, activeTab);
  }, [activeTab]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError || !event) {
    return (
      <ErrorScreen
        message="Failed to load event data, please try again later."
        title="Failed to fetch data"
      />
    );
  }

  const children = (
    <div className="p-4 pt-0 w-[96%] md:w-[94%] lg:w-[84%] xl:w-[73%] mx-auto">
      <p className="text-center text-[22px] md:text-[24px] lg:text-[26px] text-primary font-bold">
        {event?.title}'s Judging Board
      </p>
      <p className="text-center mb-4 md:mb-6 lg:text-[16px] md:text-[15px] text-[14px] text-text-muted-foreground">
        Manage teams and their scoring for this event.
      </p>
      {!isJudge && (
        <div className="flex flex-row justify-between mx-auto border-b-2 border-primary shadow-md w-full md:w-3/4 lg:w-2/3 mb-5 bg-surface-glass-bg">
          <div
            onClick={() => setActiveTab("teams")}
            className={`flex-1 hover:bg-muted-primary/20 ${
              activeTab === "teams" ? "bg-muted-primary/10" : "bg-transparent"
            } transition-colors duration-200 ease-in-out py-4 md:py-5 shadow-lg flex items-center justify-center p-2 cursor-pointer border-r border-surface-glass-border/10`}
          >
            <div className="text-text-body-main font-bold text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] leading-[10px] md:leading-[14px] font-inter text-center">
              Teams
            </div>
          </div>
          <div
            onClick={() => setActiveTab("questions")}
            className={`flex-1 hover:bg-muted-primary/20 ${
              activeTab === "questions"
                ? "bg-muted-primary/10"
                : "bg-transparent"
            } transition-colors duration-200 ease-in-out shadow-lg flex items-center justify-center p-2 cursor-pointer border-r border-surface-glass-border/10`}
          >
            <div className="text-text-body-main font-bold text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] leading-[10px] md:leading-[14px] font-inter text-center">
              Criterion
            </div>
          </div>
          {!isJudge && (
            <div
              onClick={() => setActiveTab("judges")}
              className={`flex-1 hover:bg-muted-primary/20 ${
                activeTab === "judges"
                  ? "bg-muted-primary/10"
                  : "bg-transparent"
              } transition-colors duration-200 ease-in-out shadow-lg flex items-center justify-center p-2 cursor-pointer`}
            >
              <div className="text-text-body-main font-bold text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] leading-[10px] md:leading-[14px] font-inter text-center">
                Judges
              </div>
            </div>
          )}
          {
            <div
              onClick={() => setActiveTab("certificates")}
              className={`flex-1 hover:bg-muted-primary/20 ${
                activeTab === "certificates"
                  ? "bg-muted-primary/10"
                  : "bg-transparent"
              } transition-colors duration-200 ease-in-out shadow-lg flex items-center justify-center p-2 cursor-pointer`}
            >
              <div className="text-text-body-main font-bold text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] leading-[10px] md:leading-[14px] font-inter text-center">
                Certificates
              </div>
            </div>
          }
        </div>
      )}
      <Activity
        mode={activeTab === "questions" && !isJudge ? "visible" : "hidden"}
      >
        <QuestionManagePage event={event} />
      </Activity>
      <Activity mode={activeTab === "teams" || isJudge ? "visible" : "hidden"}>
        <TeamsPage event={event} mode={!isJudge} />
      </Activity>
      <Activity
        mode={activeTab === "judges" && !isJudge ? "visible" : "hidden"}
      >
        <JudgesPage event={event} />
      </Activity>
      <Activity
        mode={activeTab === "certificates" && !isJudge ? "visible" : "hidden"}
      >
        <CertificatesTab />
      </Activity>
    </div>
  );

  return (
    <ConditionalWrapper
      condition={!isJudge}
      wrapper={(children) => <WithNavbar>{children}</WithNavbar>}
    >
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-page-gradient-start dark:via-page-gradient-middle dark:to-page-gradient-end text-text-body-main transition-colors duration-500">
        <img
          src={logo}
          alt="TCCD Logo"
          className="w-24 md:w-28 h-auto mx-auto pt-6 mb-2"
        />
        {children}
      </main>
    </ConditionalWrapper>
  );
}
