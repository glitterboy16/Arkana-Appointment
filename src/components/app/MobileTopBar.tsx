import { ArkanaIcons, LogoArkana } from './Shared';

interface MobileTopBarProps {
  onMenu: () => void;
  title?: string;
}

export default function MobileTopBar({ onMenu, title = 'Arkana' }: MobileTopBarProps) {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 26, height: 26, background: '#004AAD', borderRadius: 7,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <LogoArkana size={18} onBrand />
        </div>
        <div className="ark-mobile-topbar-brand" style={{
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {title}
        </div>
      </div>
    </div>
  );
}
