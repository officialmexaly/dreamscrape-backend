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
  SimpleGrid,
  Card,
  CardBody,
  IconButton,
  useToast,
  HStack,
  Heading,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowLeft, Save, Plus, Trash2, RefreshCw, ImagePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MediaPickerModal } from '../components/MediaPickerModal';

type Slide = {
  id: string;
  image: string;
};

type Stat = {
  id: string;
  value: string;
  label: string;
};

type Service = {
  id: string;
  title: string;
  description: string;
};

type FeaturedEvent = {
  id: string;
  title: string;
  location: string;
  image: string;
};

export function HomeContentEditor() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [imageTarget, setImageTarget] = useState<{ type: 'hero' | 'brand' | 'event'; index?: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Hero
  const [slides, setSlides] = useState<Slide[]>([]);
  const [heroText, setHeroText] = useState({
    headline: '',
    subheadline: '',
    description: '',
    bookingNote: ''
  });

  // Brand Intro
  const [brandIntro, setBrandIntro] = useState({
    label: '',
    headline: '',
    paragraph1: '',
    paragraph2: '',
    locationNote: '',
    image: ''
  });

  // Statistics
  const [statistics, setStatistics] = useState<Stat[]>([]);

  // Services Preview
  const [servicesPreview, setServicesPreview] = useState({
    label: '',
    headline: '',
    ctaText: '',
    ctaLink: ''
  });
  const [services, setServices] = useState<Service[]>([]);

  // Featured Events
  const [featuredEvents, setFeaturedEvents] = useState({
    label: '',
    headline: '',
    viewAllText: '',
    viewAllLink: '',
    description: ''
  });
  const [events, setEvents] = useState<FeaturedEvent[]>([]);

  // Why Dreamscape
  const [whyDreamscape, setWhyDreamscape] = useState({
    label: '',
    headline: '',
    features: ['']
  });

  // CTA Section
  const [ctaSection, setCtaSection] = useState({
    headline: '',
    subheadline: '',
    description: '',
    details: ''
  });

  // Newsletter
  const [newsletter, setNewsletter] = useState({
    headline: '',
    buttonText: '',
    disclaimer: ''
  });

  // Footer
  const [footer, setFooter] = useState({
    exploreLinks: [{ label: '', href: '' }],
    companyLinks: [{ label: '', href: '' }],
    connectLinks: [{ label: '', href: '', icon: '' }],
    copyright: ''
  });

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/site-content?page=home', { cache: 'no-store' });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to load content');

      const data = json.grouped || {};

      // Parse slides
      if (data.home_hero?.slides?.value) {
        let rawSlides = data.home_hero.slides.value;
        if (typeof rawSlides === 'string') {
          try {
            rawSlides = JSON.parse(rawSlides);
          } catch {
            rawSlides = [];
          }
        }
        const safeSlides = Array.isArray(rawSlides) ? rawSlides : [];
        const loadedSlides = safeSlides.map((slide: any, index: number) => ({
          id: slide.id || `slide_${index + 1}`,
          image: slide.image || ''
        }));
        setSlides(loadedSlides.length ? loadedSlides : [{
          id: 'slide_1',
          image: ''
        }]);
      } else if (slides.length === 0) {
        // Add a default slide if none exist
        setSlides([{
          id: 'slide_1',
          image: ''
        }]);
      }

      if (data.home_hero) {
        setHeroText({
          headline: data.home_hero.headline?.value || '',
          subheadline: data.home_hero.subheadline?.value || '',
          description: data.home_hero.description?.value || '',
          bookingNote: data.home_hero.bookingNote?.value || ''
        });
      }

      // Parse brand intro
      if (data.home_brandIntro) {
        setBrandIntro({
          label: data.home_brandIntro.label?.value || '',
          headline: data.home_brandIntro.headline?.value || '',
          paragraph1: data.home_brandIntro.paragraph1?.value || '',
          paragraph2: data.home_brandIntro.paragraph2?.value || '',
          locationNote: data.home_brandIntro.locationNote?.value || '',
          image: data.home_brandIntro.image?.value || ''
        });
      }

      // Parse statistics
      if (data.home_statistics?.stats?.value) {
        setStatistics(data.home_statistics.stats.value);
      }

      // Parse services preview
      if (data.home_servicesPreview) {
        setServicesPreview({
          label: data.home_servicesPreview.label?.value || '',
          headline: data.home_servicesPreview.headline?.value || '',
          ctaText: data.home_servicesPreview.ctaText?.value || '',
          ctaLink: data.home_servicesPreview.ctaLink?.value || ''
        });
        if (data.home_servicesPreview.services?.value) {
          setServices(data.home_servicesPreview.services.value);
        }
      }

      // Parse featured events
      if (data.home_featuredEvents) {
        setFeaturedEvents({
          label: data.home_featuredEvents.label?.value || '',
          headline: data.home_featuredEvents.headline?.value || '',
          viewAllText: data.home_featuredEvents.viewAllText?.value || '',
          viewAllLink: data.home_featuredEvents.viewAllLink?.value || '',
          description: data.home_featuredEvents.description?.value || ''
        });
        if (data.home_featuredEvents.events?.value) {
          setEvents(data.home_featuredEvents.events.value);
        }
      }

      // Parse why dreamscape
      if (data.home_whyDreamscape) {
        setWhyDreamscape({
          label: data.home_whyDreamscape.label?.value || '',
          headline: data.home_whyDreamscape.headline?.value || '',
          features: data.home_whyDreamscape.features?.value || ['']
        });
      }

      // Parse CTA section
      if (data.home_cta) {
        setCtaSection({
          headline: data.home_cta.headline?.value || '',
          subheadline: data.home_cta.subheadline?.value || '',
          description: data.home_cta.description?.value || '',
          details: data.home_cta.details?.value || ''
        });
      }

      // Parse newsletter
      if (data.home_newsletter) {
        setNewsletter({
          headline: data.home_newsletter.headline?.value || '',
          buttonText: data.home_newsletter.buttonText?.value || '',
          disclaimer: data.home_newsletter.disclaimer?.value || ''
        });
      }

      // Parse footer
      if (data.home_footer) {
        setFooter({
          exploreLinks: data.home_footer.exploreLinks?.value || [{ label: '', href: '' }],
          companyLinks: data.home_footer.companyLinks?.value || [{ label: '', href: '' }],
          connectLinks: data.home_footer.connectLinks?.value || [{ label: '', href: '', icon: '' }],
          copyright: data.home_footer.copyright?.value || ''
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
        // Slides (only text + image)
        // Hero text
        { page: 'home', section: 'hero', content_key: 'headline', content_type: 'text', content: heroText.headline },
        { page: 'home', section: 'hero', content_key: 'subheadline', content_type: 'text', content: heroText.subheadline },
        { page: 'home', section: 'hero', content_key: 'description', content_type: 'text', content: heroText.description },
        { page: 'home', section: 'hero', content_key: 'bookingNote', content_type: 'text', content: heroText.bookingNote },

        // Slides (images only)
        {
          page: 'home',
          section: 'hero',
          content_key: 'slides',
          content_type: 'json',
          content_json: slides.map((slide) => ({
            id: slide.id,
            image: slide.image
          }))
        },

        // Brand Intro
        { page: 'home', section: 'brandIntro', content_key: 'label', content_type: 'text', content: brandIntro.label },
        { page: 'home', section: 'brandIntro', content_key: 'headline', content_type: 'text', content: brandIntro.headline },
        { page: 'home', section: 'brandIntro', content_key: 'paragraph1', content_type: 'richtext', content: brandIntro.paragraph1 },
        { page: 'home', section: 'brandIntro', content_key: 'paragraph2', content_type: 'richtext', content: brandIntro.paragraph2 },
        { page: 'home', section: 'brandIntro', content_key: 'locationNote', content_type: 'text', content: brandIntro.locationNote },
        { page: 'home', section: 'brandIntro', content_key: 'image', content_type: 'image', content: brandIntro.image },

        // Statistics
        { page: 'home', section: 'statistics', content_key: 'stats', content_type: 'json', content_json: statistics },

        // Services Preview
        { page: 'home', section: 'servicesPreview', content_key: 'label', content_type: 'text', content: servicesPreview.label },
        { page: 'home', section: 'servicesPreview', content_key: 'headline', content_type: 'text', content: servicesPreview.headline },
        { page: 'home', section: 'servicesPreview', content_key: 'services', content_type: 'json', content_json: services },
        { page: 'home', section: 'servicesPreview', content_key: 'ctaText', content_type: 'text', content: servicesPreview.ctaText },
        { page: 'home', section: 'servicesPreview', content_key: 'ctaLink', content_type: 'text', content: servicesPreview.ctaLink },

        // Featured Events
        { page: 'home', section: 'featuredEvents', content_key: 'label', content_type: 'text', content: featuredEvents.label },
        { page: 'home', section: 'featuredEvents', content_key: 'headline', content_type: 'text', content: featuredEvents.headline },
        { page: 'home', section: 'featuredEvents', content_key: 'viewAllText', content_type: 'text', content: featuredEvents.viewAllText },
        { page: 'home', section: 'featuredEvents', content_key: 'viewAllLink', content_type: 'text', content: featuredEvents.viewAllLink },
        { page: 'home', section: 'featuredEvents', content_key: 'description', content_type: 'text', content: featuredEvents.description },
        { page: 'home', section: 'featuredEvents', content_key: 'events', content_type: 'json', content_json: events },

        // Why Dreamscape
        { page: 'home', section: 'whyDreamscape', content_key: 'label', content_type: 'text', content: whyDreamscape.label },
        { page: 'home', section: 'whyDreamscape', content_key: 'headline', content_type: 'text', content: whyDreamscape.headline },
        { page: 'home', section: 'whyDreamscape', content_key: 'features', content_type: 'json', content_json: whyDreamscape.features.filter(f => f.trim() !== '') },

        // CTA Section
        { page: 'home', section: 'cta', content_key: 'headline', content_type: 'text', content: ctaSection.headline },
        { page: 'home', section: 'cta', content_key: 'subheadline', content_type: 'text', content: ctaSection.subheadline },
        { page: 'home', section: 'cta', content_key: 'description', content_type: 'text', content: ctaSection.description },
        { page: 'home', section: 'cta', content_key: 'details', content_type: 'text', content: ctaSection.details },

        // Newsletter
        { page: 'home', section: 'newsletter', content_key: 'headline', content_type: 'text', content: newsletter.headline },
        { page: 'home', section: 'newsletter', content_key: 'buttonText', content_type: 'text', content: newsletter.buttonText },
        { page: 'home', section: 'newsletter', content_key: 'disclaimer', content_type: 'text', content: newsletter.disclaimer },

        // Footer
        { page: 'home', section: 'footer', content_key: 'exploreLinks', content_type: 'json', content_json: footer.exploreLinks },
        { page: 'home', section: 'footer', content_key: 'companyLinks', content_type: 'json', content_json: footer.companyLinks },
        { page: 'home', section: 'footer', content_key: 'connectLinks', content_type: 'json', content_json: footer.connectLinks },
        { page: 'home', section: 'footer', content_key: 'copyright', content_type: 'text', content: footer.copyright },
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

  const addSlide = () => {
    setSlides([...slides, {
      id: `slide_${Date.now()}`,
      image: ''
    }]);
  };

  const updateSlide = (index: number, field: string, value: any) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const openImagePicker = (target: { type: 'hero' | 'brand' | 'event'; index?: number }) => {
    setImageTarget(target);
    onOpen();
  };

  const handleMediaSelect = (url: string) => {
    if (!imageTarget) return;
    if (imageTarget.type === 'hero' && imageTarget.index !== undefined) {
      updateSlide(imageTarget.index, 'image', url);
    }
    if (imageTarget.type === 'brand') {
      setBrandIntro({ ...brandIntro, image: url });
    }
    if (imageTarget.type === 'event' && imageTarget.index !== undefined) {
      updateEvent(imageTarget.index, 'image', url);
    }
    setImageTarget(null);
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 1) {
      toast({ title: 'You must have at least one slide', status: 'error', duration: 2000 });
      return;
    }
    setSlides(slides.filter((_, i) => i !== index));
  };

  const addStat = () => {
    setStatistics([...statistics, {
      id: `stat_${Date.now()}`,
      value: '',
      label: ''
    }]);
  };

  const updateStat = (index: number, field: string, value: string) => {
    const newStats = [...statistics];
    newStats[index] = { ...newStats[index], [field]: value };
    setStatistics(newStats);
  };

  const removeStat = (index: number) => {
    setStatistics(statistics.filter((_, i) => i !== index));
  };

  const addService = () => {
    setServices([...services, {
      id: `service_${Date.now()}`,
      title: '',
      description: ''
    }]);
  };

  const updateService = (index: number, field: string, value: string) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    setServices(newServices);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const addEvent = () => {
    setEvents([...events, {
      id: `event_${Date.now()}`,
      title: '',
      location: '',
      image: ''
    }]);
  };

  const updateEvent = (index: number, field: string, value: string) => {
    const newEvents = [...events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setEvents(newEvents);
  };

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    setWhyDreamscape({ ...whyDreamscape, features: [...whyDreamscape.features, ''] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...whyDreamscape.features];
    newFeatures[index] = value;
    setWhyDreamscape({ ...whyDreamscape, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    if (whyDreamscape.features.length > 1) {
      setWhyDreamscape({ ...whyDreamscape, features: whyDreamscape.features.filter((_, i) => i !== index) });
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
            Home Page Content
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
        <TabList px={4} pt={2} borderBottom="1px solid" borderColor="gray.100" flexWrap="wrap">
          <Tab fontWeight="500">Hero Slides</Tab>
          <Tab fontWeight="500">Brand Intro</Tab>
          <Tab fontWeight="500">Statistics</Tab>
          <Tab fontWeight="500">Services</Tab>
          <Tab fontWeight="500">Featured Events</Tab>
          <Tab fontWeight="500">Why Dreamscape</Tab>
          <Tab fontWeight="500">CTA</Tab>
          <Tab fontWeight="500">Newsletter</Tab>
          <Tab fontWeight="500">Footer</Tab>
        </TabList>

        <TabPanels>
          {/* Hero Slides */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch">
              <Flex justify="space-between" align="center">
                <Heading size="md" color="brand.dark">Hero Carousel</Heading>
                <Button leftIcon={<Plus size={16} />} colorScheme="brand" onClick={addSlide}>
                  Add Slide
                </Button>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl>
                  <FormLabel>Headline</FormLabel>
                  <Input
                    value={heroText.headline}
                    onChange={(e) => setHeroText({ ...heroText, headline: e.target.value })}
                    placeholder="More Than Events."
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Subheadline</FormLabel>
                  <Input
                    value={heroText.subheadline}
                    onChange={(e) => setHeroText({ ...heroText, subheadline: e.target.value })}
                    placeholder="We Curate Experiences."
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={heroText.description}
                  onChange={(e) => setHeroText({ ...heroText, description: e.target.value })}
                  placeholder="Luxury weddings, private celebrations..."
                  rows={2}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Booking Note</FormLabel>
                <Input
                  value={heroText.bookingNote}
                  onChange={(e) => setHeroText({ ...heroText, bookingNote: e.target.value })}
                  placeholder="Now booking 2026 & 2027 events"
                />
              </FormControl>

              <SimpleGrid columns={1} spacing={4}>
                {slides.map((slide, index) => (
                  <Card key={slide.id} variant="outline">
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Flex justify="space-between" align="center">
                          <Text fontSize="sm" color="gray.500" fontWeight="medium">
                            Slide {index + 1}
                          </Text>
                          <IconButton
                            aria-label="Remove slide"
                            icon={<Trash2 size={16} />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeSlide(index)}
                          />
                        </Flex>

                        <FormControl>
                          <FormLabel>Background Image</FormLabel>
                          <InputGroup>
                            <Input
                              value={slide.image}
                              onChange={(e) => updateSlide(index, 'image', e.target.value)}
                              placeholder="https://..."
                            />
                            <InputRightElement>
                              <IconButton
                                aria-label="Select image"
                                icon={<ImagePlus size={16} />}
                                size="sm"
                                variant="ghost"
                                onClick={() => openImagePicker({ type: 'hero', index })}
                              />
                            </InputRightElement>
                          </InputGroup>
                          {slide.image && (
                            <Box mt={3} borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.100">
                              <img src={slide.image} alt={`Slide ${index + 1}`} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                            </Box>
                          )}
                        </FormControl>

                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </VStack>
          </TabPanel>

          {/* Brand Intro */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Heading size="md" color="brand.dark">Brand Introduction</Heading>

              <FormControl>
                <FormLabel>Label</FormLabel>
                <Input
                  value={brandIntro.label}
                  onChange={(e) => setBrandIntro({ ...brandIntro, label: e.target.value })}
                  placeholder="Welcome to Dreamscape"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Headline</FormLabel>
                <Input
                  value={brandIntro.headline}
                  onChange={(e) => setBrandIntro({ ...brandIntro, headline: e.target.value })}
                  placeholder="Intentional design meets structured coordination."
                />
              </FormControl>

              <FormControl>
                <FormLabel>Paragraph 1</FormLabel>
                <Textarea
                  value={brandIntro.paragraph1}
                  onChange={(e) => setBrandIntro({ ...brandIntro, paragraph1: e.target.value })}
                  placeholder="Dreamscape Curated Events is a Toronto-based..."
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Paragraph 2</FormLabel>
                <Textarea
                  value={brandIntro.paragraph2}
                  onChange={(e) => setBrandIntro({ ...brandIntro, paragraph2: e.target.value })}
                  placeholder="We blend intentional design..."
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Location Note</FormLabel>
                <Input
                  value={brandIntro.locationNote}
                  onChange={(e) => setBrandIntro({ ...brandIntro, locationNote: e.target.value })}
                  placeholder="Toronto-based | Available Worldwide"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Image</FormLabel>
                <InputGroup>
                  <Input
                    value={brandIntro.image}
                    onChange={(e) => setBrandIntro({ ...brandIntro, image: e.target.value })}
                    placeholder="https://..."
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Select image"
                      icon={<ImagePlus size={16} />}
                      size="sm"
                      variant="ghost"
                      onClick={() => openImagePicker({ type: 'brand' })}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </VStack>
          </TabPanel>

          {/* Statistics */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Flex justify="space-between" align="center">
                <Heading size="md" color="brand.dark">Statistics</Heading>
                <Button leftIcon={<Plus size={16} />} colorScheme="brand" onClick={addStat}>
                  Add Statistic
                </Button>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                {statistics.map((stat, index) => (
                  <Card key={stat.id} variant="outline">
                    <CardBody>
                      <VStack spacing={3}>
                        <Flex justify="space-between" align="center">
                          <Text fontSize="xs" color="gray.500">Statistic {index + 1}</Text>
                          <IconButton
                            aria-label="Remove"
                            icon={<Trash2 size={14} />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeStat(index)}
                          />
                        </Flex>

                        <FormControl>
                          <FormLabel fontSize="sm">Value</FormLabel>
                          <Input
                            value={stat.value}
                            onChange={(e) => updateStat(index, 'value', e.target.value)}
                            placeholder="30+"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm">Label</FormLabel>
                          <Input
                            value={stat.label}
                            onChange={(e) => updateStat(index, 'label', e.target.value)}
                            placeholder="Events Completed"
                          />
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </VStack>
          </TabPanel>

          {/* Services Preview */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Heading size="md" color="brand.dark">Services Preview Section</Heading>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl>
                  <FormLabel>Section Label</FormLabel>
                  <Input
                    value={servicesPreview.label}
                    onChange={(e) => setServicesPreview({ ...servicesPreview, label: e.target.value })}
                    placeholder="Our Expertise"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Section Headline</FormLabel>
                  <Input
                    value={servicesPreview.headline}
                    onChange={(e) => setServicesPreview({ ...servicesPreview, headline: e.target.value })}
                    placeholder="Curated Experiences"
                  />
                </FormControl>
              </SimpleGrid>

              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="sm" color="brand.dark">Services</Heading>
                  <Button leftIcon={<Plus size={16} />} size="sm" colorScheme="brand" onClick={addService}>
                    Add Service
                  </Button>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  {services.map((service, index) => (
                    <Card key={service.id} variant="outline">
                      <CardBody>
                        <VStack spacing={3}>
                          <Flex justify="space-between" align="center">
                            <Text fontSize="xs" color="gray.500">Service {index + 1}</Text>
                            <IconButton
                              aria-label="Remove"
                              icon={<Trash2 size={14} />}
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => removeService(index)}
                            />
                          </Flex>

                          <FormControl>
                            <FormLabel fontSize="sm">Title</FormLabel>
                            <Input
                              value={service.title}
                              onChange={(e) => updateService(index, 'title', e.target.value)}
                              placeholder="Weddings"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="sm">Description</FormLabel>
                            <Textarea
                              value={service.description}
                              onChange={(e) => updateService(index, 'description', e.target.value)}
                              placeholder="Curated planning for timeless..."
                              rows={2}
                            />
                          </FormControl>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl>
                  <FormLabel>CTA Button Text</FormLabel>
                  <Input
                    value={servicesPreview.ctaText}
                    onChange={(e) => setServicesPreview({ ...servicesPreview, ctaText: e.target.value })}
                    placeholder="Explore Services"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>CTA Button Link</FormLabel>
                  <Input
                    value={servicesPreview.ctaLink}
                    onChange={(e) => setServicesPreview({ ...servicesPreview, ctaLink: e.target.value })}
                    placeholder="/services"
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </TabPanel>

          {/* Featured Events */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Heading size="md" color="brand.dark">Featured Events Section</Heading>

              <FormControl>
                <FormLabel>Section Label</FormLabel>
                <Input
                  value={featuredEvents.label}
                  onChange={(e) => setFeaturedEvents({ ...featuredEvents, label: e.target.value })}
                  placeholder="Blog"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Section Headline</FormLabel>
                <Input
                  value={featuredEvents.headline}
                  onChange={(e) => setFeaturedEvents({ ...featuredEvents, headline: e.target.value })}
                  placeholder="Recent Celebrations"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={featuredEvents.description}
                  onChange={(e) => setFeaturedEvents({ ...featuredEvents, description: e.target.value })}
                  placeholder="A refined destination wedding experience..."
                  rows={2}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl>
                  <FormLabel>"View All" Button Text</FormLabel>
                  <Input
                    value={featuredEvents.viewAllText}
                    onChange={(e) => setFeaturedEvents({ ...featuredEvents, viewAllText: e.target.value })}
                    placeholder="View Experience"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>"View All" Button Link</FormLabel>
                  <Input
                    value={featuredEvents.viewAllLink}
                    onChange={(e) => setFeaturedEvents({ ...featuredEvents, viewAllLink: e.target.value })}
                    placeholder="/blog"
                  />
                </FormControl>
              </SimpleGrid>

              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="sm" color="brand.dark">Events</Heading>
                  <Button leftIcon={<Plus size={16} />} size="sm" colorScheme="brand" onClick={addEvent}>
                    Add Event
                  </Button>
                </Flex>

                <VStack spacing={4}>
                  {events.map((event, index) => (
                    <Card key={event.id} variant="outline">
                      <CardBody>
                        <VStack spacing={3}>
                          <Flex justify="space-between" align="center">
                            <Text fontSize="xs" color="gray.500">Event {index + 1}</Text>
                            <IconButton
                              aria-label="Remove"
                              icon={<Trash2 size={14} />}
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => removeEvent(index)}
                            />
                          </Flex>

                          <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                            <FormControl>
                              <FormLabel fontSize="sm">Title</FormLabel>
                              <Input
                                value={event.title}
                                onChange={(e) => updateEvent(index, 'title', e.target.value)}
                                placeholder="Nneoma's 25th Birthday"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel fontSize="sm">Location</FormLabel>
                              <Input
                                value={event.location}
                                onChange={(e) => updateEvent(index, 'location', e.target.value)}
                                placeholder="Toronto"
                              />
                            </FormControl>
                          </SimpleGrid>

                          <FormControl>
                            <FormLabel fontSize="sm">Image</FormLabel>
                            <InputGroup>
                              <Input
                                value={event.image}
                                onChange={(e) => updateEvent(index, 'image', e.target.value)}
                                placeholder="https://images.unsplash.com/photo-..."
                              />
                              <InputRightElement>
                                <IconButton
                                  aria-label="Select image"
                                  icon={<ImagePlus size={16} />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openImagePicker({ type: 'event', index })}
                                />
                              </InputRightElement>
                            </InputGroup>
                          </FormControl>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </TabPanel>

          {/* Why Dreamscape */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Heading size="md" color="brand.dark">Why Dreamscape Section</Heading>

              <FormControl>
                <FormLabel>Section Label</FormLabel>
                <Input
                  value={whyDreamscape.label}
                  onChange={(e) => setWhyDreamscape({ ...whyDreamscape, label: e.target.value })}
                  placeholder="Why Dreamscape"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Headline</FormLabel>
                <Input
                  value={whyDreamscape.headline}
                  onChange={(e) => setWhyDreamscape({ ...whyDreamscape, headline: e.target.value })}
                  placeholder="Intentional design from concept to execution"
                />
              </FormControl>

              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="sm" color="brand.dark">Features</Heading>
                  <Button leftIcon={<Plus size={16} />} size="sm" colorScheme="brand" onClick={addFeature}>
                    Add Feature
                  </Button>
                </Flex>

                <VStack spacing={3}>
                  {whyDreamscape.features.map((feature, index) => (
                    <Flex key={index} gap={2} align="center">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Structured planning systems that eliminate stress"
                        flex={1}
                      />
                      <IconButton
                        icon={<Trash2 size={16} />}
                        aria-label="Remove feature"
                        colorScheme="red"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        isDisabled={whyDreamscape.features.length === 1}
                      />
                    </Flex>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </TabPanel>

          {/* CTA Section */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Heading size="md" color="brand.dark">CTA Section</Heading>

              <FormControl>
                <FormLabel>Headline</FormLabel>
                <Input
                  value={ctaSection.headline}
                  onChange={(e) => setCtaSection({ ...ctaSection, headline: e.target.value })}
                  placeholder="Ready to bring your vision to life?"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Subheadline</FormLabel>
                <Input
                  value={ctaSection.subheadline}
                  onChange={(e) => setCtaSection({ ...ctaSection, subheadline: e.target.value })}
                  placeholder="Dreamscape Curated Events"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={ctaSection.description}
                  onChange={(e) => setCtaSection({ ...ctaSection, description: e.target.value })}
                  placeholder="Toronto-based | Available Worldwide"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Details</FormLabel>
                <Input
                  value={ctaSection.details}
                  onChange={(e) => setCtaSection({ ...ctaSection, details: e.target.value })}
                  placeholder="Luxury weddings, private celebrations, and elevated brand experiences."
                />
              </FormControl>
            </VStack>
          </TabPanel>

          {/* Newsletter */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Heading size="md" color="brand.dark">Newsletter Section</Heading>

              <FormControl>
                <FormLabel>Headline</FormLabel>
                <Input
                  value={newsletter.headline}
                  onChange={(e) => setNewsletter({ ...newsletter, headline: e.target.value })}
                  placeholder="Enter your email"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Button Text</FormLabel>
                <Input
                  value={newsletter.buttonText}
                  onChange={(e) => setNewsletter({ ...newsletter, buttonText: e.target.value })}
                  placeholder="Submit"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Disclaimer</FormLabel>
                <Textarea
                  value={newsletter.disclaimer}
                  onChange={(e) => setNewsletter({ ...newsletter, disclaimer: e.target.value })}
                  placeholder="By subscribing you agree to receive updates from Dreamscape Curated Events."
                  rows={2}
                />
              </FormControl>
            </VStack>
          </TabPanel>

          {/* Footer */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Heading size="md" color="brand.dark">Footer</Heading>

              <FormControl>
                <FormLabel>Copyright</FormLabel>
                <Input
                  value={footer.copyright}
                  onChange={(e) => setFooter({ ...footer, copyright: e.target.value })}
                  placeholder="© 2026 Dreamscape Curated Events Inc. All rights reserved."
                />
              </FormControl>

              <Heading size="sm" color="brand.dark" mt={4}>Explore Links</Heading>
              <VStack spacing={3}>
                {footer.exploreLinks.map((link, index) => (
                  <SimpleGrid key={index} columns={{ base: 1, md: 2 }} gap={3}>
                    <FormControl>
                      <FormLabel fontSize="sm">Label</FormLabel>
                      <Input
                        value={link.label}
                        onChange={(e) => {
                          const newLinks = [...footer.exploreLinks];
                          newLinks[index] = { ...newLinks[index], label: e.target.value };
                          setFooter({ ...footer, exploreLinks: newLinks });
                        }}
                        placeholder="Home"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Link</FormLabel>
                      <Input
                        value={link.href}
                        onChange={(e) => {
                          const newLinks = [...footer.exploreLinks];
                          newLinks[index] = { ...newLinks[index], href: e.target.value };
                          setFooter({ ...footer, exploreLinks: newLinks });
                        }}
                        placeholder="/"
                      />
                    </FormControl>
                  </SimpleGrid>
                ))}
              </VStack>

              <Heading size="sm" color="brand.dark" mt={4}>Company Links</Heading>
              <VStack spacing={3}>
                {footer.companyLinks.map((link, index) => (
                  <SimpleGrid key={index} columns={{ base: 1, md: 2 }} gap={3}>
                    <FormControl>
                      <FormLabel fontSize="sm">Label</FormLabel>
                      <Input
                        value={link.label}
                        onChange={(e) => {
                          const newLinks = [...footer.companyLinks];
                          newLinks[index] = { ...newLinks[index], label: e.target.value };
                          setFooter({ ...footer, companyLinks: newLinks });
                        }}
                        placeholder="About"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Link</FormLabel>
                      <Input
                        value={link.href}
                        onChange={(e) => {
                          const newLinks = [...footer.companyLinks];
                          newLinks[index] = { ...newLinks[index], href: e.target.value };
                          setFooter({ ...footer, companyLinks: newLinks });
                        }}
                        placeholder="/about"
                      />
                    </FormControl>
                  </SimpleGrid>
                ))}
              </VStack>

              <Heading size="sm" color="brand.dark" mt={4}>Connect Links</Heading>
              <VStack spacing={3}>
                {footer.connectLinks.map((link, index) => (
                  <SimpleGrid key={index} columns={{ base: 1, md: 3 }} gap={3}>
                    <FormControl>
                      <FormLabel fontSize="sm">Label</FormLabel>
                      <Input
                        value={link.label}
                        onChange={(e) => {
                          const newLinks = [...footer.connectLinks];
                          newLinks[index] = { ...newLinks[index], label: e.target.value };
                          setFooter({ ...footer, connectLinks: newLinks });
                        }}
                        placeholder="Instagram"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Link</FormLabel>
                      <Input
                        value={link.href}
                        onChange={(e) => {
                          const newLinks = [...footer.connectLinks];
                          newLinks[index] = { ...newLinks[index], href: e.target.value };
                          setFooter({ ...footer, connectLinks: newLinks });
                        }}
                        placeholder="https://instagram.com"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Icon</FormLabel>
                      <Input
                        value={link.icon}
                        onChange={(e) => {
                          const newLinks = [...footer.connectLinks];
                          newLinks[index] = { ...newLinks[index], icon: e.target.value };
                          setFooter({ ...footer, connectLinks: newLinks });
                        }}
                        placeholder="instagram"
                      />
                    </FormControl>
                  </SimpleGrid>
                ))}
              </VStack>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <MediaPickerModal isOpen={isOpen} onClose={onClose} onSelect={handleMediaSelect} />
    </Box>
  );
}
