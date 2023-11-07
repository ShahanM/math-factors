import 'bootstrap/dist/css/bootstrap.min.css';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import './App.css';
import DistrictBrowser from './components/DistrictBrowser';
import InteractiveMap from './components/InteractiveMap';
import VizStage from './components/VizStage';
import { useEffect, useState } from 'react';

function App() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeData, setActiveData] = useState({});

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8000/data/agg_nceds/2018-2019')
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setData(data);
        setLoading(false);
      })
      .catch(error => console.log(error));
  }, []);


  const filterCallbackHandler = (filter) => {
    console.log(filter);
    setActiveData({
      statename: filter,
      data: data.filter(district => district.state_name === filter)
    }
    );
  }

  return (
    <>
      <Container className="App">
        <Row className="header">
          <h1>Math Factors</h1>
        </Row>
        <Row>
          <Col lg={9} md={12} sm={12}>
            <VizStage width={900} height={400} data={activeData} graphId={"vizviz"} />
          </Col>

          <Col lg={3} md={12} sm={12}>
            <DistrictBrowser data={data} filterCallback={filterCallbackHandler} />
          </Col>
        </Row>
        <Row>
          <InteractiveMap />
        </Row>
      </Container>
      <Row className="footer">
      </Row>
    </>
  );
}

export default App;
