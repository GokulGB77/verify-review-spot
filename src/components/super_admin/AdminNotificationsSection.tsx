import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Users, FileCheck, UserCheck, ClipboardList, ArrowRight } from 'lucide-react';
import { useAdminNotifications, AdminNotification } from '@/hooks/useAdminNotifications';

interface AdminNotificationsSectionProps {
  onNavigateToSection: (section: string) => void;
}

const AdminNotificationsSection = ({ onNavigateToSection }: AdminNotificationsSectionProps) => {
  const { data: notifications = [], isLoading, error } = useAdminNotifications();

  const getNotificationIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'entity_addition_request':
        return <Users className="h-5 w-5" />;
      case 'pending_review_verification':
        return <FileCheck className="h-5 w-5" />;
      case 'pending_pan_verification':
        return <UserCheck className="h-5 w-5" />;
      case 'entity_registration':
        return <ClipboardList className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNavigationSection = (type: AdminNotification['type']) => {
    switch (type) {
      case 'entity_addition_request':
        return 'entity-addition-requests';
      case 'pending_review_verification':
        return 'review-verification';
      case 'pending_pan_verification':
        return 'verification';
      case 'entity_registration':
        return 'entity-registrations';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: AdminNotification['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Admin Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500">Loading notifications...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Admin Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-500">Error loading notifications</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalNotifications = notifications.reduce((total, notification) => total + notification.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Admin Notifications
          {totalNotifications > 0 && (
            <Badge variant="destructive" className="ml-2">
              {totalNotifications}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500 font-medium">No pending notifications</div>
            <div className="text-sm text-gray-400 mt-1">All administrative tasks are up to date</div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <div
                key={`${notification.type}-${index}`}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {notification.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {notification.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                    className="capitalize"
                  >
                    {notification.priority}
                  </Badge>
                  <Badge variant="outline" className="font-mono">
                    {notification.count}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateToSection(getNavigationSection(notification.type))}
                    className="ml-2"
                  >
                    View
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminNotificationsSection;