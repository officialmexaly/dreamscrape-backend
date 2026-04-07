'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Card,
  CardBody,
  IconButton,
  SimpleGrid,
  useToast,
  Badge
} from '@chakra-ui/react';
import { Save, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { useSiteContent } from '../providers/SiteContentProvider';

export function SiteContentPage() {
  const { siteContent, setSiteContent, refreshContent, isLoading } = useSiteContent();
  const [content, setContent] = useState(siteContent);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setContent(siteContent);
  }, [siteContent]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert content to update format
      const updates: any[] = [];

      // Flatten the content structure into updates
      Object.entries(content).forEach(([page, sections]: [string, any]) => {
        Object.entries(sections).forEach(([section, data]: [string, any]) => {
          Object.entries(data).forEach(([key, item]: [string, any]) => {
            if (key === 'id') return; // Skip id fields

            const content_type = typeof item === 'object' ? 'json' : 'text';
            updates.push({
              page,
              section,
              content_key: key,
              content_type,
              content: content_type === 'text' ? item : undefined,
              content_json: content_type === 'json' ? item : undefined
            });
          });
        });
      });

      const res = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save content');
      }

      await refreshContent();
      toast({
        title: 'Content saved successfully',
        status: 'success',
        duration: 2000
      });
    } catch (error: any) {
      toast({ title: error?.message || 'Failed to save content', status: 'error', duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (page: string, section: string, key: string, value: any) => {
    setContent({
      ...content,
      [page]: {
        ...content[page],
        [section]: {
          ...content[page][section],
          [key]: value
        }
      }
    });
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
        <Text fontSize="2xl" fontFamily="heading" fontWeight="bold" color="brand.dark">
          Site Content
        </Text>
        <Button
          leftIcon={<Save size={18} />}
          colorScheme="brand"
          onClick={handleSave}
          isLoading={isSaving}
          loadingText="Saving...">
          Save All Changes
        </Button>
      </Flex>

      <Box bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
        <Tabs colorScheme="brand" size="lg">
          <TabList px={4} pt={2} borderBottom="1px solid" borderColor="gray.100">
            <Tab fontWeight="500">Home</Tab>
            <Tab fontWeight="500">About</Tab>
            <Tab fontWeight="500">Services</Tab>
            <Tab fontWeight="500">Contact</Tab>
          </TabList>

          <TabPanels>
            {/* HOME PAGE */}
            <TabPanel p={6}>
              <VStack spacing={8} align="stretch">
                {/* Hero Slides */}
                <Box>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Text fontSize="lg" fontWeight="bold" color="brand.dark">
                      Hero Slideshow
                    </Text>
                    <Badge colorScheme="green">Edit slides below</Badge>
                  </Flex>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    {(content.home?.hero?.slides || []).map((slide: any, idx: number) => (
                      <Card key={slide.id || idx} variant="outline">
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            <Text fontSize="sm" color="gray.500" fontWeight="medium">
                              Slide {idx + 1}
                            </Text>
                            <FormControl>
                              <FormLabel fontSize="sm">Headline</FormLabel>
                              <Input
                                value={slide.headline || ''}
                                onChange={(e) => {
                                  const slides = [...content.home.hero.slides];
                                  slides[idx] = { ...slides[idx], headline: e.target.value };
                                  updateField('home', 'hero', 'slides', slides);
                                }}
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm">Subheadline</FormLabel>
                              <Input
                                value={slide.subheadline || ''}
                                onChange={(e) => {
                                  const slides = [...content.home.hero.slides];
                                  slides[idx] = { ...slides[idx], subheadline: e.target.value };
                                  updateField('home', 'hero', 'slides', slides);
                                }}
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm">Image URL</FormLabel>
                              <Input
                                value={slide.image || ''}
                                onChange={(e) => {
                                  const slides = [...content.home.hero.slides];
                                  slides[idx] = { ...slides[idx], image: e.target.value };
                                  updateField('home', 'hero', 'slides', slides);
                                }}
                              />
                            </FormControl>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Box>

                {/* Brand Intro */}
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="brand.dark" mb={4}>
                    Brand Introduction
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <FormControl>
                      <FormLabel>Label</FormLabel>
                      <Input
                        value={content.home?.brandIntro?.label || ''}
                        onChange={(e) => updateField('home', 'brandIntro', 'label', e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Headline</FormLabel>
                      <Input
                        value={content.home?.brandIntro?.headline || ''}
                        onChange={(e) => updateField('home', 'brandIntro', 'headline', e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Paragraph 1</FormLabel>
                      <Textarea
                        value={content.home?.brandIntro?.paragraph1 || ''}
                        onChange={(e) => updateField('home', 'brandIntro', 'paragraph1', e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Paragraph 2</FormLabel>
                      <Textarea
                        value={content.home?.brandIntro?.paragraph2 || ''}
                        onChange={(e) => updateField('home', 'brandIntro', 'paragraph2', e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Location Note</FormLabel>
                      <Input
                        value={content.home?.brandIntro?.locationNote || ''}
                        onChange={(e) => updateField('home', 'brandIntro', 'locationNote', e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Image URL</FormLabel>
                      <Input
                        value={content.home?.brandIntro?.image || ''}
                        onChange={(e) => updateField('home', 'brandIntro', 'image', e.target.value)}
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>

                {/* Statistics */}
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="brand.dark" mb={4}>
                    Statistics
                  </Text>
                  <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                    {(content.home?.statistics?.stats || []).map((stat: any, idx: number) => (
                      <VStack key={idx} spacing={2} align="stretch">
                        <FormControl>
                          <FormLabel fontSize="sm">Value</FormLabel>
                          <Input
                            value={stat?.value || ''}
                            onChange={(e) => {
                              const stats = [...content.home.statistics.stats];
                              stats[idx] = { ...stats[idx], value: e.target.value };
                              updateField('home', 'statistics', 'stats', stats);
                            }}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm">Label</FormLabel>
                          <Input
                            value={stat?.label || ''}
                            onChange={(e) => {
                              const stats = [...content.home.statistics.stats];
                              stats[idx] = { ...stats[idx], label: e.target.value };
                              updateField('home', 'statistics', 'stats', stats);
                            }}
                          />
                        </FormControl>
                      </VStack>
                    ))}
                  </SimpleGrid>
                </Box>
              </VStack>
            </TabPanel>

            {/* ABOUT PAGE */}
            <TabPanel p={6}>
              <VStack spacing={6} align="stretch" maxW="3xl">
                <Text fontSize="lg" fontWeight="bold" color="brand.dark">
                  About Page Content
                </Text>

                <FormControl>
                  <FormLabel>Hero Headline</FormLabel>
                  <Input
                    value={content.about?.hero?.headline || ''}
                    onChange={(e) => updateField('about', 'hero', 'headline', e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Hero Subheadline</FormLabel>
                  <Input
                    value={content.about?.hero?.subheadline || ''}
                    onChange={(e) => updateField('about', 'hero', 'subheadline', e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Story Title</FormLabel>
                  <Input
                    value={content.about?.story?.title || ''}
                    onChange={(e) => updateField('about', 'story', 'title', e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Story Content</FormLabel>
                  <Textarea
                    rows={6}
                    value={content.about?.story?.content || ''}
                    onChange={(e) => updateField('about', 'story', 'content', e.target.value)}
                  />
                </FormControl>
              </VStack>
            </TabPanel>

            {/* SERVICES PAGE */}
            <TabPanel p={6}>
              <VStack spacing={6} align="stretch" maxW="3xl">
                <Text fontSize="lg" fontWeight="bold" color="brand.dark">
                  Services Page Content
                </Text>

                <FormControl>
                  <FormLabel>Hero Headline</FormLabel>
                  <Input
                    value={content.services?.hero?.headline || ''}
                    onChange={(e) => updateField('services', 'hero', 'headline', e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Hero Subheadline</FormLabel>
                  <Input
                    value={content.services?.hero?.subheadline || ''}
                    onChange={(e) => updateField('services', 'hero', 'subheadline', e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Introduction Title</FormLabel>
                  <Input
                    value={content.services?.introduction?.title || ''}
                    onChange={(e) => updateField('services', 'introduction', 'title', e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Introduction Content</FormLabel>
                  <Textarea
                    rows={6}
                    value={content.services?.introduction?.content || ''}
                    onChange={(e) => updateField('services', 'introduction', 'content', e.target.value)}
                  />
                </FormControl>
              </VStack>
            </TabPanel>

            {/* CONTACT PAGE */}
            <TabPanel p={6}>
              <VStack spacing={6} align="stretch" maxW="3xl">
                <Text fontSize="lg" fontWeight="bold" color="brand.dark">
                  Contact Page Content
                </Text>

                <FormControl>
                  <FormLabel>Hero Headline</FormLabel>
                  <Input
                    value={content.contact?.hero?.headline || ''}
                    onChange={(e) => updateField('contact', 'hero', 'headline', e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Hero Subheadline</FormLabel>
                  <Input
                    value={content.contact?.hero?.subheadline || ''}
                    onChange={(e) => updateField('contact', 'hero', 'subheadline', e.target.value)}
                  />
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                      value={content.contact?.information?.email || ''}
                      onChange={(e) => updateField('contact', 'information', 'email', e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Location</FormLabel>
                    <Input
                      value={content.contact?.information?.location || ''}
                      onChange={(e) => updateField('contact', 'information', 'location', e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Availability</FormLabel>
                    <Input
                      value={content.contact?.information?.availability || ''}
                      onChange={(e) => updateField('contact', 'information', 'availability', e.target.value)}
                    />
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
