"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { authKeys } from "@/hooks/auth-keys";
import { useAuth } from "@/hooks/useAuth";
import { noteKeys } from "@/hooks/note-keys";
import {
  isRegisterSession,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  type RegisterResult,
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
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: RegisterInput) => registerUser(input),
    onSuccess: (result: RegisterResult) => {
      // Automatic login only when the backend actually returns a session.
      // Verification-required responses leave the user on the page.
      if (isRegisterSession(result)) {
        login(result);
        router.push("/dashboard");
      }
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
