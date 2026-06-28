'use client';

import { PageHeader } from '@/components/shared/page-header';
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/query-states';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useContributors } from '@/hooks/use-api';
import { formatNaira, getInitials } from '@/lib/utils';
import { getAuthErrorMessage } from '@/contexts/auth-context';

export default function ContributorsPage() {
  const { data: contributors, isLoading, error, refetch } = useContributors();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={getAuthErrorMessage(error)} onRetry={() => refetch()} />;

  return (
    <div>
      <PageHeader title="Contributors & Members" description="Payment activity across your campaigns" />
      {!contributors?.length ? (
        <EmptyState title="No contributors" description="Add contributors to campaigns or wait for payments." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Campaigns</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead>Last Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributors.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarFallback>{c.avatar_initials ?? getInitials(c.name)}</AvatarFallback></Avatar>
                        <span className="font-medium">{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.email ?? '—'}</TableCell>
                    <TableCell>{c.goals_count ?? 0}</TableCell>
                    <TableCell className="font-medium">{formatNaira(Number(c.total_contributed ?? 0))}</TableCell>
                    <TableCell className="text-muted-foreground">{c.last_contribution_at ? new Date(c.last_contribution_at).toLocaleDateString('en-NG') : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
