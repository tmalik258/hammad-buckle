import { Button } from "@/components/ui/button";
import { CheckCircle2, Lock, User } from "lucide-react";
import { UserInitialsAvatar } from "@/components/ui/user-initials-avatar";

const actionButtonClass =
  "cursor-pointer rounded-none rounded-tr-2xl rounded-bl-2xl border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white";

const ProfileOverview = ({
  name,
  email,
  onEditProfileClick,
  onChangePasswordClick,
}: {
  name?: string;
  email?: string;
  onEditProfileClick?: () => void;
  onChangePasswordClick?: () => void;
}) => {
  return (
    <div className="container mx-auto mb-8 px-4">
      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm md:p-10">
        <div className="mb-6 flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-zinc-900" aria-hidden />
          <h2 className="text-xl font-semibold text-zinc-900">Profile Overview</h2>
        </div>

        <div className="mb-6 flex flex-col items-center gap-6 md:flex-row md:items-center">
          <UserInitialsAvatar name={name} email={email} size="xl" />
          <div className="flex-1 text-center md:text-left">
            <h1 className="mb-2 text-2xl font-bold text-zinc-900">{name}</h1>
            <p className="mb-4 text-zinc-600">{email}</p>
            <div className="hidden gap-3 sm:inline-flex">
              <Button
                variant="outline"
                className={actionButtonClass}
                onClick={onEditProfileClick}
              >
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                className={actionButtonClass}
                onClick={onChangePasswordClick}
              >
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:hidden">
          <Button variant="outline" className={actionButtonClass} onClick={onEditProfileClick}>
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button variant="outline" className={actionButtonClass} onClick={onChangePasswordClick}>
            <Lock className="mr-2 h-4 w-4" />
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
