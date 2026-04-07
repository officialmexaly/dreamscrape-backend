'use client'

import React from 'react'
import {
  Flex,
  Box,
  InputGroup,
  InputLeftElement,
  Input,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  HStack,
  useToast,
} from '@chakra-ui/react'
import { Search, Bell, LogOut, User, Settings } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'

export function TopBar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const toast = useToast()

  const getPageTitle = () => {
    const path = pathname.substring(1)
    if (!path) return 'Dashboard'
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ')
  }

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/admin/login' })
      toast({
        title: 'Logged out successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error logging out',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const userName = session?.user?.name || 'Admin'
  const userEmail = session?.user?.email || 'admin@dreamscape.com'

  return (
    <Flex
      as="header"
      h="72px"
      bg="rgba(255,255,255,0.75)"
      backdropFilter="blur(12px)"
      borderBottom="1px solid"
      borderColor="surface.border"
      alignItems="center"
      justifyContent="space-between"
      px={8}
      position="sticky"
      top={0}
      zIndex={5}
    >
      <Text
        fontFamily="heading"
        fontSize="xl"
        fontWeight="600"
        color="brand.dark"
        noOfLines={1}
      >
        {getPageTitle()}
      </Text>

      <HStack spacing={6}>
        <InputGroup
          w="300px"
          display={{
            base: 'none',
            md: 'block',
          }}
        >
          <InputLeftElement pointerEvents="none">
            <Search size={18} color="gray.400" />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="Search..."
            borderRadius="full"
            bg="white"
            border="1px solid"
            borderColor="surface.border"
            _focus={{
              boxShadow: 'outline',
            }}
          />
        </InputGroup>

        <HStack spacing={4}>
          <IconButton
            aria-label="Notifications"
            icon={<Bell size={20} />}
            variant="ghost"
            color="gray.700"
            borderRadius="full"
            _hover={{ bg: 'gray.100' }}
          />

          <Menu>
            <MenuButton>
              <HStack spacing={3}>
                <Avatar
                  size="sm"
                  name={userName}
                  bg="brand.gold"
                  color="white"
                />
                <Box
                  display={{
                    base: 'none',
                    md: 'block',
                  }}
                  textAlign="left"
                >
                  <Text fontSize="sm" fontWeight="600" color="brand.dark">
                    {userName}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {userEmail}
                  </Text>
                </Box>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<User size={16} />}>Profile</MenuItem>
              <MenuItem icon={<Settings size={16} />}>Settings</MenuItem>
              <MenuItem
                icon={<LogOut size={16} />}
                onClick={handleLogout}
                color="red.500"
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </HStack>
    </Flex>
  )
}
