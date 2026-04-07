'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Heading,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'

export default function SetupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(true)
  const toast = useToast()

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/admin/setup')
      const data = await response.json()

      if (!data.needsSetup) {
        setNeedsSetup(false)
      }
    } catch (error) {
      console.error('Error checking setup status:', error)
    }
  }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !name) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: 'Setup complete!',
          description: 'Admin user created. Redirecting to login...',
          status: 'success',
          duration: 2000,
          isClosable: true,
        })

        setTimeout(() => {
          window.location.href = '/admin/login'
        }, 2000)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Setup failed',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!needsSetup) {
    return (
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        bg="gray.50"
      >
        <Box maxW="md" w="full" p={8}>
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>Setup Already Complete</AlertTitle>
              <AlertDescription>
                The application has already been set up. You can now{' '}
                <a href="/admin/login" style={{ textDecoration: 'underline' }}>
                  log in
                </a>
                .
              </AlertDescription>
            </Box>
          </Alert>
        </Box>
      </Flex>
    )
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
          w={{ base: '90vw', sm: '500px' }}
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
                Initial Setup
              </Text>
            </Box>

            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">Create Admin Account</AlertTitle>
                <AlertDescription fontSize="xs">
                  This will create the first administrator account. Make sure to use a strong password.
                </AlertDescription>
              </Box>
            </Alert>

            <form onSubmit={handleSetup}>
              <VStack spacing={5}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Full Name
                  </FormLabel>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    size="lg"
                    fontSize="sm"
                    bg="white"
                    borderColor="surface.border"
                    _focus={{ boxShadow: 'outline' }}
                  />
                </FormControl>

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

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Confirm Password
                  </FormLabel>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    size="lg"
                    fontSize="sm"
                    bg="white"
                    borderColor="surface.border"
                    _focus={{ boxShadow: 'outline' }}
                  />
                </FormControl>

                <Box fontSize="xs" color="gray.500">
                  <Text fontWeight="600">Password requirements:</Text>
                  <VStack align="start" spacing={1} mt={2}>
                    <Text>• At least 8 characters</Text>
                    <Text>• Uppercase and lowercase letters</Text>
                    <Text>• At least one number</Text>
                    <Text>• At least one special character</Text>
                  </VStack>
                </Box>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  w="full"
                  mt={4}
                  isLoading={isLoading}
                  loadingText="Creating account..."
                >
                  Create Admin Account
                </Button>
              </VStack>
            </form>
          </VStack>
        </Box>
      </motion.div>
    </Flex>
  )
}
