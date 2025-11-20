import React, { createContext, useContext, useEffect, useState } from 'react';

export interface PageView {
  page: string;
  timestamp: number;
  userAgent: string;
  referrer: string;
}

export interface FormSubmission {
  name: string;
  email: string;
  phone: string;
  message: string;
  timestamp: number;
}

export interface UserAction {
  action: string;
  page: string;
  timestamp: number;
  details?: string;
}

interface AnalyticsData {
  pageViews: PageView[];
  formSubmissions: FormSubmission[];
  userActions: UserAction[];
  sessionStart: number;
  totalSessions: number;
}

interface AnalyticsContextType {
  trackPageView: (page: string) => void;
  trackFormSubmission: (data: Omit<FormSubmission, 'timestamp'>) => void;
  trackUserAction: (action: string, page: string, details?: string) => void;
  getAnalytics: () => AnalyticsData;
  clearAnalytics: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

const STORAGE_KEY = 'lflauto_analytics';

// Limits to prevent localStorage quota issues
const MAX_PAGE_VIEWS = 100;
const MAX_FORM_SUBMISSIONS = 50;
const MAX_USER_ACTIONS = 100;
const MAX_AGE_DAYS = 30; // Delete data older than 30 days

const cleanOldData = (data: AnalyticsData): AnalyticsData => {
  const now = Date.now();
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  return {
    ...data,
    pageViews: data.pageViews
      .filter(pv => now - pv.timestamp < maxAge)
      .slice(-MAX_PAGE_VIEWS),
    formSubmissions: data.formSubmissions
      .filter(fs => now - fs.timestamp < maxAge)
      .slice(-MAX_FORM_SUBMISSIONS),
    userActions: data.userActions
      .filter(ua => now - ua.timestamp < maxAge)
      .slice(-MAX_USER_ACTIONS),
  };
};

const getStoredAnalytics = (): AnalyticsData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Clean old data on load
      return cleanOldData(parsed);
    }
  } catch (error) {
    console.error('Error loading analytics:', error);
    // If quota exceeded, clear storage and start fresh
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  return {
    pageViews: [],
    formSubmissions: [],
    userActions: [],
    sessionStart: Date.now(),
    totalSessions: 0,
  };
};

const saveAnalytics = (data: AnalyticsData) => {
  try {
    // Clean data before saving to prevent quota issues
    const cleanedData = cleanOldData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedData));
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded. Clearing old analytics data...');
      try {
        // Emergency cleanup: keep only most recent data
        const emergencyData: AnalyticsData = {
          ...data,
          pageViews: data.pageViews.slice(-20),
          formSubmissions: data.formSubmissions.slice(-10),
          userActions: data.userActions.slice(-20),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(emergencyData));
      } catch (retryError) {
        console.error('Failed to save analytics even after cleanup:', retryError);
        // Last resort: clear everything
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
      }
    } else {
      console.error('Error saving analytics:', error);
    }
  }
};

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>(getStoredAnalytics);

  // Initialize session
  useEffect(() => {
    const storedData = getStoredAnalytics();
    const newSession = {
      ...storedData,
      sessionStart: Date.now(),
      totalSessions: storedData.totalSessions + 1,
    };
    setAnalytics(newSession);
    saveAnalytics(newSession);
  }, []);

  // Save analytics whenever it changes
  useEffect(() => {
    saveAnalytics(analytics);
  }, [analytics]);

  const trackPageView = (page: string) => {
    const pageView: PageView = {
      page,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
    };

    setAnalytics((prev) => ({
      ...prev,
      pageViews: [...prev.pageViews, pageView],
    }));
  };

  const trackFormSubmission = (data: Omit<FormSubmission, 'timestamp'>) => {
    const submission: FormSubmission = {
      ...data,
      timestamp: Date.now(),
    };

    setAnalytics((prev) => ({
      ...prev,
      formSubmissions: [...prev.formSubmissions, submission],
    }));
  };

  const trackUserAction = (action: string, page: string, details?: string) => {
    const userAction: UserAction = {
      action,
      page,
      timestamp: Date.now(),
      details,
    };

    setAnalytics((prev) => ({
      ...prev,
      userActions: [...prev.userActions, userAction],
    }));
  };

  const getAnalytics = () => analytics;

  const clearAnalytics = () => {
    const freshData: AnalyticsData = {
      pageViews: [],
      formSubmissions: [],
      userActions: [],
      sessionStart: Date.now(),
      totalSessions: 0,
    };
    setAnalytics(freshData);
    saveAnalytics(freshData);
  };

  return (
    <AnalyticsContext.Provider
      value={{
        trackPageView,
        trackFormSubmission,
        trackUserAction,
        getAnalytics,
        clearAnalytics,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
};
