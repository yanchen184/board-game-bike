import { useState } from 'prop-types';
import PropTypes from 'prop-types';

/**
 * Tooltip 組件 - 懸浮提示框
 * 用於顯示額外的說明信息
 */
const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-neutral-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-neutral-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-neutral-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-neutral-900',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      {isVisible && (
        <div
          className={`
            absolute z-50 px-3 py-2 text-sm text-white bg-neutral-900 rounded-lg shadow-xl
            whitespace-nowrap pointer-events-none
            ${positionClasses[position]}
            animate-fade-in
          `}
        >
          {content}

          {/* Arrow */}
          <div
            className={`
              absolute w-0 h-0 border-4 border-transparent
              ${arrowClasses[position]}
            `}
          />
        </div>
      )}
    </div>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.string.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
};

export default Tooltip;
