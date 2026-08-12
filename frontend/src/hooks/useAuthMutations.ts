"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { authKeys } from "@/hooks/auth.keys";
import { useAuth } from "@/hooks/useAuth";
import { noteKeys } from "@/hooks/note.keys";
import {
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  updateProfile,
} from "@/services/auth.service";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "@/types/auth.types";

// A successful login must always produce a real session from the backend. The
// AuthContext is only updated with that validated response, and the redirect
// only happens after persistence. Failed mutations never redirect.
export function useLogin() {
  const { login } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) => loginUser(input),
    onSuccess: (session) => {
      // Drop any cached data left over from a previous session so a different
      // account can never see it after signing in.
      queryClient.clear();
      login(session);
      router.push("/dashboard");
    },
  });
}

// Registration creates the account and nothing else. The registration token is
// intentionally ignored and never persisted, and the user is never
// auto-authenticated: they must sign in with their new credentials.
export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: RegisterInput) => registerUser(input),
    onSuccess: () => {
      router.push("/login?registered=1");
    },
  });
}

export function useUpdateProfile() {
  const { setUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (user) => {
      // Sync the authenticated session immediately so the navbar avatar and
      // profile page reflect the change without a full page reload.
      setUser(user);
      void queryClient.invalidateQueries({ queryKey: authKeys.user() });
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
    mutationFn: () => logoutUser(),
    // Local cleanup always wins when the user explicitly signs out. The remote
    // logout call acknowledges the request (JWTs are stateless, so the server
    // cannot revoke the token), and the local session is cleared regardless.
    onSettled: () => {
      // Cancel protected in-flight requests before tearing down their cache.
      void queryClient.cancelQueries({ queryKey: noteKeys.all });
      void queryClient.cancelQueries({ queryKey: authKeys.all });
      // Clears context, localStorage auth keys, and the query cache.
      logout();
      // Explicitly drop any auth/current-user entries that may still exist.
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.removeQueries({ queryKey: noteKeys.all });
      router.replace("/login");
    },
  });
}
