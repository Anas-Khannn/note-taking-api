"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { authKeys } from "@/hooks/auth-keys";
import {
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "@/services/auth.service";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/types/auth";

// A successful login must always produce a real session from the backend. The
// AuthContext is only updated with that validated response, and the redirect
// only happens after persistence. Failed mutations never redirect.
export function useLogin() {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) => loginUser(input),
    onSuccess: (session) => {
      login(session);
      router.push("/dashboard");
    },
  });
}

export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: RegisterInput) => registerUser(input),
    onSuccess: () => {
      router.replace("/login?registered=1");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => requestPasswordReset(input),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => resetPassword(input),
  });
}

export function useLogout() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    // JWTs are stateless, so the backend call is best-effort. Even if the
    // request fails (offline, server down), the local session must still be
    // cleared so a later refresh cannot restore it.
    mutationFn: async () => {
      try {
        await logoutUser();
      } catch {
        // Local cleanup below is what actually ends the session.
      }
    },
    onSuccess: () => {
      // Clears storage, auth query cache, and any user-scoped server state.
      logout();
      queryClient.removeQueries({ queryKey: authKeys.all });
      router.push("/login");
    },
  });
}
