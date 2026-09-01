import { useCallback, useEffect, useRef, useState } from 'react';
import { postScan } from '../api/scan.api.js';

export function useScan(zona) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scanCount, setScanCount] = useState(null);
  const registrado = useRef(false);

  const registrar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postScan(zona);
      setScanCount(data?.count ?? data?.scanCount ?? data?.total ?? null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [zona]);

  useEffect(() => {
    if (registrado.current) return;
    registrado.current = true;
    registrar();
  }, [registrar]);

  return { loading, error, scanCount };
}
