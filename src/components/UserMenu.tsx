import LogoutButton from '@/app/LogoutButton';

interface Props {
  displayName: string;
  avatarUrl?: string | null;
}

export default function UserMenu({ displayName, avatarUrl }: Props) {
  return (
    <>
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-8 h-8 rounded-full border border-pale-slate-200"
        />
      )}
      <span className="text-pale-slate-700 text-sm font-medium">{displayName}</span>
      <LogoutButton />
    </>
  );
}
