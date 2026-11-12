"use client";
import { useEffect, useState } from "react";
import { api } from "./api";

export interface Business {
  id: string; name: string; category: string; type: string;
  location: string; phone: string; preferredLanguage: "en" | "ha"; currency: string;
}

const CURRENT_BUSINESS_KEY = "kaanti_current_business";

export const useBusinesses = () => {
  const [businesses, setBusinesses] = useState<Business[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Business[]>("/businesses")
      .then(setBusinesses)
      .catch((e) => setError(e.message));
  }, []);

  return { businesses, error, setBusinesses };
};

export const getCurrentBusinessId = () =>
  typeof window === "undefined" ? null : localStorage.getItem(CURRENT_BUSINESS_KEY);

export const setCurrentBusinessId = (id: string) => localStorage.setItem(CURRENT_BUSINESS_KEY, id);