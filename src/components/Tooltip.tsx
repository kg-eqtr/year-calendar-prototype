import { useState, useRef, useLayoutEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  label?: string;
}

export default function Tooltip({ content, children, label }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [positioned, setPositioned] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  useLayoutEffect(() => {
    if (visible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let left =
        triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      let top = triggerRect.top - tooltipRect.height - 8;

      if (top < 8) top = triggerRect.bottom + 8;
      if (left < 8) left = 8;
      if (left + tooltipRect.width > vw - 8) left = vw - tooltipRect.width - 8;
      if (top + tooltipRect.height > vh - 8) top = vh - tooltipRect.height - 8;

      setPosition({ top, left });
      setPositioned(true);
    } else {
      setPositioned(false);
    }
  }, [visible]);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      tabIndex={0}
      aria-label={label}
      aria-describedby={visible ? tooltipId : undefined}
      className="flex-shrink-0 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-0 rounded-sm"
    >
      {children}
      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-3 text-sm pointer-events-none transition-opacity duration-75"
            style={{
              top: position.top,
              left: position.left,
              opacity: positioned ? 1 : 0,
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </div>
  );
}
