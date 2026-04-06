import { ChevronLeft } from 'lucide-react';
import { Button as AntButton } from 'antd';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function AppFrame({
  children,
  showBottomNav = true,
}: {
  children: ReactNode;
  showBottomNav?: boolean;
}) {
  return (
    <div className="page-scaffold">
      <div className="page-scaffold__orb page-scaffold__orb--left" />
      <div className="page-scaffold__orb page-scaffold__orb--right" />
      <div className="app-device">
        <div className="app-device__screen">
          <div className="app-device__content">{children}</div>
          {showBottomNav ? <BottomNav /> : null}
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
    <header className="flex items-center justify-between gap-3 pb-1">
      <div className="flex-1 flex items-center gap-3">
        {backTo ? (
          <Link
            className="shrink-0"
            to={backTo}
            aria-label="Go back"
          >
            <AntButton shape="circle" icon={<ChevronLeft size={18} />} />
          </Link>
        ) : (
          <span className="h-10 w-10 shrink-0" aria-hidden="true" />
        )}
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Bubbleverse
          </p>
          <h1 className="text-[2rem]">{title}</h1>
          {subtitle ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
