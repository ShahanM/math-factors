import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import './App.css';
import { DistrictNavigationMap, StateNavigationMap } from './components/Maps.jsx';
import VizStage from './components/VizStage';
import { API } from './constants.js';


function App() {

	const [data, setData] = useState({});
	const [loading, setLoading] = useState(false);
	const [activeData, setActiveData] = useState({});
	const [deferredSelectedState, setDeferredSelectedState] = useState("");
	const [selectedState, setSelectedState] = useState("");

	useEffect(() => {
		if (selectedState === "") {
			setLoading(false);
			return;
		};
		setLoading(true);
		let myData = { ...data };
		const fetchStateData = (stateid) => {
			console.log("fetchingdata", stateid);
			fetch(API + 'data/' + stateid, {
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
					myData[data.key.substring(0, 2)] = data.data;
					setData(myData);
					setLoading(false);
				})
				.catch(error => console.log(error));
		}

		if (selectedState in Object(myData)) {
			setLoading(false);
			setActiveData({
				stateid: selectedState,
				data: data[selectedState]
			});
			return;
		} else {
			fetchStateData(selectedState);
		}

	}, [selectedState, data]);


	const filterCallbackHandler = (state, filter) => {
		setDeferredSelectedState(filter);
		setSelectedState(state);
	}

	return (
		<Container className="App" fluid>
			<Row className="header">
				<h1>Math Factors</h1>
			</Row>
			<Row style={{ display: "flex", marginBottom: "2em" }}>
				<Col lg={6} md={12} sm={12} style={{ marginLeft: "27px" }}>
					<VizStage width={800} height={450} data={activeData}
						graphId={"dataBarChart"} loading={loading}
						pairedChartId={"districtMap"} />
				</Col>

				<Col lg={5} md={12} sm={12}>
					<Row className="vizContainer" style={{ minHeight: 300 }}>
						<DistrictNavigationMap width={400} height={300}
							graphId={"districtMap"} state={selectedState}
							pairedChartId={"dataBarChart"} />
					</Row>
					<Row className="vizContainer" style={{ minHeight: 400 }}>
						<StateNavigationMap callback={filterCallbackHandler} />
					</Row>
				</Col>
			</Row>
			<Row className="footer">
			</Row>
		</Container >
	);
}

export default App;
