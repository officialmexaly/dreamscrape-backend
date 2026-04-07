'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Button,
  Input,
  Textarea,
  Select,
  Text,
  IconButton,
  VStack,
  HStack,
  Badge,
  useToast,
  Divider,
  Image,
  FormControl,
  FormLabel,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel } from
'@chakra-ui/react';
import {
  ArrowLeft,
  Save,
  Eye,
  Type,
  ImagePlus,
  Quote,
  ArrowUp,
  ArrowDown,
  Trash2 } from
'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaPickerModal } from '../components/MediaPickerModal';
import { useBlogPosts } from '../providers/BlogPostsProvider';

export function BlogEditorPage({
  mode = 'create',
  postId,
}: {
  mode?: 'create' | 'edit'
  postId?: string
}) {
  const id = postId || 'new'
  const router = useRouter();
  const { posts, savePost } = useBlogPosts();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null);
  const normalizedId = (id || '').trim().replace(/\s+/g, '');
  const [post, setPost] = useState<any>(() => {
    if (initialPost) return initialPost;
    return {
      id: '',
      title: '',
      subtitle: '',
      author: 'Eleanor Vance',
      date: new Date().toISOString().split('T')[0],
      status: 'Draft',
      category: 'Wedding',
      location: '',
      excerpt: '',
      image: '',
      contentBlocks: [],
    };
  });

  useEffect(() => {
    if (initialPost) setPost(initialPost);
  }, [initialPost]);

  // If we didn't get an initial post (or it was stale), try to hydrate from in-memory list.
  useEffect(() => {
    if (normalizedId && normalizedId !== 'new' && (!post?.id || post?.id === '')) {
      const existing = posts.find(
        (p: any) => p.id === normalizedId || p.__raw?.slug === normalizedId
      );
      if (existing) setPost(existing);
    }
  }, [normalizedId, posts, post?.id]);

  const handleSave = async () => {
    if (!post.title) {
      toast({
        title: 'Title is required',
        status: 'error',
        duration: 2000
      });
      return;
    }
    try {
      const saved = await savePost(post, normalizedId === 'new' ? 'create' : 'update');
      setPost(saved);
      toast({
        title: 'Post saved successfully',
        status: 'success',
        duration: 2000
      });
      if (normalizedId === 'new') {
        router.replace(`/admin/blog/editor/${saved.id}`);
      }
    } catch (error: any) {
      toast({ title: error?.message || 'Failed to save post', status: 'error', duration: 2500 });
    }
  };
  const addBlock = (index: number, type: string) => {
    const newBlock = {
      id: `b_${Date.now()}`,
      type,
      content: '',
      ...(type === 'heading' ?
      {
        level: 'h2'
      } :
      {})
    };
    const newBlocks = [...post.contentBlocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setPost({
      ...post,
      contentBlocks: newBlocks
    });
  };
  const addBlockAt = (index: number, type: string) => {
    const newBlock = {
      id: `b_${Date.now()}`,
      type,
      content: '',
      ...(type === 'heading' ? { level: 'h2' } : {})
    };
    const newBlocks = [...post.contentBlocks];
    const safeIndex = Math.max(0, Math.min(index, newBlocks.length));
    newBlocks.splice(safeIndex, 0, newBlock);
    setPost({ ...post, contentBlocks: newBlocks });
  };
  const updateBlock = (blockId: string, updates: any) => {
    setPost({
      ...post,
      contentBlocks: post.contentBlocks.map((b: any) =>
      b.id === blockId ?
      {
        ...b,
        ...updates
      } :
      b
      )
    });
  };
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (
    direction === 'up' && index === 0 ||
    direction === 'down' && index === post.contentBlocks.length - 1)

    return;
    const newBlocks = [...post.contentBlocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    setPost({
      ...post,
      contentBlocks: newBlocks
    });
  };
  const deleteBlock = (blockId: string) => {
    setPost({
      ...post,
      contentBlocks: post.contentBlocks.filter((b: any) => b.id !== blockId)
    });
  };
  const openMediaPicker = (index: number) => {
    setActiveBlockIndex(index);
    onOpen();
  };
  const handleMediaSelect = (url: string) => {
    if (activeBlockIndex === -1) {
      setPost({
        ...post,
        image: url
      });
    } else if (activeBlockIndex !== null) {
      const block = post.contentBlocks[activeBlockIndex];
      updateBlock(block.id, {
        content: url
      });
    }
  };
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const moveBlockToIndex = (from: number, to: number) => {
    if (from === to) return;
    const newBlocks = [...post.contentBlocks];
    const [moved] = newBlocks.splice(from, 1);
    newBlocks.splice(to, 0, moved);
    setPost({ ...post, contentBlocks: newBlocks });
  };

  const handleDragStart = (index: number, event?: React.DragEvent) => {
    setDragIndex(index);
    if (event) {
      event.dataTransfer.setData('block-index', String(index));
    }
  };

  const handleDragOver = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDrop = (index: number, event: React.DragEvent) => {
    const draggedType = event.dataTransfer.getData('block-type');
    if (draggedType) {
      addBlockAt(index, draggedType);
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    if (dragIndex === null) return;
    moveBlockToIndex(dragIndex, index);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handlePaletteDragStart = (type: string, event: React.DragEvent) => {
    event.dataTransfer.setData('block-type', type);
  };

  return (
    <Box h="calc(100vh - 72px)" display="flex" flexDirection="column" m={-8}>
      {/* Editor Top Bar */}
      <Flex
        bg="white"
        p={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        justify="space-between"
        align="center"
        zIndex={2}>

        <HStack spacing={4}>
          <IconButton
            aria-label="Back"
            icon={<ArrowLeft size={18} />}
            variant="ghost"
            onClick={() => router.push('/admin/blog')} />

          <Text fontWeight="bold" color="brand.dark">
            {post.title || 'Untitled Post'}
          </Text>
          <Badge colorScheme={post.status === 'Published' ? 'green' : 'gray'}>
            {post.status}
          </Badge>
        </HStack>
        <HStack spacing={3}>
          <Button
            leftIcon={<Eye size={16} />}
            variant="outline"
            onClick={() => router.push(`/admin/blog/preview/${post.__raw?.slug || post.id}`)}
            isDisabled={normalizedId === 'new'}>
            
            Preview
          </Button>
          <Button
            leftIcon={<Save size={16} />}
            colorScheme="brand"
            onClick={handleSave}>
            
            Save Post
          </Button>
        </HStack>
      </Flex>

      <Tabs
        colorScheme="brand"
        size="md"
        variant="soft-rounded"
        h="full"
        display="flex"
        flexDirection="column">
        <TabList px={8} pt={4} pb={2} gap={2} borderBottom="1px solid" borderColor="gray.200">
          <Tab
            px={5}
            py={2}
            fontSize="sm"
            fontWeight="semibold"
            borderRadius="full"
            _selected={{ bg: 'brand.primary', color: 'white' }}>
            Post Settings
          </Tab>
          <Tab
            px={5}
            py={2}
            fontSize="sm"
            fontWeight="semibold"
            borderRadius="full"
            _selected={{ bg: 'brand.primary', color: 'white' }}>
            Content Builder
          </Tab>
        </TabList>
        <Box bg="white" p={8} flex="1" overflow="hidden">
          <Box w="full" maxW="none" h="full">
            <TabPanels h="full" pt={0}>
              <TabPanel p={0} h="full" overflowY="auto" pr={2}>
                <Box maxW="1100px">
                  <Flex gap={8} wrap="wrap">
                    <Box flex="1 1 420px" minW="320px">
                      <VStack spacing={5} align="stretch">
                        <Text fontFamily="heading" fontSize="lg" fontWeight="bold" color="brand.dark">
                          Essentials
                        </Text>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Title</FormLabel>
                    <Input
                      value={post.title}
                      onChange={(e) => setPost({ ...post, title: e.target.value })}
                      placeholder="Post title"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Subtitle</FormLabel>
                    <Textarea
                      value={post.subtitle}
                      onChange={(e) => setPost({ ...post, subtitle: e.target.value })}
                      placeholder="A brief subtitle..."
                      rows={3}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Featured Image</FormLabel>
                    <HStack mb={2}>
                      <Input
                        value={post.image}
                        onChange={(e) => setPost({ ...post, image: e.target.value })}
                        placeholder="Image URL"
                        fontSize="sm"
                      />
                      <IconButton
                        aria-label="Browse"
                        icon={<ImagePlus size={16} />}
                        onClick={() => {
                          setActiveBlockIndex(-1);
                          onOpen();
                        }}
                      />
                    </HStack>
                    {post.image && (
                      <Image
                        src={post.image}
                        borderRadius="md"
                        h="120px"
                        w="full"
                        objectFit="cover"
                      />
                    )}
                  </FormControl>

                  <Flex gap={4}>
                    <FormControl>
                      <FormLabel fontSize="sm">Category</FormLabel>
                      <Select
                        value={post.category}
                        onChange={(e) => setPost({ ...post, category: e.target.value })}>
                        <option value="Wedding">Wedding</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Private Events">Private Events</option>
                        <option value="Design">Design</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Status</FormLabel>
                      <Select
                        value={post.status}
                        onChange={(e) => setPost({ ...post, status: e.target.value })}>
                        <option value="Draft">Draft</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Published">Published</option>
                      </Select>
                    </FormControl>
                  </Flex>
                      </VStack>
                    </Box>

                    <Box flex="1 1 420px" minW="320px">
                      <VStack spacing={5} align="stretch">
                        <Text fontFamily="heading" fontSize="lg" fontWeight="bold" color="brand.dark">
                          Details
                        </Text>
                        <Flex gap={4}>
                          <FormControl>
                            <FormLabel fontSize="sm">Date</FormLabel>
                            <Input
                              type="date"
                              value={post.date}
                              onChange={(e) => setPost({ ...post, date: e.target.value })}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm">Location</FormLabel>
                            <Input
                              value={post.location}
                              onChange={(e) => setPost({ ...post, location: e.target.value })}
                              placeholder="e.g. Dallas, TX"
                            />
                          </FormControl>
                        </Flex>

                        <FormControl>
                          <FormLabel fontSize="sm">Author</FormLabel>
                          <Input value={post.author} onChange={(e) => setPost({ ...post, author: e.target.value })} />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm">Excerpt</FormLabel>
                          <Textarea
                            value={post.excerpt}
                            onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                            rows={6}
                            placeholder="Brief summary for blog listing..."
                          />
                        </FormControl>
                      </VStack>
                    </Box>
                  </Flex>
                </Box>
              </TabPanel>

              <TabPanel p={0} h="full">
                <Flex h="full" minH="0" gap={6}>
                  <Box
                    w="280px"
                    minW="260px"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="xl"
                    p={4}
                    bg="gray.50"
                    h="full"
                    overflowY="auto">
                    <Text fontWeight="semibold" color="brand.dark" mb={3}>
                      Add Blocks
                    </Text>
                    <VStack spacing={2} align="stretch">
                      <Button
                        size="sm"
                        variant="outline"
                        draggable
                        onDragStart={(e) => handlePaletteDragStart('text', e)}
                        onClick={() => addBlock(-1, 'text')}>
                        Text
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        draggable
                        onDragStart={(e) => handlePaletteDragStart('heading', e)}
                        onClick={() => addBlock(-1, 'heading')}>
                        Heading
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        draggable
                        onDragStart={(e) => handlePaletteDragStart('quote', e)}
                        onClick={() => addBlock(-1, 'quote')}>
                        Quote
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        draggable
                        onDragStart={(e) => handlePaletteDragStart('image', e)}
                        onClick={() => addBlock(-1, 'image')}>
                        Image
                      </Button>
                    </VStack>
                    <Divider my={4} />
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="semibold" color="brand.dark">Blocks</Text>
                      <Badge colorScheme="gray">{post.contentBlocks.length}</Badge>
                    </HStack>
                    <VStack align="stretch" spacing={2}>
                      {post.contentBlocks.map((block: any, index: number) => (
                        <Flex
                          key={block.id}
                          align="center"
                          justify="space-between"
                          border="1px solid"
                          borderColor={dragOverIndex === index ? 'brand.primary' : 'gray.200'}
                          borderRadius="md"
                          bg="white"
                          px={3}
                          py={2}
                          draggable
                          onDragStart={(e) => handleDragStart(index, e)}
                          onDragOver={(e) => { e.preventDefault(); handleDragOver(index); }}
                          onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleDrop(index, e); }}
                          onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                          >
                          <HStack spacing={2} color="gray.600" minW={0}>
                            {block.type === 'text' && <Type size={14} />}
                            {block.type === 'image' && <ImagePlus size={14} />}
                            {block.type === 'heading' && <Type size={14} />}
                            {block.type === 'quote' && <Quote size={14} />}
                            <Text fontSize="xs" fontWeight="semibold" textTransform="capitalize" noOfLines={1}>
                              {block.type}
                            </Text>
                          </HStack>
                          <HStack spacing={1}>
                            <IconButton
                              aria-label="Move Up"
                              icon={<ArrowUp size={12} />}
                              size="xs"
                              variant="ghost"
                              onClick={() => moveBlock(index, 'up')}
                              isDisabled={index === 0}
                            />
                            <IconButton
                              aria-label="Move Down"
                              icon={<ArrowDown size={12} />}
                              size="xs"
                              variant="ghost"
                              onClick={() => moveBlock(index, 'down')}
                              isDisabled={index === post.contentBlocks.length - 1}
                            />
                          </HStack>
                        </Flex>
                      ))}
                      {post.contentBlocks.length === 0 && (
                        <Flex
                          direction="column"
                          align="center"
                          justify="center"
                          p={6}
                          border="2px dashed"
                          borderColor="gray.300"
                          borderRadius="lg"
                          color="gray.500"
                          textAlign="center">
                          <Type size={26} opacity={0.5} />
                          <Text mt={3} fontSize="sm">
                            Add a block to start building.
                          </Text>
                        </Flex>
                      )}
                    </VStack>
                  </Box>

                  <Box
                    flex="1"
                    minW="0"
                    h="full"
                    overflowY="auto"
                    pr={2}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.currentTarget !== e.target) return;
                      const draggedType = e.dataTransfer.getData('block-type');
                      if (draggedType) {
                        addBlockAt(post.contentBlocks.length, draggedType);
                      }
                    }}>
                    <AnimatePresence>
                      {post.contentBlocks.map((block: any, index: number) =>
                        <motion.div
                          key={block.id}
                          layout
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.2 }}>
                          
                          <Box
                            bg="white"
                            p={4}
                            borderRadius="xl"
                            shadow="sm"
                            border="1px solid"
                            borderColor={dragOverIndex === index ? 'brand.primary' : 'gray.200'}
                            mb={4}
                            draggable
                            onDragStart={(e) => handleDragStart(index, e)}
                            onDragOver={(e) => { e.preventDefault(); handleDragOver(index); }}
                            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleDrop(index, e); }}
                            onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                            _active={{ cursor: 'grabbing' }}
                            cursor="grab">
                            
                            <Flex align="center" justify="space-between" mb={3}>
                              <HStack color="gray.500" spacing={2}>
                                {block.type === 'text' && <Type size={16} />}
                                {block.type === 'image' && <ImagePlus size={16} />}
                                {block.type === 'heading' && <Type size={16} />}
                                {block.type === 'quote' && <Quote size={16} />}
                                <Text fontSize="sm" fontWeight="semibold" textTransform="capitalize">
                                  {block.type}
                                </Text>
                              </HStack>
                              <HStack spacing={1}>
                                <IconButton
                                  aria-label="Delete"
                                  icon={<Trash2 size={14} />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => deleteBlock(block.id)}
                                />
                              </HStack>
                            </Flex>

                            {block.type === 'text' && (
                              <Textarea
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                placeholder="Write your paragraph here..."
                                minH="120px"
                                border="1px solid"
                                borderColor="gray.200"
                              />
                            )}

                            {block.type === 'heading' && (
                              <HStack>
                                <Select
                                  w="110px"
                                  size="sm"
                                  value={block.level}
                                  onChange={(e) => updateBlock(block.id, { level: e.target.value })}>
                                  <option value="h2">H2</option>
                                  <option value="h3">H3</option>
                                </Select>
                                <Input
                                  value={block.content}
                                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                  placeholder="Heading text..."
                                  fontFamily="heading"
                                  fontSize="xl"
                                  fontWeight="bold"
                                />
                              </HStack>
                            )}

                            {block.type === 'quote' && (
                              <Textarea
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                placeholder="Pull quote text..."
                                minH="100px"
                                fontStyle="italic"
                                border="1px solid"
                                borderColor="gray.200"
                              />
                            )}

                            {block.type === 'image' && (
                              <VStack align="stretch" spacing={3}>
                                <HStack>
                                  <Input
                                    size="sm"
                                    value={block.content}
                                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                    placeholder="Image URL"
                                  />
                                  <Button size="sm" onClick={() => openMediaPicker(index)}>
                                    Browse
                                  </Button>
                                </HStack>
                                {block.content && (
                                  <Image
                                    src={block.content}
                                    borderRadius="md"
                                    maxH="300px"
                                    objectFit="cover"
                                    w="full"
                                  />
                                )}
                                <Input
                                  size="sm"
                                  variant="flushed"
                                  value={block.caption || ''}
                                  onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                                  placeholder="Image caption (optional)"
                                  textAlign="center"
                                  color="gray.500"
                                />
                              </VStack>
                            )}
                          </Box>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {post.contentBlocks.length === 0 && (
                      <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        p={12}
                        border="2px dashed"
                        borderColor="gray.300"
                        borderRadius="xl"
                        color="gray.500">
                        <Type size={32} opacity={0.5} />
                        <Text mt={4}>
                          Add a block to begin writing your post.
                        </Text>
                      </Flex>
                    )}
                  </Box>
                </Flex>
              </TabPanel>
            </TabPanels>
          </Box>
        </Box>
      </Tabs>

      <MediaPickerModal
        isOpen={isOpen}
        onClose={onClose}
        onSelect={handleMediaSelect} />
      
    </Box>);

}
