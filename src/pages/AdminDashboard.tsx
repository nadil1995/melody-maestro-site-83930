import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, BarChart2, Upload, ImagePlus, Table2, Wifi, FileText, LayoutTemplate } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import S3ImageUploader from '@/components/S3ImageUploader';
import GalleryManager from '@/components/GalleryManager';
import DataManager from '@/components/DataManager';
import LiveAnalytics from '@/components/LiveAnalytics';
import HistoricalAnalytics from '@/components/HistoricalAnalytics';
import ArticleEditor from '@/components/admin/ArticleEditor';
import ServicePageEditor from '@/components/admin/ServicePageEditor';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'analytics' | 'live' | 'media' | 'gallery' | 'data' | 'articles' | 'pages'>('live');
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

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-playfair text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">LF Flauto Analytics & Media Management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border border-border rounded-lg p-1 w-fit bg-muted/30 flex-wrap">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'live'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Wifi className="w-4 h-4" />
            Live
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'media'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="w-4 h-4" />
            Media Upload
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'gallery'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ImagePlus className="w-4 h-4" />
            Gallery
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'data'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Table2 className="w-4 h-4" />
            Data
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'articles'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4" />
            Articles
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'pages'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            Service Pages
          </button>
        </div>

        {/* Live Analytics Tab */}
        {activeTab === 'live' && <LiveAnalytics />}

        {/* Historical Analytics Tab */}
        {activeTab === 'analytics' && <HistoricalAnalytics />}

        {/* Media Upload Tab */}
        {activeTab === 'media' && <S3ImageUploader />}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && <GalleryManager />}

        {/* Data Tab */}
        {activeTab === 'data' && <DataManager />}

        {/* Articles Tab */}
        {activeTab === 'articles' && <ArticleEditor />}

        {/* Service Pages Tab */}
        {activeTab === 'pages' && <ServicePageEditor />}

      </div>
    </div>
  );
};

export default AdminDashboard;
