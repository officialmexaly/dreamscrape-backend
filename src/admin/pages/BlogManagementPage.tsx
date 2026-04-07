'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  VStack,
  HStack,
  Badge,
  IconButton,
  Input,
  Select,
} from '@chakra-ui/react'
import { Plus, Edit, Eye, Trash2, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  published: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
  coverImage?: string
  category?: string
  tags?: string[]
}

export function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')
  const toast = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog-posts')
      const data = await response.json()

      if (data.success) {
        setPosts(data.posts || [])
      } else {
        throw new Error(data.error || 'Failed to fetch posts')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch blog posts',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    try {
      const response = await fetch(`/api/admin/blog-posts/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Post deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        fetchPosts()
      } else {
        throw new Error(data.error || 'Failed to delete post')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete post',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const filteredPosts = posts
    .filter((post) => {
      if (filterStatus === 'published') return post.published
      if (filterStatus === 'draft') return !post.published
      return true
    })
    .filter(
      (post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )

  return (
    <Box p={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg" color="brand.dark">
            Blog Posts
          </Heading>
          <Text color="gray.500" mt={1}>
            Manage your blog content
          </Text>
        </Box>

        <Button
          leftIcon={<Plus size={18} />}
          colorScheme="brand"
          onClick={() => router.push('/admin/blog/new')}
        >
          New Post
        </Button>
      </Flex>

      <Box mb={6}>
        <HStack spacing={4}>
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            maxW="300px"
            leftElement={<Search size={18} color="gray.400" />}
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            maxW="200px"
          >
            <option value="all">All Posts</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </Select>
        </HStack>
      </Box>

      <Box bg="white" borderRadius="xl" shadow="sm" overflow="hidden">
        {isLoading ? (
          <Box p={8} textAlign="center" color="gray.500">
            Loading posts...
          </Box>
        ) : filteredPosts.length === 0 ? (
          <Box p={8} textAlign="center">
            <Text color="gray.500">
              {searchQuery || filterStatus !== 'all'
                ? 'No posts match your filters'
                : 'No blog posts yet. Create your first post!'}
            </Text>
          </Box>
        ) : (
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Title</Th>
                <Th>Status</Th>
                <Th>Category</Th>
                <Th>Date</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredPosts.map((post) => (
                <Tr key={post.id}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">{post.title}</Text>
                      <Text fontSize="xs" color="gray.500">
                        /{post.slug}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={post.published ? 'green' : 'gray'}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </Badge>
                  </Td>
                  <Td>
                    {post.category ? (
                      <Badge variant="outline" colorScheme="blue">
                        {post.category}
                      </Badge>
                    ) : (
                      <Text fontSize="sm" color="gray.400">
                        -
                      </Text>
                    )}
                  </Td>
                  <Td>
                    <Text fontSize="sm">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Text>
                  </Td>
                  <Td textAlign="right">
                    <HStack spacing={2} justify="flex-end">
                      <IconButton
                        aria-label="View"
                        icon={<Eye size={16} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                      />
                      <IconButton
                        aria-label="Edit"
                        icon={<Edit size={16} />}
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/admin/blog/${post.id}/edit`)}
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<Trash2 size={16} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDelete(post.id, post.title)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  )
}
