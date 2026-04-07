'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  Textarea,
  useToast,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  IconButton,
  Image,
  useDisclosure,
} from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, ImagePlus } from 'lucide-react';
import { useServices } from '../providers/ServicesProvider';
import { MediaPickerModal } from '../components/MediaPickerModal';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

type EditorProps = {
  id?: string;
};

export function ServicesEditorPage({ id }: EditorProps) {
  const router = useRouter();
  const params = useParams();
  const routeId = (id || (params?.id as string) || '').toString();
  const normalizedRouteId = routeId.trim().replace(/\s+/g, '');
  const toast = useToast();
  const { services, createService, updateService, isLoading } = useServices();
  const [isFetching, setIsFetching] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isNew = !normalizedRouteId || normalizedRouteId === 'new';
  const [serviceId, setServiceId] = useState<string | null>(null);

  const existing = useMemo(() => {
    if (isNew) return null;
    return services.find((s) => s.id === normalizedRouteId || s.slug === normalizedRouteId) || null;
  }, [normalizedRouteId, services, isNew]);

  const [draft, setDraft] = useState<any>(() => ({
    slug: '',
    category: '',
    title: '',
    subtitle: '',
    description: '',
    image: '',
    listItemsText: '',
    cta_text: '',
    cta_link: '',
    status: 'draft',
    display_order: 0,
  }));

  useEffect(() => {
    if (existing) {
      setServiceId(existing.id);
      setDraft({
        slug: existing.slug || '',
        category: existing.category || '',
        title: existing.title || '',
        subtitle: existing.subtitle || '',
        description: existing.description || '',
        image: existing.image || '',
        listItemsText: (existing.list_items || []).join('\n'),
        cta_text: existing.cta_text || '',
        cta_link: existing.cta_link || '',
        status: existing.status || 'draft',
        display_order: existing.display_order ?? 0,
      });
    }
  }, [existing]);

  useEffect(() => {
    if (isNew || existing || !normalizedRouteId) return;
    const load = async () => {
      setIsFetching(true);
      try {
        const res = await fetch(`/api/admin/services/${normalizedRouteId}`);
        const json = await res.json();
        if (res.ok && json?.item) {
          const item = json.item;
          setServiceId(item.id);
          setDraft({
            slug: item.slug || '',
            category: item.category || '',
            title: item.title || '',
            subtitle: item.subtitle || '',
            description: item.description || '',
            image: item.image || '',
            listItemsText: (item.list_items || []).join('\n'),
            cta_text: item.cta_text || '',
            cta_link: item.cta_link || '',
            status: item.status || 'draft',
            display_order: item.display_order ?? 0,
          });
        }
      } finally {
        setIsFetching(false);
      }
    };
    load();
  }, [normalizedRouteId, existing, isNew]);

  const handleSave = async () => {
    if (!draft.title || !draft.description) {
      toast({ title: 'Title and description are required', status: 'error', duration: 2000 });
      return;
    }

    const payload = {
      slug: draft.slug?.trim() ? draft.slug : slugify(draft.title),
      category: draft.category || null,
      title: draft.title,
      subtitle: draft.subtitle || null,
      description: draft.description,
      image: draft.image || null,
      list_items: String(draft.listItemsText || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      cta_text: draft.cta_text || null,
      cta_link: draft.cta_link || null,
      status: draft.status || 'draft',
      display_order: Number(draft.display_order) || 0,
    };

    try {
      if (isNew) {
        const created = await createService(payload);
        toast({ title: 'Service created', status: 'success', duration: 2000 });
        router.replace(`/admin/services/${created.id}/edit`);
        return;
      }
      const targetId = serviceId || normalizedRouteId;
      if (!targetId) return;
      await updateService(targetId, payload);
      toast({ title: 'Service updated', status: 'success', duration: 2000 });
    } catch (error: any) {
      toast({ title: error?.message || 'Failed to save', status: 'error', duration: 3000 });
    }
  };

  const handleMediaSelect = (url: string) => {
    setDraft({ ...draft, image: url });
  };

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
            onClick={() => router.push('/admin/services')}
          />
          <Text fontWeight="bold" color="brand.dark">
            {isNew ? 'New Service' : draft.title || 'Untitled Service'}
          </Text>
          {!isNew && (
            <Badge colorScheme={draft.status === 'published' ? 'green' : 'gray'}>
              {draft.status || 'draft'}
            </Badge>
          )}
        </HStack>
        <HStack spacing={3}>
          {!isNew && (
            <Button
              leftIcon={<Eye size={16} />}
              variant="outline"
              onClick={() => router.push(`/admin/services/preview/${draft.slug || normalizedRouteId}`)}
            >
              Preview
            </Button>
          )}
          <Button leftIcon={<Save size={16} />} colorScheme="brand" onClick={handleSave} isLoading={isLoading || isFetching}>
            Save
          </Button>
        </HStack>
      </Flex>

      <Box bg="gray.50" p={8} flex="1" overflow="hidden">
        <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.200" shadow="sm" p={6} h="full">
          <Tabs colorScheme="brand" variant="soft-rounded" size="md" h="full" display="flex" flexDirection="column">
            <TabList gap={2} borderBottom="1px solid" borderColor="gray.200" pb={2}>
              <Tab px={5} py={2} fontSize="sm" fontWeight="semibold" borderRadius="full" _selected={{ bg: 'brand.primary', color: 'white' }}>
                Content
              </Tab>
              <Tab px={5} py={2} fontSize="sm" fontWeight="semibold" borderRadius="full" _selected={{ bg: 'brand.primary', color: 'white' }}>
                Details
              </Tab>
            </TabList>
            <TabPanels flex="1" pt={6} overflow="auto">
              <TabPanel p={0} pr={2}>
                <Flex gap={8} wrap="wrap" maxW="1100px">
                <Box flex="1 1 420px" minW="320px">
                  <VStack spacing={6} align="stretch">
                    <Text fontFamily="heading" fontSize="lg" fontWeight="bold" color="brand.dark">
                      Essentials
                    </Text>
                    <FormControl isRequired>
                      <FormLabel>Title</FormLabel>
                      <Input size="md" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Subtitle</FormLabel>
                      <Input size="md" value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Textarea size="md" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={6} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>List Items (one per line)</FormLabel>
                      <Textarea
                        size="md"
                        value={draft.listItemsText}
                        onChange={(e) => setDraft({ ...draft, listItemsText: e.target.value })}
                        rows={8}
                      />
                    </FormControl>
                  </VStack>
                </Box>

                <Box flex="1 1 420px" minW="320px">
                  <VStack spacing={6} align="stretch">
                    <Text fontFamily="heading" fontSize="lg" fontWeight="bold" color="brand.dark">
                      Media & CTA
                    </Text>
                    <FormControl>
                      <FormLabel>Image URL</FormLabel>
                      <HStack>
                        <Input size="md" value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
                        <IconButton
                          aria-label="Browse"
                          icon={<ImagePlus size={16} />}
                          onClick={onOpen}
                        />
                      </HStack>
                      {draft.image && (
                        <Image
                          src={draft.image}
                          borderRadius="md"
                          h="160px"
                          w="full"
                          objectFit="cover"
                          mt={3}
                        />
                      )}
                    </FormControl>
                    <FormControl>
                      <FormLabel>CTA Text</FormLabel>
                      <Input size="md" value={draft.cta_text} onChange={(e) => setDraft({ ...draft, cta_text: e.target.value })} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>CTA Link</FormLabel>
                      <Input size="md" value={draft.cta_link} onChange={(e) => setDraft({ ...draft, cta_link: e.target.value })} />
                    </FormControl>
                  </VStack>
                </Box>
              </Flex>
            </TabPanel>
            <TabPanel p={0} pr={2}>
              <Flex gap={8} wrap="wrap" maxW="1100px">
                <Box flex="1 1 420px" minW="320px">
                        <VStack spacing={6} align="stretch">
                          <Text fontFamily="heading" fontSize="lg" fontWeight="bold" color="brand.dark">
                            Identity
                          </Text>
                          <FormControl>
                            <FormLabel>Slug</FormLabel>
                            <Input size="md" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Category</FormLabel>
                            <Input size="md" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
                          </FormControl>
                        </VStack>
                      </Box>
                      <Box flex="1 1 420px" minW="320px">
                        <VStack spacing={6} align="stretch">
                          <Text fontFamily="heading" fontSize="lg" fontWeight="bold" color="brand.dark">
                            Publishing
                          </Text>
                          <FormControl>
                            <FormLabel>Status</FormLabel>
                            <Select size="md" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                            </Select>
                          </FormControl>
                          <FormControl>
                            <FormLabel>Display Order</FormLabel>
                            <Input
                              type="number"
                              size="md"
                              value={draft.display_order}
                              onChange={(e) => setDraft({ ...draft, display_order: e.target.value })}
                            />
                          </FormControl>
                        </VStack>
                      </Box>
                    </Flex>
                  </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>

      <MediaPickerModal
        isOpen={isOpen}
        onClose={onClose}
        onSelect={handleMediaSelect}
      />
    </Box>
  );
}
