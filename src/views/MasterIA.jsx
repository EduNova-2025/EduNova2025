import React from 'react';
import Sidebar from '../components/chatbot/Sidebar';
import ChatArea from '../components/chatbot/ChatArea';
import { Container, Row, Col } from 'react-bootstrap';

const MasterIA = () => {
  return (
    <Container fluid className="d-flex p-0">
      <Row className="w-100 m-0">
        <Col xs="auto" className="p-0"><Sidebar /></Col>
        <Col className="p-0"><ChatArea /></Col>
      </Row>
    </Container>
  );
};
export default MasterIA;