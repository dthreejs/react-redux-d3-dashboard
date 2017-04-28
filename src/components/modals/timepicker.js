require('react-input-range/lib/css/index.css');

import React, { Component } from 'react';
import { connect } from 'react-redux';
import InputRange from 'react-input-range';

import Modal from './../modals';
import { toggleModal, updateFilters } from './../../actions/overview';

import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';
import Input from 'muicss/lib/react/input';
import Button from 'muicss/lib/react/button';
import Form from 'muicss/lib/react/form';
import Option from 'muicss/lib/react/option';
import Select from 'muicss/lib/react/select';

const S: Object = {
  AM: 'AM',
  PM: 'PM'
};

class ModalTimePicker extends Component {
  constructor(props) {
    super(props);
    this.updateTime = this.updateTime.bind(this);
    this.handleSlideChange = this.handleSlideChange.bind(this);
    this.renderTimeRange = this.renderTimeRange.bind(this);
    this.confirmTime = this.confirmTime.bind(this);
    this.state = {
      error: false,
      range: { min: 0, max: 24 },
      time: {
        start: { h: null, m: null, meridian: null },
        end: { h: null, m: null, meridian: null },
      }
    };
  }

  componentWillMount() {
    const { range } = this.state;
    const { time } = this.props;

    range.min = this.formatTo24(time.start);
    range.max = this.formatTo24(time.end);

    this.setState({ time, range });
  }

  updateTime = (type, change) => {
    let { time, range } = this.state;
    const { name, value } = change.target;

    if (name === 'meridian') {
      time[type][name] = value;
    }
    else {
      time[type][name] = Number(value);
    }

    range.min = this.formatTo24(time.start);
    range.max = this.formatTo24(time.end);

    this.setState({ time, error: this.invalidDate(time.start, time.end) });
  };

  doubleDigit = (n: number): string => {
    return n < 10 ? `0${n}` : String(n);
  };

  timeToObject = (time: number): Object => {
    const base: boolean = time % 1 === 0;
    let h: number = base ? time : time - 0.5,
        m: number = base ? 0 : 30,
        meridian: string = S.AM;

    if (time === 12) {
      meridian = S.PM;
      //h = 12;
    }
    else if (time > 12) {
      let formatTime = h % 24 - 12;
      h = formatTime === 12 ? 12 : formatTime;
      meridian = S.PM;
    }
    // TODO : Manage midnight and noon

    return { h, m, meridian };
  };

  formatTo24 = (t: Object): number => {
    let time: number = t.m === 30 ? .5 : 0;
    // check if afternoon
    if (t.meridian === S.PM) {
      time += 12;
    }
    time += t.h;
    return Number((Math.round(time * 2) / 2).toFixed(1));
  };

  formatToTime = (val: number): string => {
    const check: boolean = val % 1 === 0;
    const meridian: string = val < 12 ? S.AM : S.PM;
    let hour: number = check ? val : val - .5;
    const min: string = check ? '00' : '30';

    if (meridian === S.PM) hour -= 12;
    if (hour === 0) hour = 12;
    return `${hour}:${min} ${meridian}`
  };

  invalidDate = (t1: Object, t2: Object): boolean => {
    // Check meridian PM > AM
    if (t1.meridian === S.PM && t2.meridian === S.AM) return true;

    // Compare hours
    if (t1.meridian === t2.meridian && t1.h >= t2.h) return true;

    return false;
  };

  handleSlideChange(range: Object) {
    let { time } = this.state;

    const start: Object = this.timeToObject(range.min);
    const end: Object = this.timeToObject(range.max);
    const error: boolean = this.invalidDate(time.start, time.end);

    time.start = start;
    time.end = end;

    this.setState({ time, error, range });
  }

  confirmTime = () => {
    const { toggleModal, updateFilters } = this.props;

    toggleModal(false);
    const time = this.state.time;
    updateFilters({ time });
  };

  renderTimeRange(type) {
    const context = this;
    const { time } = this.state;
    const t = time[type];
    const hourRange = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const minuteRange = [0, 30];
    const title = type === 'start' ? 'START TIME' : 'END TIME';

    return (
      <Form onChange={form => context.updateTime(type, form)}>
        <Col xs="12" md="6">
          <Row>
            <legend>{ title }</legend>
            <Col xs="3" style={{margin: 0}}>
              <Select name="h" value={this.doubleDigit(t.h)} onChange={() => {}}>
                {
                  hourRange.map((h, i) => <Option key={i} value={this.doubleDigit(h)} label={this.doubleDigit(h)} />)
                }
              </Select>
            </Col>
            <Col xs="1" className="mui--text-center">
              <label>:</label>
            </Col>

            <Col xs="3">
              <Select name="m" value={this.doubleDigit(t.m)} onChange={() => {}}>
                {
                  minuteRange.map((m, i) => <Option key={i} value={this.doubleDigit(m)} label={this.doubleDigit(m)} />)
                }
              </Select>
            </Col>

            <Col xs="3">
              <Select name="meridian" value={t.meridian} onChange={() => {}}>
                <Option value={S.AM} label={S.AM} />
                <Option value={S.PM} label={S.PM} />
              </Select>
            </Col>
          </Row>
        </Col>
      </Form>
    );
  }

  render() {
    const { time: { start, end }, error, range } = this.state;

    const content = (
      <div className={error ? 'modal-timepicker timepicker-error' : 'modal-timepicker'}>
        <Row>
          { this.renderTimeRange('start') }
          { this.renderTimeRange('end') }
        </Row>

        <InputRange
          formatLabel={this.formatToTime}
          step={0.5}
          maxValue={24}
          minValue={0}
          disabled={error}
          value={range}
          onChange={this.handleSlideChange} />

        <p>{ error && 'The time range you have entered is invalid.' }</p>

        <div className="modal-footer mui--text-center">
          <Button
            color="primary"
            disabled={error}
            onClick={this.confirmTime}>Okay</Button>
        </div>
      </div>
    );

    return <Modal
      title="Time Picker"
      maxWidth={530}
      toggleAction={() => this.props.toggleModal()}
      content={content}/>;
  }
}

function mapStateToProps(state) {
  return {
    time: state.overview.filters.time
  };
}

export default connect(
  mapStateToProps,
  { toggleModal, updateFilters }
)(ModalTimePicker);
