"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFeedback } from "@/components/auth/AuthFeedback";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useLogin } from "@/hooks/useAuthMutations";
import { getErrorMessage } from "@/lib/api";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";

function LoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onInvalid = () => {
    if (errors.email) setFocus("email");
    else if (errors.password) setFocus("password");
  };

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <AuthCard className="memo-anim-slide-in">
      <AuthHeader
        title="Welcome back"
        description="Sign in to continue organizing your ideas."
      />

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
        aria-busy={loginMutation.isPending}
        className="flex flex-col gap-5"
      >
        <AuthInput
          id="login-email"
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

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="login-password" className="text-sm font-medium text-ink">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="rounded-memo-sm py-1 text-sm font-medium text-brand transition-colors hover:text-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            label=""
            icon={LockKeyhole}
            placeholder="Your password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        {loginMutation.isError ? (
          <AuthFeedback
            tone="error"
            title="Could not sign in"
            message={getErrorMessage(loginMutation.error)}
          />
        ) : null}

        {registered ? (
          <AuthFeedback
            tone="success"
            message="Account created successfully. Please sign in."
          />
        ) : null}

        <AuthSubmitButton pending={loginMutation.isPending} icon={<ArrowRight size={18} strokeWidth={2} />}>
          Sign in
        </AuthSubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-ink-secondary">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-brand transition-colors hover:text-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}

// useSearchParams requires a Suspense boundary during prerendering.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
