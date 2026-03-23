import { ChevronLeft } from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { BottomNav } from './BottomNav';

type AppFrameProps = PropsWithChildren<{
  showNav?: boolean;
}>;

export function AppFrame({ children, showNav = true }: AppFrameProps) {
  return (
    <div className="page-scaffold">
      <div className="page-scaffold__orb page-scaffold__orb--left" />
      <div className="page-scaffold__orb page-scaffold__orb--right" />
      <div className="app-device">
        <div className="app-device__screen">
          {children}
          {showNav ? <BottomNav /> : null}
        </div>
      </div>
    </div>
  );
}

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backTo?: string;
  action?: ReactNode;
};

export function PageHeader({ title, subtitle, backTo, action }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__main">
        {backTo ? (
          <Link className="icon-button icon-button--ghost" to={backTo} aria-label="Go back">
            <ChevronLeft size={18} />
          </Link>
        ) : (
          <span className="icon-button icon-button--ghost icon-button--placeholder" aria-hidden="true" />
        )}
        <div>
          <p className="eyebrow">Bubbleverse</p>
          <h1>{title}</h1>
          {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="page-header__action">{action}</div> : null}
    </header>
  );
}
