import PropTypes from 'prop-types';
import clsx from 'clsx';

const Loading = ({ size = 'md', message = '載入中...', fullscreen = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={clsx(
          'rounded-full border-primary-orange border-t-transparent animate-spin',
          sizeClasses[size]
        )}
      />
      {message && <p className="text-neutral-600 font-medium">{message}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

Loading.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  message: PropTypes.string,
  fullscreen: PropTypes.bool,
};

export default Loading;
