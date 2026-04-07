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
  Link,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const toast = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast({
          title: 'Reset email sent',
          description: 'If an account exists with this email, you will receive a password reset link.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send reset email',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setIsLoading(false)
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
          w={{ base: '90vw', sm: '450px' }}
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
                Forgot Password
              </Text>
            </Box>

            {isSuccess ? (
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Check your email</Text>
                  <Text fontSize="sm">
                    If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
                  </Text>
                </Box>
              </Alert>
            ) : (
              <>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Enter your email address and we'll send you a link to reset your password.
                </Text>

                <form onSubmit={handleSubmit}>
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
                        disabled={isLoading}
                      />
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="brand"
                      size="lg"
                      w="full"
                      mt={4}
                      isLoading={isLoading}
                      loadingText="Sending..."
                      disabled={isSuccess}
                    >
                      Send Reset Link
                    </Button>
                  </VStack>
                </form>
              </>
            )}

            <VStack spacing={3}>
              <Link
                href="/admin/login"
                fontSize="sm"
                color="gray.600"
                fontWeight="500"
                _hover={{ color: 'brand.primary' }}
              >
                ← Back to login
              </Link>
            </VStack>
          </VStack>
        </Box>
      </motion.div>
    </Flex>
  )
}
