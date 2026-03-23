import type { PropsWithChildren, ReactNode } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ModalProps = PropsWithChildren<{
  open: boolean;
  title: string;
  description?: string;
  footer?: ReactNode;
  onClose: () => void;
}>;

export function Modal({ open, title, description, footer, children, onClose }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="modal-card">
        <DialogHeader className="modal-card__header">
          <div>
            <p className="eyebrow">Safety & trust</p>
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription className="modal-card__description">
                {description}
              </DialogDescription>
            ) : null}
          </div>
        </DialogHeader>
        <div className="modal-card__content">{children}</div>
        {footer ? <DialogFooter className="modal-card__footer">{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}
