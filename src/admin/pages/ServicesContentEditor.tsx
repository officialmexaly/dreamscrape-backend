'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  Textarea,
  VStack,
  useToast,
  HStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { ArrowLeft, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ContentItem = {
  id: string;
  page: string;
  section: string;
  content_key: string;
  content_type: string;
  content: string | null;
  content_json: any;
  display_order: number;
  is_active: boolean;
  updated_at: string;
};

export function ServicesContentEditor() {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [editValue, setEditValue] = useState('');

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/content?page=services', { cache: 'no-store' });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to load content');

      const data = json.items || [];
      setItems(data);
      setFilteredItems(data);
    } catch (error: any) {
      toast({ title: 'Failed to load content', description: error.message, status: 'error', duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    let result = [...items];

    // Filter by search query
    if (searchQuery) {
      result = result.filter((item) =>
        item.content_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.section.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by section first, then by display_order
    const sectionOrder = ['page_intro', 'weddings', 'private_events', 'corporate_events', 'special_events', 'destination', 'final_cta'];

    result.sort((a, b) => {
      const sectionIndexA = sectionOrder.indexOf(a.section);
      const sectionIndexB = sectionOrder.indexOf(b.section);

      // If both sections are in the predefined order, sort by that
      if (sectionIndexA !== -1 && sectionIndexB !== -1) {
        if (sectionIndexA !== sectionIndexB) {
          return sectionIndexA - sectionIndexB;
        }
      }
      // If one is not in the order, put it last
      else if (sectionIndexA !== -1) return -1;
      else if (sectionIndexB !== -1) return 1;

      // If same section, sort by display_order
      if (a.section === b.section) {
        return a.display_order - b.display_order;
      }

      // Otherwise, sort alphabetically by section
      return a.section.localeCompare(b.section);
    });

    setFilteredItems(result);
  }, [searchQuery, items]);

  const getSectionLabel = (key: string) => {
    const labels: Record<string, string> = {
      page_intro: 'Page Intro',
      weddings: 'Weddings',
      private_events: 'Private Events',
      corporate_events: 'Corporate Events',
      special_events: 'Special Events',
      destination: 'Destination',
      final_cta: 'Final CTA',
    };
    return labels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
  };

  const getContentTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      text: 'gray',
      richtext: 'blue',
      image: 'green',
      json: 'purple',
      number: 'orange',
    };
    return colors[type] || 'gray';
  };

  const formatContentValue = (item: ContentItem) => {
    if (item.content_type === 'json') {
      const json = item.content_json;
      if (Array.isArray(json)) {
        return `Array (${json.length} items): ${json.slice(0, 2).join(', ')}${json.length > 2 ? '...' : ''}`;
      }
      if (typeof json === 'object') {
        const keys = Object.keys(json);
        return `Object (${keys.length} keys)`;
      }
      return JSON.stringify(json).slice(0, 50) + '...';
    }

    // Show image preview for image URLs
    if (item.content_key === 'image' && item.content) {
      return (
        <HStack spacing={3}>
          <Box
            as="img"
            src={item.content}
            alt="Preview"
            boxSize="40px"
            objectFit="cover"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
          />
          <Text fontSize="sm" color="gray.600" noOfLines={1} maxW="250px">
            {item.content}
          </Text>
        </HStack>
      );
    }

    return item.content?.slice(0, 80) + (item.content && item.content.length > 80 ? '...' : '');
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    if (item.content_type === 'json') {
      setEditValue(JSON.stringify(item.content_json, null, 2));
    } else {
      setEditValue(item.content || '');
    }
    setViewMode('edit');
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    setIsSaving(true);
    try {
      const updateData: any = {
        page: 'services',
        section: editingItem.section,
        content_key: editingItem.content_key,
        content_type: editingItem.content_type,
      };

      if (editingItem.content_type === 'json') {
        try {
          updateData.content_json = JSON.parse(editValue);
        } catch (e) {
          toast({ title: 'Invalid JSON', description: 'Please check your JSON syntax', status: 'error', duration: 3000 });
          setIsSaving(false);
          return;
        }
      } else {
        updateData.content = editValue;
      }

      const res = await fetch(`/api/admin/content/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update content');
      }

      toast({ title: 'Content updated successfully!', status: 'success', duration: 2000 });
      await fetchContent();
    } catch (error: any) {
      toast({ title: error.message || 'Failed to save', status: 'error', duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: ContentItem) => {
    if (!confirm(`Are you sure you want to delete "${item.content_key}"?`)) return;

    try {
      const res = await fetch(`/api/site-content?id=${item.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete content');
      }

      toast({ title: 'Content deleted successfully!', status: 'success', duration: 2000 });
      await fetchContent();
    } catch (error: any) {
      toast({ title: error.message || 'Failed to delete', status: 'error', duration: 3000 });
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minH="400px">
        <VStack spacing={4}>
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-purple border-t-transparent"></div>
          <Text color="gray.500">Loading content...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="calc(100vh - 72px)" display="flex" flexDirection="column" m={-8}>
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
            onClick={() => router.push('/admin/content')}
          />
          <Text fontWeight="bold" color="brand.dark">
            Services
          </Text>
        </HStack>
        <HStack spacing={3}>
          <Button leftIcon={<RefreshCw size={16} />} variant="outline" onClick={fetchContent} isLoading={isLoading}>
            Refresh
          </Button>
        </HStack>
      </Flex>

      <Box bg="white" p={8} flex="1" overflow="hidden">
        <Box w="full" maxW="none" h="full">
          {viewMode === 'list' && (
            <>
              <Flex justify="space-between" align="center" mb={6}>
                <Text
                  fontSize="2xl"
                  fontFamily="heading"
                  fontWeight="bold"
                  color="brand.dark">
                  Services
                </Text>
                <Input
                  placeholder="Search by key or section..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  maxW="300px"
                  size="sm"
                />
              </Flex>

              <Box
                bg="white"
                borderRadius="xl"
                shadow="sm"
                border="1px solid"
                borderColor="gray.100"
                overflow="hidden"
                h="full"
                display="flex"
                flexDirection="column">
                {filteredItems.length > 0 ? (
                  <Box flex="1" overflow="auto">
                    <Table variant="simple">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th>Title</Th>
                          <Th>Category</Th>
                          <Th>Type</Th>
                          <Th>Date</Th>
                          <Th>Status</Th>
                          <Th textAlign="right">Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {isLoading && (
                          <Tr>
                            <Td colSpan={6}>
                              <Text color="gray.500">Loading...</Text>
                            </Td>
                          </Tr>
                        )}
                          {filteredItems.map((item) => (
                            <Tr key={item.id} onClick={() => handleEdit(item)} _hover={{ bg: 'gray.50' }} cursor="pointer">
                              <Td>
                                <Text fontWeight="500">{item.content_key}</Text>
                                <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="300px">
                                  {formatContentValue(item)}
                                </Text>
                              </Td>
                              <Td>{getSectionLabel(item.section)}</Td>
                              <Td>{item.content_type}</Td>
                              <Td>{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '-'}</Td>
                              <Td>
                                <Badge colorScheme={item.is_active ? 'green' : 'gray'} fontSize="xs">
                                  {item.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </Td>
                              <Td textAlign="right">
                                <HStack spacing={1}>
                                  <IconButton
                                    aria-label="Edit"
                                    icon={<Edit size={14} />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="brand"
                                    onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                  />
                                  <IconButton
                                    aria-label="Delete"
                                    icon={<Trash2 size={14} />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  </Box>
                ) : (
                  <Box p={12} textAlign="center">
                    <Text color="gray.500">
                      {searchQuery ? 'No matching content found' : 'No Services content found.'}
                    </Text>
                  </Box>
                )}
              </Box>
            </>
          )}

          {viewMode === 'edit' && (
            <Box h="full" display="flex" flexDirection="column">
              <Flex justify="space-between" align="center" mb={4}>
                <HStack spacing={3}>
                  <Button variant="ghost" onClick={() => setViewMode('list')}>Back to List</Button>
                  <Text fontSize="xl" fontFamily="heading" fontWeight="bold" color="brand.dark">
                    Edit Content
                  </Text>
                </HStack>
                <Button
                  leftIcon={<RefreshCw size={16} />}
                  colorScheme="brand"
                  onClick={handleSaveEdit}
                  isLoading={isSaving}
                  isDisabled={!editingItem}
                >
                  Save Changes
                </Button>
              </Flex>

              <Tabs colorScheme="brand" variant="soft-rounded" size="md" flex="1" display="flex" flexDirection="column">
                <TabList gap={2} borderBottom="1px solid" borderColor="gray.200" pb={2}>
                  <Tab px={5} py={2} fontSize="sm" fontWeight="semibold" borderRadius="full" _selected={{ bg: 'brand.primary', color: 'white' }}>
                    Content
                  </Tab>
                  <Tab px={5} py={2} fontSize="sm" fontWeight="semibold" borderRadius="full" _selected={{ bg: 'brand.primary', color: 'white' }}>
                    Details
                  </Tab>
                </TabList>
                <TabPanels flex="1" pt={4} overflow="auto">
                  <TabPanel p={0} pr={2}>
                    <VStack spacing={6} align="stretch" maxW="900px">
                      {editingItem?.content_type === 'json' ? (
                        <FormControl>
                          <FormLabel>JSON Value</FormLabel>
                          <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder='["item1", "item2", "item3"]'
                            rows={18}
                            fontFamily="mono"
                            fontSize="sm"
                          />
                          <Text fontSize="xs" color="gray.500" mt={2}>
                            For arrays: ["item1", "item2"] • For objects: {`{"key": "value"}`}
                          </Text>
                        </FormControl>
                      ) : editingItem?.content_type === 'richtext' ? (
                        <FormControl>
                          <FormLabel>Rich Text Content</FormLabel>
                          <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="Enter content..."
                            rows={12}
                          />
                        </FormControl>
                      ) : (
                        <FormControl>
                          <FormLabel>Content Value</FormLabel>
                          {editingItem?.content_key === 'image' ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                            />
                          ) : (
                            <Textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder="Enter content..."
                              rows={6}
                            />
                          )}
                        </FormControl>
                      )}
                    </VStack>
                  </TabPanel>
                  <TabPanel p={0} pr={2}>
                    <VStack spacing={6} align="stretch" maxW="900px">
                      <FormControl>
                        <FormLabel>Content Key</FormLabel>
                        <Input value={editingItem?.content_key || ''} isDisabled />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Section</FormLabel>
                        <Input value={editingItem ? getSectionLabel(editingItem.section) : ''} isDisabled />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Type</FormLabel>
                        <Input value={editingItem?.content_type || ''} isDisabled />
                      </FormControl>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
