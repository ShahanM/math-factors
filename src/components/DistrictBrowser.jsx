import { Container } from "react-bootstrap";
import { useEffect, useState } from "react";


export default function DistrictBrowser({ data, filterCallback }) {

	const [fetching, setFetching] = useState(true);
	const [states, setStates] = useState([]);
	const [selectedState, setSelectedState] = useState('');

	useEffect(() => {
		if (data.length > 0) {
			setStates([...new Set(data.map(district => district.state_name))]);
			setFetching(false);
		}
	}, [data]);

	return (
		<Container>
			<h1>Data Browser</h1>
			<div className="dataTree">
				{fetching && states.length <= 0 ? <p>Fetching data...</p>
					: <ul className="stateList">
						{states.map((statename, index) => (
							<li key={'statename_' + index} 
							onClick={() => filterCallback(statename)}>
								{statename}
							</li>
						)
						)}
					</ul>
				}
			</div>
		</Container>
	)
}