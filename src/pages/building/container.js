import React, { Component, PropTypes, cloneElement } from 'react';
import DocumentTitle from 'react-document-title';
import { connect } from 'react-redux';

const propTypes = {
  children: PropTypes.node.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
};

class PageContainer extends Component {
  render() {
    const { fixHeader, setModal } = this.props;
    return (
      <DocumentTitle title="building-container">
        { cloneElement(this.props.children, {fixHeader, setModal})}
      </DocumentTitle>
    );
  }
}

PageContainer.propTypes = propTypes;

function mapStateToProps(state) {
  return {
    isLoggedIn: state.auth.isLoggedIn,
  };
}

export default connect(
  mapStateToProps,
  null
)(PageContainer);
