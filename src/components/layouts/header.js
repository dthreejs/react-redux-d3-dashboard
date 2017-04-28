import React, { PropTypes } from 'react';
import { Link, IndexLink } from 'react-router';
import Appbar from 'muicss/lib/react/appbar';

import logo from './../../assets/images/acme-prelude-logo.svg';

const propTypes = {
  user: PropTypes.object.isRequired
};

const Header = ({ user }) => {
  return (
    <Appbar>
      <header>
        <Link to="/"><img src={logo} alt="Acme" /></Link>
        {
          user &&
          <div className="brand">
            { user.company }
          </div>
        }
        {
          user &&
          <div className="header-user">
            <div>Hello, { user.name }</div>
            <a href="" className="btn">Log out</a>
          </div>
        }
      </header>
    </Appbar>
  );
};

Header.propTypes = propTypes;

export default Header;
