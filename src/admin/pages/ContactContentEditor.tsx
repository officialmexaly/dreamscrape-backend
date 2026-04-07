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
  VStack,
  useToast,
  HStack,
  Heading,
  SimpleGrid,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { ArrowLeft, Save, RefreshCw, Mail, MapPin, Globe, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ContactContentEditor() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Hero
  const [hero, setHero] = useState({
    headline: '',
    subheadline: ''
  });

  // Information
  const [information, setInformation] = useState({
    title: '',
    email: '',
    location: '',
    availability: ''
  });

  // Form
  const [form, setForm] = useState({
    title: '',
    submitButton: ''
  });

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/site-content?page=contact', { cache: 'no-store' });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to load content');

      const data = json.grouped || {};

      // Parse hero
      if (data.contact_hero) {
        setHero({
          headline: data.contact_hero.headline?.value || '',
          subheadline: data.contact_hero.subheadline?.value || ''
        });
      }

      // Parse information
      if (data.contact_information) {
        setInformation({
          title: data.contact_information.title?.value || '',
          email: data.contact_information.email?.value || '',
          location: data.contact_information.location?.value || '',
          availability: data.contact_information.availability?.value || ''
        });
      }

      // Parse form
      if (data.contact_form) {
        setForm({
          title: data.contact_form.title?.value || '',
          submitButton: data.contact_form.submitButton?.value || ''
        });
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
        // Hero
        { page: 'contact', section: 'hero', content_key: 'headline', content_type: 'text', content: hero.headline },
        { page: 'contact', section: 'hero', content_key: 'subheadline', content_type: 'text', content: hero.subheadline },

        // Information
        { page: 'contact', section: 'information', content_key: 'title', content_type: 'text', content: information.title },
        { page: 'contact', section: 'information', content_key: 'email', content_type: 'text', content: information.email },
        { page: 'contact', section: 'information', content_key: 'location', content_type: 'text', content: information.location },
        { page: 'contact', section: 'information', content_key: 'availability', content_type: 'text', content: information.availability },

        // Form
        { page: 'contact', section: 'form', content_key: 'title', content_type: 'text', content: form.title },
        { page: 'contact', section: 'form', content_key: 'submitButton', content_type: 'text', content: form.submitButton },
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

  const handleDeleteSection = async (section: string) => {
    if (!confirm(`Are you sure you want to delete all content in the ${section} section?`)) return;

    try {
      const res = await fetch(`/api/site-content?page=contact&section=${section}`, {
        method: 'GET',
      });

      if (!res.ok) throw new Error('Failed to fetch content');

      const json = await res.json();
      const items = json.items || [];

      if (items.length === 0) {
        toast({ title: 'No content to delete', status: 'info', duration: 2000 });
        return;
      }

      const ids = items.map((item: any) => item.id);

      const deleteRes = await fetch('/api/site-content', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      if (!deleteRes.ok) {
        const error = await deleteRes.json();
        throw new Error(error.error || 'Failed to delete content');
      }

      toast({ title: 'Section deleted successfully!', status: 'success', duration: 2000 });
      await fetchContent();

      // Clear the relevant state
      switch (section) {
        case 'hero':
          setHero({ headline: '', subheadline: '' });
          break;
        case 'information':
          setInformation({ title: '', email: '', location: '', availability: '' });
          break;
        case 'form':
          setForm({ title: '', submitButton: '' });
          break;
      }
    } catch (error: any) {
      toast({ title: error.message || 'Failed to delete', status: 'error', duration: 3000 });
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

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Flex align="center" gap={3}>
          <Button leftIcon={<ArrowLeft size={16} />} variant="ghost" onClick={() => router.push('/admin/content')}>
            Back
          </Button>
          <Text fontSize="2xl" fontFamily="heading" fontWeight="bold" color="brand.dark">
            Contact Page Content
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
          <Tab fontWeight="500">Contact Information</Tab>
          <Tab fontWeight="500">Contact Form</Tab>
        </TabList>

        <TabPanels>
          {/* Hero */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Flex justify="space-between" align="center">
                <Heading size="md" color="brand.dark">Hero Section</Heading>
                <Button
                  leftIcon={<Trash2 size={14} />}
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  onClick={() => handleDeleteSection('hero')}
                >
                  Delete Section
                </Button>
              </Flex>

              <FormControl>
                <FormLabel>Headline</FormLabel>
                <Input
                  value={hero.headline}
                  onChange={(e) => setHero({ ...hero, headline: e.target.value })}
                  placeholder="Get in Touch"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Subheadline</FormLabel>
                <Input
                  value={hero.subheadline}
                  onChange={(e) => setHero({ ...hero, subheadline: e.target.value })}
                  placeholder="Let's create something extraordinary together"
                />
              </FormControl>
            </VStack>
          </TabPanel>

          {/* Contact Information */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Flex justify="space-between" align="center">
                <Heading size="md" color="brand.dark">Contact Information</Heading>
                <Button
                  leftIcon={<Trash2 size={14} />}
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  onClick={() => handleDeleteSection('information')}
                >
                  Delete Section
                </Button>
              </Flex>

              <FormControl>
                <FormLabel>Section Title</FormLabel>
                <Input
                  value={information.title}
                  onChange={(e) => setInformation({ ...information, title: e.target.value })}
                  placeholder="Contact Information"
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl>
                  <HStack spacing={3}>
                    <Mail size={18} className="text-brand-purple" />
                    <FormLabel mb="0">Email Address</FormLabel>
                  </HStack>
                  <Input
                    value={information.email}
                    onChange={(e) => setInformation({ ...information, email: e.target.value })}
                    placeholder="dreamscapeventts@gmail.com"
                  />
                </FormControl>

                <FormControl>
                  <HStack spacing={3}>
                    <MapPin size={18} className="text-brand-purple" />
                    <FormLabel mb="0">Location</FormLabel>
                  </HStack>
                  <Input
                    value={information.location}
                    onChange={(e) => setInformation({ ...information, location: e.target.value })}
                    placeholder="Toronto, Canada"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <HStack spacing={3}>
                  <Globe size={18} className="text-brand-purple" />
                  <FormLabel mb="0">Availability</FormLabel>
                </HStack>
                <Input
                  value={information.availability}
                  onChange={(e) => setInformation({ ...information, availability: e.target.value })}
                  placeholder="Available Worldwide"
                />
              </FormControl>
            </VStack>
          </TabPanel>

          {/* Contact Form */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Flex justify="space-between" align="center">
                <Heading size="md" color="brand.dark">Contact Form Settings</Heading>
                <Button
                  leftIcon={<Trash2 size={14} />}
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  onClick={() => handleDeleteSection('form')}
                >
                  Delete Section
                </Button>
              </Flex>

              <FormControl>
                <FormLabel>Form Title</FormLabel>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Send us a message"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Submit Button Text</FormLabel>
                <Input
                  value={form.submitButton}
                  onChange={(e) => setForm({ ...form, submitButton: e.target.value })}
                  placeholder="Send Message"
                />
              </FormControl>

              <Box p={4} bg="brand-light" borderRadius="lg" borderLeft="4px" border="brand-purple">
                <Text fontSize="sm" color="brand-dark">
                  💡 <strong>Tip:</strong> Contact form submissions are managed through the <strong style={{ color: 'brand-purple' }}>Inquiries</strong> section in the admin panel.
                </Text>
              </Box>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
