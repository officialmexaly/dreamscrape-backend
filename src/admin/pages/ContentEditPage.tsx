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
  Select,
  Badge,
} from '@chakra-ui/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ContentEditPage({ page, id }: { page: string; id: string }) {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    const loadItem = async () => {
      if (id === 'new') {
        setItem({
          page,
          section: '',
          content_key: '',
          content_type: 'text',
          content: '',
          display_order: 0,
          is_active: true,
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/content/${id}`, { cache: 'no-store' });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || 'Failed to load content');
        }

        setItem(json.item);
      } catch (error: any) {
        toast({ title: 'Failed to load content', description: error.message, status: 'error', duration: 3000 });
        router.push(`/admin/content/${page}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadItem();
  }, [id, page]);

  const handleSave = async () => {
    if (!item.content_key || !item.section || !item.content_type) {
      toast({ title: 'Section, Key, and Type are required', status: 'error', duration: 2000 });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        page,
        section: item.section,
        content_key: item.content_key,
        content_type: item.content_type,
        display_order: parseInt(item.display_order) || 0,
        is_active: item.is_active !== false,
      };

      // Add content field based on type
      if (item.content_type === 'json') {
        (payload as any).content_json = item.content_json;
        (payload as any).content = null;
      } else if (item.content_type === 'number') {
        (payload as any).content_number = item.content;
        (payload as any).content = null;
      } else {
        (payload as any).content = item.content;
        (payload as any).content_json = null;
        (payload as any).content_number = null;
      }

      const method = id === 'new' ? 'POST' : 'PUT';
      const url = id === 'new' ? '/api/admin/content' : `/api/admin/content/${id}`;

      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to save content');
      }

      toast({ title: 'Content saved successfully', status: 'success', duration: 2000 });
      router.push(`/admin/content/${page}`);
    } catch (error: any) {
      toast({ title: error.message || 'Failed to save content', status: 'error', duration: 3000 });
    } finally {
      setIsSaving(false);
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

  if (!item) {
    return (
      <Box>
        <Text>Content not found.</Text>
        <Button mt={4} onClick={() => router.push(`/admin/content/${page}`)}>
          Back to {page} Content
        </Button>
      </Box>
    );
  }

  const pageTitle = page.charAt(0).toUpperCase() + page.slice(1);

  return (
    <Box maxW="800px">
      <Flex justify="space-between" align="center" mb={6}>
        <Flex align="center" gap={3}>
          <Button leftIcon={<ArrowLeft size={16} />} variant="ghost" onClick={() => router.push(`/admin/content/${page}`)}>
            Back
          </Button>
          <Text fontSize="2xl" fontFamily="heading" fontWeight="bold" color="brand.dark">
            {id === 'new' ? `Add ${pageTitle} Content` : 'Edit Content'}
          </Text>
        </Flex>
        <Button leftIcon={<Save size={16} />} colorScheme="brand" onClick={handleSave} isLoading={isSaving}>
          Save
        </Button>
      </Flex>

      <VStack spacing={5} align="stretch">
        <FormControl isRequired>
          <FormLabel>Section</FormLabel>
          <Input
            value={item.section}
            onChange={(e) => setItem({ ...item, section: e.target.value })}
            placeholder="e.g., hero, brandIntro, statistics"
          />
          <Text fontSize="xs" color="gray.500" mt={1}>
            The section this content belongs to (e.g., hero, brandIntro)
          </Text>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Content Key</FormLabel>
          <Input
            value={item.content_key}
            onChange={(e) => setItem({ ...item, content_key: e.target.value })}
            placeholder="e.g., headline, paragraph1, image"
          />
          <Text fontSize="xs" color="gray.500" mt={1}>
            Unique identifier for this content within the section
          </Text>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Content Type</FormLabel>
          <Select
            value={item.content_type}
            onChange={(e) => setItem({ ...item, content_type: e.target.value })}
          >
            <option value="text">Text</option>
            <option value="richtext">Rich Text</option>
            <option value="image">Image URL</option>
            <option value="number">Number</option>
            <option value="json">JSON</option>
          </Select>
        </FormControl>

        {item.content_type === 'json' ? (
          <FormControl isRequired>
            <FormLabel>JSON Value</FormLabel>
            <Textarea
              value={typeof item.content_json === 'string' ? item.content_json : JSON.stringify(item.content_json || '', null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setItem({ ...item, content_json: parsed });
                } catch {
                  setItem({ ...item, content_json: e.target.value });
                }
              }}
              placeholder='{"key": "value"} or ["item1", "item2"]'
              rows={10}
              fontFamily="mono"
              fontSize="sm"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              Valid JSON array or object
            </Text>
          </FormControl>
        ) : (
          <FormControl isRequired>
            <FormLabel>Content Value</FormLabel>
            {item.content_type === 'richtext' ? (
              <Textarea
                value={item.content || ''}
                onChange={(e) => setItem({ ...item, content: e.target.value })}
                placeholder="Enter content..."
                rows={8}
              />
            ) : (
              <Input
                value={item.content || ''}
                onChange={(e) => setItem({ ...item, content: e.target.value })}
                placeholder={
                  item.content_type === 'image'
                    ? 'https://example.com/image.jpg'
                    : item.content_type === 'number'
                    ? '123'
                    : 'Enter content...'
                }
                type={item.content_type === 'number' ? 'number' : 'text'}
              />
            )}
          </FormControl>
        )}

        <Flex gap={4}>
          <FormControl>
            <FormLabel>Display Order</FormLabel>
            <Input
              type="number"
              value={item.display_order}
              onChange={(e) => setItem({ ...item, display_order: parseInt(e.target.value) || 0 })}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Status</FormLabel>
            <Select
              value={item.is_active ? 'true' : 'false'}
              onChange={(e) => setItem({ ...item, is_active: e.target.value === 'true' })}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </FormControl>
        </Flex>

        {item.updated_at && (
          <Text fontSize="xs" color="gray.500">
            Last updated: {new Date(item.updated_at).toLocaleString()}
          </Text>
        )}
      </VStack>
    </Box>
  );
}
