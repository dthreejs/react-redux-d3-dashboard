import React, { Component, PropTypes } from 'react';
import DocumentTitle from 'react-document-title';
import { Link, IndexLink } from 'react-router';

import SubHeader from './../../components/layouts/sub_header';

class BuildingPage extends Component {
  constructor() {
   super();
   this.renderTitle = this.renderTitle.bind(this);
   this.renderFloors = this.renderFloors.bind(this);
  }

  renderTitle() {
    const { routeParams: { bId, fId }, fixHeader, setModal } = this.props;

    let title = 'Building Page Overview',
        smallTitle = '';

    if (bId) {
      title = `Building #${bId}`;
      if (fId) {
        smallTitle = `(building #${bId})`;
        title = <Link to={`/building/${bId}`} style={{ marginRight: '20px' }}>&lt; floor {fId}</Link>;
      }
    }

    return <SubHeader
      title={title}
      smallTitle={smallTitle}
      showFilters={true}
      setModal={setModal}
      fixHeader={fixHeader} />
  }

  renderFloors() {
    const { routeParams, buildings } = this.props;
    if (buildings && routeParams.bId && !routeParams.fId) {
      let building = null;
      for (let i = 0; i < buildings.length; i++) {
        if (buildings[i].id == Number(routeParams.bId)) {
          building = buildings[i];
        }
      }
      return (
        <ul className="mui-list--unstyled">
          { building && building.floors.map((f, i) => <li key={i}><section><Link to={`/building/${routeParams.bId}/floor/${f.id}`}>Floor {f.id}</Link></section></li>) }
        </ul>
      )
    }
    else if (buildings && routeParams.fId) {
      return <section>FLOOR SECTION</section>
    }
    return null;
  }


  render() {
    return (
      <DocumentTitle title="Company">
        <div className="page">
          { this.renderTitle() }
          { this.renderFloors() }
        </div>
      </DocumentTitle>
    );
  }
}

export default BuildingPage;
