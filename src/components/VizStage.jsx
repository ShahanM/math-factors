import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';


export default function VizStage({ graphId, width, height, data }) {

	const [graph, setGraph] = useState(1)

	const xDiv = 100;
	const yDiv = 15;

	const xOffset = 5;
	const yOffset = 5;

	useEffect(() => {
		console.log(graph);
	}, [graph]);

	useEffect(() => {
		console.log(data);
	}, [data]);

	return (
		<Container>
			<h1>VizStage</h1>
			<Row>
				{graph === 1 &&
					<XYGrid width={width} height={height}
						xDiv={xDiv} yDiv={yDiv} xOffset={xOffset} yOffset={yOffset}
						graphID={graphId} />
				}
				{graph === 2 &&
					<XEqYGrid width={width} height={height}
						xDiv={xDiv} yDiv={yDiv} xOffset={xOffset} yOffset={yOffset}
						graphID={graphId} />
				}
				{graph === 3 &&
					<XEqNegYGrid width={width} height={height}
						xDiv={xDiv} yDiv={yDiv} xOffset={xOffset} yOffset={yOffset}
						graphID={graphId} />
				}
				{graph === 4 &&
					<NCEDS width={width} height={height}
						xDiv={xDiv} yDiv={yDiv} xOffset={xOffset} yOffset={yOffset}
						graphID={graphId} data={data} />
				}
			</Row>
			<Row style={{ margin: "9px 5px" }}>
				<Button className="vizNavBtn"
					onClick={() => setGraph(1)}>1</Button>
				<Button className="vizNavBtn"
					onClick={() => setGraph(2)}>2</Button>
				<Button className="vizNavBtn"
					onClick={() => setGraph(3)}>3</Button>
				<Button className="vizNavBtn"
					onClick={() => setGraph(4)}>4</Button>
			</Row>
		</Container>
	)
}

const NCEDS = ({ width, height, xDiv, yDiv, xOffset, yOffset, graphID, data }) => {


	const [totalStudents, setTotalStudents] = useState(0);
	const [totalProficient, setTotalProficient] = useState(0);


	useEffect(() => {
		const margin = { top: 45, right: 9, bottom: 45, left: 45 };
		const drawData = (graphID) => {
			console.log('drawData', graphID);

			const svg = d3.select(`#${graphID}`);
			svg.selectChildren().remove();

			svg.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom);

			var x = d3.scaleBand()
				.range([0, width])
				.domain(data.data.map(function (d) { return d.schoolname; }))
				.padding(0.2);

			svg.append("g")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(x))
				.selectAll("text")
				.attr("transform", "translate(-10,0)rotate(-45)")
				.style("text-anchor", "end");

			// Add Y axis
			var y = d3.scaleLinear()
				.domain([0, d3.max(data.data, d => { return d.num_students; })])
				.range([height, 0]);
			svg.append("g")
				.call(d3.axisLeft(y));

			// Bars
			svg.selectAll("mybar")
				.data(data.data)
				.enter()
				.append("rect")
				.attr("x", function (d) { return x(d.schoolname); })
				.attr("y", function (d) { return y(d.num_students); })
				.attr("width", x.bandwidth())
				.attr("height", function (d) { return height - y(d.num_students); })
				.attr("fill", "#69b3a2")


		}
		if (data.data !== undefined && data.data.length > 0) {
			drawData(graphID);
			setTotalStudents(data.data.reduce((acc, cur) => acc + cur.num_students, 0));
			setTotalProficient(data.data.reduce((acc, cur) => acc + cur.total_proficient, 0));
		}
	}, [data, graphID, height, width]);

	return (
		<>
			<h1>{data.statename}</h1>
			<div>
				<p>{totalStudents}</p>
				<p>{totalProficient}</p>
				<p>{(totalProficient / totalStudents) * 100}</p>
			</div>
			<svg id={graphID}>
			</svg>
		</>
	)
}

const XYGrid = ({ width, height, xDiv, yDiv, xOffset, yOffset, graphID }) => {
	return (
		<svg id={graphID} width={width} height={height}>
			{
				[...Array(xDiv + 1)
					.keys()].map(i =>
						<line key={`gridXDiv-${i}`}
							x1={xOffset +
								(width - 2 * xOffset) / xDiv * i}
							y1={yOffset}
							x2={xOffset +
								(width - 2 * xOffset) / xDiv * i}
							y2={height - yOffset}
							style={{
								stroke: "rgb(255, 38, 63)",
								strokeWidth: "0.25"
							}} />
					)
			}
			{
				[...Array(yDiv + 1)
					.keys()].map(i =>
						<line key={`gridYDiv-${i}`}
							x1={xOffset}
							y1={yOffset +
								(height - 2 * yOffset) / yDiv * i}
							x2={width - xOffset}
							y2={yOffset +
								(height - 2 * yOffset) / yDiv * i}
							style={{
								stroke: "rgb(255, 38, 63)",
								strokeWidth: "0.25"
							}} />
					)
			}
		</svg>
	)
}

const XEqYGrid = ({ width, height, xDiv, yDiv, xOffset, yOffset, graphID }) => {
	return (
		<svg id={graphID} width={width} height={height}>
			{
				[...Array(xDiv + 1)
					.keys()].map(i =>
						<line key={`gridXDiv-${i}`}
							x1={xOffset +
								(width - 2 * xOffset) / xDiv * i}
							y1={yOffset}
							x2={width - (width - 2 * xOffset) / xDiv * i}
							y2={height - yOffset}
							style={{
								stroke: "rgb(255, 38, 255)",
								strokeWidth: "0.25"
							}} />
					)
			}
			{
				[...Array(yDiv + 1)
					.keys()].map(i =>
						<line key={`gridYDiv-${i}`}
							x1={xOffset}
							y1={yOffset +
								(height - 2 * yOffset) / yDiv * i}
							x2={width - xOffset}
							y2={yOffset +
								(height - 2 * yOffset) / yDiv * i}
							style={{
								stroke: "rgb(255, 38, 63)",
								strokeWidth: "0.25"
							}} />
					)
			}
		</svg>

	)
}

const XEqNegYGrid = ({ width, height, xDiv, yDiv, xOffset, yOffset, graphID }) => {
	return (
		<svg id={graphID} width={width} height={height}>
			{
				[...Array(xDiv + 1)
					.keys()].map(i =>
						<line key={`gridXDiv-${i}`}
							x1={xOffset +
								(width - 2 * xOffset) / xDiv * i}
							y1={yOffset}
							x2={width - (width - 2 * xOffset) / xDiv * i}
							y2={height - yOffset}
							style={{
								stroke: "rgb(255, 38, 255)",
								strokeWidth: "0.25"
							}} />
					)
			}
			{
				[...Array(yDiv + 1)
					.keys()].map(i =>
						<line key={`gridYDiv-${i}`}
							x1={xOffset}
							y1={yOffset +
								(height - 2 * yOffset) / yDiv * i}
							x2={width - xOffset}
							y2={height -
								(height - 2 * yOffset) / yDiv * i}
							style={{
								stroke: "rgb(90, 134, 99)",
								strokeWidth: "0.25"
							}} />
					)
			}
		</svg>
	)
}