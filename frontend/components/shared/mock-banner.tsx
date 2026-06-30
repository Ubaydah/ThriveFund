import { Info } from 'lucide-react';
import { paymentModeCopy } from '@/lib/environment';

export function MockDataBanner() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
      <Info className="h-4 w-4 shrink-0" />
      <span>
        <strong>{paymentModeCopy.label}</strong> {paymentModeCopy.detail}
      </span>
    </div>
  );
}
