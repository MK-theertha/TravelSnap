import { useState } from 'react';
import { Button } from '@chakra-ui/react';

import useLogout from '../hooks/useLogout';

import UsersPage from './UserPage';
import ReportedPostsPage from './ReportedPostsPage';

const Home = () => {
  const [activePage, setActivePage] = useState('users');

  const logout = useLogout();

  const renderPage = () => {
    if (activePage === 'users') {
      return <UsersPage />;
    }
    if (activePage === 'reported-posts') {
      return <ReportedPostsPage />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', margin: 0 }}>
      {/* Sidebar */}
      <div
        style={{
          width: '200px',
          backgroundColor: '#f0f0f0',
          padding: '20px',
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          overflowY: 'auto',
        }}
      >
        <h2
          style={{ marginBottom: '20px', fontWeight: '900', fontSize: '20px' }}
        >
          Dashboard
        </h2>
        <button
          onClick={() => setActivePage('users')}
          style={{
            display: 'block',
            marginBottom: '10px',
            padding: '10px',
            width: '100%',
            backgroundColor: activePage === 'users' ? '#bf9191' : '#fff',
            border: '1px solid #ccc',
            cursor: 'pointer',
          }}
        >
          Users
        </button>
        <button
          onClick={() => setActivePage('reported-posts')}
          style={{
            display: 'block',
            padding: '10px',
            width: '100%',
            backgroundColor:
              activePage === 'reported-posts' ? '#bf9191' : '#fff',
            border: '1px solid #ccc',
            cursor: 'pointer',
          }}
        >
          Reported Posts
        </button>
        <Button size={'xs'} onClick={logout}>
          <h2
            style={{
              color: 'red',
              fontWeight: '500',
              fontSize: '20px',
              marginTop: 50,
            }}
          >
            Logout
          </h2>
        </Button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px' }}>{renderPage()}</div>
    </div>
  );
};

export default Home;
