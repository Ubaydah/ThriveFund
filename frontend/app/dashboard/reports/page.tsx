'use client';

import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { MonthlyChart } from '@/components/charts/monthly-chart';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingState, ErrorState } from '@/components/shared/query-states';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialSummary, useAnalyticsMonthly, useAnalyticsGoalPerformance } from '@/hooks/use-api';
import { reportsApi } from '@/lib/api/services';
import { formatNaira } from '@/lib/utils';
import { getAuthErrorMessage } from '@/contexts/auth-context';

export default function ReportsPage() {
  const { data: summary, isLoading, error, refetch } = useFinancialSummary();
  const { data: monthly } = useAnalyticsMonthly();
  const { data: performance } = useAnalyticsGoalPerformance();

  const downloadCsv = async () => {
    try {
      const { data: csv } = await reportsApi.transactionsExport();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'thrivefund-transactions.csv';
      a.click();
      toast.success('Export downloaded');
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={getAuthErrorMessage(error)} onRetry={() => refetch()} />;

  return (
    <div>
      <PageHeader title="Reports" description="Payment summaries and campaign performance" action={<Button variant="outline" onClick={downloadCsv}><Download className="h-4 w-4" /> Export Transactions CSV</Button>} />

      {summary && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Collected</p><p className="text-2xl font-bold">{formatNaira(Number(summary.total_collected))}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Active Campaigns</p><p className="text-2xl font-bold">{summary.active_goals}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Transactions</p><p className="text-2xl font-bold">{summary.total_transactions}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Contributors</p><p className="text-2xl font-bold">{summary.total_contributors}</p></CardContent></Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Monthly Collections</CardTitle></CardHeader>
          <CardContent>{monthly?.length ? <MonthlyChart data={monthly.map((m) => ({ month: m.month, amount: Number(m.amount) }))} /> : <p className="text-sm text-muted-foreground">No data yet</p>}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Campaign Performance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {!performance?.length ? <p className="text-sm text-muted-foreground">No campaigns yet</p> : performance.map((c) => (
              <div key={c.id} className="flex justify-between border-b pb-3 last:border-0">
                <div><p className="text-sm font-medium">{c.title}</p><p className="text-xs text-muted-foreground">{c.status}</p></div>
                <div className="text-right"><p className="font-semibold text-primary">{c.progress_percent}%</p><p className="text-xs">{formatNaira(Number(c.current_amount))}</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
