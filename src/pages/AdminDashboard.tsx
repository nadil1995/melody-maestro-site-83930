import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { Eye, MessageSquare, MousePointer, Users, Calendar, Mail, Phone, Clock, LogOut, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const { getAnalytics, clearAnalytics } = useAnalytics();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if already authenticated
  useEffect(() => {
    const auth = sessionStorage.getItem('admin_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password protection - You should change this password!
    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'madu2025admin';

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      toast({
        title: 'Access Granted',
        description: 'Welcome to the admin dashboard',
      });
    } else {
      toast({
        title: 'Access Denied',
        description: 'Incorrect password',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setPassword('');
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully',
    });
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      clearAnalytics();
      toast({
        title: 'Data Cleared',
        description: 'All analytics data has been cleared',
      });
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-playfair">Admin Access</CardTitle>
            <CardDescription>Enter password to access dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center text-lg"
                autoFocus
              />
              <Button type="submit" className="w-full" size="lg">
                Access Dashboard
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard view
  const analytics = getAnalytics();

  // Calculate statistics
  const totalPageViews = analytics.pageViews.length;
  const totalFormSubmissions = analytics.formSubmissions.length;
  const totalUserActions = analytics.userActions.length;
  const uniquePages = new Set(analytics.pageViews.map(pv => pv.page)).size;

  // Page view counts
  const pageViewCounts = analytics.pageViews.reduce((acc, pv) => {
    acc[pv.page] = (acc[pv.page] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Recent page views (last 10)
  const recentPageViews = [...analytics.pageViews]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  // Recent form submissions (last 10)
  const recentSubmissions = [...analytics.formSubmissions]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  // Recent user actions (last 10)
  const recentActions = [...analytics.userActions]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-playfair text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">LF Flauto Analytics & User Engagement</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClearData}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Data
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
              <Eye className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPageViews}</div>
              <p className="text-xs text-muted-foreground mt-1">{uniquePages} unique pages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Form Submissions</CardTitle>
              <MessageSquare className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalFormSubmissions}</div>
              <p className="text-xs text-muted-foreground mt-1">Contact inquiries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">User Actions</CardTitle>
              <MousePointer className="w-4 h-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalUserActions}</div>
              <p className="text-xs text-muted-foreground mt-1">Interactions tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">Site visits</p>
            </CardContent>
          </Card>
        </div>

        {/* Page Views by Page */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Page Views by Page
            </CardTitle>
            <CardDescription>Total views per page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(pageViewCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([page, count]) => (
                  <div key={page} className="flex items-center justify-between">
                    <span className="font-medium">{page}</span>
                    <span className="text-2xl font-bold text-primary">{count}</span>
                  </div>
                ))}
              {Object.keys(pageViewCounts).length === 0 && (
                <p className="text-muted-foreground text-center py-4">No page views recorded yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Recent Page Views */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Page Views
              </CardTitle>
              <CardDescription>Last 10 page visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentPageViews.map((pv, idx) => (
                  <div key={idx} className="border-b border-border pb-2 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{pv.page}</span>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(pv.timestamp)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatDate(pv.timestamp)}
                    </div>
                  </div>
                ))}
                {recentPageViews.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No page views yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent User Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="w-5 h-5" />
                Recent User Actions
              </CardTitle>
              <CardDescription>Last 10 interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentActions.map((action, idx) => (
                  <div key={idx} className="border-b border-border pb-2 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{action.action}</span>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(action.timestamp)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {action.page} • {formatDate(action.timestamp)}
                    </div>
                    {action.details && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {action.details}
                      </div>
                    )}
                  </div>
                ))}
                {recentActions.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No user actions yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Form Submissions
            </CardTitle>
            <CardDescription>Recent contact inquiries (last 10)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubmissions.map((submission, idx) => (
                <div key={idx} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{submission.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {submission.email}
                        </span>
                        {submission.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {submission.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(submission.timestamp)}</span>
                      <div className="text-xs text-muted-foreground mt-1">{formatDate(submission.timestamp)}</div>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded text-sm">
                    <strong>Message:</strong>
                    <p className="mt-1">{submission.message}</p>
                  </div>
                </div>
              ))}
              {recentSubmissions.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No form submissions yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
