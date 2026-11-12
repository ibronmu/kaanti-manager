"use client";
import { useEffect, useState } from "react";
import { api, ApiError } from "./api";

export interface Business {
  id: string;
  name: string;
  category: string;
  type: string;
  location: string;
  phone: string;
  preferredLanguage: "en" | "ha";
  currency: string;
}

const KEY = "kaanti_current_business";

export const useCurrentBusiness = () => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
        if (stored) {
          try {
            const b = await api.get<Business>(`/businesses/${stored}`);
            if (!cancelled) { setBusiness(b); setLoading(false); }
            return;
          } catch {
            localStorage.removeItem(KEY);
          }
        }
        const list = await api.get<Business[]>("/businesses");
        if (cancelled) return;
        if (list.length > 0) {
          localStorage.setItem(KEY, list[0].id);
          setBusiness(list[0]);
        }
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Failed to load business");
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { business, error, loading };
};