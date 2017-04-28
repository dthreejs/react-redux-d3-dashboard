import React, { Component, PropTypes } from 'react';
import { reduxForm, Field, propTypes } from 'redux-form';
import DocumentTitle from 'react-document-title';
import renderInput from '../components/render_input';

const formPropTypes = {
  ...propTypes,
};

const LoginPage = props => {
  const { handleSubmit } = props;
  return (
    <DocumentTitle title="Login">
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>
            Login
          </legend>
          <div className="form-element">
            <Field
              label="Email"
              id="email"
              name="email"
              placeholder="Your email"
              component={renderInput}
              type="email"
            />
          </div>
          <div className="form-element">
            <Field
              label="Password"
              id="password"
              name="password"
              placeholder="Your password"
              component={renderInput}
              type="password"
            />
          </div>
          <button
            type="submit"
            className="button button-primary"
          >
            Login
          </button>
        </fieldset>
      </form>
    </DocumentTitle>
  );
};

function validate(values) {
  const errors = {};

  if (!values.email) {
    errors.email = 'Enter a email';
  }

  if (!values.password) {
    errors.password = 'Enter a password';
  }

  return errors;
}

LoginPage.propTypes = formPropTypes;

function mapStateToProps(state) {
  return {
    isLoggedIn: state.auth.isLoggedIn,
  };
}

// connect: first argument is mapStateToProps, 2nd is mapDispatchToProps
// reduxForm: 1st is form config, 2nd is mapStateToProps, 3rd is mapDispatchToProps
export default reduxForm({
  form: 'LoginPageForm',
  validate,
})(LoginPage);
