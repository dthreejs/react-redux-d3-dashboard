import React, { PropTypes } from 'react';

import MdClose from 'react-icons/lib/md/close';

export default function TagButton({ label, value, onDismiss }) {
  return (
    <div className="tag-button">
      <p className="label">{label}</p>
      <a className="close-icon" onClick={onDismiss ? () => onDismiss(value) : () => {}}>
        <MdClose size={20} color="#272727" />
      </a>
    </div>
  );
}

TagButton.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onDismiss: PropTypes.func,
};
