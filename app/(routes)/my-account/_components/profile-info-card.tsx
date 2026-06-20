"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

interface ProfileInfoCardProps {
  displayProfile?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

const inputClassName =
  "border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400";

export const ProfileInfoCard = ({ displayProfile }: ProfileInfoCardProps) => {
  return (
    <div className="container mx-auto space-y-8 px-4 pb-12">
      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-zinc-900">
            <User className="h-6 w-6" aria-hidden />
            Profile Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-zinc-900">Full Name</Label>
              <Input
                type="text"
                value={displayProfile?.name || ""}
                readOnly
                disabled
                className={inputClassName}
                placeholder="Not provided"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-zinc-900">Email</Label>
              <Input
                type="email"
                value={displayProfile?.email || ""}
                readOnly
                disabled
                className={inputClassName}
                placeholder="Not provided"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
