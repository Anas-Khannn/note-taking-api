"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import {
  isRegisterSession,
  loginUser,
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
      router.push("/");
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
        router.push("/");
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
