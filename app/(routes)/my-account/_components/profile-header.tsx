import { UserInitialsAvatar } from "@/components/ui/user-initials-avatar";

const ProfileHeader = ({
  name,
  email,
}: {
  name?: string;
  email?: string;
}) => {
  return (
    <div className="container mx-auto px-4 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <UserInitialsAvatar name={name} email={email} size="xl" />
          <div>
            <h1 className="mb-1 flex items-center text-2xl font-bold text-zinc-900">
              Welcome back, {name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-zinc-600">
              Here&apos;s your shopping journey at a glance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
