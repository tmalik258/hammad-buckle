"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  userAccountFormSchema,
  type UserAccountFormData,
} from "@/lib/validations/user-account-schema";
import { Save, X, AlertCircle, User } from "lucide-react";
import { type User as PrismaUser } from "@prisma/client";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile?: PrismaUser | null;
  onProfileUpdate: (data: UserAccountFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdate,
  isLoading = false,
}: ProfileEditModalProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UserAccountFormData>({
    resolver: zodResolver(userAccountFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
    mode: "onChange",
  });

  // Auto-populate form fields when modal opens or currentProfile changes
  useEffect(() => {
    if (isOpen && currentProfile) {
      form.reset({
        name: currentProfile.name || "",
        email: currentProfile.email || "",
      });
      setError(null); // Clear any previous errors
    }
  }, [isOpen, currentProfile, form]);

  const handleSubmit = async (data: UserAccountFormData) => {
    try {
      setError(null);
      await onProfileUpdate(data);
      onClose();
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleCancel = () => {
    // Reset form to current profile data instead of empty values
    if (currentProfile) {
      form.reset({
        name: currentProfile.name || "",
        email: currentProfile.email || "",
      });
    } else {
      form.reset();
    }
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile information below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {error && (
              <Alert className="border-red-500 bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full Name
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your full name"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email Address
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email address"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
