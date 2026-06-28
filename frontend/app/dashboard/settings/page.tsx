'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingState } from '@/components/shared/query-states';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth, getAuthErrorMessage } from '@/contexts/auth-context';
import { usersApi } from '@/lib/api/services';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({ full_name: user?.full_name ?? '', phone_number: user?.phone_number ?? '' });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '' });
  const [saving, setSaving] = useState(false);

  if (!user) return <LoadingState />;

  const saveProfile = async () => {
    setSaving(true);
    try {
      await usersApi.updateProfile({ full_name: profile.full_name, phone_number: profile.phone_number || undefined });
      await refreshUser();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    try {
      await usersApi.changePassword(passwords);
      toast.success('Password updated');
      setPasswords({ current_password: '', new_password: '' });
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Profile and account security" />
      <div className="grid max-w-2xl gap-6">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h3 className="font-semibold">Profile</h3>
            <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} placeholder="Full name" />
            <Input value={user.email} disabled />
            <Input value={profile.phone_number} onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })} placeholder="Phone number" />
            <Button onClick={saveProfile} disabled={saving}>Save Profile</Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <h3 className="font-semibold">Change Password</h3>
            <Input type="password" placeholder="Current password" value={passwords.current_password} onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })} />
            <Input type="password" placeholder="New password" value={passwords.new_password} onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })} />
            <Button variant="outline" onClick={changePassword}>Update Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
