'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
  VStack,
  Progress
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useMedia } from '@/src/admin/providers/MediaProvider';

export default function NewMediaPage() {
  const router = useRouter();
  const toast = useToast();
  const { refresh } = useMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: 'Please select a file', status: 'error', duration: 2000 });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/admin/media-library', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload file');
      }

      toast({ title: 'File uploaded successfully', status: 'success', duration: 2000 });
      await refresh();

      // Reset form
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Redirect back to media library after a short delay
      setTimeout(() => {
        router.push('/admin/media');
      }, 500);
    } catch (error: any) {
      toast({ title: error?.message || 'Failed to upload file', status: 'error', duration: 2500 });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
            Upload Media
          </Text>
        </Flex>
        <Button
          leftIcon={<Upload size={16} />}
          colorScheme="brand"
          onClick={handleUpload}
          isLoading={isUploading}
          isDisabled={!selectedFile}
        >
          Upload
        </Button>
      </Flex>

      <VStack spacing={6} align="stretch">
        {/* File Upload Area */}
        <Box
          border="2px dashed"
          borderColor="gray.300"
          borderRadius="lg"
          p={8}
          textAlign="center"
          cursor="pointer"
          onClick={() => fileInputRef.current?.click()}
          _hover={{ borderColor: 'brand.primary', bg: 'gray.50' }}
          transition="all 0.2s"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.mp4,.webm"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <Upload size={48} color="gray.400" style={{ margin: '0 auto 16px' }} />
          <Text color="gray.600" fontSize="lg" fontWeight="medium">
            {selectedFile ? selectedFile.name : 'Click to select a file'}
          </Text>
          <Text color="gray.500" fontSize="sm" mt={2}>
            Supports: Images (JPG, PNG, GIF, WebP), PDF, Videos (MP4, WebM)
          </Text>
        </Box>

        {/* Selected File Info */}
        {selectedFile && (
          <Box bg="gray.50" borderRadius="lg" p={4}>
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">{selectedFile.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Unknown type'}
                </Text>
              </VStack>
              <Button
                leftIcon={<X size={16} />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={handleRemoveFile}
              >
                Remove
              </Button>
            </Flex>
            {isUploading && (
              <Progress
                value={uploadProgress}
                size="sm"
                colorScheme="brand"
                mt={3}
                hasStripe
                isAnimated
              />
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
}
