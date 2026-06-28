'use client';

import { PageHeader } from '@/components/shared/page-header';
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/query-states';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNotifications, useMarkAllNotificationsRead } from '@/hooks/use-api';
import { getAuthErrorMessage } from '@/contexts/auth-context';

export default function NotificationsPage() {
  const { data: notifications, isLoading, error, refetch } = useNotifications();
  const markAll = useMarkAllNotificationsRead();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={getAuthErrorMessage(error)} onRetry={() => refetch()} />;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Payment and campaign activity"
        action={<Button variant="outline" size="sm" onClick={() => markAll.mutate()} disabled={markAll.isPending}>Mark all read</Button>}
      />
      {!notifications?.length ? (
        <EmptyState title="No notifications" description="You'll see payment alerts and campaign updates here." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={!n.read ? 'border-primary/30 bg-primary/5' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString('en-NG')}</p>
                  </div>
                  {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
