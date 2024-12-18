import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
} from '@chakra-ui/react';
import { useState } from 'react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useSetRecoilState } from 'recoil';

import authScreenAtom from '../atoms/authAtom';

export default function SignupCard({ setIsSignedUp, isSignedUp }) {
  const [showPassword, setShowPassword] = useState(false);
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const [inputs, setInputs] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  // State for loading, response message, and signup success
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const color = useColorModeValue('white', 'gray.dark');

  const handleSignup = async () => {
    setLoading(true); // Set loading to true before starting the API call
    setResponseMessage(''); // Reset response message

    try {
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();

      if (data.error) {
        setResponseMessage(`Error: ${data.error}`);
      } else if (data.message) {
        setResponseMessage(`Success: ${data.message}`);
        setIsSignedUp(true); // Set isSignedUp to true on success
      }
    } catch (error) {
      setResponseMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false); // Set loading to false once the API call is done
    }
  };

  if (isSignedUp) {
    return (
      <Flex align={'center'} justify={'center'}>
        <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
          <Box rounded={'lg'} bg={color} boxShadow={'lg'} p={8}>
            <Text color={'green.500'} textAlign='center' mt={4}>
              {responseMessage}
            </Text>
          </Box>
        </Stack>
      </Flex>
    );
  }

  return (
    <Flex align={'center'} justify={'center'}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <>
          <Stack align={'center'}>
            <Heading fontSize={'4xl'} textAlign={'center'}>
              Sign up
            </Heading>
          </Stack>
          <Box rounded={'lg'} bg={color} boxShadow={'lg'} p={8}>
            <Stack spacing={4}>
              <HStack>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Full name</FormLabel>
                    <Input
                      type='text'
                      onChange={(e) =>
                        setInputs({ ...inputs, name: e.target.value })
                      }
                      value={inputs.name}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Username</FormLabel>
                    <Input
                      type='text'
                      onChange={(e) =>
                        setInputs({ ...inputs, username: e.target.value })
                      }
                      value={inputs.username}
                    />
                  </FormControl>
                </Box>
              </HStack>
              <FormControl isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                  type='email'
                  onChange={(e) =>
                    setInputs({ ...inputs, email: e.target.value })
                  }
                  value={inputs.email}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    onChange={(e) =>
                      setInputs({ ...inputs, password: e.target.value })
                    }
                    value={inputs.password}
                  />
                  <InputRightElement h={'full'}>
                    <Button
                      variant={'ghost'}
                      onClick={() =>
                        setShowPassword((showPassword) => !showPassword)
                      }
                    >
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Stack spacing={10} pt={2}>
                <Button
                  isLoading={loading} // Shows the loading spinner while loading
                  loadingText='Submitting'
                  size='lg'
                  color={'white'}
                  onClick={handleSignup}
                  disabled={loading} // Disable button while loading
                >
                  Sign up
                </Button>
              </Stack>
              <Stack pt={6}>
                <Text align={'center'}>
                  Already a user?{' '}
                  <Link
                    color={'blue.400'}
                    onClick={() => setAuthScreen('login')}
                  >
                    Login
                  </Link>
                </Text>
              </Stack>
            </Stack>
          </Box>
        </>
      </Stack>
    </Flex>
  );
}
