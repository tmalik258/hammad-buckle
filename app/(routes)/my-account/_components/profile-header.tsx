import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { EnhancedImage } from "@/components/ui/enhanced-image";

const ProfileHeader = ({
  avatar,
  name,
  onEditClick,
}: {
  avatar?: string | null;
  name?: string;
  onEditClick?: () => void;
}) => {
  return (
    <div className="container mx-auto px-4 mb-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative w-[80px] h-[80px] rounded-full border border-pink-500">
            <EnhancedImage
              src={avatar || ""}
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full border-2 w-full h-full object-cover transition-opacity duration-200"
              fallbackInitial={name?.charAt(0) || "U"}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#D793FE] to-[#F93DAE] bg-clip-text text-transparent mb-1 flex items-center">
              Welcome back,{" "}
              {name || "User"}!
            </h1>
            <p className="text-white">“Here&apos;s your shopping journey at a glance.”</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            className="rounded-3xl text-white border border-pink-500 backdrop-blur-sm hover:bg-transparent cursor-pointer"
            onClick={onEditClick}
          >
            <Upload className="mr-2 h-4 w-4" />
            Change Picture
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
