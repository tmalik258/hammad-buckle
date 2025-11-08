import { Button } from "@/components/ui/button";
import { User, Lock, MapPin } from "lucide-react";
import { EnhancedImage } from "@/components/ui/enhanced-image";

const ProfileOverview = ({
  avatar,
  name,
  email,
  onEditProfileClick,
  onChangePasswordClick,
  onManageAddressClick,
}: {
  avatar?: string | null;
  name?: string;
  email?: string;
  onEditProfileClick?: () => void;
  onChangePasswordClick?: () => void;
  onManageAddressClick?: () => void;
}) => {
  return (
    <div className="container mx-auto px-4 mb-8">
      {/* Profile Card */}
      <div className="p-10 border border-pink-500 rounded-[3rem] mb-6">
        {/* Title Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <svg
              width="33"
              height="33"
              viewBox="0 0 33 33"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M30.963 12.93C30.378 12.3195 29.7735 11.6895 29.5305 11.103C29.3055 10.5585 29.2935 9.753 29.28 8.901C29.259 7.494 29.235 5.901 28.167 4.833C27.099 3.765 25.5 3.741 24.099 3.72C23.247 3.7065 22.449 3.6945 21.897 3.4695C21.3105 3.2265 20.6805 2.622 20.07 2.037C19.074 1.083 17.946 0 16.5 0C15.054 0 13.926 1.083 12.93 2.037C12.3195 2.622 11.6895 3.2265 11.103 3.4695C10.5585 3.6945 9.753 3.7065 8.901 3.72C7.494 3.741 5.901 3.765 4.833 4.833C3.765 5.901 3.741 7.5 3.72 8.901C3.7065 9.753 3.6945 10.551 3.4695 11.103C3.2265 11.6895 2.622 12.3195 2.037 12.93C1.083 13.926 0 15.054 0 16.5C0 17.946 1.083 19.074 2.037 20.07C2.622 20.6805 3.2265 21.3105 3.4695 21.897C3.6945 22.4415 3.7065 23.247 3.72 24.099C3.741 25.506 3.765 27.099 4.833 28.167C5.901 29.235 7.5 29.259 8.901 29.28C9.753 29.2935 10.551 29.3055 11.103 29.5305C11.6895 29.7735 12.3195 30.378 12.93 30.963C13.926 31.917 15.054 33 16.5 33C17.946 33 19.074 31.917 20.07 30.963C20.6805 30.378 21.3105 29.7735 21.897 29.5305C22.4415 29.3055 23.247 29.2935 24.099 29.28C25.506 29.259 27.099 29.235 28.167 28.167C29.235 27.099 29.259 25.506 29.28 24.099C29.2935 23.247 29.3055 22.449 29.5305 21.897C29.7735 21.3105 30.378 20.6805 30.963 20.07C31.917 19.074 33 17.946 33 16.5C33 15.054 31.917 13.926 30.963 12.93ZM29.664 18.825C28.9635 19.554 28.239 20.31 27.864 21.21C27.507 22.071 27.492 23.088 27.477 24.072C27.4605 25.188 27.4425 26.343 26.892 26.895C26.3415 27.447 25.185 27.4635 24.069 27.48C23.085 27.495 22.068 27.51 21.207 27.867C20.307 28.239 19.557 28.9635 18.8205 29.667C18.033 30.417 17.2185 31.203 16.497 31.203C15.7755 31.203 14.961 30.4215 14.172 29.667C13.443 28.9665 12.687 28.242 11.787 27.867C10.926 27.51 9.909 27.495 8.925 27.48C7.809 27.4635 6.654 27.4455 6.102 26.895C5.55 26.3445 5.5335 25.188 5.517 24.072C5.502 23.088 5.487 22.071 5.13 21.21C4.758 20.31 4.0335 19.56 3.33 18.8235C2.5815 18.036 1.8 17.2215 1.8 16.5C1.8 15.7785 2.5815 14.964 3.336 14.175C4.0365 13.446 4.761 12.69 5.136 11.79C5.493 10.929 5.508 9.912 5.523 8.928C5.5395 7.812 5.5575 6.657 6.108 6.105C6.6585 5.553 7.815 5.5365 8.931 5.52C9.915 5.505 10.932 5.49 11.793 5.133C12.693 4.761 13.443 4.0365 14.1795 3.333C14.964 2.5815 15.7785 1.8 16.5 1.8C17.2215 1.8 18.036 2.5815 18.825 3.336C19.554 4.0365 20.31 4.761 21.21 5.136C22.071 5.493 23.088 5.508 24.072 5.523C25.188 5.5395 26.343 5.5575 26.895 6.108C27.447 6.6585 27.4635 7.815 27.48 8.931C27.495 9.915 27.51 10.932 27.867 11.793C28.239 12.693 28.9635 13.443 29.667 14.1795C30.417 14.967 31.203 15.7815 31.203 16.503C31.203 17.2245 30.4185 18.036 29.664 18.825ZM23.136 12.264C23.3045 12.4328 23.3992 12.6615 23.3992 12.9C23.3992 13.1385 23.3045 13.3672 23.136 13.536L14.736 21.936C14.5673 22.1045 14.3385 22.1992 14.1 22.1992C13.8615 22.1992 13.6328 22.1045 13.464 21.936L9.864 18.336C9.70502 18.1654 9.61848 17.9397 9.62259 17.7066C9.6267 17.4734 9.72116 17.2509 9.88605 17.0861C10.051 16.9212 10.2734 16.8267 10.5066 16.8226C10.7397 16.8185 10.9654 16.905 11.136 17.064L14.1 20.0265L21.864 12.264C22.0328 12.0955 22.2615 12.0008 22.5 12.0008C22.7385 12.0008 22.9673 12.0955 23.136 12.264Z"
                fill="white"
              />
            </svg>

            <h2 className="text-xl font-semibold text-white">
              Profile Overview
            </h2>
          </div>
        </div>

        <div className="flex md:flex-row items-center space-x-6 mb-6">
          <div className="relative w-[100px] h-[100px] rounded-full border-2 border-pink-500 p-1">
            <EnhancedImage
              src={avatar || ""}
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full w-full h-full object-cover"
              fallbackInitial={name?.charAt(0) || "U"}
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">{name}</h1>
            <p className="text-gray-300 mb-4">{email}</p>
            <div className="inline-flex items-center gap-3 max-sm:hidden">
              <Button
                variant="ghost"
                className="rounded-3xl text-white border border-pink-500 backdrop-blur-sm hover:bg-pink-500/10 cursor-pointer"
                onClick={onEditProfileClick}
              >
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button
                variant="ghost"
                className="rounded-3xl text-white border border-pink-500 backdrop-blur-sm hover:bg-pink-500/10 cursor-pointer"
                onClick={onChangePasswordClick}
              >
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:hidden">
          <Button
            variant="ghost"
            className="rounded-3xl text-white border border-pink-500 backdrop-blur-sm hover:bg-pink-500/10 cursor-pointer"
            onClick={onEditProfileClick}
          >
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button
            variant="ghost"
            className="rounded-3xl text-white border border-pink-500 backdrop-blur-sm hover:bg-pink-500/10 cursor-pointer"
            onClick={onChangePasswordClick}
          >
            <Lock className="mr-2 h-4 w-4" />
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
