'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateGoal } from '@/hooks/use-api';
import { getAuthErrorMessage } from '@/contexts/auth-context';

const CATEGORIES = [
  { value: 'education', label: 'Education / Tuition' },
  { value: 'religious', label: 'Religious / Donations' },
  { value: 'community_project', label: 'Community Project' },
  { value: 'business', label: 'Business' },
  { value: 'personal', label: 'Personal / Events' },
  { value: 'wedding', label: 'Wedding' },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const createGoal = useCreateGoal();
  const [form, setForm] = useState({
    title: '',
    description: '',
    target_amount: '',
    category: 'community_project',
    deadline: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createGoal.mutateAsync({
        title: form.title,
        description: form.description || undefined,
        target_amount: Number(form.target_amount),
        category: form.category,
        deadline: form.deadline,
      });
      toast.success('Campaign created');
      router.push(`/dashboard/campaigns/${res.data.id}`);
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    }
  };

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link href="/dashboard/campaigns"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
      </Button>
      <PageHeader title="Create Campaign" description="Set up a new payment collection campaign" />
      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Campaign title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" placeholder="Target amount (₦)" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} required min={1} />
            <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
            <Button type="submit" className="w-full" disabled={createGoal.isPending}>{createGoal.isPending ? 'Creating...' : 'Create Campaign'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
