import WithNavbar from "@/shared/components/hoc/WithNavbar";
import UserList from "../components/UserList";

export default function UsersManagementPage() {
  return (
    <WithNavbar>
      <div className="min-h-screen bg-background dark:bg-background-primary p-4 text-text-body-main">
        <div className="w-[96%] md:w-[94%] lg:w-[84%] xl:w-[73%] mx-auto">
          <h1 className="lg:text-[24px] md:text-[22px] text-[20px] font-bold dark:text-text-title">
            Member Management
          </h1>
          <p className="mb-2 lg:text-[16px] md:text-[14px] text-[13px] text-inactive-tab-text dark:text-text-muted-foreground">
            View and manage all members in the system.
          </p>
          <UserList />
        </div>
      </div>
    </WithNavbar>
  );
}
