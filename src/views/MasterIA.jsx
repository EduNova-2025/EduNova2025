import React from 'react';
import ChatArea from '../components/chatbot/ChatArea';
import { Container } from 'react-bootstrap';

const MasterIA = () => {
  return (
    <Container fluid className="p-0">
      <ChatArea />
    </Container>
  );
};

export default MasterIA;