import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { BsList, BsChatDots } from 'react-icons/bs';
import './InputBox.css';
import { db, auth } from '../../database/firebaseconfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'chatSessions'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs
        .filter(doc => doc.data().userId === user.uid)
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      setChatHistory(history);
    });
    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    console.log('Sesión cerrada');
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h4>EduNova AI</h4>
          <Button variant="danger" onClick={handleSignOut}>
            Cerrar Sesión
          </Button>
        </div>
        <div className="chat-history">
          <h5>Historial de Sesiones</h5>
          <ul className="chat-list">
            {chatHistory.map(session => (
              <li key={session.id} className="chat-item">
                <BsChatDots className="chat-icon" />
                <span>
                  {session.title || 'Sin título'} -{' '}
                  {session.timestamp?.toDate().toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;