import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useSubscription, PLAN_LIMITS } from '@/features/billing/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

type Feature = keyof typeof PLAN_LIMITS.pro;

export function PlanGate({
  feature,
  fallback,
  children,
}: {
  feature: Feature;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const { canUse } = useSubscription();
  if (canUse(feature)) return <>{children}</>;
  return <>{fallback ?? <UpgradePrompt />}</>;
}

export function UpgradePrompt({ message }: { message?: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-6 text-center space-y-3">
        <div className="inline-flex w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <p className="text-muted-foreground">
          {message ?? 'Esta funcionalidade está disponível nos planos Pro e Elite.'}
        </p>
        <Button asChild>
          <Link to="/billing">Ver planos</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
