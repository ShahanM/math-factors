import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';


export default function VizStage({ graphId, width, height, data, loading }) {

	const xDiv = 100;
	const yDiv = 15;

	const xOffset = 5;
	const yOffset = 5;

	useEffect(() => {
		console.log(data);
	}, [data]);

	return (
		<Container style={{ border: "1px solid", height: height*1.8 }}>
			<h1>VizStage</h1>
			{loading ? "Loading" :
				<NewChart width={width} height={height}
					xDiv={xDiv} yDiv={yDiv} xOffset={xOffset} yOffset={yOffset}
					graphID={graphId} data={data} />
			}
		</Container>
	)
}

const NewChart = ({ width, height, xDiv, yDiv, xOffset, yOffset, graphID, data, pairedChartId  }) => {
	const [totalStudents, setTotalStudents] = useState(0);
	const [totalProficient, setTotalProficient] = useState(0);

	const [selectedBar, setSelectedBar] = useState(0);

	useEffect(() => {
		const margin = { top: 20, right: 20, bottom: 30, left: 40 };
		const focusHeight = 100;

		const drawData = (graphID) => {
			d3.select(`#${graphID}`).selectAll('svg').remove();

			const chart = d3.select(`#${graphID}`)
				.append("svg")
				.attr("id", `svg-chart-${graphID}`)
				.attr("viewBox", [0, 0,
					width + margin.left + margin.right,
					height + margin.top + margin.bottom])
				.style("display", "block");

			chart.append("clipPath")
				.attr("id", "clippingArea")
				.append("rect")
				.attr("x", margin.left + 10)
				.attr("y", 0)
				.attr("height", height)
				.attr("width", width - margin.left - margin.right);


			const navigator = d3.select(`#${graphID}`)
				.append("svg")
				.attr("viewBox", [0, 0,
					width + margin.left + margin.right,
					focusHeight + margin.top + margin.bottom])
				.style("display", "block");


			let y = d3.scaleLinear()
				.domain([0, d3.max(data.data, d => { return d.num_students; })])
				.range([height - margin.bottom, margin.top]);

			let x = d3.scaleBand()
				.range([margin.left, 18 * data.data.length])
				.domain(data.data.map(function (d) { return d.schoolname; }))
				.padding(0.2);

			const brush = d3.brushX()
				.extent([
					[margin.left, margin.top],
					[width - margin.right, focusHeight + 0.5]
				]).on("brush", brushed)
				.on("end", brushended);

			let navX = d3.scaleBand()
				.range([margin.left, width - margin.right])
				.domain(data.data.map(function (d) { return d.schoolname; }))
				.padding(0);
			let navY = d3.scaleLinear()
				.domain([0, d3.max(data.data, d => { return d.num_students; })])
				.range([focusHeight, margin.top]);

			const defaultSelection = [navX(x.domain()[0], -1), 18 * 10];

			const gb = navigator.append("g")
				.attr("class", "brush")
				.call(brush).call(brush.move, defaultSelection);

			function brushed({ selection }) {
				if (selection) {
					chart.select(".navbars")
						.attr("transform", `translate(${-selection[0]}, 0)`);
					chart.select(".navbars")
						.attr("width", x.bandwidth());
				}
			}

			function brushended({ selection }) {
				if (!selection) {
					gb.call(brush.move, defaultSelection);
				}
			}

			// y-axis labels
			const title = "Number of Students";
			chart.append("g").attr("transform", `translate(${margin.left + 10}, 0)`)
				.call(d3.axisLeft(y))
				.call(g => g.select(".domain").remove())
				.call(g => g.selectAll(".title").data([title]).join("text")
					.attr("class", "title")
					.attr("x", -margin.left)
					.attr("y", 10)
					.attr("fill", "currentColor")
					.attr("text-anchor", "start")
					.text(title));

			// x-axis labels
			chart.append("g")
				.attr("transform", `translate(0,${height - margin.bottom})`)
				.call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

			chart.append("g")
				.attr("class", "navbars")
				.selectAll("navbars")
				.data(data.data)
				.enter()
				.append("rect")
				.attr("id", function (d) { return `bar-${d.nced_id}`})
				.attr("x", function (d) { return x(d.schoolname); })
				.attr("y", function (d) { return y(d.num_students); })
				.attr("width", x.bandwidth())
				.attr("height", function (d) {
					return height - margin.bottom - y(d.num_students);
				})
				.attr("fill", function (d) {
					if (d.nced_id === selectedBar) {
						return "orange";
					} else {
						return "purple"
					}
				})
				.on("mouseover", function (d) {
					d3.select(this).attr("fill", "orange");
					// d3.select(`#${pairedChartId}`).selectAll())
				})
				.on("mouseout", function (d, i) {
					d3.select(this).attr("fill", "purple");
				})
				.attr("cursor", "pointer")
				.on("click", function (d, i) {
					console.log("bar", i);
					setSelectedBar(i.nced_id);
				});

			navigator.append("g")
				.attr("class", "navbars")
				.selectAll("navbars")
				.data(data.data)
				.enter()
				.append("rect")
				.attr("id", function (d) { return `navbar-${d.nced_id}`})
				.attr("x", function (d) { return navX(d.schoolname); })
				.attr("y", function (d) { return navY(d.num_students); })
				.attr("width", navX.bandwidth())
				.attr("height", function (d) {
					return focusHeight - navY(d.num_students);
				})
				.attr("fill", "#69b3a2")


		}
		if (data.data !== undefined && data.data.length > 0) {
			drawData(graphID);
			setTotalStudents(data.data.reduce((acc, cur) => acc + cur.num_students, 0));
			setTotalProficient(data.data.reduce((acc, cur) => acc + cur.total_proficient, 0));
		}

	}, [data, graphID, height, width, pairedChartId, selectedBar]);

	return (
		<>
			<div className="st-summary">
				{
					data.data === undefined ?
						<h3>No data available</h3> :
						<>
							<h3>{data.statename}</h3>
							<ul>
								<li>No. of districts: <span>
									{data.data.length}</span></li>
								<li>No. of participating students: <span>
									{totalStudents}</span></li>
								<li>Estimated no. of proficient students: <span>
									{totalProficient}</span></li>
								<li>Percent of proficient students: <span>
									{((totalProficient / totalStudents) * 100).toFixed(2)}%</span></li>
							</ul>
						</>
				}
			</div>
			<div id={graphID}>
			</div>
		</>
	)
}
