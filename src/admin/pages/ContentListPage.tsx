'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  Input,
  VStack,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
} from '@chakra-ui/react';
import { Plus, Edit, Eye, RefreshCw } from 'lucide-react';
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

export function ContentListPage({ page }: { page: string }) {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      // If page is empty (advanced view), fetch all content
      const url = page ? `/api/admin/content?page=${page}` : '/api/admin/content';
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to load content');
      }

      setItems(json.items || []);
    } catch (error: any) {
      toast({ title: 'Failed to load content', description: error.message, status: 'error', duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this content item?')) return;

    try {
      const res = await fetch(`/api/admin/content/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete content');
      }

      await fetchContent();
      toast({ title: 'Content deleted', status: 'success', duration: 2000 });
    } catch (error: any) {
      toast({ title: 'Failed to delete content', description: error.message, status: 'error', duration: 3000 });
    }
  };

  // Group items by section (or by page if advanced view)
  const sections = useMemo(() => {
    const grouped: Record<string, ContentItem[]> = {};
    items.forEach((item) => {
      // For advanced view (no page), group by "page_section"
      const key = page ? item.section : `${item.page}_${item.section}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    // Sort items within each section by display_order
    Object.keys(grouped).forEach((section) => {
      grouped[section].sort((a, b) => a.display_order - b.display_order);
    });

    return grouped;
  }, [items, page]);

  const sectionList = Object.keys(sections).sort();

  const getSectionLabel = (key: string) => {
    if (!page) {
      // Advanced view: "Home - Hero" format
      const [pageName, sectionName] = key.split('_');
      return `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} - ${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}`;
    }
    return key;
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
        return `Array (${json.length} items)`;
      }
      if (typeof json === 'object') {
        const keys = Object.keys(json);
        if (keys.length <= 3) {
          return keys.map(k => `${k}: ${JSON.stringify(json[k]).slice(0, 30)}...`).join(', ');
        }
        return `Object (${keys.length} keys)`;
      }
      return JSON.stringify(json).slice(0, 50) + '...';
    }
    return item.content?.slice(0, 60) + (item.content && item.content.length > 60 ? '...' : '');
  };

  const pageTitle = page ? page.charAt(0).toUpperCase() + page.slice(1) : 'All Content';

  const renderTable = (sectionKey: string, sectionItems: ContentItem[]) => {
    const filteredItems = sectionItems.filter((item) =>
      item.content_key.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredItems.length === 0) {
      return (
        <Box p={8} textAlign="center">
          <Text color="gray.500">
            {searchQuery ? 'No matching content found' : 'No content items in this section'}
          </Text>
        </Box>
      );
    }

    return (
      <Table variant="simple" size="sm">
        <Thead bg="gray.50">
          <Tr>
            {!page && <Th>Page</Th>}
            <Th>Section</Th>
            <Th>Content Key</Th>
            <Th>Type</Th>
            <Th>Value</Th>
            <Th>Order</Th>
            <Th>Status</Th>
            <Th textAlign="right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredItems.map((item) => (
            <Tr key={item.id}>
              {!page && (
                <Td>
                  <Badge colorScheme={
                    item.page === 'home' ? 'purple' :
                    item.page === 'about' ? 'blue' :
                    item.page === 'services' ? 'green' :
                    item.page === 'contact' ? 'orange' :
                    'gray'
                  } fontSize="xs">
                    {item.page}
                  </Badge>
                </Td>
              )}
              <Td>
                <Text fontSize="sm" textTransform="capitalize">{page ? item.section : ''}</Text>
              </Td>
              <Td>
                <Text fontSize="sm" fontFamily="mono" fontWeight="medium">
                  {item.content_key}
                </Text>
              </Td>
              <Td>
                <Badge colorScheme={getContentTypeBadge(item.content_type)} fontSize="xs">
                  {item.content_type}
                </Badge>
              </Td>
              <Td>
                <Text fontSize="sm" color="gray.600" noOfLines={1} maxW="250px">
                  {formatContentValue(item)}
                </Text>
              </Td>
              <Td>
                <Text fontSize="sm">{item.display_order}</Text>
              </Td>
              <Td>
                <Badge colorScheme={item.is_active ? 'green' : 'red'} fontSize="xs">
                  {item.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Td>
              <Td textAlign="right">
                <HStack spacing={2} justify="flex-end">
                  <IconButton
                    aria-label="Edit"
                    icon={<Edit size={14} />}
                    size="xs"
                    variant="ghost"
                    colorScheme="brand"
                    onClick={() => router.push(`/admin/content/${page || item.page}/${item.id}/edit`)}
                  />
                  <IconButton
                    aria-label="View"
                    icon={<Eye size={14} />}
                    size="xs"
                    variant="ghost"
                    onClick={() => router.push(`/admin/content/${page || item.page}/${item.id}`)}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    );
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="2xl" fontFamily="heading" fontWeight="bold" color="brand.dark">
          {page ? `${pageTitle} Content` : 'Advanced Content View'}
        </Text>
        <HStack spacing={3}>
          <Button
            leftIcon={<RefreshCw size={16} />}
            variant="outline"
            onClick={fetchContent}
            isLoading={isLoading}
          >
            Refresh
          </Button>
          <Button
            leftIcon={<Plus size={18} />}
            colorScheme="brand"
            onClick={() => router.push(`/admin/content/${page || 'home'}/new`)}
          >
            Add Content
          </Button>
        </HStack>
      </Flex>

      <Box bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
        {sectionList.length > 0 ? (
          <Tabs colorScheme="brand" size="md" index={activeTab} onChange={setActiveTab}>
            <TabList px={4} pt={3} borderBottom="1px solid" borderColor="gray.200">
              {sectionList.map((sectionKey) => (
                <Tab key={sectionKey} fontSize="sm" fontWeight="500">
                  {getSectionLabel(sectionKey)}
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {sectionList.map((sectionKey) => (
                <TabPanel key={sectionKey} p={0}>
                  <VStack align="stretch" spacing={0}>
                    <Box p={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          Section: <Text as="span" fontWeight="semibold" color="brand.dark">{getSectionLabel(sectionKey)}</Text>
                        </Text>
                        <Input
                          placeholder="Search keys..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          maxW="250px"
                          size="sm"
                        />
                      </HStack>
                    </Box>
                    {renderTable(sectionKey, sections[sectionKey])}
                  </VStack>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        ) : (
          <VStack p={12} spacing={4}>
            <Text color="gray.500">No content sections found for this page.</Text>
            <Button
              leftIcon={<Plus size={16} />}
              colorScheme="brand"
              onClick={() => router.push(`/admin/content/${page}/new`)}
            >
              Add First Content Item
            </Button>
          </VStack>
        )}
      </Box>
    </Box>
  );
}
