"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUserAction } from "@/features/auth/actions/auth-actions";
import type { User } from "@/features/auth/types";

export function useUser(initialUser?: User) {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUserAction,
    initialData: initialUser,
  });
}
