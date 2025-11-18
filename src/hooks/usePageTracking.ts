import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/contexts/AnalyticsContext';

export const usePageTracking = (pageName?: string) => {
  const location = useLocation();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    const page = pageName || location.pathname;
    trackPageView(page);
  }, [location.pathname, pageName, trackPageView]);
};
