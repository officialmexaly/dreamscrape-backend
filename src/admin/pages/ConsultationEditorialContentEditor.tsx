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
import { ArrowLeft, Save, RefreshCw, Plus, Trash2, FileText, Image as ImageIcon, Type } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ConsultationOption {
  slug: string;
  title: string;
  image: string;
  description: string;
}

interface HeroContent {
  background_image: string;
  subtitle: string;
  title: string;
}

export function ConsultationEditorialContentEditor() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Hero Content
  const [heroContent, setHeroContent] = useState<HeroContent>({
    background_image: '',
    subtitle: '',
    title: ''
  });

  // Consultation Options
  const [consultationOptions, setConsultationOptions] = useState<ConsultationOption[]>([
    { slug: '', title: '', image: '', description: '' }
  ]);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      // Fetch hero content
      const heroRes = await fetch('/api/site-content?page=consultation_editorial&section=hero', { cache: 'no-store' });
      const heroJson = await heroRes.json();

      if (heroRes.ok) {
        const heroData = heroJson.grouped?.consultation_editorial_hero || {};
        const hero = heroData.content?.value || {};
        if (Object.keys(hero).length > 0) {
          setHeroContent(hero);
        }
      }

      // Fetch consultation options
      const optionsRes = await fetch('/api/site-content?page=consultation_editorial&section=options', { cache: 'no-store' });
      const optionsJson = await optionsRes.json();

      if (optionsRes.ok) {
        const optionsData = optionsJson.grouped?.consultation_editorial_options || {};
        const options = optionsData.options?.value || [];
        if (options.length > 0) {
          setConsultationOptions(options);
        }
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
        // Hero content
        {
          page: 'consultation_editorial',
          section: 'hero',
          content_key: 'content',
          content_type: 'json',
          content_json: heroContent
        },
        // Consultation options
        {
          page: 'consultation_editorial',
          section: 'options',
          content_key: 'options',
          content_type: 'json',
          content_json: consultationOptions.filter(o => o.slug.trim() !== '' || o.title.trim() !== '')
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

  const addOption = () => {
    setConsultationOptions([...consultationOptions, { slug: '', title: '', image: '', description: '' }]);
  };

  const removeOption = (index: number) => {
    if (consultationOptions.length > 1) {
      setConsultationOptions(consultationOptions.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, field: keyof ConsultationOption, value: string) => {
    const newOptions = [...consultationOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setConsultationOptions(newOptions);
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
            Consultation Editorial Page Content
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
          <Tab fontWeight="500">Hero Section</Tab>
          <Tab fontWeight="500">Consultation Options</Tab>
        </TabList>

        <TabPanels>
          {/* Hero Section */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Heading size="md" color="brand.dark">Hero Section</Heading>

              <FormControl>
                <HStack spacing={3}>
                  <ImageIcon size={18} className="text-brand-purple" />
                  <FormLabel mb="0">Background Image URL</FormLabel>
                </HStack>
                <Input
                  value={heroContent.background_image}
                  onChange={(e) => setHeroContent({ ...heroContent, background_image: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </FormControl>

              <FormControl>
                <HStack spacing={3}>
                  <Type size={18} className="text-brand-purple" />
                  <FormLabel mb="0">Subtitle</FormLabel>
                </HStack>
                <Input
                  value={heroContent.subtitle}
                  onChange={(e) => setHeroContent({ ...heroContent, subtitle: e.target.value })}
                  placeholder="Dreamscape Curated Events"
                />
              </FormControl>

              <FormControl>
                <HStack spacing={3}>
                  <FileText size={18} className="text-brand-purple" />
                  <FormLabel mb="0">Title</FormLabel>
                </HStack>
                <Input
                  value={heroContent.title}
                  onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
                  placeholder="Schedule A Consultation"
                />
              </FormControl>
            </VStack>
          </TabPanel>

          {/* Consultation Options */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Flex justify="space-between" align="center">
                <Heading size="md" color="brand.dark">Consultation Options</Heading>
                <Button leftIcon={<Plus size={16} />} colorScheme="brand" size="sm" onClick={addOption}>
                  Add Option
                </Button>
              </Flex>

              <Box p={4} bg="cyan.50" borderRadius="lg" borderLeft="4px" border="cyan.400">
                <Text fontSize="sm" color="gray.700">
                  💡 <strong>Tip:</strong> Add consultation type options with images and descriptions. The slug should match the consultation page service parameter.
                </Text>
              </Box>

              <VStack spacing={4}>
                {consultationOptions.map((option, index) => (
                  <Box key={index} p={4} border="1px solid" borderColor="gray.200" borderRadius="lg" w="full">
                    <Flex justify="space-between" align="center" mb={3}>
                      <HStack spacing={3}>
                        <FileText size={18} className="text-brand-purple" />
                        <Text fontWeight="medium" color="brand.dark">
                          Option {index + 1}
                        </Text>
                      </HStack>
                      <IconButton
                        icon={<Trash2 size={16} />}
                        aria-label="Remove option"
                        colorScheme="red"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        isDisabled={consultationOptions.length === 1}
                      />
                    </Flex>

                    <VStack spacing={3}>
                      <FormControl>
                        <FormLabel>Slug</FormLabel>
                        <Input
                          value={option.slug}
                          onChange={(e) => updateOption(index, 'slug', e.target.value)}
                          placeholder="wedding-destination-social"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Title</FormLabel>
                        <Input
                          value={option.title}
                          onChange={(e) => updateOption(index, 'title', e.target.value)}
                          placeholder="Wedding / Destination Planning"
                        />
                      </FormControl>

                      <FormControl>
                        <HStack spacing={3}>
                          <ImageIcon size={18} className="text-brand-purple" />
                          <FormLabel mb="0">Image URL</FormLabel>
                        </HStack>
                        <Input
                          value={option.image}
                          onChange={(e) => updateOption(index, 'image', e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          value={option.description}
                          onChange={(e) => updateOption(index, 'description', e.target.value)}
                          placeholder="For couples seeking full planning..."
                          rows={3}
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
