'use client';

import React from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  Image,
  Button,
  VStack,
  HStack,
  Divider,
  Container } from
'@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBlogPosts } from '../providers/BlogPostsProvider';

export function BlogPreviewPage({ postId }: { postId: string }) {
  const router = useRouter();
  const { posts } = useBlogPosts();
  const post = posts.find((p: any) => p.id === postId || p.__raw?.slug === postId);
  const router = useRouter();
  const { posts } = useBlogPosts();
  const post = posts.find((p: any) => p.id === id || p.__raw?.slug === id);
  if (!post) {
    return <Box p={8}>Post not found.</Box>;
  }
  const routeId = post.__raw?.slug || post.id;
  return (
    <Box bg="white" minH="100vh" m={-8}>
      {/* Admin Preview Header */}
      <Flex
        bg="brand.dark"
        color="white"
        p={3}
        justify="space-between"
        align="center"
        position="sticky"
        top={0}
        zIndex={100}>
        
        <HStack>
          <Button
            size="sm"
            variant="ghost"
            color="white"
            _hover={{
              bg: 'whiteAlpha.200'
            }}
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => router.push(`/admin/blog/editor/${routeId}`)}>
            
            Back to Editor
          </Button>
          <Text fontSize="sm" opacity={0.8}>
            Preview Mode
          </Text>
        </HStack>
      </Flex>

      {/* Hero Section */}
      <Box position="relative" h="60vh" w="full">
        <Image
          src={
          post.image ||
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622'
          }
          w="full"
          h="full"
          objectFit="cover" />
        
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600" />
        

        <Flex
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          direction="column"
          align="center"
          justify="center"
          color="white"
          textAlign="center"
          px={4}>
          
          <Text
            letterSpacing="widest"
            fontSize="sm"
            textTransform="uppercase"
            mb={4}>
            
            Story Overview
          </Text>
          <Heading
            fontFamily="heading"
            fontSize={{
              base: '4xl',
              md: '6xl'
            }}
            fontWeight="normal"
            mb={6}
            maxW="800px">
            
            {post.title}
          </Heading>
          {post.subtitle &&
          <Text
            fontSize={{
              base: 'md',
              md: 'xl'
            }}
            maxW="600px"
            opacity={0.9}>
            
              {post.subtitle}
            </Text>
          }
        </Flex>
      </Box>

      {/* Content Area */}
      <Container maxW="1200px" py={16}>
        <Flex
          direction={{
            base: 'column',
            lg: 'row'
          }}
          gap={16}>
          
          {/* Main Content Blocks */}
          <Box flex={1}>
            <VStack spacing={8} align="stretch">
              {post.contentBlocks?.map((block: any) =>
              <Box key={block.id}>
                  {block.type === 'text' &&
                <Text fontSize="lg" color="gray.700" lineHeight="1.8">
                      {block.content}
                    </Text>
                }

                  {block.type === 'heading' &&
                <Heading
                  as={block.level || 'h2'}
                  fontFamily="heading"
                  fontSize={block.level === 'h2' ? '3xl' : '2xl'}
                  color="brand.dark"
                  mt={4}
                  mb={2}>
                  
                      {block.content}
                    </Heading>
                }

                  {block.type === 'quote' &&
                <Box
                  borderLeft="2px solid"
                  borderColor="brand.gold"
                  pl={6}
                  py={2}
                  my={4}>
                  
                      <Text
                    fontFamily="heading"
                    fontSize="2xl"
                    fontStyle="italic"
                    color="gray.600">
                    
                        "{block.content}"
                      </Text>
                    </Box>
                }

                  {block.type === 'image' &&
                <Box my={6}>
                      <Image src={block.content} w="full" borderRadius="md" />
                      {block.caption &&
                  <Text
                    textAlign="center"
                    fontSize="sm"
                    color="gray.500"
                    mt={3}
                    fontStyle="italic">
                    
                          {block.caption}
                        </Text>
                  }
                    </Box>
                }
                </Box>
              )}

              {(!post.contentBlocks || post.contentBlocks.length === 0) &&
              <Text color="gray.500" fontStyle="italic">
                  No content blocks added yet.
                </Text>
              }
            </VStack>
          </Box>

          {/* Sidebar */}
          <Box
            w={{
              base: 'full',
              lg: '350px'
            }}>
            
            <Box position="sticky" top="100px">
              <Text
                fontSize="xs"
                letterSpacing="widest"
                color="brand.primary"
                textTransform="uppercase"
                mb={6}
                fontWeight="bold">
                
                Event Snapshot
              </Text>

              <VStack align="stretch" spacing={6}>
                <Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    letterSpacing="wider"
                    textTransform="uppercase"
                    mb={1}>
                    
                    Category
                  </Text>
                  <Text fontSize="md" color="gray.800">
                    {post.category}
                  </Text>
                </Box>

                <Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    letterSpacing="wider"
                    textTransform="uppercase"
                    mb={1}>
                    
                    Location
                  </Text>
                  <Text fontSize="md" color="gray.800">
                    {post.location || 'Not specified'}
                  </Text>
                </Box>

                <Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    letterSpacing="wider"
                    textTransform="uppercase"
                    mb={1}>
                    
                    Date
                  </Text>
                  <Text fontSize="md" color="gray.800">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </Box>

                <Divider my={2} />

                <Button
                  bg="brand.dark"
                  color="white"
                  size="lg"
                  _hover={{
                    bg: 'black'
                  }}
                  w="full"
                  borderRadius="sm"
                  fontWeight="normal"
                  letterSpacing="wider">
                  
                  PLAN YOUR EVENT
                </Button>
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>);

}
