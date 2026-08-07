"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera, Mail, NotebookPen, Save, Trash2, UserRound } from "lucide-react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { AuthFeedback } from "@/components/auth/AuthFeedback";
import { UserMenu } from "@/components/auth/UserMenu";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/hooks/useAuthMutations";
import { getErrorMessage, resolveApiUrl } from "@/lib/api";
import { getUserInitials } from "@/lib/initials";
import type { AuthUser } from "@/types/auth";

const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function AvatarPreview({ user, previewUrl }: { user: AuthUser; previewUrl: string | null }) {
  if (previewUrl) {
    return (
      // User-provided avatar images come from the API origin; next/image is
      // not applied because the source is remote and unoptimized by design.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={previewUrl}
        alt="Profile photo preview"
        className="size-28 rounded-full border-2 border-border-subtle object-cover"
      />
    );
  }

  if (user.profileImageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolveApiUrl(user.profileImageUrl)}
        alt={`${user.name} profile picture`}
        className="size-28 rounded-full border-2 border-border-subtle object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex size-28 items-center justify-center rounded-full bg-brand text-4xl font-semibold text-brand-on"
    >
      {getUserInitials(user)}
    </span>
  );
}

function ProfileForm() {
  const { user } = useAuth();
  const updateMutation = useUpdateProfile();

  const [name, setName] = useState(user?.name ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const releasePreview = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreviewUrl(null);
  };

  // Revoke any live object URL when the component unmounts.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFileError("Profile photo must be a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setFileError("Profile photo must be 2 MB or smaller.");
      return;
    }

    setFileError(null);
    releasePreview();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreviewUrl(url);
    setSelectedFile(file);
    setRemovePhoto(false);
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    releasePreview();
    setSelectedFile(null);
    setRemovePhoto(true);
  };

  const handleSave = () => {
    updateMutation.mutate(
      {
        name: name.trim(),
        profileImage: selectedFile,
        removeProfileImage: removePhoto && !selectedFile,
      },
      {
        // After a successful save the server is the source of truth: clear
        // the local preview and the remove-photo flag so the current photo
        // and name are shown.
        onSuccess: () => {
          releasePreview();
          setSelectedFile(null);
          setRemovePhoto(false);
        },
      }
    );
  };

  if (!user) {
    return null;
  }

  const nameChanged = name.trim() !== user.name;
  const canSave =
    nameChanged || selectedFile !== null || (removePhoto && Boolean(user.profileImageUrl));
  const mutationError = updateMutation.isError
    ? getErrorMessage(updateMutation.error)
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-navbar-bg shadow-memo-subtle">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-6 xl:px-12"
        >
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span
              className="flex size-10 items-center justify-center rounded-memo-md bg-brand/10 text-brand"
              aria-hidden="true"
            >
              <NotebookPen size={22} strokeWidth={2} />
            </span>
            <span className="text-lg font-bold tracking-tight text-ink">
              MemoNest
            </span>
          </Link>
          <UserMenu />
        </nav>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 xl:px-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">
          Account
        </p>
        <h1 className="mt-2 text-4xl font-bold leading-tight text-ink">
          Profile
        </h1>
        <p className="mt-2 text-base text-ink-secondary">
          Manage your personal information and profile photo.
        </p>

        <div className="mt-8 rounded-memo-lg border border-border-subtle bg-card-surface p-6 shadow-memo-subtle sm:p-8">
          <section aria-labelledby="profile-photo-heading">
            <h2
              id="profile-photo-heading"
              className="text-lg font-semibold text-ink"
            >
              Profile photo
            </h2>
            <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              <AvatarPreview user={user} previewUrl={previewUrl} />
              <div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
                <p className="max-w-sm text-center text-sm text-ink-muted sm:text-left">
                  JPG, PNG, or WebP. Max 2 MB. Your photo is stored on your
                  device&apos;s server and never in your browser.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button
                    variant="ghost"
                    leftIcon={<Camera size={18} strokeWidth={2} aria-hidden="true" />}
                    onClick={handleChangePhoto}
                  >
                    Change Photo
                  </Button>
                  {user.profileImageUrl || selectedFile ? (
                    <Button
                      variant="ghost"
                      leftIcon={<Trash2 size={18} strokeWidth={2} aria-hidden="true" />}
                      onClick={handleRemovePhoto}
                    >
                      Remove Photo
                    </Button>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  className="hidden"
                  aria-label="Upload a profile photo"
                  onChange={(event) => {
                    handleFileSelect(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                {fileError ? (
                  <p role="alert" className="text-sm font-medium text-error">
                    {fileError}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <div role="separator" className="my-8 h-px bg-border-subtle" />

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSave();
            }}
            className="flex flex-col gap-5"
          >
            <div>
              <label htmlFor="profile-name" className="text-sm font-medium text-ink">
                Name
              </label>
              <div className="mt-1.5">
                <Input
                  id="profile-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  leadingIcon={<UserRound size={18} strokeWidth={2} aria-hidden="true" />}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="profile-email" className="text-sm font-medium text-ink">
                Email
              </label>
              <div className="mt-1.5">
                <Input
                  id="profile-email"
                  type="email"
                  autoComplete="email"
                  value={user.email}
                  disabled
                  leadingIcon={<Mail size={18} strokeWidth={2} aria-hidden="true" />}
                />
              </div>
              <p className="mt-1.5 text-xs text-ink-muted">
                Your email is used to sign in and cannot be changed here.
              </p>
            </div>

            {mutationError ? (
              <AuthFeedback
                tone="error"
                title="Could not save your profile"
                message={mutationError}
              />
            ) : null}

            {updateMutation.isSuccess ? (
              <AuthFeedback
                tone="success"
                title="Profile updated"
                message="Profile updated successfully."
              />
            ) : null}

            <div className="mt-2 flex justify-end">
              <Button
                type="submit"
                loading={updateMutation.isPending}
                disabled={!canSave}
                leftIcon={<Save size={18} strokeWidth={2} aria-hidden="true" />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard requireAuth>
      <ProfileForm />
    </AuthGuard>
  );
}
