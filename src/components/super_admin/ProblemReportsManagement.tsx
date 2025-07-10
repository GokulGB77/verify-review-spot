import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Clock, CheckCircle, XCircle, MessageSquare, Mail, Calendar } from 'lucide-react';
import { useProblemReports, useUpdateProblemReport, type ProblemReport } from '@/hooks/useProblemReports';
import { format } from 'date-fns';

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const statusColors = {
  open: 'bg-red-100 text-red-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const categoryLabels = {
  bug: 'Bug/Error',
  'ui-ux': 'UI/UX Issue',
  performance: 'Performance',
  'feature-request': 'Feature Request',
  account: 'Account Issues',
  payment: 'Payment/Billing',
  security: 'Security Concern',
  other: 'Other',
};

const ProblemReportDetail = ({ report }: { report: ProblemReport }) => {
  const [status, setStatus] = useState(report.status);
  const [adminNotes, setAdminNotes] = useState(report.admin_notes || '');
  const updateProblemReport = useUpdateProblemReport();

  const handleUpdateReport = async () => {
    const updates: any = { status };
    
    if (adminNotes !== report.admin_notes) {
      updates.admin_notes = adminNotes;
    }
    
    if (status === 'resolved' && !report.resolved_at) {
      updates.resolved_at = new Date().toISOString();
    }

    await updateProblemReport.mutateAsync({
      id: report.id,
      ...updates,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1">Category</h4>
          <Badge variant="outline">
            {categoryLabels[report.category as keyof typeof categoryLabels] || report.category}
          </Badge>
        </div>
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1">Priority</h4>
          <Badge className={priorityColors[report.priority as keyof typeof priorityColors]}>
            {report.priority}
          </Badge>
        </div>
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
          <Badge className={statusColors[report.status as keyof typeof statusColors]}>
            {report.status.replace('_', ' ')}
          </Badge>
        </div>
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1">Reported</h4>
          <p className="text-sm">{format(new Date(report.created_at), 'MMM dd, yyyy HH:mm')}</p>
        </div>
      </div>

      {report.contact_email && (
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center">
            <Mail className="w-4 h-4 mr-1" />
            Contact Email
          </h4>
          <p className="text-sm">{report.contact_email}</p>
        </div>
      )}

      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
        <div className="bg-muted p-3 rounded-md">
          <p className="text-sm whitespace-pre-wrap">{report.description}</p>
        </div>
      </div>

      <div className="space-y-4 border-t pt-4">
        <div>
          <label className="text-sm font-medium">Update Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Admin Notes</label>
          <Textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add internal notes about this report..."
            className="mt-1"
          />
        </div>

        <Button 
          onClick={handleUpdateReport}
          disabled={updateProblemReport.isPending}
          className="w-full"
        >
          {updateProblemReport.isPending ? 'Updating...' : 'Update Report'}
        </Button>
      </div>
    </div>
  );
};

const ProblemReportsManagement = () => {
  const { data: reports = [], isLoading, error } = useProblemReports();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filteredReports = reports.filter(report => {
    if (filterStatus !== 'all' && report.status !== filterStatus) return false;
    if (filterPriority !== 'all' && report.priority !== filterPriority) return false;
    return true;
  });

  const stats = {
    total: reports.length,
    open: reports.filter(r => r.status === 'open').length,
    inProgress: reports.filter(r => r.status === 'in_progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading problem reports...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-600">Error loading problem reports</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Problem Reports Management
          </CardTitle>
          <CardDescription>
            View and manage user-reported problems and issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.open}</div>
              <div className="text-sm text-muted-foreground">Open</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categoryLabels[report.category as keyof typeof categoryLabels] || report.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[report.priority as keyof typeof priorityColors]}>
                        {report.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(report.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{report.title}</DialogTitle>
                            <DialogDescription>
                              Problem report details and management
                            </DialogDescription>
                          </DialogHeader>
                          <ProblemReportDetail report={report} />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No reports found</h3>
              <p className="text-muted-foreground">
                {filterStatus !== 'all' || filterPriority !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'No problem reports have been submitted yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProblemReportsManagement;