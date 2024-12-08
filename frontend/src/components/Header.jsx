import { Box, Button, Flex, Link, useColorMode } from '@chakra-ui/react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { AiFillHome } from 'react-icons/ai';
import { RxAvatar } from 'react-icons/rx';
import { Link as RouterLink } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { BsFillChatQuoteFill } from 'react-icons/bs';
import { MdOutlineSettings } from 'react-icons/md';

import useLogout from '../hooks/useLogout';
import authScreenAtom from '../atoms/authAtom';
import userAtom from '../atoms/userAtom';

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  const setAuthScreen = useSetRecoilState(authScreenAtom);

  return (
    <Flex justifyContent={'space-between'} mt={6} mb='12'>
      {user && (
        <Link as={RouterLink} to='/'>
          <AiFillHome size={24} />
        </Link>
      )}
      {!user && (
        <Link
          as={RouterLink}
          to={'/auth'}
          onClick={() => setAuthScreen('login')}
        >
          Login
        </Link>
      )}

      <Box
        as='div'
        onClick={toggleColorMode}
        cursor='pointer'
        fontSize='4xl'
        fontWeight='bold'
        textAlign='center'
        letterSpacing='widest'
        transition='color 0.3s ease'
        color={colorMode === 'light' ? 'blue.500' : 'yellow.300'}
        _hover={{
          textShadow: '0px 0px 8px rgba(255, 255, 255, 0.8)',
          transform: 'scale(1.05)',
        }}
        fontFamily="'Poppins', sans-serif"
      >
        TRAVELSNAP
      </Box>

      {user && (
        <Flex alignItems={'center'} gap={4}>
          <Link as={RouterLink} to={`/${user.username}`}>
            <RxAvatar size={24} />
          </Link>
          <Link as={RouterLink} to={`/chat`}>
            <BsFillChatQuoteFill size={20} />
          </Link>
          <Link as={RouterLink} to={`/settings`}>
            <MdOutlineSettings size={20} />
          </Link>
          <Button size={'xs'} onClick={logout}>
            <FiLogOut size={20} />
          </Button>
        </Flex>
      )}

      {!user && (
        <Link
          as={RouterLink}
          to={'/auth'}
          onClick={() => setAuthScreen('signup')}
        >
          Sign up
        </Link>
      )}
    </Flex>
  );
};

export default Header;
