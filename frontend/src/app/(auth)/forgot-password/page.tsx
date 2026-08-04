"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFeedback } from "@/components/auth/AuthFeedback";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { useForgotPassword } from "@/hooks/useAuthMutations";
import { getErrorMessage } from "@/lib/api";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/schemas/auth.schema";

export default function ForgotPasswordPage() {
  const forgotMutation = useForgotPassword();
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const onInvalid = () => {
    if (errors.email) setFocus("email");
  };

  const onSubmit = (values: ForgotPasswordFormValues) => {
    forgotMutation.mutate(values);
  };

  return (
    <AuthCard className="memo-anim-slide-in">
      <AuthHeader
        title="Reset your password"
        description="Enter your email and we'll send you instructions to regain access."
      />

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
        aria-busy={forgotMutation.isPending}
        className="flex flex-col gap-5"
      >
        <AuthInput
          id="forgot-email"
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          error={errors.email?.message}
          {...register("email")}
        />

        {forgotMutation.isError ? (
          <AuthFeedback
            tone="error"
            title="Could not send instructions"
            message={getErrorMessage(forgotMutation.error)}
          />
        ) : null}

        {forgotMutation.isSuccess ? (
          <AuthFeedback
            tone="success"
            title="Check your inbox"
            message={forgotMutation.data.message}
          />
        ) : null}

        <AuthSubmitButton pending={forgotMutation.isPending} icon={<ArrowRight size={18} strokeWidth={2} />}>
          Send reset instructions
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
