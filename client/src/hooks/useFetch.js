import { useEffect, useState } from 'react';
import { get } from '../api/client.js';
export function useFetch(path) {
  const [data,setData] = useState(null);
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true); setError('');
    get(path, {signal:controller.signal}).then(value => { if(active) setData(value); })
      .catch(err => { if(active) setError(err.message); })
      .finally(() => { if(active) setLoading(false); });
    return () => { active=false; controller.abort(); };
  },[path]);
  return {data,error,loading};
}
