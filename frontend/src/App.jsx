import { Box, Container } from '@chakra-ui/react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { useState } from 'react';

import UserPage from './pages/UserPage';
import PostPage from './pages/PostPage';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import userAtom from './atoms/userAtom';
import UpdateProfilePage from './pages/UpdateProfilePage';
import CreatePost from './components/CreatePost';
import ChatPage from './pages/ChatPage';
import { SettingsPage } from './pages/SettingsPage';
import VerifyEmailPage from './pages/VerifyEmail';

function App() {
  const user = useRecoilValue(userAtom);
  const { pathname } = useLocation();
  const [isSignedUp, setIsSignedUp] = useState(false);
  const shouldHideHeader = pathname === '/verify-email';

  return (
    <Box position={'relative'} w='full'>
      <Container
        maxW={pathname === '/' ? { base: '1020px', md: '1020px' } : '1020px'}
      >
        {!isSignedUp && !shouldHideHeader && <Header />}
        <Routes>
          <Route
            path='/'
            element={user ? <HomePage /> : <Navigate to='/auth' />}
          />
          <Route
            path='/auth'
            element={
              !user ? (
                <AuthPage
                  setIsSignedUp={setIsSignedUp}
                  isSignedUp={isSignedUp}
                />
              ) : (
                <Navigate to='/' />
              )
            }
          />
          <Route
            path='/update'
            element={user ? <UpdateProfilePage /> : <Navigate to='/auth' />}
          />
          <Route
            path='/:username'
            element={
              user ? (
                <>
                  <UserPage />
                  <CreatePost />
                </>
              ) : (
                <UserPage />
              )
            }
          />
          <Route path='/:username/post/:pid' element={<PostPage />} />
          <Route
            path='/chat'
            element={user ? <ChatPage /> : <Navigate to='/auth' />}
          />
          <Route
            path='/settings'
            element={user ? <SettingsPage /> : <Navigate to='/auth' />}
          />
          <Route path='/verify-email' element={<VerifyEmailPage />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
