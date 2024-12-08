import { useRecoilValue } from 'recoil';

import LoginCard from '../components/LoginCard';
import SignupCard from '../components/SignupCard';
import authScreenAtom from '../atoms/authAtom';

const AuthPage = ({ setIsSignedUp, isSignedUp }) => {
  const authScreenState = useRecoilValue(authScreenAtom);

  return (
    <>
      {authScreenState === 'login' ? (
        <LoginCard />
      ) : (
        <SignupCard setIsSignedUp={setIsSignedUp} isSignedUp={isSignedUp} />
      )}
    </>
  );
};

export default AuthPage;
