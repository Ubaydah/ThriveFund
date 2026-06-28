'use client';

import { Target, Users, ArrowLeftRight, CreditCard, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { LoadingState, ErrorState } from '@/components/shared/query-states';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminOverview, useAnalyticsMonthly } from '@/hooks/use-api';
import { MonthlyChart } from '@/components/charts/monthly-chart';
import { formatNaira } from '@/lib/utils';
import { getAuthErrorMessage } from '@/contexts/auth-context';
import { ApiError } from '@/lib/api/client';

export default function AdminDashboardPage() {
  const { data, isLoading, error, refetch } = useAdminOverview();
  const { data: monthly } = useAnalyticsMonthly();

  if (isLoading) return <LoadingState />;
  if (error) {
    const msg = error instanceof ApiError && error.status === 403
      ? 'Admin access required. Log in as admin@thrivefund.ng'
      : getAuthErrorMessage(error);
    return <ErrorState message={msg} onRetry={() => refetch()} />;
  }

  return (
    <div>
      <PageHeader title="Platform Admin" description="Platform-level overview (admin role required)" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total Users" value={String(data?.total_users ?? 0)} icon={Users} />
        <StatCard title="Campaigns" value={String(data?.total_goals ?? 0)} icon={Target} />
        <StatCard title="Transactions" value={String(data?.total_transactions ?? 0)} icon={ArrowLeftRight} />
        <StatCard title="Total Volume" value={formatNaira(Number(data?.total_volume_ngn ?? 0))} icon={TrendingUp} />
        <StatCard title="Reconciliation Matched" value={String(data?.reconciliation?.matched ?? 0)} icon={CreditCard} subtitle={data?.reconciliation?.auto_match_rate} />
      </div>
      <Card>
        <CardHeader><CardTitle>Monthly Volume (your account)</CardTitle></CardHeader>
        <CardContent>{monthly?.length ? <MonthlyChart data={monthly.map((m) => ({ month: m.month, amount: Number(m.amount) }))} /> : null}</CardContent>
      </Card>
    </div>
  );
}
