'use client';

import React from 'react';
import {
  Box,
  Flex,
  VStack,
  Text,
  Icon,
  Link as ChakraLink,
  IconButton,
  Divider } from
'@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  Layout as LayoutIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut } from
'lucide-react';
const NAV_ITEMS = [
{
  name: 'Dashboard',
  path: '/admin/dashboard',
  icon: LayoutDashboard
},
{
  name: 'Events',
  path: '/admin/events',
  icon: Calendar
},
{
  name: 'Services',
  path: '/admin/services',
  icon: Briefcase
},
{
  name: 'Blog',
  path: '/admin/blog',
  icon: FileText
},
{
  name: 'Inquiries',
  path: '/admin/inquiries',
  icon: MessageSquare
},
{
  name: 'Media',
  path: '/admin/media',
  icon: ImageIcon
},
{
  name: 'Site Content',
  path: '/admin/content',
  icon: LayoutIcon
},
{
  name: 'Settings',
  path: '/admin/settings',
  icon: Settings
}];

interface SidebarProps {
  onLogout: () => void;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}
export function Sidebar({
  onLogout,
  isCollapsed = false,
  onToggleCollapsed
}: SidebarProps) {
  const pathname = usePathname();
  return (
    <Box
      w={isCollapsed ? '80px' : '260px'}
      h="100vh"
      bg="rgba(255,255,255,0.86)"
      backdropFilter="blur(14px)"
      borderRight="1px solid"
      borderColor="rgba(15, 23, 42, 0.08)"
      transition="width 200ms ease"
      position="fixed"
      left={0}
      top={0}
      overflow="visible"
      display="flex"
      flexDirection="column"
      zIndex={10}
      boxShadow="0 10px 30px rgba(15,23,42,0.06)">
      
      <IconButton
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        icon={isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        variant="ghost"
        size="sm"
        borderRadius="full"
        onClick={onToggleCollapsed}
        isDisabled={!onToggleCollapsed}
        position="absolute"
        top="88px"
        right="-14px"
        w="32px"
        h="32px"
        bg="white"
        border="1px solid"
        borderColor="rgba(15, 23, 42, 0.10)"
        boxShadow="0 10px 20px rgba(15,23,42,0.10)"
        _hover={{ bg: 'gray.50' }}
      />
       
      <Box
        p={6}
        borderBottom="1px solid"
        borderColor="rgba(15, 23, 42, 0.08)"
        transition="padding 200ms ease">
        
        <Flex align="center" justify="space-between" gap={3}>
          <Text
            fontFamily="heading"
            fontSize={isCollapsed ? 'lg' : '2xl'}
            fontWeight="bold"
            color="brand.primary"
            noOfLines={1}>
            
            {isCollapsed ? 'D' : 'Dreamscape'}
          </Text>
        </Flex>
        {!isCollapsed && (
          <Text
            fontSize="xs"
            color="gray.500"
            letterSpacing="widest"
            textTransform="uppercase"
            mt={1}>
            
            Admin Portal
          </Text>
        )}
      </Box>

      <VStack spacing={1} align="stretch" flex={1} px={3} py={4} overflowY="auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
          pathname === item.path ||
          item.path === '/admin/blog' && pathname.startsWith('/admin/blog/');
          return (
            <ChakraLink
              key={item.name}
              as={Link}
              href={item.path}
              _hover={{
                textDecoration: 'none'
              }}>
              
              <Flex
                align="center"
                p={3}
                borderRadius="xl"
                bg={
                  isActive
                    ? 'linear-gradient(135deg, rgba(123,45,110,0.16) 0%, rgba(201,168,76,0.10) 100%)'
                    : 'transparent'
                }
                color={isActive ? 'brand.primary' : 'gray.700'}
                _hover={{
                  bg: isActive ? 'rgba(123, 45, 110, 0.16)' : 'rgba(15, 23, 42, 0.04)',
                  color: 'brand.primary'
                }}
                transition="all 0.2s">
                
                <Flex
                  align="center"
                  justify="center"
                  w="34px"
                  h="34px"
                  borderRadius="lg"
                  bg={isActive ? 'rgba(255,255,255,0.8)' : 'rgba(15, 23, 42, 0.04)'}
                  mr={isCollapsed ? 0 : 3}
                  flexShrink={0}>
                  <Icon as={item.icon} boxSize={5} />
                </Flex>
                {!isCollapsed && (
                  <Text fontWeight={isActive ? '600' : '500'} fontSize="sm">
                    {item.name}
                  </Text>
                )}
              </Flex>
            </ChakraLink>);

        })}
      </VStack>

      <Box p={4}>
        <Divider mb={4} borderColor="rgba(15, 23, 42, 0.08)" />
        <Flex
          as="button"
          onClick={onLogout}
          w="full"
          align="center"
          p={3}
          borderRadius="xl"
          bg="rgba(15, 23, 42, 0.04)"
          color="gray.700"
          _hover={{
            bg: 'rgba(239, 68, 68, 0.10)'
          }}
          transition="all 0.2s">
          
          <Icon as={LogOut} boxSize={5} mr={isCollapsed ? 0 : 3} />
          {!isCollapsed && (
            <Text fontWeight="500" fontSize="sm">
              Log Out
            </Text>
          )}
        </Flex>
      </Box>
    </Box>);

}
