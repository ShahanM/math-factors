import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import Container from 'react-bootstrap/Container';
import { LoadingAnim } from '../utils';
import { stateCodeMap, stateIdMap } from '../constants';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

export default function VizStage({ graphId, width, height, data, loading }) {

	const xDiv = 100;
	const yDiv = 15;

	const xOffset = 5;
	const yOffset = 5;

	const [preprocessing, setPreprocessing] = useState(false);
	const [processedData, setProcessedData] = useState([]);

	const [totalDistricts, setTotalDistricts] = useState(0);
	const [noData, setNoData] = useState(false);

	useEffect(() => {
		if (Object.keys(data).length > 0) {
			setNoData(false);
			setPreprocessing(true);
			const districtCount = Object.keys(data.data).length;
			const flatArrTh = Object.values(data.data).flat();
			setProcessedData(flatArrTh);
			setTotalDistricts(districtCount);
		}
	}, [data]);

	useEffect(() => {
		if (processedData.length > 0) {
			setPreprocessing(false);
		} else {
			if (!loading) {
				setNoData(true);
			}
		}
	}, [processedData, loading]);

	return (
		<Container className="vizContainer" style={{ height: height * 1.8, padding: "0" }}>
			{noData ?
				<div className='stage'
					style={{
						width: "100%", height: height * 1.8,
						backgroundColor: "rgba(99, 99, 99, 0.5)", margin: "0", display: "block"
					}}>
					<h2 style={{ marginRight: "27px", marginTop: "300px" }}>No data found for the selected state.</h2>
					<p style={{ marginRight: "27px" }}>{stateCodeMap[stateIdMap[data.stateid]]}</p>
				</div>
				:
				<>
					{loading || preprocessing ?
						<div className='stage'
							style={{
								width: "100%", height: height * 1.8,
								backgroundColor: "rgba(99, 99, 99, 0.5)", margin: "0"
							}}>
							<h2 style={{ marginRight: "27px" }}>Loading</h2>  <LoadingAnim />
						</div>
						:
						<SchoolBarChart width={width} height={height}
							xDiv={xDiv} yDiv={yDiv} xOffset={xOffset} yOffset={yOffset}
							graphID={graphId} data={processedData} districtCount={totalDistricts} />
					}
				</>
			}
		</Container>
	)
}

const SchoolBarChart = ({ width, height, xDiv, yDiv, xOffset, yOffset, graphID, data, pairedChartId, districtCount }) => {
	const [totalStudents, setTotalStudents] = useState(0);
	const [totalProficient, setTotalProficient] = useState(0);

	const [selectedBar, setSelectedBar] = useState(0);
	const [selectedDataPoint, setSelectedDataPoint] = useState({});

	const brushState = useRef([0, 35]);
	const barWidth = useRef(0);

	useEffect(() => {
		console.log("schoolbar", data);
		const drawData = (graphID) => {
			d3.select(`#${graphID}`).selectAll('svg').remove();
			const margin = {
				top: 30,
				right: 20,
				bottom: 0.3 * height,
				left: 60
			};

			const navMargin = {
				top: height - 0.1 * height,
				right: 10,
				bottom: 30,
				left: 10
			};
			const _width = width - margin.left - margin.right;
			const _height = height - margin.bottom;
			const navHeight = height / 5;
			const navWdith = width - navMargin.left - navMargin.right;

			const xLabels = data.map(d => d.schoolname);

			const defaultSelection = brushState.current;
			const defaultBarWidth = barWidth === 0 ?
				_width / 35 : barWidth.current;

			const chartId = `chart-${graphID}`;
			const navId = `nav-${graphID}`;
			const clipId = `clip-${graphID}`;

			const svg = d3.select(`#${graphID}`)
				.append("svg").attr("id", `${graphID}-svg`)
				.attr("viewBox", [0, 0,
					width,
					height + margin.top + margin.bottom])
				.style("display", "block");

			const chart = svg.append("g").attr("id", chartId).attr("fill", "steelblue");
			chart.append("g").attr("class", "axis");
			chart.append("g").attr("class", "axis axis--y");

			const nav = svg.append("g").attr("id", navId);
			nav.append("g").attr("class", "navAxis")
			nav.append("g").attr("class", "brush");

			d3.selectAll('.tooltip').remove();
			const tooltipDiv = d3.select("body").append("div")
				.attr("class", "tooltip")
				.style("opacity", 0);

			const scale = {
				x: d3.scaleLinear().range([0, _width]).nice(),
				y: d3.scaleLinear().range([_height, 0]).nice(),
				navX: d3.scaleLinear().range([0, navWdith]).nice(),
				navY: d3.scaleLinear().range([navHeight, 0]).nice()
			}

			let xBand = d3.scaleBand()
				.domain(d3.range(-1, xLabels.length)).range([0, _width]);

			const axes = {
				x: d3.axisBottom(scale.x).tickFormat(''),
				y: d3.axisLeft(scale.y)
			};

			const brush = d3.brushX()
				.extent([[0, 0], [navWdith, navHeight]]).on("brush", brushed)

			const focus = svg.select(`#${chartId}`)
				.attr("transform", `translate(${margin.left}, ${margin.top})`);

			focus.select('.axis').attr("transform", `translate(0, ${_height})`);

			const context = svg.select(`#${navId} `)
				.attr("transform", `translate(${navMargin.left}, ${navMargin.top})`);

			const defs = focus.append('defs');

			defs.append('clipPath').attr('id', clipId)
				.append('rect').attr('width', _width).attr('height', _height);

			function updateScales() {
				scale.x.domain([-1, xLabels.length]);
				scale.y.domain([0, d3.max(data, d => d.num_students)]);
				scale.navX.domain(scale.x.domain());
				scale.navY.domain([0, d3.max(data, d => d.num_students)]);
			}

			svg.call(renderPlot);

			function renderPlot(selection) {
				updateScales();
				selection.select(`#${navId}`)
					.attr("transform", `translate(${navMargin.left}, ${navMargin.top})`)
					.select('.brush')
					.call(brush)
					.call(brush.move, defaultSelection);

				selection.select('.navAxis')
					.attr("transform", `translate(0, ${navHeight})`);

				const charSelection = selection.select(`#${chartId}`)
				charSelection.select('.axis').call(axes.x);
				charSelection.select('.axis.axis--y').call(axes.y);

				selection.call(renderPoints);
			}

			function renderPoints(selection) {
				const points = selection.select(`#${chartId}`)
					.selectAll('.bar').data(data);

				const newPoints = points.enter().append('rect')
					.attr('id', (d, i) => `bar-${d.leaid}_${d.schoolid_stateassigned}`)
					.attr('class', 'bar')
					.attr('x', (d, i) => {
						return scale.x(i) + xBand.bandwidth() * 0.9;
					}
					)
					.attr('y', (d, i) => {
						return scale.y(d.num_students);
					})
					.attr('width', xBand.bandwidth() * defaultBarWidth - 0.9)
					.attr('height', d => _height - scale.y(d.num_students))
					.attr('fill', 'purple')	// default color
					.style('cursor', 'pointer')
					.on("mouseover", (evt, d) => {
						// const idx = yValues.indexOf(d);
						d3.select(`#bar-${d.leaid}_${d.schoolid_stateassigned}`).attr('fill', 'orange');
						d3.select(`#nav-bar-${d.leadid}_${d.schoolid_stateassigned}`).attr("fill", "orange");
						tooltipDiv.transition()
							.duration(200)
							.style("opacity", .9);
						tooltipDiv.html(`<strong>${d.schoolname}</strong><br/>${d.num_students} students`)
							// .attr("id", `${graphID}-tooltip-${idx}`)
							.style("left", (evt.pageX) + "px")
							.style("top", (evt.pageY - 63) + "px");

					})
					.on("mouseout", (evt, d) => {
						// const idx = yValues.indexOf(d);
						if (`${d.leaid}_${d.schoolid_stateassigned}` !== selectedBar) {
							d3.select(`#bar-${d.leaid}_${d.schoolid_stateassigned}`).attr('fill', 'purple');
							d3.select(`#nav-bar-${d.leaid}_${d.schoolid_stateassigned}`).attr("fill", "#69b3a2");
						}
						d3.select(`#${graphID}-tooltip-${d.leaid}_${d.schoolid_stateassigned}`).transition()
							.duration(500)
							.style("opacity", 0)
							.remove();
						tooltipDiv.transition()
							.duration(500)
							.style("opacity", 0);
					})
					.on("click", (evt, d) => {
						// const idx = yValues.indexOf(d);
						setSelectedBar(`${d.leaid}_${d.schoolid_stateassigned}`);
						setSelectedDataPoint(d);
					})
					.attr('clip-path', `url(#${clipId})`);

				points.merge(newPoints)
					.transition().duration(1000)
					.attr('x', (d, i) => scale.x(i) - xBand.bandwidth() * 0.9)
					.attr('y', (d, i) => scale.y(d.num_students))
					.attr('width', xBand.bandwidth() * defaultBarWidth - 0.9)
					.attr('height', d => _height - scale.y(d.num_students));

				points.exit().remove();

				const selectedPoints = selection.select(`#${navId}`)
					.selectAll('.bar').data(data);

				const newSelectedPoints = selectedPoints.enter().append('rect')
					.attr('id', (d, i) => `nav-bar-${d.leaid}_${d.schoolid_stateassigned}`)
					.attr('class', 'bar')
					.attr('x', (d, i) =>
						scale.navX(i) + xBand.bandwidth() * 0.9 / 2
					)
					.attr('y', (d, i) => scale.navY(d.num_students))
					.attr('fill', '#69b3a2')	// default color;
					.on("mouseover", (evt, d) => {
						d3.select(`#bar-${d.leaid}_${d.schoolid_stateassigned}`).attr('fill', 'orange');
						d3.select(`#nav-bar-${d.leadid}_${d.schoolid_stateassigned}`).attr("fill", "orange");
					})
					.on("mouseout", (evt, d) => {
						if (`${d.leaid}_${d.schoolid_stateassigned}` !== selectedBar) {
							d3.select(`#bar-${d.leaid}_${d.schoolid_stateassigned}`).attr('fill', 'purple');
							d3.select(`#nav-bar-${d.leaid}_${d.schoolid_stateassigned}`).attr("fill", "#69b3a2");
						}
					})
					.attr('width', xBand.bandwidth() * 0.9)
					.attr('height', d =>
						navHeight - scale.navY(d.num_students))

				selectedPoints.merge(newSelectedPoints)
					.transition().duration(1000)
					.attr('x', (d, i) =>
						scale.navX(i) + xBand.bandwidth() * 0.9 / 2
					)
					.attr('y', (d, i) => scale.navY(d.num_students))
					.attr('width', xBand.bandwidth() * 0.9)
					.attr('height', d =>
						navHeight - scale.navY(d.num_students));

				selectedPoints.exit().transition().duration(1000).remove();
			}

			function brushed({ selection }) {
				const barWidthFactor = _width / (selection[1] - selection[0]);
				scale.x.domain(selection.map(scale.navX.invert, scale.navX));
				focus.select('.axis').call(axes.x);
				focus.selectAll('.bar')
					.attr('x', (d, i) =>
						scale.x(i) - xBand.bandwidth() * 0.9 / 2
					)
					.attr('width', xBand.bandwidth() * barWidthFactor - 0.9);
				if (selection !== null) {
					brushState.current = selection;
					barWidth.current = barWidthFactor;
				}
			}
		}
		if (data !== undefined && data.length > 0) {
			drawData(graphID);
			setTotalStudents(data.reduce((acc, cur) =>
				acc + cur.num_students, 0));
			setTotalProficient(data.reduce((acc, cur) =>
				acc + cur.total_proficient, 0));
		}

	}, [data, graphID, height, width, pairedChartId, selectedBar]);

	return (
		<>
			{
				data === undefined || data.length === 0 ?
					<div className="st-summary" style={{ margin: "300px auto" }}>
						<h3>No data to show. Please select a state from the map.</h3>
					</div>
					:
					<Row>
						<Col>
							<div className="st-summary">
								<h3>{data[0].state_name}</h3>
								<ul>
									<li>No. of districts: <span>
										{districtCount}</span></li>
									<li>No. of schools: <span>
										{data.length}</span></li>
									<li>No. of participating students: <span>
										{totalStudents}</span></li>
									<li>Estimated no. of proficient students: <span>
										{totalProficient}</span></li>
									<li>Percent of proficient students: <span>
										{((totalProficient / totalStudents) * 100).toFixed(2)}%</span></li>
								</ul>
							</div>
						</Col>
						<Col className="col-5">
							<div className='st-summary'>
								<h3 style={{ textAlign: "left" }}>Funding Info for: <span>{selectedDataPoint.schoolname}</span></h3>
								<ul>
									<li>Per pupil federal funding: <span>
										${selectedDataPoint.pp_fed_raw}</span></li>
									<li>Per pupil state funding: <span>
										${selectedDataPoint.pp_stloc_raw}</span></li>
									<li>Per pupil total funding: <span>
										${selectedDataPoint.pp_total_raw}</span></li>
									<li>Total students: <span>{selectedDataPoint.num_students}</span></li>
									<li>Proficiency percentage: <span>{selectedDataPoint.raw_percent_proficient}%</span></li>
								</ul>
							</div>
						</Col>
					</Row>

			}
			<div id={graphID}></div>
		</>
	)
}
