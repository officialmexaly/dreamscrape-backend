'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useToast,
  VStack,
  HStack,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { Plus, Lock, Unlock, Trash2, Key } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: string
  emailVerified: boolean
  isActive: boolean
  twoFactorEnabled: boolean
  createdAt: string
  lastLoginAt: string | null
  failedLoginAttempts: number
  lockedUntil: string | null
}

export function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const toast = useToast()

  const createModal = useDisclosure()
  const lockModal = useDisclosure()
  const resetModal = useDisclosure()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'admin',
  })

  const [lockDuration, setLockDuration] = useState(15)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
      } else {
        throw new Error(data.error || 'Failed to fetch users')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch users',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'User created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        createModal.onClose()
        setFormData({ email: '', password: '', name: '', role: 'admin' })
        fetchUsers()
      } else {
        throw new Error(data.error || 'Failed to create user')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleLockUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMinutes: lockDuration }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'User locked successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        lockModal.onClose()
        fetchUsers()
      } else {
        throw new Error(data.error || 'Failed to lock user')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to lock user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleUnlockUser = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/lock`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'User unlocked successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        fetchUsers()
      } else {
        throw new Error(data.error || 'Failed to unlock user')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to unlock user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'User deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        fetchUsers()
      } else {
        throw new Error(data.error || 'Failed to delete user')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const isLocked = (user: User) => {
    return user.lockedUntil && new Date(user.lockedUntil) > new Date()
  }

  return (
    <Box p={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="brand.dark">
            User Management
          </Text>
          <Text color="gray.500" mt={1}>
            Manage admin user accounts
          </Text>
        </Box>

        <Button
          leftIcon={<Plus size={18} />}
          colorScheme="brand"
          onClick={createModal.onOpen}
        >
          Add User
        </Button>
      </Flex>

      {users.some((u) => isLocked(u)) && (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          Some user accounts are currently locked
        </Alert>
      )}

      <Box bg="white" borderRadius="xl" shadow="sm" overflow="hidden">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Last Login</Th>
              <Th>Failed Attempts</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={6} textAlign="center" py={8}>
                  Loading...
                </Td>
              </Tr>
            ) : users.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" py={8}>
                  No users found
                </Td>
              </Tr>
            ) : (
              users.map((user) => (
                <Tr key={user.id}>
                  <Td>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">{user.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {user.email}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={user.role === 'super_admin' ? 'purple' : 'blue'}
                    >
                      {user.role}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      {user.isActive ? (
                        <Badge colorScheme="green">Active</Badge>
                      ) : (
                        <Badge colorScheme="red">Inactive</Badge>
                      )}
                      {isLocked(user) && (
                        <Badge colorScheme="orange">Locked</Badge>
                      )}
                    </HStack>
                  </Td>
                  <Td>
                    <Text fontSize="sm">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString()
                        : 'Never'}
                    </Text>
                  </Td>
                  <Td>
                    {user.failedLoginAttempts > 0 && (
                      <Badge colorScheme="red">
                        {user.failedLoginAttempts}
                      </Badge>
                    )}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      {isLocked(user) ? (
                        <IconButton
                          aria-label="Unlock user"
                          icon={<Unlock size={16} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="green"
                          onClick={() => handleUnlockUser(user)}
                        />
                      ) : (
                        <IconButton
                          aria-label="Lock user"
                          icon={<Lock size={16} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="orange"
                          onClick={() => {
                            setSelectedUser(user)
                            lockModal.onOpen()
                          }}
                        />
                      )}
                      <IconButton
                        aria-label="Delete user"
                        icon={<Trash2 size={16} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteUser(user)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Create User Modal */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="createUserForm" onSubmit={handleCreateUser}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="john@example.com"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Min 8 chars, uppercase, lowercase, number, special char
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value,
                      })
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </Select>
                </FormControl>
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={createModal.onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="brand"
                type="submit"
                form="createUserForm"
              >
                Create User
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Lock User Modal */}
      <Modal isOpen={lockModal.isOpen} onClose={lockModal.onClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Lock User Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>
                Lock {selectedUser?.name}'s account for how many minutes?
              </Text>

              <FormControl>
                <FormLabel>Duration (minutes)</FormLabel>
                <Input
                  type="number"
                  value={lockDuration}
                  onChange={(e) =>
                    setLockDuration(parseInt(e.target.value) || 15)
                  }
                  min={1}
                  max={43200}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Max: 43200 minutes (30 days)
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={lockModal.onClose}>
                Cancel
              </Button>
              <Button colorScheme="orange" onClick={handleLockUser}>
                Lock Account
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
