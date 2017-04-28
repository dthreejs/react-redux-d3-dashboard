import React from 'react';
import { Link } from 'react-router';

const PageNotFound = () => {
  return (
    <div>
      <div className="block-header">
        <h1>
          405
          <small>Page In Construction</small>
        </h1>
      </div>
      <p>The page you are requesting is being build!</p>
      <br />
      <Link to="/">Back to home</Link>
    </div>
  );
};

export default PageNotFound;
