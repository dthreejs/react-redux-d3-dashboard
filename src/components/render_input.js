import React from 'react';

const renderInput = ({ input, label, type, meta: { touched, error, invalid } }) => {
  return (
    <div>
      <label htmlFor={label}>{label}</label>
      <input
        className={`form-input form-element ${touched && invalid ? 'input-invalid' : 'input-valid'}`}
        type={type}
        {...input}
        required/>

      {touched && error && <span className="error">{error}</span>}
    </div>
  );
};

export default renderInput;
