'use client';

import React from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  SimpleGrid,
  Image,
  IconButton,
  useToast } from
'@chakra-ui/react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMedia } from '../providers/MediaProvider';
export function MediaPage() {
  const router = useRouter();
  const { media, deleteMedia, isLoading } = useMedia();
  const toast = useToast();
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this media item?')) return;
    await deleteMedia(id);
    toast({
      title: 'Image deleted',
      status: 'info',
      duration: 2000
    });
  };
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Text
          fontSize="2xl"
          fontFamily="heading"
          fontWeight="bold"
          color="brand.dark">
          
          Media Library
        </Text>
        <Button
          leftIcon={<Plus size={18} />}
          colorScheme="brand"
          onClick={() => router.push('/admin/media/new')}>
          
          Add Media
        </Button>
      </Flex>

      <SimpleGrid
        columns={{
          base: 2,
          md: 3,
          lg: 4,
          xl: 5
        }}
        spacing={4}>
        
        {isLoading && (
          <Box>
            <Text color="gray.500">Loading...</Text>
          </Box>
        )}
        {media.map((item) =>
        <Box
          key={item.id}
          position="relative"
          borderRadius="lg"
          overflow="hidden"
          border="1px solid"
          borderColor="gray.200">
          
            <Image
            src={item.url}
            alt={item.name}
            w="full"
            h="200px"
            objectFit="cover" />
          

            <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            opacity={0}
            _hover={{
              opacity: 1
            }}
            transition="opacity 0.2s"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            p={3}>
            
              <Flex justify="flex-end" gap={2}>
                <IconButton
                aria-label="Edit image"
                icon={<Pencil size={16} />}
                size="sm"
                bg="white"
                color="gray.800"
                _hover={{
                  bg: 'gray.100'
                }}
                onClick={() => router.push(`/admin/media/${item.id}/edit`)} />
              
                <IconButton
                aria-label="Delete image"
                icon={<Trash2 size={16} />}
                size="sm"
                colorScheme="red"
                onClick={() => handleDelete(item.id)} />
              
              </Flex>
              <Box color="white">
                <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                  {item.name}
                </Text>
                <Text fontSize="xs">
                  {item.size ? `${item.size}` : '—'} • {new Date(item.created_at || Date.now()).toLocaleDateString()}
                </Text>
              </Box>
            </Box>
          </Box>
        )}
      </SimpleGrid>
    </Box>);

}
