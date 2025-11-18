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

const getStoredAnalytics = (): AnalyticsData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading analytics:', error);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving analytics:', error);
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
