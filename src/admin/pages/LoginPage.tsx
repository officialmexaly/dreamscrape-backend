'use client'

import React, { useState } from 'react'
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  HStack,
  Link,
  useToast,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface LoginPageProps {
  callbackUrl?: string
}

export function LoginPage({ callbackUrl = '/admin/dashboard' }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
      return
    }

    setIsLoading(true)

    try {
      // Let NextAuth handle the redirect automatically
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl,
        redirect: true, // Let NextAuth handle redirect
      })

      // If redirect doesn't happen (shouldn't occur with redirect: true)
      if (result?.error) {
        throw new Error(result.error)
      }
    } catch (error: any) {
      setIsLoading(false)
      toast({
        title: 'Authentication failed',
        description: error?.message || 'Invalid email or password',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient="radial(circle at 20% 10%, rgba(123,45,110,0.14) 0%, rgba(123,45,110,0) 45%), radial(circle at 85% 30%, rgba(201,168,76,0.14) 0%, rgba(201,168,76,0) 45%), linear-gradient(180deg, #F7FAFC 0%, #FFFFFF 100%)"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          bg="rgba(255,255,255,0.9)"
          backdropFilter="blur(14px)"
          p={10}
          borderRadius="2xl"
          boxShadow="soft"
          w={{ base: '90vw', sm: '400px' }}
          border="1px solid"
          borderColor="surface.border"
        >
          <VStack spacing={8} align="stretch">
            <Box textAlign="center">
              <Text
                fontFamily="heading"
                fontSize="3xl"
                fontWeight="bold"
                color="brand.primary"
              >
                Dreamscape
              </Text>
              <Text
                color="gray.500"
                fontSize="sm"
                mt={2}
                letterSpacing="wide"
                textTransform="uppercase"
              >
                Admin Portal
              </Text>
            </Box>

            <form onSubmit={handleLogin}>
              <VStack spacing={5}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Email Address
                  </FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@dreamscape.com"
                    size="lg"
                    fontSize="sm"
                    bg="white"
                    borderColor="surface.border"
                    _focus={{ boxShadow: 'outline' }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Password
                  </FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    size="lg"
                    fontSize="sm"
                    bg="white"
                    borderColor="surface.border"
                    _focus={{ boxShadow: 'outline' }}
                  />
                </FormControl>

                <HStack justify="flex-end" w="full">
                  <Link
                    href="/admin/forgot-password"
                    fontSize="sm"
                    color="brand.primary"
                    fontWeight="500"
                    _hover={{ color: 'brand.gold', textDecoration: 'underline' }}
                  >
                    Forgot password?
                  </Link>
                </HStack>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  w="full"
                  mt={4}
                  isLoading={isLoading}
                  loadingText="Signing in..."
                >
                  Sign In
                </Button>

                <Text fontSize="xs" color="gray.400" textAlign="center">
                  Secure admin portal
                </Text>
              </VStack>
            </form>
          </VStack>
        </Box>
      </motion.div>
    </Flex>
  )
}
