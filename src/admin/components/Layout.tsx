'use client';

import React, { useEffect, useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { motion } from 'framer-motion';
interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const SIDEBAR_STORAGE_KEY = 'dreamscape_admin_sidebarCollapsed';

export function Layout({ children, onLogout }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      setIsSidebarCollapsed(raw === 'true');
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <Flex minH="100vh" bg="gray.50">
      <Sidebar
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={toggleSidebar}
      />
      <Box
        flex={1}
        ml={isSidebarCollapsed ? '80px' : '260px'}
        transition="margin-left 200ms ease"
        minW={0}>
        
        <TopBar />
        <Box as="main" p={{ base: 5, md: 8 }}>
          <motion.div
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.3
            }}>
            
            <Box
              bg="surface.bg"
              border="1px solid"
              borderColor="surface.border"
              borderRadius="2xl"
              boxShadow="soft"
              p={{ base: 5, md: 8 }}>
              {children}
            </Box>
          </motion.div>
        </Box>
      </Box>
    </Flex>);

}
