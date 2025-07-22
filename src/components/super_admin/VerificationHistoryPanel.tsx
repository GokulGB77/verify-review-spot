import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useVerificationHistory, useUserVerificationStats } from '@/hooks/useVerificationHistory';
import { History, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface VerificationHistoryPanelProps {
  userId: string;
  onViewDocument?: (documentUrl: string) => void;
}

const VerificationHistoryPanel: React.FC<VerificationHistoryPanelProps> = ({ 
  userId, 
  onViewDocument 
}) => {
  const { data: history, isLoading: historyLoading } = useVerificationHistory(userId);
  const { data: stats, isLoading: statsLoading } = useUserVerificationStats(userId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  if (historyLoading || statsLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            Loading verification history...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <History className="h-5 w-5 mr-2" />
            Verification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            No verification history found for this user.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <History className="h-5 w-5 mr-2" />
          Verification History
        </CardTitle>
        {stats && (
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">
              Total Attempts: <span className="font-medium">{stats.totalAttempts}</span>
            </span>
            <span className="text-green-600">
              Approved: <span className="font-medium">{stats.approvedAttempts}</span>
            </span>
            <span className="text-red-600">
              Rejected: <span className="font-medium">{stats.rejectedAttempts}</span>
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attempt #</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>PAN Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reviewed</TableHead>
              <TableHead>Document</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">#{entry.attempt_number}</TableCell>
                <TableCell>{format(new Date(entry.submitted_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                <TableCell>{entry.full_name_pan || 'N/A'}</TableCell>
                <TableCell>{getStatusBadge(entry.status)}</TableCell>
                <TableCell>
                  {entry.reviewed_at ? (
                    format(new Date(entry.reviewed_at), 'MMM dd, yyyy HH:mm')
                  ) : (
                    <span className="text-gray-400">Not reviewed</span>
                  )}
                </TableCell>
                <TableCell>
                  {entry.pan_image_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDocument?.(entry.pan_image_url!)}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Show rejection reasons for rejected attempts */}
        <div className="mt-4 space-y-2">
          {history
            .filter(entry => entry.status === 'rejected' && entry.rejection_reason)
            .map((entry) => (
              <div key={entry.id} className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Attempt #{entry.attempt_number} - Rejection Reason:
                    </p>
                    <p className="text-sm text-red-700 mt-1">{entry.rejection_reason}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationHistoryPanel;