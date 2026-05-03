import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Save, ShieldCheck, UserCog } from 'lucide-react';
import { fetchMe, updateMe, handleFirestoreError, OperationType } from '../apiClient';
import type { UserProfile } from '../types';
import PageLoader from './ui/PageLoader';

type SettingsState = {
  displayName: string;
  email: string;
  emailNotificationsEnabled: boolean;
  dailyDigestEnabled: boolean;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const me = (await fetchMe()) as UserProfile;
        if (!mounted) return;
        setSettings({
          displayName: me.displayName || 'Developer',
          email: me.email || '',
          emailNotificationsEnabled: me.emailNotificationsEnabled ?? true,
          dailyDigestEnabled: me.dailyDigestEnabled ?? true,
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users/me');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const onSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateMe({
        emailNotificationsEnabled: settings.emailNotificationsEnabled,
        dailyDigestEnabled: settings.dailyDigestEnabled,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users/me');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <PageLoader variant="profile" />;
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl flex-1 space-y-4 sm:space-y-5">
      <motion.div
        className="surface-card p-4 sm:p-5"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-primary shadow-inner">
            <UserCog size={20} strokeWidth={2.25} />
          </span>
          <div>
            <h2 className="heading text-lg sm:text-xl">Settings</h2>
            <p className="text-sm text-muted">Manage your account and notifications.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-black">Display name</label>
            <input type="text" value={settings.displayName} readOnly className="input-field cursor-not-allowed bg-black/[0.03]" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-black">Email</label>
            <input type="text" value={settings.email} readOnly className="input-field cursor-not-allowed bg-black/[0.03]" />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="surface-card p-4 sm:p-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
      >
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-primary shadow-inner">
            <Bell size={20} strokeWidth={2.25} />
          </span>
          <div>
            <h3 className="heading text-base sm:text-lg">Notifications</h3>
            <p className="text-sm text-muted">Choose what updates we send you by email.</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-black">Email notifications</p>
              <p className="text-xs text-muted">Follow, like, and important account updates.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotificationsEnabled}
              onChange={(e) => setSettings((s) => (s ? { ...s, emailNotificationsEnabled: e.target.checked } : s))}
              className="h-4 w-4 accent-black"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-black">Daily digest</p>
              <p className="text-xs text-muted">A once-a-day summary of activity and mentions.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.dailyDigestEnabled}
              onChange={(e) => setSettings((s) => (s ? { ...s, dailyDigestEnabled: e.target.checked } : s))}
              className="h-4 w-4 accent-black"
            />
          </label>
        </div>
      </motion.div>

      <motion.div
        className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/25 text-black ring-1 ring-black/10">
            <ShieldCheck size={16} />
          </span>
          <p className="text-sm text-muted">
            Settings are saved to your account and synced on next login.
          </p>
        </div>
        <motion.button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="btn-cta flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold"
          whileHover={{ scale: saving ? 1 : 1.02 }}
          whileTap={{ scale: saving ? 1 : 0.98 }}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save'}
        </motion.button>
      </motion.div>
    </div>
  );
}
