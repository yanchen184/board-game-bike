import { memo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const Card = memo(({ children, className, onClick, hover = false, ...rest }) => {
  return (
    <div
      className={clsx(
        'card bg-white rounded-2xl p-6',
        'shadow-medium transition-all duration-300',
        hover && 'hover:shadow-large hover:-translate-y-1 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  hover: PropTypes.bool,
};

export default Card;
