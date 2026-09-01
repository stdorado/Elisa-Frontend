import { useCallback, useEffect, useState } from 'react';
import { getData, getStats } from '../api/stats.api.js';

const POLL_MS = 30000;

export function useStats(token) {
  const [stats, setStats] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const [statsRes, dataRes] = await Promise.all([getStats(token), getData(token)]);
      setStats(statsRes);
      setData(dataRes);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, POLL_MS);
    return () => clearInterval(interval);
  }, [cargar]);

  return { stats, data, loading, error };
}
