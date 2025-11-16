import { useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { gsap } from 'gsap';
import clsx from 'clsx';

const ProgressBar = memo(({ value = 0, label, color = 'blue', showPercentage = true, className }) => {
  const barRef = useRef(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (barRef.current && value !== prevValue.current) {
      gsap.to(barRef.current, {
        width: `${value}%`,
        duration: 0.5,
        ease: 'power2.out',
      });
      prevValue.current = value;
    }
  }, [value]);

  const colorClasses = {
    blue: 'bg-primary-blue',
    green: 'bg-primary-green',
    orange: 'bg-primary-orange',
    red: 'bg-accent-red',
    purple: 'bg-accent-purple',
  };

  // Color based on value (health bar style)
  const getColorByValue = () => {
    if (value >= 70) return 'green';
    if (value >= 40) return 'orange';
    return 'red';
  };

  const barColor = color === 'auto' ? getColorByValue() : color;

  return (
    <div className={clsx('progress-bar', className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neutral-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-semibold text-neutral-900">{Math.round(value)}%</span>
          )}
        </div>
      )}

      <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
        <div
          ref={barRef}
          className={clsx('h-full rounded-full transition-all', colorClasses[barColor])}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

ProgressBar.propTypes = {
  value: PropTypes.number,
  label: PropTypes.string,
  color: PropTypes.oneOf(['blue', 'green', 'orange', 'red', 'purple', 'auto']),
  showPercentage: PropTypes.bool,
  className: PropTypes.string,
};

export default ProgressBar;
