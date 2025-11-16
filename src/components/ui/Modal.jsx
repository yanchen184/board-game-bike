import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { gsap } from 'gsap';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, actions }) => {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Animate in
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.2 });
      gsap.fromTo(
        modalRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );

      // Add escape key listener
      const handleEscape = e => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 opacity-0"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-xl"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {title && (
          <h2 id="modal-title" className="text-2xl font-bold mb-4 text-neutral-900">
            {title}
          </h2>
        )}

        <div className="modal-content mb-6">{children}</div>

        {actions && <div className="modal-actions flex justify-end gap-3">{actions}</div>}

        {!actions && (
          <div className="modal-actions flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              關閉
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
};

export default Modal;
