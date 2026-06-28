'use client';

import { useState } from 'react';
import { Copy, Mail, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/query-states';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGoals, useGoalInvitations, useSendInvitations, useGoalShare } from '@/hooks/use-api';
import { getAuthErrorMessage } from '@/contexts/auth-context';

export default function InvitationsPage() {
  const { data: goalsData, isLoading } = useGoals();
  const goals = goalsData?.data ?? [];
  const [goalId, setGoalId] = useState('');
  const selectedGoal = goalId || goals[0]?.id || '';
  const { data: invitations } = useGoalInvitations(selectedGoal);
  const { data: share } = useGoalShare(selectedGoal);
  const sendInv = useSendInvitations(selectedGoal);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const shareLink = share?.public_url ?? '';

  const handleSend = async () => {
    if (!selectedGoal || !email) return;
    try {
      await sendInv.mutateAsync({ recipients: [{ email, name: name || undefined }], channel: 'email' });
      toast.success('Invitation sent');
      setEmail('');
      setName('');
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Invitations" description="Invite contributors via email, share link, or QR code" />

      <div className="mb-6">
        <Select value={selectedGoal} onValueChange={setGoalId}>
          <SelectTrigger className="max-w-md"><SelectValue placeholder="Select campaign" /></SelectTrigger>
          <SelectContent>{goals.map((g) => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {!goals.length ? (
        <EmptyState title="No campaigns" description="Create a campaign first to send invitations." />
      ) : (
        <>
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Send Email Invitation</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Contributor email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input placeholder="Contributor name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
                <Button className="w-full" onClick={handleSend} disabled={sendInv.isPending || !email}><Mail className="h-4 w-4" /> Send Invitation</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><QrCode className="h-5 w-5" /> Share Link</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                {shareLink ? (
                  <>
                    <p className="w-full break-all rounded-lg border bg-slate-50 p-3 text-sm">{shareLink}</p>
                    <QRCodeSVG value={shareLink} size={140} />
                    <Button variant="outline" onClick={() => { navigator.clipboard.writeText(shareLink); toast.success('Copied'); }}><Copy className="h-4 w-4" /> Copy Link</Button>
                  </>
                ) : <p className="text-sm text-muted-foreground">Loading share link...</p>}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Sent Invitations</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Name</TableHead><TableHead>Channel</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {!invitations?.length ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No invitations sent yet</TableCell></TableRow>
                  ) : invitations.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>{inv.email}</TableCell>
                      <TableCell>{inv.name ?? '—'}</TableCell>
                      <TableCell>{inv.channel}</TableCell>
                      <TableCell><StatusBadge status={inv.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
