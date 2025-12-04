"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useAuthGuard(redirectTo: string = "/login") {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push(redirectTo);
    }
  }, [router, redirectTo, pathname]);
}

export function useGuestGuard(redirectTo: string = "/today") {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      router.push(redirectTo);
    }
  }, [router, redirectTo, pathname]);
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("accessToken");
}

