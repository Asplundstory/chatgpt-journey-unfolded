import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const SyncProgressCard = () => {
  const { 
    currentSync, 
    loading, 
    progressPercentage, 
    statusMessage, 
    isRunning, 
    isCompleted, 
    isFailed 
  } = useSyncStatus();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Laddar sync-status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentSync) {
    return null;
  }

  const getStatusIcon = () => {
    if (isRunning) return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    if (isCompleted) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (isFailed) return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusColor = () => {
    if (isCompleted) return 'text-green-600';
    if (isFailed) return 'text-red-600';
    if (isRunning) return 'text-blue-600';
    return 'text-yellow-600';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          {getStatusIcon()}
          Systembolaget Import
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className={`text-sm ${getStatusColor()}`}>
            {statusMessage}
          </div>
          
          {isRunning && (
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{currentSync.processed_products} / {currentSync.total_products} produkter</span>
                <span>{progressPercentage}%</span>
              </div>
            </div>
          )}
          
          {isCompleted && (
            <div className="text-xs text-muted-foreground">
              <div>Importerade: {currentSync.wines_inserted} viner</div>
              <div>Slutförd: {new Date(currentSync.completed_at!).toLocaleString('sv-SE')}</div>
            </div>
          )}
          
          {isFailed && currentSync.error_message && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              {currentSync.error_message}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};