import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';

import { fetchOverview, fetchSpaces, fetchMap } from '../actions/overview';

import Logger from '../utils/logger';
import Container from '../components/layouts/container';
import SubHeader from '../components/layouts/sub_header';
import { SpaceAverageModule } from '../components/SpaceAverage';

import SeatOverview from '../components/visualizations/seat_overview';
import SpaceType from '../components/visualizations/space_type';
import FloorPlan from '../components/visualizations/floorplan';

import TimeOfDayChart from '../components/visualizations/time_of_day_chart';

class OverviewPage extends Component {
  static propTypes = {
    fixHeader: PropTypes.bool,
    setModal: PropTypes.func,
    fetchOverview: PropTypes.func.isRequired,
    fetchSpaces: PropTypes.func.isRequired,
    fetchMap: PropTypes.func.isRequired,
    filter: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.logger = new Logger('OverviewPage');
    this.refresh = this.refresh.bind(this);
  }

  componentWillMount() {
    this.refresh();
  }

  handleApiError = (reason) => {
    const error = {
      status: reason.action.payload.status,
      statusText: reason.action.payload.statusText,
      serverError: reason.action.payload.data.error,
    };
    this.logger.error(error);
  };

  refresh() {
    this.props.fetchOverview().catch(this.handleApiError);
    this.props.fetchSpaces().catch(this.handleApiError);
    this.props.fetchMap().catch(this.handleApiError);
  }

  render() {
    const { setModal, fixHeader, filter } = this.props;
    const spaces = 342;
    const smallTitle: string = `${spaces} TOTAL SPACES`;

    return (
      <DocumentTitle title="Acme - Overview">
        <div className="page test">
          <SubHeader
            title="Overview"
            smallTitle={smallTitle}
            setModal={setModal}
            fixHeader={fixHeader}
            showFilters
          />
          <Container>
            <div>
              <h2>Seat overview</h2>
              <SeatOverview />
            </div>
          </Container>

          <Container>
            <div>
              <h2>Floorplan</h2>
              <div>
                <FloorPlan/>
              </div>
            </div>
          </Container>

          <Container>
            <div>
              <h2>Scatter plot</h2>
              <SpaceAverageModule />
            </div>
          </Container>

          <Container>
            <div>
              <h2>Space type overview</h2>
              <div>
                <SpaceType />
              </div>
            </div>
          </Container>

          <Container>
            <div>
              <h2>Time of day chart</h2>
              <div>
                <TimeOfDayChart filter={filter} />
              </div>
            </div>
          </Container>

          <Container>
            <div>
              <h2>Day of week chart</h2>
              <div>
                <section><p>day of week visualization</p></section>
              </div>
            </div>
          </Container>
        </div>
      </DocumentTitle>
    );
  }
}

function mapStateToProps(state) {
  return {
    filter: state.overview.filters
  };
}

export default connect(
  mapStateToProps,
  { fetchOverview, fetchSpaces, fetchMap }
)(OverviewPage);
