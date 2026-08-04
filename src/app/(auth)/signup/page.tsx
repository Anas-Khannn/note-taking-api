"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowRight, LockKeyhole, Mail, User } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFeedback } from "@/components/auth/AuthFeedback";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { useSignup } from "@/hooks/useAuthMutations";
import { getErrorMessage } from "@/lib/api";
import {
  signupSchema,
  type SignupFormValues,
} from "@/schemas/auth.schema";

export default function SignupPage() {
  const signupMutation = useSignup();
  const {
    register,
    handleSubmit,
    setFocus,
    control,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  // Live password value drives the strength meter; useWatch avoids the
  // unmemoizable watch() function that the React Compiler lint flags.
  const password = useWatch({ control, name: "password" });

  const onInvalid = () => {
    if (errors.name) setFocus("name");
    else if (errors.email) setFocus("email");
    else if (errors.password) setFocus("password");
    else if (errors.confirmPassword) setFocus("confirmPassword");
  };

  const onSubmit = (values: SignupFormValues) => {
    // confirmPassword is a client-only field; the backend contract only
    // receives name, email and password.
    signupMutation.mutate({
      name: values.name,
      email: values.email,
      password: values.password,
    });
  };

  const success = signupMutation.isSuccess ? signupMutation.data : null;

  return (
    <AuthCard className="memo-anim-slide-in">
      <AuthHeader
        title="Create your MemoNest"
        description="Build a private space for your thoughts, plans, and ideas."
      />

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
        aria-busy={signupMutation.isPending}
        className="flex flex-col gap-5"
      >
        <AuthInput
          id="signup-name"
          label="Full name"
          type="text"
          icon={User}
          placeholder="Ada Lovelace"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />

        <AuthInput
          id="signup-email"
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

        <div>
          <PasswordInput
            id="signup-password"
            label="Password"
            icon={LockKeyhole}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrength password={password} />
        </div>

        <PasswordInput
          id="signup-confirm-password"
          label="Confirm password"
          icon={LockKeyhole}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {signupMutation.isError ? (
          <AuthFeedback
            tone="error"
            title="Could not create your account"
            message={getErrorMessage(signupMutation.error)}
          />
        ) : null}

        {success ? (
          <AuthFeedback
            tone="success"
            title="Account created"
            message={
              "requiresVerification" in success
                ? success.message
                : "Your account is ready. You can now start taking notes."
            }
          />
        ) : null}

        <AuthSubmitButton pending={signupMutation.isPending} icon={<ArrowRight size={18} strokeWidth={2} />}>
          Create account
        </AuthSubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-ink-secondary">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand transition-colors hover:text-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
