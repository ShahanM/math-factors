import 'bootstrap/dist/css/bootstrap.min.css';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import './App.css';
import DistrictBrowser from './components/DistrictBrowser';
import InteractiveMap from './components/InteractiveMap';
import VizStage from './components/VizStage';

function App() {
  return (
    <>
      <Container className="App">
        <Row className="header">
          <h1>Math Factors</h1>
        </Row>
        <Row>
          <Col lg={9} md={12} sm={12}>
            <VizStage width={900} height={400} />
          </Col>

          <Col lg={3} md={12} sm={12}>
            <DistrictBrowser />
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
