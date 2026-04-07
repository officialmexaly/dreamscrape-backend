'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Image,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useMedia } from '@/src/admin/providers/MediaProvider';

export default function EditMediaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const toast = useToast();
  const { media, updateMedia } = useMedia();

  const existing = useMemo(() => media.find((m: any) => m.id === params.id), [media, params.id]);
  const [filename, setFilename] = useState(() => existing?.name || '');

  if (!existing) {
    return (
      <Box>
        <Text>Media item not found.</Text>
        <Button mt={4} onClick={() => router.push('/admin/media')}>
          Back to Media Library
        </Button>
      </Box>
    );
  }

  const handleSave = async () => {
    if (!filename) {
      toast({ title: 'Filename is required', status: 'error', duration: 2000 });
      return;
    }

    // Preserve file extension
    const currentExt = existing.name.split('.').pop();
    const newFilename = filename.includes('.') ? filename : `${filename}.${currentExt}`;

    try {
      await updateMedia(existing.id, {
        name: newFilename,
        url: `/media/${newFilename}`,
        type: existing.type,
        mime_type: existing.mime_type,
        size: existing.size_bytes,
      });
      toast({ title: 'File renamed successfully', status: 'success', duration: 2000 });
      router.push('/admin/media');
    } catch (error: any) {
      toast({ title: error?.message || 'Failed to rename file', status: 'error', duration: 2500 });
    }
  };

  return (
    <Box maxW="800px">
      <Flex justify="space-between" align="center" mb={6}>
        <Flex align="center" gap={3}>
          <Button leftIcon={<ArrowLeft size={16} />} variant="ghost" onClick={() => router.push('/admin/media')}>
            Back
          </Button>
          <Text fontSize="2xl" fontFamily="heading" fontWeight="bold" color="brand.dark">
            Edit Media
          </Text>
        </Flex>
        <Button leftIcon={<Save size={16} />} colorScheme="brand" onClick={handleSave}>
          Save
        </Button>
      </Flex>

      <VStack spacing={6} align="stretch">
        {/* Preview */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
            Preview
          </Text>
          <Image
            src={existing.url}
            alt={existing.name}
            maxW="400px"
            maxH="300px"
            objectFit="contain"
            borderRadius="md"
            bg="gray.100"
          />
        </Box>

        {/* File Info */}
        <Box bg="gray.50" borderRadius="lg" p={4}>
          <VStack align="start" spacing={2}>
            <Text fontSize="sm">
              <Text as="span" fontWeight="medium">Current filename:</Text> {existing.name}
            </Text>
            <Text fontSize="sm">
              <Text as="span" fontWeight="medium">Size:</Text> {existing.size}
            </Text>
            <Text fontSize="sm">
              <Text as="span" fontWeight="medium">Type:</Text> {existing.mime_type || 'Unknown'}
            </Text>
            <Text fontSize="sm">
              <Text as="span" fontWeight="medium">URL:</Text> {existing.url}
            </Text>
          </VStack>
        </Box>

        {/* Rename Form */}
        <FormControl isRequired>
          <FormLabel>Rename File</FormLabel>
          <Input
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Enter new filename (without extension)"
          />
          <Text fontSize="xs" color="gray.500" mt={1}>
            The file extension will be preserved automatically
          </Text>
        </FormControl>
      </VStack>
    </Box>
  );
}
