import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';

const Modal = ({ content, title, toggleAction, maxWidth = 850 }): Object => {
  return (
    <div className="modal">
      <div className="modal-inner" style={{maxWidth}}>
        <div className="modal-content">
          <h1>{ title } <div className="close-icon" onClick={() => toggleAction()}>X</div></h1>
          { content }
        </div>
      </div>
      <div className="modal-background" onClick={ toggleAction }></div>
    </div>
  );
};

Modal.propTypes = {
  content: PropTypes.object.isRequired,
  title: PropTypes.string,
  toggleAction: PropTypes.func.isRequired,
  maxWidth: PropTypes.number,
};

export default Modal;
