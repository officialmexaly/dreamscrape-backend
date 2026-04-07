'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  Image,
  FormControl,
  FormLabel,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { ArrowLeft, Save, Eye, Type, ImagePlus, Quote, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaPickerModal } from '../components/MediaPickerModal';
import { useEvents } from '../providers/EventsProvider';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

type ContentBlock = {
  id: string;
  type: 'text' | 'heading' | 'quote' | 'image';
  content: string;
  level?: string;
  caption?: string;
};

export function EventsEditorPage({ id }: { id?: string }) {
  const router = useRouter();
  const params = useParams();
  const routeId = (id || (params?.id as string) || '').toString().trim();
  const isNew = !routeId || routeId === 'new';
  const { events, refresh } = useEvents();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null);

  const existing = useMemo(() => {
    if (isNew) return null;
    return events.find((e: any) => e.id === routeId || e.slug === routeId) || null;
  }, [events, routeId, isNew]);

  const [draft, setDraft] = useState<any>({
    slug: '',
    title: '',
    client_name: '',
    event_date: '',
    event_type: 'Wedding',
    location: '',
    status: 'draft',
    featured_image: '',
    description: '',
    contentBlocks: [] as ContentBlock[],
  });

  useEffect(() => {
    if (existing) {
      setDraft({
        slug: existing.slug || '',
        title: existing.title || '',
        client_name: existing.client_name || '',
        event_date: existing.event_date || '',
        event_type: existing.event_type || 'Wedding',
        location: existing.location || '',
        status: existing.status || 'draft',
        featured_image: existing.featured_image || '',
        description: existing.description || '',
        contentBlocks: Array.isArray(existing.images) ? existing.images : [],
      });
    }
  }, [existing]);

  const addBlock = (index: number, type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `b_${Date.now()}`,
      type,
      content: '',
      ...(type === 'heading' ? { level: 'h2' } : {}),
    };
    const next = [...draft.contentBlocks];
    next.splice(index + 1, 0, newBlock);
    setDraft({ ...draft, contentBlocks: next });
  };

  const updateBlock = (blockId: string, updates: any) => {
    setDraft({
      ...draft,
      contentBlocks: draft.contentBlocks.map((b: ContentBlock) => (b.id === blockId ? { ...b, ...updates } : b)),
    });
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === draft.contentBlocks.length - 1)) return;
    const next = [...draft.contentBlocks];
    const target = direction === 'up' ? index - 1 : index + 1;
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setDraft({ ...draft, contentBlocks: next });
  };

  const deleteBlock = (blockId: string) => {
    setDraft({ ...draft, contentBlocks: draft.contentBlocks.filter((b: ContentBlock) => b.id !== blockId) });
  };

  const openMediaPicker = (index: number) => {
    setActiveBlockIndex(index);
    onOpen();
  };

  const handleMediaSelect = (url: string) => {
    if (activeBlockIndex === -1) {
      setDraft({ ...draft, featured_image: url });
    } else if (activeBlockIndex !== null) {
      const block = draft.contentBlocks[activeBlockIndex];
      updateBlock(block.id, { content: url });
    }
  };

  const handleSave = async () => {
    if (!draft.title) {
      toast({ title: 'Title is required', status: 'error', duration: 2000 });
      return;
    }
    const payload = {
      slug: draft.slug?.trim() ? draft.slug : slugify(draft.title),
      title: draft.title,
      client_name: draft.client_name || null,
      event_date: draft.event_date || null,
      event_type: draft.event_type,
      location: draft.location || null,
      status: draft.status || 'draft',
      featured_image: draft.featured_image || '',
      description: draft.description || '',
      images: draft.contentBlocks || [],
      gallery_images: (draft.contentBlocks || [])
        .filter((b: ContentBlock) => b.type === 'image' && b.content)
        .map((b: ContentBlock) => b.content),
    };

    const url = isNew ? '/api/admin/events' : `/api/admin/events/${routeId}`;
    const method = isNew ? 'POST' : 'PUT';
    const res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      toast({ title: json?.error || 'Failed to save event', status: 'error', duration: 2500 });
      return;
    }
    toast({ title: 'Event saved', status: 'success', duration: 2000 });
    await refresh();
    if (isNew && json?.item?.id) {
      router.replace(`/admin/events/${json.item.id}/edit`);
    }
  };

  return (
    <Box h="calc(100vh - 72px)" display="flex" flexDirection="column" m={-8}>
      <Flex
        bg="white"
        p={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        justify="space-between"
        align="center"
        zIndex={2}>
        <HStack spacing={4}>
          <IconButton aria-label="Back" icon={<ArrowLeft size={18} />} variant="ghost" onClick={() => router.push('/admin/events')} />
          <Text fontWeight="bold" color="brand.dark">
            {draft.title || 'Untitled Event'}
          </Text>
          <Badge colorScheme={draft.status === 'published' ? 'green' : 'gray'}>{draft.status}</Badge>
        </HStack>
        <HStack spacing={3}>
          {!isNew && (
            <Button leftIcon={<Eye size={16} />} variant="outline" onClick={() => router.push(`/admin/events/preview/${draft.slug || routeId}`)}>
              Preview
            </Button>
          )}
          <Button leftIcon={<Save size={16} />} colorScheme="brand" onClick={handleSave}>
            Save
          </Button>
        </HStack>
      </Flex>

      <Tabs colorScheme="brand" size="md" variant="soft-rounded" h="full" display="flex" flexDirection="column">
        <TabList px={8} pt={4} pb={2} gap={2} borderBottom="1px solid" borderColor="gray.200">
          <Tab px={5} py={2} fontSize="sm" fontWeight="semibold" borderRadius="full" _selected={{ bg: 'brand.primary', color: 'white' }}>
            Event Settings
          </Tab>
          <Tab px={5} py={2} fontSize="sm" fontWeight="semibold" borderRadius="full" _selected={{ bg: 'brand.primary', color: 'white' }}>
            Content Builder
          </Tab>
        </TabList>
        <Box bg="white" p={8} flex="1" overflow="hidden">
          <Box w="full" maxW="none" h="full">
            <TabPanels h="full" pt={0}>
              <TabPanel p={0} h="full" overflowY="auto" pr={2}>
                <Flex gap={8} wrap="wrap" maxW="1100px">
                  <Box flex="1 1 420px" minW="320px">
                    <VStack spacing={5} align="stretch">
                      <Text fontFamily="heading" fontSize="lg" fontWeight="bold" color="brand.dark">
                        Essentials
                      </Text>
                      <FormControl isRequired>
                        <FormLabel>Title</FormLabel>
                        <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Client Name</FormLabel>
                        <Input value={draft.client_name} onChange={(e) => setDraft({ ...draft, client_name: e.target.value })} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={6} />
                      </FormControl>
                    </VStack>
                  </Box>

                  <Box flex="1 1 420px" minW="320px">
                    <VStack spacing={5} align="stretch">
                      <Text fontFamily="heading" fontSize="lg" fontWeight="bold" color="brand.dark">
                        Details
                      </Text>
                      <Flex gap={4}>
                        <FormControl>
                          <FormLabel>Date</FormLabel>
                          <Input type="date" value={draft.event_date} onChange={(e) => setDraft({ ...draft, event_date: e.target.value })} />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Category</FormLabel>
                          <Select value={draft.event_type} onChange={(e) => setDraft({ ...draft, event_type: e.target.value })}>
                            <option value="Wedding">Wedding</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Private Events">Private Events</option>
                            <option value="Design">Design</option>
                          </Select>
                        </FormControl>
                      </Flex>
                      <FormControl>
                        <FormLabel>Location</FormLabel>
                        <Input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="e.g. Dallas, TX" />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Status</FormLabel>
                        <Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Featured Image</FormLabel>
                        <HStack>
                          <Input value={draft.featured_image} onChange={(e) => setDraft({ ...draft, featured_image: e.target.value })} placeholder="Image URL" />
                          <IconButton aria-label="Browse" icon={<ImagePlus size={16} />} onClick={() => { setActiveBlockIndex(-1); onOpen(); }} />
                        </HStack>
                        {draft.featured_image && (
                          <Image src={draft.featured_image} borderRadius="md" h="120px" w="full" objectFit="cover" mt={3} />
                        )}
                      </FormControl>
                    </VStack>
                  </Box>
                </Flex>
              </TabPanel>

              <TabPanel p={0} h="full">
                <Box maxW="1100px">
                  <Flex
                    align="center"
                    justify="space-between"
                    mb={4}
                    px={1}
                    position="sticky"
                    top={0}
                    zIndex={1}
                    bg="white"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    p={3}>
                    <Text fontWeight="semibold" color="brand.dark">
                      Blocks ({draft.contentBlocks.length})
                    </Text>
                    <HStack spacing={2}>
                      <Button size="sm" onClick={() => addBlock(-1, 'text')}>Text</Button>
                      <Button size="sm" onClick={() => addBlock(-1, 'heading')}>Heading</Button>
                      <Button size="sm" onClick={() => addBlock(-1, 'quote')}>Quote</Button>
                      <Button size="sm" onClick={() => addBlock(-1, 'image')}>Image</Button>
                    </HStack>
                  </Flex>

                  <AnimatePresence>
                    {draft.contentBlocks.map((block: ContentBlock, index: number) => (
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
                          borderColor="gray.200"
                          mb={4}>
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
                                aria-label="Move Up"
                                icon={<ArrowUp size={14} />}
                                size="xs"
                                variant="ghost"
                                onClick={() => moveBlock(index, 'up')}
                                isDisabled={index === 0}
                              />
                              <IconButton
                                aria-label="Move Down"
                                icon={<ArrowDown size={14} />}
                                size="xs"
                                variant="ghost"
                                onClick={() => moveBlock(index, 'down')}
                                isDisabled={index === draft.contentBlocks.length - 1}
                              />
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
                    ))}
                  </AnimatePresence>
                </Box>
              </TabPanel>
            </TabPanels>
          </Box>
        </Box>
      </Tabs>

      <MediaPickerModal isOpen={isOpen} onClose={onClose} onSelect={handleMediaSelect} />
    </Box>
  );
}
