import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, handleFirestoreError, OperationType, fetchMe, updateMe, uploadPostImage, getApiBaseUrl } from '../apiClient';
import { X, User, Book, MapPin, GraduationCap, Save, Image as ImageIcon } from 'lucide-react';
import { UserProfile } from '../types';
import PageLoader from './ui/PageLoader';
import Avatar from './ui/Avatar';

export default function ProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (!isOpen || !auth.currentUser) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const me = await fetchMe();
        setProfile(me as UserProfile);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users/' + auth.currentUser!.uid);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setSaving(true);
    try {
      await updateMe({
        ...profile,
        updatedAt: new Date(),
      });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users/' + auth.currentUser.uid);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-3 py-8 backdrop-blur-md sm:items-center sm:p-4 sm:py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="surface-card relative my-auto w-full max-w-md max-h-[min(100dvh-2rem,880px)] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-[110] rounded-xl p-2 text-muted hover:bg-black/5"
            >
              <X size={22} />
            </button>

            <div className="p-6 md:p-8">
              <h2 className="heading mb-6 text-xl md:text-2xl">Profile</h2>

              {loading ? (
                <PageLoader variant="profile" compact />
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <ImageIcon size={16} className="text-black" /> Profile photo
                    </label>
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={profile.displayName || auth.currentUser?.displayName}
                        src={profile.photoURL}
                        alt="Profile"
                        className="h-14 w-14 rounded-full border border-black/12 object-cover"
                        initialsClassName="flex items-center justify-center rounded-full border border-black/12 bg-black/85 text-sm font-bold text-primary"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingPhoto}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingPhoto(true);
                          try {
                            const uploaded = await uploadPostImage(file);
                            setProfile((prev) => ({
                              ...prev,
                              photoURL: `${getApiBaseUrl()}${uploaded.url}`,
                            }));
                          } catch (error) {
                            handleFirestoreError(error, OperationType.WRITE, 'uploads/image');
                          } finally {
                            setUploadingPhoto(false);
                            e.currentTarget.value = '';
                          }
                        }}
                        className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/25 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-black hover:file:bg-primary/35"
                      />
                      <button
                        type="button"
                        onClick={() => setProfile((prev) => ({ ...prev, photoURL: '' }))}
                        className="btn-secondary shrink-0 px-3 py-2 text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <User size={16} className="text-black" /> Display name
                    </label>
                    <input
                      type="text"
                      value={profile.displayName || ''}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      className="input-field"
                      placeholder="Your name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <Book size={16} className="text-black" /> Bio
                    </label>
                    <textarea
                      value={profile.bio || ''}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="input-field min-h-[100px] resize-none"
                      placeholder="What are you building?"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-sm font-semibold">
                        <MapPin size={16} className="text-black" /> College
                      </label>
                      <input
                        type="text"
                        value={profile.college || ''}
                        onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                        className="input-field"
                        placeholder="School or org"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-sm font-semibold">
                        <GraduationCap size={16} className="text-black" /> Focus
                      </label>
                      <input
                        type="text"
                        value={profile.branch || ''}
                        onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                        className="input-field"
                        placeholder="e.g. Backend, ML"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={saving}
                    className="btn-cta mt-2 flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold"
                    whileHover={{ scale: saving ? 1 : 1.01 }}
                    whileTap={{ scale: saving ? 1 : 0.99 }}
                  >
                    <Save size={18} /> {saving ? 'Saving…' : 'Save changes'}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
