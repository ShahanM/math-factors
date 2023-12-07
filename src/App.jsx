import 'bootstrap/dist/css/bootstrap.min.css';
import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import * as topojson from 'topojson-client';
import './App.css';
import VizStage from './components/VizStage';
import { FcGraduationCap } from "react-icons/fc";


const stateCodeMap = {
	"AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
	"CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "DC": "District of Columbia",
	"FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois",
	"IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana",
	"ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota",
	"MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
	"NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
	"NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon",
	"PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota",
	"TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia",
	"WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
}

const stateIdMap = {
	"01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT", "10": "DE",
	"11": "DC", "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN", "19": "IA",
	"20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
	"28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH", "34": "NJ", "35": "NM",
	"36": "NY", "37": "NC", "38": "ND", "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
	"45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
	"54": "WV", "55": "WI", "56": "WY"
}

function App() {

	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [activeData, setActiveData] = useState({});
	const [deferredSelectedState, setDeferredSelectedState] = useState("");
	const [selectedState, setSelectedState] = useState("");

	useEffect(() => {
		setLoading(true);
		fetch('https://rssa.recsys.dev/dataviz/api/data/json/2018-2019', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*',
				'Access-Control-Allow-Methods': 'OPTIONS,PUT,POST,GET',
			}
		})
			.then(response => response.json())
			.then(data => {
				console.log(data);
				setData(data);
				setLoading(false);
			})
			.catch(error => console.log(error));
	}, []);


	const filterCallbackHandler = (state, filter) => {
		console.log(filter);
		setDeferredSelectedState(filter.toUpperCase());
		setSelectedState(state);
	}

	useEffect(() => {
		if (deferredSelectedState !== "" && !loading) {
			setActiveData({
				statename: deferredSelectedState,
				data: data.filter(district => district.state_name === deferredSelectedState)
			});
			setDeferredSelectedState("");
		}
	}, [deferredSelectedState, loading, data]);

	return (
		<>
			<Container className="App" fluid>
				<Row className="header">
					<h1>Math Factors</h1>
				</Row>
				<Row style={{ display: "flex" }}>
					<Col lg={6} md={12} sm={12} style={{ marginLeft: "27px" }}>
						<VizStage width={800} height={450} data={activeData} graphId={"dataBarChart"} loading={loading}
							pairedChartId={"districtMap"} />
					</Col>

					<Col lg={5} md={12} sm={12}>
						<Row style={{ minHeight: 300, border: "1px solid", marginLeft: "3px" }}>
							<AnotherMap width={400} height={300} graphId={"districtMap"} state={selectedState} pairedChartId={"dataBarChart"} />
						</Row>
						<Row style={{ minHeight: 400, border: "1px solid", marginLeft: "3px", marginTop: "3px" }}>
							<MapData callback={filterCallbackHandler} />
						</Row>
					</Col>
				</Row>
			</Container >
			<Row className="footer">
			</Row>
		</>
	);
}

const MapData = ({ callback }) => {

	const [selectedState, setSelectedState] = useState("");

	useEffect(() => {
		const callbackHandler = (state) => {
			setSelectedState(state);
			callback && callback(state, stateCodeMap[stateIdMap[state]]);
		}
		const req = new XMLHttpRequest();
		req.open("GET", "https://d3js.org/us-10m.v1.json", true);
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

const AnotherMap = ({ width, height, state, graphId, pairedChartId }) => {

	const [selectedState, setSelectedState] = useState("");
	const [schoolCount, setSchoolCount] = useState(0);


	useEffect(() => {
		if (state === "") {
			return;
		}
		const req = new XMLHttpRequest();
		req.open("GET", "https://rssa.recsys.dev/dataviz/api/state/" + state, true);
		req.setRequestHeader({
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*',
			'Access-Control-Allow-Methods': 'OPTIONS,PUT,POST,GET',
		});
		req.send();
		req.onload = function () {

			let us = JSON.parse(req.responseText);
			console.log("district", us);
			const dataobj = us.data;
			const projection = d3
				.geoAlbers().fitHeight(height + 100, topojson.feature(dataobj, dataobj.objects[us.key]))
				.fitWidth(width - 9, topojson.feature(dataobj, dataobj.objects[us.key]));

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
				.data(topojson.feature(dataobj, dataobj.objects[us.key]).features)
				.enter().append("path")
				.attr("d", path)
				.attr("id", function (d) {
					return `dist-${d.properties.GEOID}`;
				})
				.attr("fill", function (d) {
					if (d.properties.GEOID === selectedState.GEOID) {
						return "orange";
					} else {
						return "steelblue";
					}
				})
				.attr("stroke", "white")
				.attr("stroke-width", 0.5)
				.attr("transform", "scale(0.80, 0.80)")
				.attr("cursor", "pointer")
				.on("mouseover", function (d, i) {
					d3.select(this).attr("fill", "orange");
					d3.select(`#${pairedChartId}`).selectAll(`[id^=bar-${i.properties.GEOID}]`).attr("fill", "orange");
					d3.select(`#${pairedChartId}`).selectAll(`[id^=navbar-${i.properties.GEOID}]`).attr("fill", "orange");
				})
				.on("mouseout", function (d, i) {
					if (i.properties.GEOID !== selectedState.GEOID) {
						d3.select(this).attr("fill", "steelblue");
						d3.select(`#${pairedChartId}`).selectAll(`[id^=bar-${i.properties.GEOID}]`).attr("fill", "purple");
						d3.select(`#${pairedChartId}`).selectAll(`[id^=navbar-${i.properties.GEOID}]`).attr("fill", "#69b3a2");
					}
				})
				.on("click", function (d, i) {
					const navs = d3.select(`#${pairedChartId}`).selectAll(`[id^=navbar-${i.properties.GEOID}]`);
					console.log(navs.size());
					setSelectedState(i.properties);
					setSchoolCount(navs.size());
				});
		}

	}, [height, width, state, pairedChartId, selectedState, graphId]);

	return (
		<Container style={{ margin: "auto", height: 300, display: "flex" }} fluid>
			<div className="dist-summary">
				<h4>{stateCodeMap[stateIdMap[state]]}</h4>
				<p>{selectedState.NAME}</p>
				<h3>
					{schoolCount === 0 ? "No data" :
						[...Array(schoolCount)].map((_, i) =>
							<FcGraduationCap />
						)

					}
				</h3>
			</div>
			<div id={graphId} style={{ margin: "18px" }}></div>
		</Container>
	)
}

export default App;
