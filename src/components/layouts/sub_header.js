require('react-datepicker/dist/react-datepicker.css');

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Icon from 'react-fontawesome';
import moment from 'moment';

const propTypes = {
  fixHeader: PropTypes.bool.isRequired,
  setModal: PropTypes.func,
  showFilters: PropTypes.bool,
  smallTitle: PropTypes.string,
  title: PropTypes.any.isRequired,
};

class SubHeader extends Component {
  constructor() {
    super();
    this.state = {
      filters: null
    }
  }

  componentDidMount() {
    const { filters } = this.props;
    this.setState({ filters });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ filters: nextProps.filters });
  }

  formatTime(time) {
    const minutes: string = time.m < 10 ? `0${time.m}` : time.m;
    return `${time.h}:${minutes} ${time.meridian}`;
  }

  renderExclusiveDates(excludes) {
    if (excludes.length > 0) {
      return (
        <p>
          <strong>updated:</strong><br />
          Dates excluded: { excludes.map((excl, i) => {
            const colomn = i +1 < excludes.length ? ',' : '';
            return (
              <span key={i}>{ `${moment(excl).format('M/D/YY')}${colomn}` }</span>
            )
          }) }
        </p>
      );
    }
    return null;
  }

  renderDatePicker() {
    const { setModal } = this.props;
    if (this.state.filters) {
      const { filters: { dates, time } } = this.state;
      return (
        <div className="block-header-right mui--pull-right">
          { this.renderExclusiveDates(dates.excludes) }
          <ul className="mui-list--unstyled">
            <li>
              <button type="button" onClick={() => setModal('datepicker')}>
                <Icon name="calendar" /> {dates.start.format('M/D/YY')} - {dates.end.format('M/D/YY')} <Icon name="caret-down" />
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setModal('timepicker')}>
                <Icon name="clock-o" /> {this.formatTime(time.start) } — { this.formatTime(time.end)}
              </button>
            </li>
          </ul>
        </div>
      );
    }

    return null;
  }

  render() {
    const { showFilters, title, smallTitle, fixHeader } = this.props;
    const navWidth = document.getElementById('sidedrawer');
    let style = {};

    if (!fixHeader && navWidth) {
      style = { width: `${window.innerWidth - navWidth.clientWidth - 20}px` };
    }

    return (
      <div className="block-header" style={style}>
        { showFilters && this.renderDatePicker() }
        <h1 className="page-header">
          { title }
          <small>{ smallTitle }</small>
        </h1>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    filters: state.overview.filters,
  };
}

SubHeader.propTypes = propTypes;

export default connect(
  mapStateToProps,
  null
)(SubHeader);

