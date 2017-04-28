import React, { Component } from 'react';
import { connect } from 'react-redux';
import DatePicker from 'react-datepicker';
import Icon from 'react-fontawesome';
import moment from 'moment';

import Modal from './../modals';
import { toggleModal, sendFeedback } from './../../actions/overview';

import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';
import Form from 'muicss/lib/react/form';
import Textarea from 'muicss/lib/react/textarea';
import Input from 'muicss/lib/react/input';
import Button from 'muicss/lib/react/button';
import Option from 'muicss/lib/react/option';
import Select from 'muicss/lib/react/select';

class ModalFeedback extends Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      formSent: false,
    }
  }
  handleSubmit(e) {
    // TODO: Manage feedbacks
    const { name, email, phone, subject, comment } = this;

    console.log(e);
    this.setState({ formSent: true });
    //this.sendFeedback(form);
    e.preventDefault();
  }

  render() {
    const subjects = ['Individually Shared Spaces', 'Create Your Own Space', 'Space Power!!'];
    let title = 'Feedback';
    let content = (
      <div className="modal-feedback">
        <p>
          We want to hear from you. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Nunc sodales nulla nulla, ac tempor ex scelerisque non.
          Cum sociis natoque penatibus et magnis dis parturient montes,nascetur ridiculus mus.
        </p>
        <Form onSubmit={this.handleSubmit}>
          <Row>
            <Col xs="6">
              <legend>NAME*</legend>
              <Input hint="" ref={ref => this.name = ref} required={true}/>
            </Col>
            <Col xs="6"></Col>
          </Row>
          <Row>
            <Col xs="6">
              <legend>EMAIL*</legend>
              <Input hint="" ref={ref => this.email = ref} type="email" required={true}/>

              <legend>SUBJECT</legend>
              <Select defaultValue={'2'} ref={ref => this.subject = ref}>
                { subjects.map((o, i) => <Option key={i} value={i} label={o} />) }
              </Select>
            </Col>

            <Col xs="6">
              <legend>PHONE</legend>
              <Input hint="" ref={ref => this.phone = ref}  type="tel" />
            </Col>
          </Row>
          <legend>YOUR FEEDBACK*</legend>
          <Textarea ref={ref => this.comment = ref} required={true}/>

          <div className="modal-footer mui--text-center">
            <Button type="submit" color="primary">Submit</Button>
          </div>
        </Form>
      </div>
    );

    if (this.state.formSent) {
      title = null;
      content = (
        <div className="mui--text-center">
          <h1 className="mui--text-center">Thank you!</h1>
          <p>Your feedback was successfully sent.</p>
        </div>
      );
    }

    return <Modal title={title} toggleAction={() => this.props.toggleModal()} content={content}/>;
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

export default connect(
  mapStateToProps,
  { toggleModal, sendFeedback }
)(ModalFeedback);
