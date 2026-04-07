'use client';

import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, Badge, Button, Code, Divider } from '@chakra-ui/react';
import { ArrowLeft, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ViewContentRoute({ paramsPromise }: { paramsPromise: Promise<{ page: string; id: string }> }) {
  const router = useRouter();
  const [params, setParams] = useState<{ page: string; id: string } | null>(null);
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getParams = async () => {
      const p = await paramsPromise;
      setParams(p);
    };
    getParams();
  }, [paramsPromise]);

  useEffect(() => {
    if (!params) return;

    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/admin/content/${params.id}`, { cache: 'no-store' });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || 'Failed to load content');
        }

        setItem(json.item);
      } catch (error: any) {
        console.error('Error loading content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [params]);

  if (isLoading || !params) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minH="400px">
        <Text color="gray.500">Loading...</Text>
      </Box>
    );
  }

  if (!item) {
    return (
      <Box>
        <Text>Content not found.</Text>
        <Button mt={4} onClick={() => router.push(`/admin/content/${params.page}`)}>
          Back
        </Button>
      </Box>
    );
  }

  const pageTitle = params.page.charAt(0).toUpperCase() + params.page.slice(1);

  return (
    <Box maxW="800px">
      <HStack justify="space-between" mb={6}>
        <HStack spacing={3}>
          <Button leftIcon={<ArrowLeft size={16} />} variant="ghost" onClick={() => router.push(`/admin/content/${params.page}`)}>
            Back
          </Button>
          <Text fontSize="2xl" fontFamily="heading" fontWeight="bold" color="brand.dark">
            {pageTitle} Content
          </Text>
        </HStack>
        <Button
          leftIcon={<Edit size={16} />}
          colorScheme="brand"
          onClick={() => router.push(`/admin/content/${params.page}/${params.id}/edit`)}
        >
          Edit
        </Button>
      </HStack>

      <VStack align="stretch" spacing={6} bg="white" p={6} borderRadius="xl" shadow="sm" borderWidth="1px">
        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.500">ID</Text>
          <Code fontSize="sm">{item.id}</Code>
        </HStack>

        <Divider />

        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.500">Page</Text>
          <Badge colorScheme="blue">{item.page}</Badge>
        </HStack>

        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.500">Section</Text>
          <Text fontWeight="medium">{item.section}</Text>
        </HStack>

        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.500">Content Key</Text>
          <Code fontSize="sm">{item.content_key}</Code>
        </HStack>

        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.500">Type</Text>
          <Badge colorScheme={
            item.content_type === 'text' ? 'gray' :
            item.content_type === 'richtext' ? 'blue' :
            item.content_type === 'image' ? 'green' :
            item.content_type === 'json' ? 'purple' :
            'orange'
          }>
            {item.content_type}
          </Badge>
        </HStack>

        <Divider />

        <Box>
          <Text fontSize="sm" color="gray.500" mb={2}>Value</Text>
          {item.content_type === 'json' ? (
            <Code p={4} borderRadius="md" display="block" whiteSpace="pre-wrap" fontSize="sm" bg="gray.50">
              {JSON.stringify(item.content_json, null, 2)}
            </Code>
          ) : (
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontFamily="mono" fontSize="sm" whiteSpace="pre-wrap">
                {item.content || item.content_number || '(empty)'}
              </Text>
            </Box>
          )}
        </Box>

        <Divider />

        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.500">Display Order</Text>
          <Text>{item.display_order}</Text>
        </HStack>

        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.500">Status</Text>
          <Badge colorScheme={item.is_active ? 'green' : 'red'}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </HStack>

        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.500">Last Updated</Text>
          <Text fontSize="sm">{new Date(item.updated_at).toLocaleString()}</Text>
        </HStack>
      </VStack>
    </Box>
  );
}
