'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  Textarea,
  VStack,
  useToast,
  HStack,
  Heading,
  IconButton,
  SimpleGrid,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowLeft, Save, RefreshCw, ImagePlus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MediaPickerModal } from '../components/MediaPickerModal';

export function AboutContentEditor() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Hero
  const [hero, setHero] = useState({
    headline: '',
    subheadline: ''
  });

  // Founder
  const [founder, setFounder] = useState({
    label: '',
    name: '',
    role: '',
    bio1: '',
    bio2: '',
    quote: '',
    image: ''
  });

  // Story
  const [story, setStory] = useState({
    title: '',
    content: ''
  });

  // Philosophy
  const [philosophy, setPhilosophy] = useState({
    title: '',
    content: ''
  });

  // Team
  const [team, setTeam] = useState({
    title: '',
    description: ''
  });

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/site-content?page=about', { cache: 'no-store' });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to load content');

      const data = json.grouped || {};

      // Parse hero
      if (data.about_hero) {
        setHero({
          headline: data.about_hero.headline?.value || '',
          subheadline: data.about_hero.subheadline?.value || ''
        });
      }

      // Parse founder
      if (data.about_founder) {
        setFounder({
          label: data.about_founder.label?.value || '',
          name: data.about_founder.name?.value || '',
          role: data.about_founder.role?.value || '',
          bio1: data.about_founder.bio1?.value || '',
          bio2: data.about_founder.bio2?.value || '',
          quote: data.about_founder.quote?.value || '',
          image: data.about_founder.image?.value || ''
        });
      }

      // Parse story
      if (data.about_story) {
        setStory({
          title: data.about_story.title?.value || '',
          content: data.about_story.content?.value || ''
        });
      }

      // Parse philosophy
      if (data.about_philosophy) {
        setPhilosophy({
          title: data.about_philosophy.title?.value || '',
          content: data.about_philosophy.content?.value || ''
        });
      }

      // Parse team
      if (data.about_team) {
        setTeam({
          title: data.about_team.title?.value || '',
          description: data.about_team.description?.value || ''
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
        { page: 'about', section: 'hero', content_key: 'headline', content_type: 'text', content: hero.headline },
        { page: 'about', section: 'hero', content_key: 'subheadline', content_type: 'text', content: hero.subheadline },

        // Founder
        { page: 'about', section: 'founder', content_key: 'label', content_type: 'text', content: founder.label },
        { page: 'about', section: 'founder', content_key: 'name', content_type: 'text', content: founder.name },
        { page: 'about', section: 'founder', content_key: 'role', content_type: 'text', content: founder.role },
        { page: 'about', section: 'founder', content_key: 'bio1', content_type: 'richtext', content: founder.bio1 },
        { page: 'about', section: 'founder', content_key: 'bio2', content_type: 'richtext', content: founder.bio2 },
        { page: 'about', section: 'founder', content_key: 'quote', content_type: 'text', content: founder.quote },
        { page: 'about', section: 'founder', content_key: 'image', content_type: 'image', content: founder.image },

        // Story
        { page: 'about', section: 'story', content_key: 'title', content_type: 'text', content: story.title },
        { page: 'about', section: 'story', content_key: 'content', content_type: 'richtext', content: story.content },

        // Philosophy
        { page: 'about', section: 'philosophy', content_key: 'title', content_type: 'text', content: philosophy.title },
        { page: 'about', section: 'philosophy', content_key: 'content', content_type: 'richtext', content: philosophy.content },

        // Team
        { page: 'about', section: 'team', content_key: 'title', content_type: 'text', content: team.title },
        { page: 'about', section: 'team', content_key: 'description', content_type: 'text', content: team.description },
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
      const res = await fetch(`/api/site-content?page=about&section=${section}`, {
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
        case 'founder':
          setFounder({ label: '', name: '', role: '', bio1: '', bio2: '', quote: '', image: '' });
          break;
        case 'story':
          setStory({ title: '', content: '' });
          break;
        case 'philosophy':
          setPhilosophy({ title: '', content: '' });
          break;
        case 'team':
          setTeam({ title: '', description: '' });
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
            About Page Content
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
          <Tab fontWeight="500">Founder</Tab>
          <Tab fontWeight="500">Our Story</Tab>
          <Tab fontWeight="500">Philosophy</Tab>
          <Tab fontWeight="500">Our Team</Tab>
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

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl>
                  <FormLabel>Headline</FormLabel>
                  <Input
                    value={hero.headline}
                    onChange={(e) => setHero({ ...hero, headline: e.target.value })}
                    placeholder="About Dreamscape"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Subheadline</FormLabel>
                  <Input
                    value={hero.subheadline}
                    onChange={(e) => setHero({ ...hero, subheadline: e.target.value })}
                    placeholder="Creating unforgettable moments since 2015"
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </TabPanel>

          {/* Founder */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Flex justify="space-between" align="center">
                <Heading size="md" color="brand.dark">Founder Section</Heading>
                <Button
                  leftIcon={<Trash2 size={14} />}
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  onClick={() => handleDeleteSection('founder')}
                >
                  Delete Section
                </Button>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl>
                  <FormLabel>Label</FormLabel>
                  <Input
                    value={founder.label}
                    onChange={(e) => setFounder({ ...founder, label: e.target.value })}
                    placeholder="Meet The Executive Planner"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={founder.name}
                    onChange={(e) => setFounder({ ...founder, name: e.target.value })}
                    placeholder="Oseremen Ohiku"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Role</FormLabel>
                  <Input
                    value={founder.role}
                    onChange={(e) => setFounder({ ...founder, role: e.target.value })}
                    placeholder="Founder & Executive Planner"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Image</FormLabel>
                  <InputGroup>
                    <Input
                      value={founder.image}
                      onChange={(e) => setFounder({ ...founder, image: e.target.value })}
                      placeholder="https://..."
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label="Select image"
                        icon={<ImagePlus size={16} />}
                        size="sm"
                        variant="ghost"
                        onClick={onOpen}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Bio Paragraph 1</FormLabel>
                <Textarea
                  value={founder.bio1}
                  onChange={(e) => setFounder({ ...founder, bio1: e.target.value })}
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Bio Paragraph 2</FormLabel>
                <Textarea
                  value={founder.bio2}
                  onChange={(e) => setFounder({ ...founder, bio2: e.target.value })}
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Quote</FormLabel>
                <Textarea
                  value={founder.quote}
                  onChange={(e) => setFounder({ ...founder, quote: e.target.value })}
                  rows={2}
                />
              </FormControl>

            </VStack>
          </TabPanel>

          {/* Story */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Flex justify="space-between" align="center">
                <Heading size="md" color="brand.dark">Our Story</Heading>
                <Button
                  leftIcon={<Trash2 size={14} />}
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  onClick={() => handleDeleteSection('story')}
                >
                  Delete Section
                </Button>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl>
                  <FormLabel>Section Title</FormLabel>
                  <Input
                    value={story.title}
                    onChange={(e) => setStory({ ...story, title: e.target.value })}
                    placeholder="Our Story"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Story Content</FormLabel>
                <Textarea
                  value={story.content}
                  onChange={(e) => setStory({ ...story, content: e.target.value })}
                  placeholder="Dreamscape Curated Events was founded on the belief..."
                  rows={8}
                />
              </FormControl>
            </VStack>
          </TabPanel>

          {/* Philosophy */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Flex justify="space-between" align="center">
                <Heading size="md" color="brand.dark">Our Philosophy</Heading>
                <Button
                  leftIcon={<Trash2 size={14} />}
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  onClick={() => handleDeleteSection('philosophy')}
                >
                  Delete Section
                </Button>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl>
                  <FormLabel>Section Title</FormLabel>
                  <Input
                    value={philosophy.title}
                    onChange={(e) => setPhilosophy({ ...philosophy, title: e.target.value })}
                    placeholder="Our Philosophy"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Philosophy Content</FormLabel>
                <Textarea
                  value={philosophy.content}
                  onChange={(e) => setPhilosophy({ ...philosophy, content: e.target.value })}
                  placeholder="We believe that great events are built on intentional design..."
                  rows={8}
                />
              </FormControl>
            </VStack>
          </TabPanel>

          {/* Team */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Flex justify="space-between" align="center">
                <Heading size="md" color="brand.dark">Our Team</Heading>
                <Button
                  leftIcon={<Trash2 size={14} />}
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  onClick={() => handleDeleteSection('team')}
                >
                  Delete Section
                </Button>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl>
                  <FormLabel>Section Title</FormLabel>
                  <Input
                    value={team.title}
                    onChange={(e) => setTeam({ ...team, title: e.target.value })}
                    placeholder="Our Team"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Team Description</FormLabel>
                <Textarea
                  value={team.description}
                  onChange={(e) => setTeam({ ...team, description: e.target.value })}
                  placeholder="A passionate group of designers, planners, and coordinators..."
                  rows={4}
                />
              </FormControl>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <MediaPickerModal
        isOpen={isOpen}
        onClose={onClose}
        onSelect={(url) => setFounder({ ...founder, image: url })}
      />
    </Box>
  );
}
