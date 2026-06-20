'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Save, X, User, Mail, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/utils/supabase/client';
import { AxiosError } from 'axios';

export default function SimpleAdminProfile() {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
        },
      });

      if (metadataError) {
        throw metadataError;
      }

      if (formData.password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.password,
        });

        if (passwordError) {
          throw passwordError;
        }
      }

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || error.message 
        : error;
      toast.error(errorMessage || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      email: profile?.email || '',
      password: '',
      confirmPassword: '',
    });
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="p-4 bg-zinc-100 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 mb-2">Loading Profile</h3>
          <p className="text-zinc-500">Please wait while we fetch your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3 mb-2">
            <div className="p-2 bg-zinc-100 rounded-lg">
              <User className="h-6 w-6 text-zinc-700" />
            </div>
            Admin Profile
          </h1>
          <p className="text-zinc-500 text-lg">Manage your account information and settings</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-lg border border-zinc-200">
          <Shield className="h-5 w-5 text-zinc-600" />
          <span className="text-sm font-medium text-zinc-700">Administrator</span>
        </div>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="border-b border-zinc-100 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-zinc-900 flex items-center gap-3">
              <div className="p-2 bg-zinc-100 rounded-lg">
                <User className="h-5 w-5 text-zinc-600" />
              </div>
              Profile Information
            </CardTitle>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                className="bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <div className="p-1 bg-zinc-100 rounded">
                  <User className="h-4 w-4 text-zinc-600" />
                </div>
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
                className="h-12 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-zinc-400/20"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <div className="p-1 bg-zinc-100 rounded">
                  <Mail className="h-4 w-4 text-zinc-600" />
                </div>
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled={true}
                className="h-12 bg-zinc-50 border-zinc-200 text-zinc-500 cursor-not-allowed"
                placeholder="Email cannot be changed"
              />
              <p className="text-xs text-zinc-400 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Email address cannot be modified
              </p>
            </div>
          </div>

          {isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100">
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                  <div className="p-1 bg-zinc-100 rounded">
                    <Lock className="h-4 w-4 text-zinc-600" />
                  </div>
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="h-12 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-zinc-400/20"
                  placeholder="Enter new password (optional)"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                  <div className="p-1 bg-zinc-100 rounded">
                    <Lock className="h-4 w-4 text-zinc-600" />
                  </div>
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="h-12 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-zinc-400/20"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-zinc-100">
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-medium cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isSubmitting}
                className="flex-1 h-12 border-zinc-300 text-zinc-700 hover:bg-zinc-50 cursor-pointer"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
