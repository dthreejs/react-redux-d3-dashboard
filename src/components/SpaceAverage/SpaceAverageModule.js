import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import classnames from 'classnames';
import * as d3 from 'd3';

import Dropdown from 'muicss/lib/react/dropdown';
import DropdownItem from 'muicss/lib/react/dropdown-item';
import { SimpleSelect } from 'react-selectize';

import TagButton from './TagButton';
import FaCircle from 'react-icons/lib/fa/circle';

const categories = [
  {
    label: 'Individual Shared', color: '#E41A1C', conditions: { i_we: 'I', owned_shared: 'shared' },
  },
  { label: 'Individual Owned', color: '#377EB8', conditions: { i_we: 'I', owned_shared: 'owned' } },
  { label: 'Group Shared', color: '#4DAF4A', conditions: { i_we: 'we', owned_shared: 'shared' } },
  { label: 'Group Owned', color: '#984EA3', conditions: { i_we: 'we', owned_shared: 'owned' } },
];

const chartSize = { width: 800, height: 400 };
const chartPadding = { top: 20, right: 30, bottom: 40, left: 50 };
const pointRadius = 5;

const plotWidth = chartSize.width - chartPadding.left - chartPadding.right;
const plotHeight = chartSize.height - chartPadding.top - chartPadding.bottom;
const xScale = d3.scaleLinear().domain([0, 1]).range([0, plotWidth]);
const yScale = d3.scaleLinear().domain([0, 1]).range([plotHeight, 0]);
const colorScale = d3.scaleOrdinal().domain(categories.map(c =>
  _.values(c.conditions).join(','))).range(categories.map(c => c.color));
const voronoiRadius = plotWidth / 10;

@connect(
  state => ({ spaces: state.overview.spaces }),
  {}
)
export default class SpaceAverageModule extends Component {
  static propTypes = {
    spaces: PropTypes.array,
  };

  constructor(props) {
    super(props);
    const attributeGroups = this.generateFilterAttributeGroups(props.spaces);
    this.state = {
      attributeGroups,
      attributes: this.generateFilterAttributes(props.spaces, attributeGroups),
      selectedAttributes: [],
      selectedCategories: _.clone(categories),
      valueKey: 'utilization',
    };
  }

  componentDidMount() {
    this.drawChartLayout();
    this.redrawChart();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.spaces.length !== newProps.spaces.length ||
      !_.isEqual(this.props.spaces, newProps.spaces)) {
      const attributeGroups = this.generateFilterAttributeGroups(newProps.spaces);
      const attributes = this.generateFilterAttributes(newProps.spaces, attributeGroups);
      this.setState({
        attributeGroups,
        attributes,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!_.isEqual(this.state, prevState) || this.props.spaces.length !== prevProps.spaces.length
      || !_.isEqual(this.props.spaces, prevProps.spaces)) {
      this.redrawChart();
    }
  }

  onTooltipHover = () => {
    const [mx, my] = d3.mouse(this.overlay.node());
    let plot = null;
    if (this.voronoiDiagram) {
      plot = this.voronoiDiagram.find(mx, my, voronoiRadius);
    }
    if (plot) {
      this.highlightPlot(plot.data);
    }
  }

  onTooltipLeave = () => {
    this.highlightPlot(null);
  }

  getScatterDataByCategory = (data) => {
    const { selectedAttributes, selectedCategories, valueKey } = this.state;
    if (_.isEmpty(selectedCategories)) {
      return { averageValue: 0, averageOccupancy: 0, data: [] };
    }
    const newData = [];
    let averageValue = 0;
    let averageOccupancy = 0;
    _.each(data, (dt) => {
      const cat = _.find(selectedCategories, c =>
        _.reduce(c.conditions, (r, v, k) => (r && dt[k] === v), true));
      const filtered = _.reduce(selectedAttributes,
        (r, v) => (r && _.get(dt, v.groupId) === v.label), true);
      if (cat && filtered) {
        const filteredMetrics = _.reduce(dt.metrics, (r, v, k) =>
          ({ ...r, [k]: Math.min(1, v) }), {});
        newData.push({ ...dt, metrics: filteredMetrics });
        averageValue = averageValue + filteredMetrics[valueKey];
        averageOccupancy = averageOccupancy + filteredMetrics.occupancy;
      }
    });
    if (newData.length > 0) {
      averageValue = averageValue / newData.length;
      averageOccupancy = averageOccupancy / newData.length;
    }
    return { averageValue, averageOccupancy, data: newData };
  }

  generateFilterAttributeGroups = (spaces) => ((!spaces || spaces.length === 0) ? [] :
    _.concat(_.keys(spaces[0].attributes).map(k => ({
      groupId: `attributes.${k}`, title: _.startCase(k),
    })), { groupId: 'floor', title: 'Floor' })
  )

  generateFilterAttributes = (spaces, groups) => {
    if (!spaces || spaces.length === 0) { return []; }
    const attrSet = {};
    _.each(groups, c => attrSet[c.groupId] = []);
    _.each(spaces, (s) => _.each(groups, c => attrSet[c.groupId].push(_.get(s, c.groupId))));
    return _.flatten(_.map(attrSet, (s, k) => _.uniq(s).map(v => ({
      groupId: k,
      label: v,
      value: `${k}:${v}`,
    }))));
  }

  drawChartLayout = () => {
    if (this.svg) {
      const svg = d3.select(this.svg);
      const xAxis = d3.axisBottom(xScale).ticks(10, '%').tickSizeOuter(0);
      const yAxis = d3.axisLeft(yScale).ticks(5, '%').tickSizeOuter(0);

      // x-axis and y-axis.
      const xAxisG = svg.append('g').classed('x-axis', true)
        .attr('transform', `translate(${chartPadding.left} ${plotHeight + chartPadding.top})`);
      const yAxisG = svg.append('g').classed('y-axis', true)
        .attr('transform', `translate(${chartPadding.left} ${chartPadding.top})`);
      xAxisG.call(xAxis);
      yAxisG.call(yAxis);

      // y-axis label.
      svg.append('text')
        .attr('transform', `rotate(270) translate(${-plotHeight / 2} 0)`)
        .attr('dy', 12) // adjust distance from the left edge
        .attr('class', 'axis-label').attr('text-anchor', 'middle').text('Occupancy');

      // scatter plots
      this.plots = svg.append('g').attr('class', 'plots')
        .attr('transform', `translate(${chartPadding.left} ${chartPadding.top})`);

      // average reference lines
      this.referenceX = svg.append('g').attr('class', 'reference-line').style('opacity', 0);
      this.referenceX.append('text').attr('text-anchor', 'middle').text('average');
      this.referenceX.append('line').attr('stroke-dasharray', '3, 3')
        .attr('stroke', '#272727').attr('stroke-width', 1)
        .attr('x1', 0).attr('y1', 5).attr('x2', 0).attr('y2', plotHeight);

      this.referenceY = svg.append('g').attr('class', 'reference-line').style('opacity', 0);
      this.referenceY.append('line').attr('stroke-dasharray', '3, 3')
        .attr('stroke', '#272727').attr('stroke-width', 1)
        .attr('x1', 0).attr('y1', 5).attr('x2', plotWidth).attr('y2', 5);
      this.referenceY.append('text').attr('text-anchor', 'middle')
        .attr('transform', `translate(${plotWidth} 0)`).text('average');

      // tooltip overlay
      this.overlay = svg.append('rect').attr('class', 'overlay')
        .attr('transform', `translate(${chartPadding.left} ${chartPadding.top})`)
        .attr('width', plotWidth).attr('height', plotHeight)
        .style('fill', '#f00').style('opacity', 0);
      this.overlay.on('mousemove', this.onTooltipHover).on('mouseleave', this.onTooltipLeave);

      // highlight circle
      svg.append('circle').attr('class', 'highlight-circle')
        .attr('r', pointRadius + 2).style('fill', 'none').style('display', 'none');

      d3.select(this.tooltip).style('display', 'none');
    }
  }

  redrawChart = () => {
    if (this.svg && this.plots) {
      const { spaces } = this.props;
      const { valueKey } = this.state;
      const scatterData = this.getScatterDataByCategory(spaces);
      // console.log('scatter data: ', scatterData);
      const binding = this.plots.selectAll('.data-point').data(scatterData.data, d => d.space_id);
      binding.transition().duration(500)
        .attr('cx', d => xScale(d.metrics[valueKey])).attr('cy', d => yScale(d.metrics.occupancy));
      binding.enter().append('circle').classed('data-point', true).style('opacity', 0)
        .attr('r', pointRadius).attr('fill', d => colorScale(`${d.i_we},${d.owned_shared}`))
        .attr('cx', d => xScale(d.metrics[valueKey])).attr('cy', d => yScale(d.metrics.occupancy))
        .transition().duration(500).style('opacity', 1);
      binding.exit().transition().duration(500).style('opacity', 0).remove();

      this.referenceX.transition().duration(500)
        .style('opacity', scatterData.averageValue > 0 ? 1 : 0)
        .attr('transform', `translate(${xScale(scatterData.averageValue) + chartPadding.left} ${chartPadding.top})`);

      this.referenceY.transition().duration(500)
        .style('opacity', scatterData.averageValue > 0 ? 1 : 0)
        .attr('transform', `translate(${chartPadding.left} ${yScale(scatterData.averageOccupancy) + chartPadding.top})`);

      // create voronoi diagram
      this.voronoiDiagram = d3.voronoi()
        .x(d => xScale(d.metrics[valueKey])).y(d => yScale(d.metrics.occupancy))
        .size([plotWidth, plotHeight])(scatterData.data);
    }
  }

  highlightPlot = (d) => {
    const highlightCircle = d3.select('.highlight-circle');
    const tooltip = d3.select(this.tooltip);
    if (!d) {
      highlightCircle.style('display', 'none');
      tooltip.style('display', 'none');
    } else {
      highlightCircle.style('display', '')
        .style('stroke', colorScale(`${d.i_we},${d.owned_shared}`))
        .attr('cx', xScale(d.metrics[this.state.valueKey]) + chartPadding.left)
        .attr('cy', yScale(d.metrics.occupancy) + chartPadding.top);

      // update tooltip content.
      tooltip.select('.tooltip-title').text(d.space_id);
      const valueNodes = tooltip.selectAll('.tooltip-value').nodes();
      valueNodes[0].innerText = `${d.building} / ${d.floor}`;
      valueNodes[1].innerText = `Occupancy: ${(d.metrics.occupancy * 100).toFixed(1)}%`;
      valueNodes[2].innerText = `Utilization: ${(d.metrics[this.state.valueKey] * 100).toFixed(1)}%`;
      tooltip.style('display', 'block')
        .style('left', `${xScale(d.metrics[this.state.valueKey]) + chartPadding.left}px`)
        .style('top', `${yScale(d.metrics.occupancy) + chartPadding.top}px`);
    }
  }

  changeValueKey = (key) => {
    if (this.state.valueKey !== key) {
      this.setState({ valueKey: key });
    }
  }

  toggleCategory = (cat) => this.setState({
    selectedCategories: _.xor(this.state.selectedCategories, [cat]),
  })

  removeAttributeFilter = (value) => this.setState({
    selectedAttributes: _.xor(
      this.state.selectedAttributes,
      [_.find(this.state.selectedAttributes, attr => attr.value === value)]
    ),
  })

  updateAttributeFilters = (attr) => this.setState({
    selectedAttributes: _.union(
      this.state.selectedAttributes,
      [attr]
    ),
  }, () => this.attributeFilters.blur())

  render() {
    const { spaces } = this.props;
    const {
      attributeGroups, attributes, selectedAttributes,
      selectedCategories, valueKey,
    } = this.state;
    return (
      <div className="space-average-module">
        <p className="mui--text-title">
          {`Occupancy and utilization for ${spaces.length} spaces`}
        </p>
        <div className="content-container">
          <div className="chart-section">
            <div className="chart-container">
              <svg ref={svg => this.svg = svg} width={800} height={400} />
              <div
                className="space-tooltip"
                ref={tt => this.tooltip = tt}
              >
                <div className="tooltip-container">
                  <div className="tooltip-title">The Banna Stand</div>
                  <div className="tooltip-value">Building A / Floor 1</div>
                  <div className="tooltip-value">Occupancy: 81%</div>
                  <div className="tooltip-value">Utilization: 56%</div>
                  <div className="chevron-arrow" />
                </div>
              </div>
            </div>
            <div className="graph-types">
              <div
                className={classnames('type-label', { active: valueKey === 'utilization' })}
                onClick={() => this.changeValueKey('utilization')}
              >
                Utilization
              </div>
              <div
                className={classnames('type-label', { active: valueKey !== 'utilization' })}
                onClick={() => this.changeValueKey('utilization_when_occupied')}
              >
                Utilization while occupied
              </div>
            </div>
          </div>
          <div className="filters-section">
            <SimpleSelect
              ref={e => this.attributeFilters = e}
              placeholder="Add Filter"
              value={undefined}
              groups={attributeGroups}
              options={attributes}
              onValueChange={this.updateAttributeFilters}
            />
            <div className="tag-buttons">
              {selectedAttributes.map((attr, i) =>
                <TagButton
                  key={i}
                  label={attr.label}
                  value={attr.value}
                  onDismiss={this.removeAttributeFilter}
                />
              )}
            </div>
            <div className="category-buttons">
              {categories.map((cat, i) =>
                <div key={i} className="category-filter" onClick={() => this.toggleCategory(cat)}>
                  <FaCircle color={cat.color} size={30} />
                  <p className="label">{cat.label}</p>
                  <div className="green-checkbox">
                    <input
                      type="checkbox"
                      checked={_.includes(selectedCategories, cat)}
                      onChange={() => {}}
                    />
                    <div className="check" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
