import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { logout } from '../../actions/auth';
import { Link, IndexLink } from 'react-router';

const propTypes = {
  user: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
  setModal: PropTypes.func,
  actions: PropTypes.object
};

class Navigation extends Component {

  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.renderHierarchy = this.renderHierarchy.bind(this);
    this.state = {
      debug: false
    }
  }

  logout() {
    this.props.logout();
  }

  jumpTop() {
    const nav: Object = document.getElementById('sidedrawer');
    if (nav) {
      nav.scrollTop = 0;
    }

    window.scrollTo(0, 0);
    console.log('JUMPED');
  }

  renderHierarchy() {
    const context = this;
    const { buildings } = this.props;

    if (buildings) {
      const { debug } = this.state;
      let bAll = [];

      if (debug) {
        bAll = [buildings[0], buildings[1]];
      }
      else {
        bAll = buildings;
      }
      return (
        <ul className="mui-list--unstyled side-nav">
          {
            bAll.map((b, i) => {
              return (
                <li key={i} onClick={context.jumpTop}>
                  <div>
                    <Link to={`/building/${b.id}`} activeClassName="current-item">BUILDING { b.id }</Link>
                    <ul className="mui-list--unstyled side-nav sub-nav">
                      { b.floors.map((f, ii) => <li key={ii}><Link to={`/building/${b.id}/floor/${f.id}`} activeClassName="current-item">Floor { f.id }</Link></li>) }
                    </ul>
                  </div>
                </li>
              );
            })
          }
        </ul>
      );
    }

    return null;
  }

  render() {
    const context = this;
    const progress = 90;
    const progressBar = {
      width: `${progress}%`
    };

    const mainPath = [
      { name: 'OVERVIEW', to: '/' },
      { name: 'METRICS', to: 'metrics' },
      { name: 'INSIGHTS', to: 'insights' },
    ];

    return (
      <nav id="sidedrawer" className="left-nav mui--no-user-select">
        <div className="inner-nav">
          <div className="study-progress" onClick={() => this.setState({ debug: !this.state.debug })}>
            <p>Study Progress - { progress }%</p>
            <div className="study-progress-bar">
              <div style={progressBar}></div>
              <div></div>
            </div>
          </div>
          <ul className="mui-list--unstyled side-nav">
            {
              mainPath.map((p, i) => {
                if (i === 0) {
                  return (
                    <li key={i} onClick={context.jumpTop}>
                      <IndexLink to={p.to} activeClassName="current-item">{ p.name }</IndexLink>
                    </li>
                  )
                }
                return (
                  <li key={i} onClick={this.jumpTop}>
                    <Link to={p.to} activeClassName="current-item">{ p.name }</Link>
                  </li>
                )
              })
            }
          </ul>

          <div className="map-list">
            <hr />
            <p>Location</p>
            { this.renderHierarchy() }
          </div>

          <div className="nav-bottom">
            <ul className="mui-list--unstyled side-nav bottom-nav">
              <li onClick={this.jumpTop}>
                <Link to="/knowledge-center" activeClassName="current-item">KNOWLEDGE CENTER</Link>
              </li>
              <li onClick={this.jumpTop}>
                <a onClick={e => {
                    e.preventDefault();
                    this.props.actions.setModal('feedback');
                  }}>
                  FEEDBACK
                </a>
              </li>
            </ul>
            <p>Last Updated: 3.1.17</p>
          </div>
        </div>
      </nav>
    );
  }
}

Navigation.propTypes = propTypes;

function mapStateToProps(state) {
  return {
    user: state.auth.info,
    buildings: state.overview.buildings,
  };
}

export default connect(mapStateToProps, { logout })(Navigation);
