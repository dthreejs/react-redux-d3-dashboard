import React, { Component } from 'react';
import { connect } from 'react-redux';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import Modal from './../modals';
import { toggleModal, updateFilters } from './../../actions/overview';

import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';
import Input from 'muicss/lib/react/input';
import Button from 'muicss/lib/react/button';

const S: Object = {
  START: 'START',
  END: 'END',
  PLACEHOLDER: 'Select Date',
  FORMAT: {
    MDYY: 'M/D/YY',
    YYYYMMDD: 'YYYY-MM-DD',
    MMMMDYYYY: 'MMMM D, YYYY'
  }
} ;

class ModalDatepicker extends Component {
  constructor(props) {
    super(props);
    this.updateDates = this.updateDates.bind(this);
    this.confirmDates = this.confirmDates.bind(this);
    this.state = {
      selector: null,
      error: false,
      dates: {
        start: moment(),
        end: moment(),
        excludes: []
      },
      excluding: false
    };
  }

  componentWillMount() {
    const { dates } = this.props;
    const excluding: boolean = dates.excludes.length > 0;
    this.setState({ dates, excluding });
  }

  resortExcludes = (resort: bool = false) => {
    let { dates: { start, end, excludes } } = this.props;
    const newExcludes: Array<string> = [...excludes];
    let cleanExcludes = [];

    // Update Resorting with new dates
    if (resort) {
      for (let i = 0; i < newExcludes.length; i++) {
        const d = moment(newExcludes[i]);
        if (d >= start && d <= end) {
          cleanExcludes.push(moment(d).format(S.FORMAT.YYYYMMDD));
        }
      }
      return cleanExcludes;
    }

    return newExcludes;
  };

  updateExcludes = (date = null): Array<string> => {
    let { dates: { start, end, excludes }, selector, excluding } = this.props;
    const newExcludes: Array<string> = [...excludes];

    // Update with New Array
    if (!excluding) {
      if (date && date.type !== 'click') {
        const exclude = date.format(S.FORMAT.YYYYMMDD);
        const excludeIndex = newExcludes.indexOf(exclude);

        if (date > start && date < end ) {
          if (excludeIndex === -1) {
            newExcludes.push(exclude);
          }
          else {
            newExcludes.splice(excludeIndex, 1);
          }
        }
        else if (!selector) {
          //TODO handle error
        }
      }
      return newExcludes;
    }
  };

  updateDates = date => {
    let { selector, dates, excluding, error } = this.state;
    if (selector) {
      if (selector === S.END) {
        dates.end = date;
      }
      else {
        dates.start = date;
      }
    }

    if (excluding) {
      dates.excludes = this.updateExcludes(date);
    }
    dates.excludes = this.resortExcludes(true);


    error = dates.start > dates.end;

    selector = null;
    this.setState({ dates, selector, error });
  };

  confirmDates = () => {
    const { toggleModal, updateFilters } = this.props;
    let { dates, excluding } = this.state;

    if (!excluding) {
      dates.excludes = [];
    }

    toggleModal(false);
    updateFilters({ dates });
  };

  handleDateChanges = (type: string, e: Object) => {
    let { dates } = this.state;
    if (e.charCode == 13) {
      const { value } = e.target;
      try {
        if (moment(value, true).isValid()) {
          dates[type] = moment(value);
          this.setState({ dates });
          //this.updateExcludes(null, true);
        }
        // TODO: Else Raise error
      }
      catch (err) {
        console.log(err);
        this.setState({ error: true });
      }
    }
    e.preventDefault();
  };

  renderExcludeDates() {
    const { dates: { excludes } } = this.state;
    if (excludes) {
      return (
        <ul className="mui-list--unstyled" style={{margin: 0}}>
          { excludes.map((e, i) => <li key={i}>{ moment(e).format(`dddd, ${S.FORMAT.MMMMDYYYY}`) }</li>) }
        </ul>
      );
    }
    return <p>No days have been selected.</p>;
  }

  render() {
    const { dates: { start, end, excludes}, selector, excluding, error } = this.state;
    let excludeClass = 'calendar-block';

    let hightlighed = [];
    if (excludes && excluding) {
      hightlighed = excludes.map(e => moment(e)) ;
      if (!selector) {
        excludeClass = 'calendar-block excluding';
      }
    }

    const content = (
      <div className="modal-datepicker">
        <Row>
          <Col xs="12" md="6">
            <legend>START DATE</legend>
            <Input
              hint={S.PLACEHOLDER}
              value={start.format(`dddd, ${S.FORMAT.MMMMDYYYY}`)}
              onKeyPress={this.handleDateChanges.bind(this, 'start')}
              onChange={() => {}}
              onClick={() => this.setState({ selector: S.START })} />

            <legend>END DATE</legend>
            <Input
              hint={S.PLACEHOLDER}
              value={end.format(`dddd, ${S.FORMAT.MMMMDYYYY}`)}
              onKeyPress={this.handleDateChanges.bind(this, 'end')}
              onChange={() => {}}
              onClick={() => this.setState({ selector: S.END })} />

            <div className="datepicker-exclude">
              <div className="mui-checkbox">
                <input
                  id="exclude-checkbox"
                  type="checkbox"
                  defaultChecked={excluding}
                  onChange={e => this.setState({ excluding: e.currentTarget.checked})} />
                <label htmlFor="exclude-checkbox">EXCLUDE ANY DAYS</label>
              </div>

              {
                excluding &&
                <div className="datepicker-exclude-extra">
                  <p>
                    Please use the calendar on the right to select which days you would like to exclude.
                    To select a date, simply click on the number and it will become highlighted.
                    To unselect a date, click the date a second time.
                  </p>

                  <label>Days Excluded</label>
                  { hightlighed.length > 0 ? this.renderExcludeDates() : (<p>No days have been selected.</p>) }
                </div>
              }
            </div>

          </Col>
          <Col xs="12" md="6" className={excludeClass}>
            <DatePicker
              inline
              selected={moment()}
              startDate={start}
              endDate={end}
              highlightDates={hightlighed}
              onChange={this.updateDates} />
          </Col>
          <div className="modal-footer mui--text-center">
            <Button
              disabled={error}
              color="primary"
              onClick={this.confirmDates}>Okay</Button>
          </div>
        </Row>
      </div>
    );

    return <Modal
      title="Date Picker"
      toggleAction={() => this.props.toggleModal()}
      content={content}/>;
  }
}

function mapStateToProps(state) {
  return {
    dates: state.overview.filters.dates
  };
}

export default connect(
  mapStateToProps,
  { toggleModal, updateFilters }
)(ModalDatepicker);
