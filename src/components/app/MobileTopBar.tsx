import { ArkanaIcons, LogoArkana } from './Shared';
import NotificationsBell from './NotificationsBell';

interface MobileTopBarProps {
  onMenu: () => void;
  title?: string;
  showBell?: boolean;
}

export default function MobileTopBar({ onMenu, title = 'Arkana', showBell = true }: MobileTopBarProps) {
  return (
    <div className="ark-mobile-topbar ark-only-mobile">
      <button
        className="ark-mobile-menu-btn"
        onClick={onMenu}
        aria-label="Abrir menú"
        type="button"
      >
        {ArkanaIcons.menu}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <LogoArkana size={36} />
        <div className="ark-mobile-topbar-brand" style={{
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {title}
        </div>
      </div>
      {showBell && <NotificationsBell />}
    </div>
  );
}
