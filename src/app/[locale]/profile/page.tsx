'use client';

import {useState, useEffect, type FormEvent} from 'react';
import {useSession} from 'next-auth/react';
import {useRouter} from '@/i18n/navigation';
import {Link} from '@/i18n/navigation';

type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: string;
};

export default function ProfilePage() {
  const {data: session, status} = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Edit name state
  const [editName, setEditName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<{type: 'success' | 'error'; text: string} | null>(null);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{type: 'success' | 'error'; text: string} | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch profile data
  useEffect(() => {
    if (status !== 'authenticated') return;

    async function fetchProfile() {
      setIsLoadingProfile(true);
      try {
        const res = await fetch('/api/auth/profile');
        if (res.ok) {
          const data: UserProfile = await res.json();
          setProfile(data);
          setEditName(data.name ?? '');
        }
      } catch {
        // Failed to load profile
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchProfile();
  }, [status]);

  async function handleUpdateName(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNameMessage(null);

    if (!editName.trim() || editName.trim().length < 2) {
      setNameMessage({type: 'error', text: 'Name must be at least 2 characters'});
      return;
    }

    setIsSavingName(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: editName.trim()}),
      });

      if (!res.ok) {
        const data = await res.json();
        setNameMessage({type: 'error', text: data.error || 'Failed to update name'});
        return;
      }

      const updated = await res.json();
      setProfile((prev) => (prev ? {...prev, name: updated.name} : prev));
      setNameMessage({type: 'success', text: 'Name updated'});
    } catch {
      setNameMessage({type: 'error', text: 'Something went wrong'});
    } finally {
      setIsSavingName(false);
    }
  }

  async function handleChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({type: 'error', text: 'Current password is required'});
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordMessage({type: 'error', text: 'New password must be at least 8 characters'});
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({type: 'error', text: 'Passwords do not match'});
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({currentPassword, newPassword}),
      });

      if (!res.ok) {
        const data = await res.json();
        setPasswordMessage({type: 'error', text: data.error || 'Failed to change password'});
        return;
      }

      setPasswordMessage({type: 'success', text: 'Password changed'});
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPasswordMessage({type: 'error', text: 'Something went wrong'});
    } finally {
      setIsSavingPassword(false);
    }
  }

  // Loading state
  if (status === 'loading' || isLoadingProfile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Skeleton loader */}
          <div className="h-8 w-48 bg-surface rounded animate-pulse" />
          <div className="bg-surface border border-border rounded-xl p-8 space-y-4">
            <div className="h-4 w-32 bg-background rounded animate-pulse" />
            <div className="h-10 w-full bg-background rounded animate-pulse" />
            <div className="h-4 w-32 bg-background rounded animate-pulse" />
            <div className="h-10 w-full bg-background rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-foreground/60 mb-4">Failed to load profile</p>
          <Link
            href="/"
            className="text-primary hover:text-primary-hover font-medium transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="mt-1 text-foreground/60">Manage your account settings</p>
        </div>

        {/* User Info Card */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-4">
            {profile.image ? (
              <img
                src={profile.image}
                alt={profile.name ?? 'User'}
                className="w-16 h-16 rounded-full border-2 border-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {(profile.name ?? profile.email ?? '?')[0].toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-white">{profile.name ?? 'Unnamed'}</h2>
              <p className="text-sm text-foreground/60">{profile.email}</p>
              <p className="text-xs text-foreground/40 mt-0.5">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Name */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Edit Name</h3>
          <form onSubmit={handleUpdateName} className="space-y-4">
            {nameMessage && (
              <div
                className={`px-4 py-3 rounded-lg text-sm ${
                  nameMessage.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {nameMessage.text}
              </div>
            )}

            <div>
              <label
                htmlFor="profile-name"
                className="block text-sm font-medium text-foreground/70 mb-1.5"
              >
                Display name
              </label>
              <input
                id="profile-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg
                  text-foreground placeholder:text-foreground/30
                  focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingName}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white
                font-medium rounded-lg transition-colors disabled:opacity-50
                disabled:cursor-wait flex items-center gap-2"
            >
              {isSavingName && (
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {isSavingName ? 'Saving...' : 'Save name'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordMessage && (
              <div
                className={`px-4 py-3 rounded-lg text-sm ${
                  passwordMessage.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {passwordMessage.text}
              </div>
            )}

            <div>
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-foreground/70 mb-1.5"
              >
                Current password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                autoComplete="current-password"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg
                  text-foreground placeholder:text-foreground/30
                  focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-foreground/70 mb-1.5"
              >
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg
                  text-foreground placeholder:text-foreground/30
                  focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-foreground/70 mb-1.5"
              >
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                autoComplete="new-password"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg
                  text-foreground placeholder:text-foreground/30
                  focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingPassword}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white
                font-medium rounded-lg transition-colors disabled:opacity-50
                disabled:cursor-wait flex items-center gap-2"
            >
              {isSavingPassword && (
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {isSavingPassword ? 'Changing...' : 'Change password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
