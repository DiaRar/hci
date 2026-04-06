import { forwardRef, type MouseEvent, type ReactNode } from 'react';
import { Link, type NavigateOptions, type To } from 'react-router-dom';
import { useAnimatedNavigate } from '@/lib/useAnimatedNavigate';

type AnimatedLinkProps = {
  to: To;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  navigateOptions?: NavigateOptions;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  ['data-testid']?: string;
};

export const AnimatedLink = forwardRef<HTMLAnchorElement, AnimatedLinkProps>(
  function AnimatedLink(
    { to, className, children, ariaLabel, navigateOptions, onClick, 'data-testid': dataTestId },
    ref,
  ) {
    const animatedNavigate = useAnimatedNavigate();

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) {
        return;
      }

      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }

      event.preventDefault();
      animatedNavigate(to, navigateOptions);
    };

    return (
      <Link
        ref={ref}
        to={to}
        className={className}
        aria-label={ariaLabel}
        onClick={handleClick}
        data-testid={dataTestId}
      >
        {children}
      </Link>
    );
  },
);
