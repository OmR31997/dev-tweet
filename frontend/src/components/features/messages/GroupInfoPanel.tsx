"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { SearchInput } from "@/components/common/SearchInput";
import {
  getErrorMessage,
  useDemoteGroupMember,
  usePromoteGroupMember,
  useRemoveGroupMember,
  useUpdateGroup,
  useUser,
  useUsers,
  type Conversation,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store";
import {
  ChevronRight,
  ImageIcon,
  MoreVertical,
  Shield,
  ShieldOff,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { AddGroupMemberDialog } from "./AddGroupMemberDialog";

export function GroupInfoPanel({
  group,
  open,
  onClose,
  onOpenMedia,
}: {
  group: Conversation;
  open: boolean;
  onClose: () => void;
  onOpenMedia?: () => void;
}) {
  const t = useTranslations("Chat");
  const me = useAuthUser();
  const users = useUsers();
  const updateGroup = useUpdateGroup(group.id);
  const [title, setTitle] = useState(group.title);
  const [description, setDescription] = useState(group.description);
  const [memberSearch, setMemberSearch] = useState("");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = me ? group.admins.includes(me.id) : false;

  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    if (me) map.set(me.id, me.displayName);
    for (const user of users.data ?? []) {
      map.set(user.id, user.displayName);
    }
    return map;
  }, [me, users.data]);

  const filteredParticipants = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    return group.participants.filter((id) => {
      if (!q) return true;
      const name = nameById.get(id) ?? "";
      return name.toLowerCase().includes(q);
    });
  }, [group.participants, memberSearch, nameById]);

  useEffect(() => {
    if (open) {
      setTitle(group.title);
      setDescription(group.description);
      setMemberSearch("");
      setAddMemberOpen(false);
      setError(null);
    }
  }, [open, group.title, group.description]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  const displayTitle = group.title || t("untitledGroup");
  const participantLabel = t("participantsCount", {
    count: group.participants.length,
  });

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    updateGroup.mutate(
      {
        title: title.trim(),
        description: description.trim(),
      },
      {
        onSuccess: () => setError(null),
        onError: (err) => setError(getErrorMessage(err)),
      },
    );
  };

  return (
    <>
      <aside
        className={cn(
          "chat-contact-panel",
          "fixed inset-0 z-50 h-full w-full max-w-full shadow-2xl",
          "md:static md:inset-auto md:z-auto md:h-full md:w-full md:max-w-[400px] md:shadow-none",
        )}
      >
        <header className="chat-contact-header">
          <button
            type="button"
            className="chat-contact-close"
            onClick={onClose}
            aria-label={t("closeGroupInfo")}
          >
            ×
          </button>
          <h2 className="chat-contact-title">{t("groupInfoTitle")}</h2>
        </header>

        {error ? <p className="chat-contact-notice chat-contact-notice--error">{error}</p> : null}

        <div className="chat-contact-scroll">
          <div className="chat-contact-profile">
            <div className="chat-group-avatar">
              <Users className="size-12" aria-hidden />
            </div>
            <h3 className="chat-contact-name">{displayTitle}</h3>
            <p className="chat-contact-phone">{participantLabel}</p>
          </div>

          {isAdmin ? (
            <form onSubmit={onSave} className="chat-contact-bio">
              <div className="chat-contact-bio-head">
                <span className="chat-contact-bio-label">{t("groupName")}</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className="chat-contact-bio-input chat-contact-bio-input--single"
              />

              <div className="chat-contact-bio-head chat-contact-bio-head--spaced">
                <span className="chat-contact-bio-label">{t("groupDescription")}</span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder={t("groupDescriptionPlaceholder")}
                className="chat-contact-bio-input"
              />

              <button
                type="submit"
                className="chat-group-save-btn"
                disabled={updateGroup.isPending || !title.trim()}
              >
                {updateGroup.isPending ? t("savingGroup") : t("saveGroupChanges")}
              </button>
            </form>
          ) : (
            group.description ? (
              <section className="chat-contact-bio">
                <div className="chat-contact-bio-head">
                  <span className="chat-contact-bio-label">{t("groupDescription")}</span>
                </div>
                <p className="chat-contact-bio-text">{group.description}</p>
              </section>
            ) : null
          )}

          {onOpenMedia ? (
            <nav className="chat-contact-nav" aria-label={t("groupOptions")}>
              <button
                type="button"
                className="chat-contact-menu-item"
                onClick={onOpenMedia}
              >
                <ImageIcon className="size-5 shrink-0 text-muted-foreground" />
                <span className="chat-contact-menu-label">{t("mediaAndFiles")}</span>
                <ChevronRight className="chat-contact-menu-chevron" aria-hidden />
              </button>
            </nav>
          ) : null}

          <section className="chat-group-members">
            <div className="chat-group-members-head">
              <span className="chat-contact-bio-label">{participantLabel}</span>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => setAddMemberOpen(true)}
                  className="chat-group-add-member"
                >
                  <UserPlus className="size-3.5" aria-hidden />
                  {t("addMember")}
                </button>
              ) : null}
            </div>

            <SearchInput
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder={t("searchMembers")}
              className="h-9"
              wrapperClassName="chat-group-member-search mb-3"
            />

            {filteredParticipants.length === 0 ? (
              <p className="chat-contact-bio-empty">{t("noMembersFound")}</p>
            ) : (
              <ul className="chat-group-member-list">
                {filteredParticipants.map((memberId) => (
                  <GroupMemberRow
                    key={memberId}
                    conversationId={group.id}
                    memberId={memberId}
                    isAdmin={group.admins.includes(memberId)}
                    isSelf={memberId === me?.id}
                    canManage={isAdmin && memberId !== me?.id}
                    adminCount={group.admins.length}
                    displayName={
                      memberId === me?.id
                        ? `${me?.displayName ?? t("you")} (${t("you")})`
                        : (nameById.get(memberId) ?? "…")
                    }
                    photoURL={memberId === me?.id ? me?.photoURL : undefined}
                    adminLabel={t("admin")}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      </aside>

      <AddGroupMemberDialog
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        conversationId={group.id}
        existingParticipantIds={group.participants}
      />
    </>
  );
}

function GroupMemberRow({
  conversationId,
  memberId,
  isAdmin,
  isSelf,
  canManage,
  adminCount,
  displayName,
  photoURL,
  adminLabel,
}: {
  conversationId: string;
  memberId: string;
  isAdmin: boolean;
  isSelf: boolean;
  canManage: boolean;
  adminCount: number;
  displayName: string;
  photoURL?: string;
  adminLabel: string;
}) {
  const t = useTranslations("Chat");
  const user = useUser(isSelf ? undefined : memberId);
  const promote = usePromoteGroupMember(conversationId);
  const demote = useDemoteGroupMember(conversationId);
  const remove = useRemoveGroupMember(conversationId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const busy = promote.isPending || demote.isPending || remove.isPending;
  const avatarName = isSelf ? displayName : (user.data?.displayName ?? displayName);
  const avatarPhoto = isSelf ? photoURL : user.data?.photoURL;

  const runAction = (action: () => void) => {
    setMenuOpen(false);
    setActionError(null);
    action();
  };

  return (
    <li
      className={cn(
        "chat-group-member-row",
        isSelf && "chat-group-member-row--self",
      )}
    >
      <UserAvatar
        name={avatarName}
        photoURL={avatarPhoto}
        className="size-10"
      />
      <div className="min-w-0 flex-1">
        <p className="chat-group-member-name">{displayName}</p>
        {isAdmin ? (
          <p className="chat-group-member-role">{adminLabel}</p>
        ) : null}
        {actionError ? (
          <p className="chat-group-member-error">{actionError}</p>
        ) : null}
      </div>

      {canManage ? (
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            disabled={busy}
            aria-label={t("memberOptions")}
            className="chat-group-member-menu-btn"
          >
            <MoreVertical className="size-4" />
          </button>

          {menuOpen ? (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
                {!isAdmin ? (
                  <button
                    type="button"
                    onClick={() =>
                      runAction(() =>
                        promote.mutate(memberId, {
                          onError: (err) =>
                            setActionError(getErrorMessage(err)),
                        }),
                      )
                    }
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <Shield className="size-4" />
                    {t("makeAdmin")}
                  </button>
                ) : adminCount > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      runAction(() =>
                        demote.mutate(memberId, {
                          onError: (err) =>
                            setActionError(getErrorMessage(err)),
                        }),
                      )
                    }
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <ShieldOff className="size-4" />
                    {t("removeAdmin")}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() =>
                    runAction(() =>
                      remove.mutate(memberId, {
                        onError: (err) =>
                          setActionError(getErrorMessage(err)),
                      }),
                    )
                  }
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-accent",
                    (!isAdmin || adminCount > 1) && "border-t border-border",
                  )}
                >
                  <UserMinus className="size-4" />
                  {t("removeMember")}
                </button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
