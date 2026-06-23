// src/contexts/SettingsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { cmsApi } from '../cms/api.js';

const SettingsContext = createContext({});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children, enabled = true }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchSettings = async () => {
      try {
        const data = await cmsApi.getSettings();
        if (!cancelled) {
          setSettings(data || {});
        }
      } catch (err) {
        console.error('Failed to load global settings:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return (
    <SettingsContext.Provider value={{ settings, settingsLoading: loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
