'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Text,
  VStack,
  useToast,
  HStack,
  Heading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  IconButton,
} from '@chakra-ui/react';
import { ArrowLeft, Save, RefreshCw, Plus, Trash2, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Testimonial {
  name: string;
  quote: string;
  img: string;
}

export function LoveNotesContentEditor() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Testimonials
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    { name: '', quote: '', img: '' }
  ]);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/site-content?page=love_notes&section=testimonials', { cache: 'no-store' });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to load content');

      const data = json.grouped?.love_notes_testimonials || {};
      const testimonialsData = data.items?.value || [];

      if (testimonialsData.length > 0) {
        setTestimonials(testimonialsData);
      }
    } catch (error: any) {
      toast({ title: 'Failed to load content', description: error.message, status: 'error', duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = [
        {
          page: 'love_notes',
          section: 'testimonials',
          content_key: 'items',
          content_type: 'json',
          content_json: testimonials.filter(t => t.name.trim() !== '' || t.quote.trim() !== '')
        },
      ];

      const res = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save content');
      }

      toast({ title: 'Content saved successfully!', status: 'success', duration: 2000 });
      await fetchContent();
    } catch (error: any) {
      toast({ title: error.message || 'Failed to save', status: 'error', duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  const addTestimonial = () => {
    setTestimonials([...testimonials, { name: '', quote: '', img: '' }]);
  };

  const removeTestimonial = (index: number) => {
    if (testimonials.length > 1) {
      setTestimonials(testimonials.filter((_, i) => i !== index));
    }
  };

  const updateTestimonial = (index: number, field: keyof Testimonial, value: string) => {
    const newTestimonials = [...testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    setTestimonials(newTestimonials);
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
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Flex align="center" gap={3}>
          <Button leftIcon={<ArrowLeft size={16} />} variant="ghost" onClick={() => router.push('/admin/content')}>
            Back
          </Button>
          <Text fontSize="2xl" fontFamily="heading" fontWeight="bold" color="brand.dark">
            Love Notes Page Content
          </Text>
        </Flex>
        <HStack spacing={3}>
          <Button leftIcon={<RefreshCw size={16} />} variant="outline" onClick={fetchContent} isLoading={isLoading}>
            Refresh
          </Button>
          <Button leftIcon={<Save size={18} />} colorScheme="brand" onClick={handleSave} isLoading={isSaving}>
            Save All Changes
          </Button>
        </HStack>
      </Flex>

      <Tabs colorScheme="brand" size="lg">
        <TabList px={4} pt={2} borderBottom="1px solid" borderColor="gray.100">
          <Tab fontWeight="500">Testimonials</Tab>
        </TabList>

        <TabPanels>
          {/* Testimonials */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Flex justify="space-between" align="center">
                <Heading size="md" color="brand.dark">Client Testimonials</Heading>
                <Button leftIcon={<Plus size={16} />} colorScheme="brand" size="sm" onClick={addTestimonial}>
                  Add Testimonial
                </Button>
              </Flex>

              <Box p={4} bg="pink.50" borderRadius="lg" borderLeft="4px" border="pink.400">
                <Text fontSize="sm" color="gray.700">
                  💡 <strong>Tip:</strong> Add authentic client testimonials to build trust. Use professional photos (recommended: square format).
                </Text>
              </Box>

              <VStack spacing={4}>
                {testimonials.map((testimonial, index) => (
                  <Box key={index} p={4} border="1px solid" borderColor="gray.200" borderRadius="lg" w="full">
                    <Flex justify="space-between" align="center" mb={3}>
                      <HStack spacing={3}>
                        <MessageCircle size={18} className="text-brand-pink" />
                        <Text fontWeight="medium" color="brand.dark">
                          Testimonial {index + 1}
                        </Text>
                      </HStack>
                      <IconButton
                        icon={<Trash2 size={16} />}
                        aria-label="Remove testimonial"
                        colorScheme="red"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTestimonial(index)}
                        isDisabled={testimonials.length === 1}
                      />
                    </Flex>

                    <VStack spacing={3}>
                      <FormControl>
                        <FormLabel>Client Name</FormLabel>
                        <Input
                          value={testimonial.name}
                          onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                          placeholder="Nneoma Achioso"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Testimonial Quote</FormLabel>
                        <Textarea
                          value={testimonial.quote}
                          onChange={(e) => updateTestimonial(index, 'quote', e.target.value)}
                          placeholder="Dreamscape truly made my dream birthday come true…"
                          rows={3}
                        />
                      </FormControl>

                      <FormControl>
                        <HStack spacing={3}>
                          <ImageIcon size={18} className="text-brand-purple" />
                          <FormLabel mb="0">Client Photo URL</FormLabel>
                        </HStack>
                        <Input
                          value={testimonial.img}
                          onChange={(e) => updateTestimonial(index, 'img', e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                        />
                      </FormControl>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
