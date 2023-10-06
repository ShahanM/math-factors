import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

export default function VizStage({ graphID, width, height }) {

	const [graph, setGraph] = useState(1)

	const xDiv = 100;
	const yDiv = 15;

	const xOffset = 5;
	const yOffset = 5;

	useEffect(() => {
		console.log(graph);
	}, [graph]);

	return (
		<Container>
			<h1>VizStage</h1>
			<Row>
				{graph === 1 &&
					<XYGrid width={width} height={height}
						xDiv={xDiv} yDiv={yDiv} xOffset={xOffset} yOffset={yOffset}
						graphID={graphID} />
				}
				{graph === 2 &&
					<XEqYGrid width={width} height={height}
						xDiv={xDiv} yDiv={yDiv} xOffset={xOffset} yOffset={yOffset}
						graphID={graphID} />
				}
				{graph === 3 &&
					<XEqNegYGrid width={width} height={height}
						xDiv={xDiv} yDiv={yDiv} xOffset={xOffset} yOffset={yOffset}
						graphID={graphID} />
				}
			</Row>
			<Row style={{margin: "9px 5px"}}>
				<Button className="vizNavBtn"
					onClick={() => setGraph(1)}>1</Button>
				<Button className="vizNavBtn"
					onClick={() => setGraph(2)}>2</Button>
				<Button className="vizNavBtn"
					onClick={() => setGraph(3)}>3</Button>
			</Row>
		</Container>
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