import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Flex, Spinner, Text, Button } from '@chakra-ui/react';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMessage('Invalid verification link.');
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/users/verify-email?token=${token}`);

        const data = await res.json();
        if (data.error) {
          setMessage(data.error);
        } else {
          setMessage(data.message || 'Email verified successfully!');
        }
      } catch (err) {
        console.log(err);
        setMessage('Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  if (loading) {
    return (
      <Flex justifyContent='center' alignItems='center' height='100vh'>
        <Spinner size='xl' />
      </Flex>
    );
  }

  return (
    <Flex justifyContent='center' alignItems='center' height='100vh'>
      <Text fontSize='xl'>{message}</Text>
      <Button
        loadingText='Logging in'
        size='lg'
        onClick={() => navigate('/')}
        isLoading={loading}
        style={{ marginLeft: 30 }}
      >
        Login
      </Button>
    </Flex>
  );
};

export default VerifyEmailPage;
