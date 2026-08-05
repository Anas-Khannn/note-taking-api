"use client";

import { Suspense } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFeedback } from "@/components/auth/AuthFeedback";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { useResetPassword } from "@/hooks/useAuthMutations";
import { getErrorMessage } from "@/lib/api";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/schemas/auth.schema";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const resetMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    setFocus,
    control,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const password = useWatch({ control, name: "password" });

  const onInvalid = () => {
    if (errors.password) setFocus("password");
    else if (errors.confirmPassword) setFocus("confirmPassword");
  };

  const onSubmit = (values: ResetPasswordFormValues) => {
    resetMutation.mutate({ token, password: values.password });
  };

  if (!token) {
    return (
      <AuthCard className="memo-anim-slide-in">
        <AuthHeader
          title="Reset your password"
          description="This password reset link is invalid or incomplete."
        />

        <AuthFeedback
          tone="error"
          title="Invalid reset link"
          message="No reset token was found in the link. Request a new password reset to continue."
        />

        <Link
          href="/forgot-password"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
          Request a new reset link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard className="memo-anim-slide-in">
      <AuthHeader
        title="Set a new password"
        description="Choose a new password to regain access to your account."
      />

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
        aria-busy={resetMutation.isPending}
        className="flex flex-col gap-5"
      >
        <div>
          <PasswordInput
            id="reset-password"
            label="New password"
            icon={LockKeyhole}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrength password={password} />
        </div>

        <PasswordInput
          id="reset-confirm-password"
          label="Confirm new password"
          icon={LockKeyhole}
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {resetMutation.isError ? (
          <AuthFeedback
            tone="error"
            title="Could not reset your password"
            message={getErrorMessage(resetMutation.error)}
          />
        ) : null}

        {resetMutation.isSuccess ? (
          <AuthFeedback
            tone="success"
            title="Password reset"
            message={resetMutation.data.message}
          />
        ) : null}

        <AuthSubmitButton pending={resetMutation.isPending} icon={<ArrowRight size={18} strokeWidth={2} />}>
          Reset password
        </AuthSubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-ink-secondary">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-brand transition-colors hover:text-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}

// useSearchParams requires a Suspense boundary during prerendering.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
