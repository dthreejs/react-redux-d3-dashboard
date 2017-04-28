import 'rc-collapse/assets/index.css';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Container from './../components/layouts/container';
import DocumentTitle from 'react-document-title';
import Collapse, { Panel } from 'rc-collapse';
import SubHeader from '../components/layouts/sub_header';

class KnowledgeCenter extends Component {
  renderPanels() {
    if (this.props.overview) {
      // TODO: to be replaced once API done
      if (this.props.overview.init && this.props.overview.init.knowledge) {
        const { knowledge }: Object = this.props.overview.init;
        return (
          <Collapse accordion={true}>
            {
              knowledge && knowledge.map((k, i) => {
                const onlyText: Object = !k.video ? {maxWidth: '580px'} : {};
                return (
                  <Panel key={i} header={k.question}>
                    {
                      k.video &&
                      <iframe
                        className="mui--pull-right"
                        width="340" height="210" frameBorder="0"
                        src={`${k.video}?html5=1`}>
                      </iframe>
                    }
                    <p style={onlyText}>{ k.answer }</p>
                  </Panel>
                )
              })
            }
          </Collapse>
        );
      }
    }
    return <div>Loading...</div>;
  }

  render() {
    return (
      <DocumentTitle title="Acme - Knowledge Center">
        <div className="page knowledge-center-page">
          <SubHeader
            title="Knowledge Center"
            fixHeader={this.props.fixHeader} />
          <p>
            Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
            Maecenas sed diam eget risus varius blandit sit amet non magna.
            Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
            Maecenas faucibus mollis interdum. Nullam quis risus eget urna mollis ornare
            vel eu leo. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis
            vestibulum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <Container>
            { this.renderPanels() }
          </Container>
        </div>
      </DocumentTitle>
    );
  }
}

function mapStateToProps(state) {
  return {
    overview: state.overview,
  };
}

export default connect(
  mapStateToProps,
  null)(KnowledgeCenter);
