'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, RefreshCw, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { ReconciliationBadge } from '@/components/shared/status-badge';
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/query-states';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useReconciliationOverview, useReconciliation } from '@/hooks/use-api';
import { formatNaira } from '@/lib/utils';
import { getAuthErrorMessage } from '@/contexts/auth-context';

export default function ReconciliationPage() {
  const [tab, setTab] = useState<string>('all');
  const { data: overview, isLoading: oLoading, error: oError, refetch: refetchO } = useReconciliationOverview();
  const statusFilter = tab === 'all' ? undefined : tab;
  const { data, isLoading, error, refetch } = useReconciliation({ status: statusFilter });
  const records = data?.data ?? [];

  if (oLoading) return <LoadingState />;
  if (oError) return <ErrorState message={getAuthErrorMessage(oError)} onRetry={() => refetchO()} />;

  const total = (overview?.matched ?? 0) + (overview?.unmatched ?? 0) + (overview?.pending ?? 0) + (overview?.manual ?? 0);

  return (
    <div>
      <PageHeader title="Reconciliation Dashboard" description="Automatic payment matching — review exceptions" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Records" value={String(total)} icon={RefreshCw} />
        <StatCard title="Matched" value={String(overview?.matched ?? 0)} icon={CheckCircle2} />
        <StatCard title="Unmatched" value={String(overview?.unmatched ?? 0)} icon={AlertTriangle} />
        <StatCard title="Pending" value={String(overview?.pending ?? 0)} icon={Search} />
        <StatCard title="Manual" value={String(overview?.manual ?? 0)} icon={Copy} subtitle={overview?.auto_match_rate} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="matched">Matched</TabsTrigger>
          <TabsTrigger value="unmatched">Unmatched</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {isLoading ? <LoadingState /> : error ? <ErrorState message={getAuthErrorMessage(error)} onRetry={() => refetch()} /> : !records.length ? (
            <EmptyState title="No records" description="Reconciliation records appear after payments are received." />
          ) : (
            <Card>
              <CardHeader><CardTitle>Reconciliation Records</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Payer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">{r.reference ?? r.id}</TableCell>
                        <TableCell>{r.payer_name ?? '—'}</TableCell>
                        <TableCell>{r.amount ? formatNaira(Number(r.amount)) : '—'}</TableCell>
                        <TableCell>{r.goal_title ?? '—'}</TableCell>
                        <TableCell><ReconciliationBadge status={r.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
