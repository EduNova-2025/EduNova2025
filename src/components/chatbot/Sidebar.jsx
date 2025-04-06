import React from 'react';
import { Button } from 'react-bootstrap';

const Sidebar = () => {
  return (
    <aside className="d-flex flex-column align-items-center bg-dark text-white p-3" style={{ width: '100%', maxWidth: '80px', height: '100vh' }}>
      <Button variant="light" className="mb-4" style={{ fontSize: '1.5rem' }}>☰</Button>
      <Button variant="primary" className="rounded-circle p-3" style={{ fontSize: '2rem' }}>+</Button>
    </aside>
  );
};

export default Sidebar;
