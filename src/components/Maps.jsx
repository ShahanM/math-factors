import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import { FcGraduationCap } from "react-icons/fc";
import * as topojson from 'topojson-client';
import { stateCodeMap, stateIdMap } from '../constants.js';
import { API, USMapURL } from '../constants.js';

export const StateNavigationMap = ({ callback }) => {

	const [selectedState, setSelectedState] = useState("");

	useEffect(() => {
		const callbackHandler = (state) => {
			setSelectedState(state);
			callback && callback(state, stateCodeMap[stateIdMap[state]]);
		}
		const req = new XMLHttpRequest();
		req.open("GET", USMapURL, true);
		req.send();
		req.onload = function () {
			const width = 780;
			const height = 600;
			let us = JSON.parse(req.responseText);
			d3.select("#stateSelectorMap").selectAll("svg").remove();
			const path = d3.geoPath();

			const svg = d3.select("#stateSelectorMap")
				.append("svg")
				.attr("id", "svg-state-selector")
				.attr("width", width)
				.attr("height", height)
				.attr("align-self", "center");

			svg.append("g")
				.attr("class", "states")
				.selectAll("path")
				.data(topojson.feature(us, us.objects.states).features)
				.enter().append("path")
				.attr("d", path)
				.attr("fill", function (d) {
					if (selectedState.startsWith(d.GEOID)) {
						return "orange";
					} else {
						return "steelblue";
					}
				})
				.attr("stroke", "orange")
				.attr("stroke-width", 0.5)
				.attr("transform", "scale(0.80, 0.80)")
				.on("mouseover", function (d) {
					d3.select(this).attr("fill", "orange");
				})
				.on("mouseout", function (d, i) {
					if (i.id !== selectedState) {
						d3.select(this).attr("fill", "steelblue");
					}
				})
				.attr("cursor", "pointer")
				.on("click", function (d, i) {
					callbackHandler(i.id);
					d3.select(this).attr("fill", "orange");
				});


			const labels = svg.append("g").attr("id", "labels")

			labels.selectAll("text")
				.data(topojson.feature(us, us.objects.states).features)
				.join('text')
				.attr('text-anchor', 'middle')
				.attr('fill', 'black')
				.attr('font-size', '15px')
				.attr('font-weight', 'bold')
				.text(d => stateIdMap[d.id])
				.attr('x', d => path.centroid(d)[0])
				.attr('y', d => path.centroid(d)[1])
				.attr("transform", "scale(0.80, 0.80)");
		}
	}, [selectedState, callback]);

	return (
		<Container style={{ margin: "auto", height: 500 }}>
			<div id="stateSelectorMap"></div>
		</Container>
	)

}

export const DistrictNavigationMap = ({ width, height, state, graphId,
	pairedChartId }) => {

	const [selectedState, setSelectedState] = useState("");
	const [schoolCount, setSchoolCount] = useState(0);


	useEffect(() => {
		if (state === "") { return; }
		const req = new XMLHttpRequest();
		req.open("GET", API + "state/" + state,
			true);

		req.setRequestHeader('Content-Type', 'application/json');
		req.setRequestHeader('Access-Control-Allow-Origin', '*');
		req.setRequestHeader('Access-Control-Allow-Headers', '*');
		req.setRequestHeader('Access-Control-Allow-Methods', 'GET');

		req.send();

		req.onload = function () {

			let us = JSON.parse(req.responseText);
			const dataobj = us.data;
			const projection = d3
				.geoAlbers()
				.fitHeight(height + 100,
					topojson.feature(dataobj,
						dataobj.objects[us.key]))
				.fitWidth(width - 9,
					topojson.feature(dataobj, dataobj.objects[us.key]));

			const path = d3.geoPath().projection(projection);
			d3.select(`#${graphId}`).selectAll("svg").remove();

			const svg = d3.select(`#${graphId}`) //d3.select("#districtMap")
				.append("svg")
				.attr("id", "svg-district")
				.attr("width", width)
				.attr("height", height)
				.attr("align-self", "center");

			svg.append("g")
				.attr("class", "districts")
				.selectAll("path")
				.data(topojson
					.feature(dataobj, dataobj.objects[us.key]).features)
				.enter().append("path")
				.attr("d", path)
				.attr("id", function (d) {
					return `dist-${d.properties.GEOID}`;
				})
				.attr("fill", function (d) {
					return d.properties.GEOID === selectedState.GEOID
						? "orange" : "steelblue";
				})
				.attr("stroke", "white")
				.attr("stroke-width", 0.5)
				.attr("transform", "scale(0.80, 0.80)")
				.attr("cursor", "pointer")
				.on("mouseover", function (d, i) {
					d3.select(this).attr("fill", "orange");
					d3.select(`#${pairedChartId}`)
						.selectAll(`[id^=bar-${i.properties.GEOID}]`)
						.attr("fill", "orange");
					d3.select(`#${pairedChartId}`)
						.selectAll(`[id^=nav-bar-${i.properties.GEOID}]`)
						.attr("fill", "orange");
				})
				.on("mouseout", function (d, i) {
					if (i.properties.GEOID !== selectedState.GEOID) {
						d3.select(this).attr("fill", "steelblue");
						d3.select(`#${pairedChartId}`)
							.selectAll(`[id^=bar-${i.properties.GEOID}]`)
							.attr("fill", "purple");
						d3.select(`#${pairedChartId}`)
							.selectAll(`[id^=nav-bar-${i.properties.GEOID}]`)
							.attr("fill", "#69b3a2");
					}
				})
				.on("click", function (d, i) {
					// const navs = d3.select(`#${pairedChartId}`)
						// .selectAll(`[id^=nav-bar-${i.properties.GEOID}]`);
					setSelectedState(i.properties);
					// setSchoolCount(navs.size());
				});
		}

	}, [height, width, state, pairedChartId, selectedState, graphId]);

	return (
		<Container style={{ margin: "auto", height: 300, display: "flex" }} fluid>
			{state === "" ?
				<div className="dist-summary" style={{ textAlign: "center", margin: "auto" }}>
					<h4>Select a state</h4>
					<p>to see districts</p>
				</div>
				:
				<div className="dist-summary">
					<h4>{stateCodeMap[stateIdMap[state]]}</h4>
					<p>{selectedState.NAME}</p>
					{/* <h3>
						{schoolCount === 0 ? "No data" :
							[...Array(schoolCount)].map((_, i) =>
								<FcGraduationCap key={`gradcap-${i}`} />
							)

						}
					</h3> */}
				</div>
			}
			<div id={graphId} style={{ margin: "18px" }}></div>
		</Container>
	)
}