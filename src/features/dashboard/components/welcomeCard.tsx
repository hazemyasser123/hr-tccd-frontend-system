import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store/store";
import { LazyImageLoader } from "tccd-ui";

const WelcomeCard = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="mb-4 md:mb-6 w-full rounded-[7px] relative overflow-hidden bg-dashboard-welcome-bg">
      <div className="py-10 flex flex-col items-center justify-center gap-2">
        <div className="w-[100px] h-[100px] bg-gray-300 dark:bg-gray-700 mb-3 rounded-full flex-shrink-0 sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] lg:w-[130px] lg:h-[130px] xl:w-[140px] xl:h-[140px] flex items-center justify-center overflow-hidden">
          <LazyImageLoader
            src={
              user?.profileImageUrl ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLn1_EIWe4MQKAqinzLYerlpzm0pyawzZbYg&s"
            }
            alt="User Avatar"
            className="rounded-full"
            width="100%"
            height="100%"
          />
        </div>
        <div className="flex flex-col justify-center flex-1 gap-1">
          <div className="text-center text-dashboard-welcome-text font-normal text-[13.4px] leading-[15px] font-inter sm:text-[15px] sm:leading-[18px] md:text-[16px] md:leading-[19px] lg:text-[17px] lg:leading-[20px] xl:text-[18px] xl:leading-[21px]">
            Welcome back
          </div>
          <div className="text-dashboard-user-name font-bold text-[20px] leading-[23px] font-inter sm:text-[22px] sm:leading-[24px] md:text-[24px] md:leading-[26px] lg:text-[26px] lg:leading-[28px] xl:text-[28px] xl:leading-[30px]">
            {user?.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
