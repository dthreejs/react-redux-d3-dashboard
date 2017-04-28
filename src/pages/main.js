import React, { Component, PropTypes, cloneElement } from 'react';
import DocumentTitle from 'react-document-title';
import { connect } from 'react-redux';
import LoginPage from './login_page';
import { login } from '../actions/auth';
import { fetchOverview, initApp, toggleModal } from './../actions/overview';

import Header from '../components/layouts/header';
import Navigation from '../components/layouts/navigation';
import ModalDatepicker from '../components/modals/datepicker';
import ModalTimepicker from '../components/modals/timepicker';
import ModalFeedback from '../components/modals/feedback';

import Container from 'muicss/lib/react/container';
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';

const propTypes = {
  children: PropTypes.node.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
};

class PageContainer extends Component {
  constructor() {
    super();
    this.state = {
      fixHeader: true,
      modal: null,
      user: {
        name: 'Tim',
        company: 'Company Name',
        isLoggedIn: true
      }
    };
    this.setModal = this.setModal.bind(this);
    this.renderModal = this.renderModal.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentWillMount() {
    this.props.fetchOverview();
    this.props.initApp();
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll = event => {
    let scrollTop: Object = event.srcElement.body.scrollTop,
        transform: number = Math.min(0, scrollTop/3 - 60),
        winHeight: number = window.innerHeight,
        containerHeight: Object = document.querySelector('.page'),
        nav: Object = document.querySelector('#sidedrawer');

    if (containerHeight && containerHeight.clientHeight > winHeight) {
      if (scrollTop <= 120) {
        this.setState({ fixHeader: true });
      }
      else {
        this.setState({ fixHeader: false });
        //nav.scrollTop = 0;
      }

      this.setState({ transform });
    }
  };

  setModal = (type) => {
    let { modal } = this.state;
    switch(type) {
      case 'datepicker':
        modal = <ModalDatepicker />;
        break;

      case 'timepicker':
        modal = <ModalTimepicker />;
        break;

      case 'feedback':
        modal = <ModalFeedback />;
        break;

      default:
        modal = null;
    }
    this.setState({ modal });
    this.props.toggleModal(true);
  };

  renderModal() {
    if (this.props.showModal) {
     return this.state.modal;
    }
    return null;
  }

  renderChildren() {
    const { fixHeader, user } = this.state;

    if (this.props.isLoggedIn) {
      return (
        <div>
          { this.renderModal() }
          { fixHeader && <Header user={user} /> }
          <div className={fixHeader ? 'main' : 'main fixed-header'}>
            <Navigation actions={{ setModal: this.setModal }} />
            <div id="content-wrapper">
              <Container fluid={true} className="view-container">
                { cloneElement(this.props.children, { setModal: this.setModal, fixHeader }) }
              </Container>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div>
        <Header user={user} />
        <Container fluid={true} className="main">
          <LoginPage onSubmit={login} />
        </Container>
      </div>
    );
  }

  render() {
    return (
      <DocumentTitle title="Acme">
        <div className={this.props.showModal ? 'modal-on': ''}>
          {this.renderChildren()}
        </div>
      </DocumentTitle>
    );
  }
}

PageContainer.propTypes = propTypes;

function mapStateToProps(state) {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    showModal: state.overview.showModal,
  };
}

export default connect(
  mapStateToProps,
  { login, fetchOverview, initApp, toggleModal }
)(PageContainer);
