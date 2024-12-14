import { Box, Container } from '@chakra-ui/react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { useState } from 'react';

import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import userAtom from './atoms/userAtom';
import VerifyEmailPage from './pages/VerifyEmail';

function App() {
  const user = useRecoilValue(userAtom);
  const { pathname } = useLocation();
  const [isSignedUp, setIsSignedUp] = useState(false);

  return (
    <Box position={'relative'} w='full'>
      <Container
        maxW={pathname === '/' ? { base: '1020px', md: '1020px' } : '1020px'}
      >
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
          <Route path='/verify-email' element={<VerifyEmailPage />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
