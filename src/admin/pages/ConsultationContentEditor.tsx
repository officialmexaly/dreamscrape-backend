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
  SimpleGrid,
} from '@chakra-ui/react';
import { ArrowLeft, Save, RefreshCw, Plus, Trash2, Clock, Calendar, FileText, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EventType {
  id: string;
  label: string;
}

interface ConsultationType {
  [key: string]: string;
}

export function ConsultationContentEditor() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Time Options
  const [timeOptions, setTimeOptions] = useState<string[]>([]);

  // Event Types
  const [eventTypes, setEventTypes] = useState<EventType[]>([
    { id: '', label: '' }
  ]);

  // Consultation Types
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType>({});

  // Date Range
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  // Page Content
  const [pageContent, setPageContent] = useState({
    headline: '',
    subheadline: '',
    description: ''
  });

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      // Fetch all consultation content
      const res = await fetch('/api/site-content?page=consultation', { cache: 'no-store' });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to load content');

      const data = json.grouped || {};

      // Time options
      if (data.consultation_time_options) {
        const times = data.consultation_time_options.options?.value || [];
        setTimeOptions(times);
      }

      // Event types
      if (data.consultation_event_types) {
        const events = data.consultation_event_types.options?.value || [];
        setEventTypes(events);
      }

      // Consultation types
      if (data.consultation_consultation_types) {
        const types = data.consultation_consultation_types.types?.value || {};
        setConsultationTypes(types);
      }

      // Date range
      if (data.consultation_date_range) {
        const range = data.consultation_date_range.config?.value || {};
        setDateRange(range);
      }

      // Page content
      if (data.consultation_page_content) {
        setPageContent({
          headline: data.consultation_page_content.headline?.value || '',
          subheadline: data.consultation_page_content.subheadline?.value || '',
          description: data.consultation_page_content.description?.value || ''
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
        // Time options
        {
          page: 'consultation',
          section: 'time_options',
          content_key: 'options',
          content_type: 'json',
          content_json: timeOptions.filter(t => t.trim() !== '')
        },
        // Event types
        {
          page: 'consultation',
          section: 'event_types',
          content_key: 'options',
          content_type: 'json',
          content_json: eventTypes.filter(e => e.id.trim() !== '' && e.label.trim() !== '')
        },
        // Consultation types
        {
          page: 'consultation',
          section: 'consultation_types',
          content_key: 'types',
          content_type: 'json',
          content_json: consultationTypes
        },
        // Date range
        {
          page: 'consultation',
          section: 'date_range',
          content_key: 'config',
          content_type: 'json',
          content_json: dateRange
        },
        // Page content
        {
          page: 'consultation',
          section: 'page_content',
          content_key: 'headline',
          content_type: 'text',
          content: pageContent.headline
        },
        {
          page: 'consultation',
          section: 'page_content',
          content_key: 'subheadline',
          content_type: 'text',
          content: pageContent.subheadline
        },
        {
          page: 'consultation',
          section: 'page_content',
          content_key: 'description',
          content_type: 'text',
          content: pageContent.description
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

  const addEventType = () => {
    setEventTypes([...eventTypes, { id: '', label: '' }]);
  };

  const removeEventType = (index: number) => {
    if (eventTypes.length > 1) {
      setEventTypes(eventTypes.filter((_, i) => i !== index));
    }
  };

  const updateEventType = (index: number, field: keyof EventType, value: string) => {
    const newEventTypes = [...eventTypes];
    newEventTypes[index] = { ...newEventTypes[index], [field]: value };
    setEventTypes(newEventTypes);
  };

  const addTimeOption = () => {
    setTimeOptions([...timeOptions, '']);
  };

  const removeTimeOption = (index: number) => {
    if (timeOptions.length > 1) {
      setTimeOptions(timeOptions.filter((_, i) => i !== index));
    }
  };

  const updateTimeOption = (index: number, value: string) => {
    const newTimeOptions = [...timeOptions];
    newTimeOptions[index] = value;
    setTimeOptions(newTimeOptions);
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
            Consultation Page Content
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
          <Tab fontWeight="500">Page Content</Tab>
          <Tab fontWeight="500">Time Options</Tab>
          <Tab fontWeight="500">Event Types</Tab>
          <Tab fontWeight="500">Consultation Types</Tab>
          <Tab fontWeight="500">Date Range</Tab>
        </TabList>

        <TabPanels>
          {/* Page Content */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Heading size="md" color="brand.dark">Page Content</Heading>

              <FormControl>
                <FormLabel>Headline</FormLabel>
                <Input
                  value={pageContent.headline}
                  onChange={(e) => setPageContent({ ...pageContent, headline: e.target.value })}
                  placeholder="Begin Your Event Journey"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Subheadline</FormLabel>
                <Textarea
                  value={pageContent.subheadline}
                  onChange={(e) => setPageContent({ ...pageContent, subheadline: e.target.value })}
                  placeholder="Schedule a consultation with Dreamscape Curated Events..."
                  rows={2}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={pageContent.description}
                  onChange={(e) => setPageContent({ ...pageContent, description: e.target.value })}
                  placeholder="Whether you're planning a wedding, corporate event..."
                  rows={3}
                />
              </FormControl>
            </VStack>
          </TabPanel>

          {/* Time Options */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Flex justify="space-between" align="center">
                <Heading size="md" color="brand.dark">Available Time Slots</Heading>
                <Button leftIcon={<Plus size={16} />} colorScheme="brand" size="sm" onClick={addTimeOption}>
                  Add Time
                </Button>
              </Flex>

              <Box p={4} bg="teal.50" borderRadius="lg" borderLeft="4px" border="teal.400">
                <Text fontSize="sm" color="gray.700">
                  💡 <strong>Tip:</strong> Add available consultation time slots in 24-hour format (e.g., 09:00, 14:00).
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                {timeOptions.map((time, index) => (
                  <Flex key={index} gap={2} align="center">
                    <Clock size={18} className="text-brand-purple" />
                    <Input
                      value={time}
                      onChange={(e) => updateTimeOption(index, e.target.value)}
                      placeholder="09:00"
                      flex={1}
                    />
                    <IconButton
                      icon={<Trash2 size={16} />}
                      aria-label="Remove time"
                      colorScheme="red"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTimeOption(index)}
                      isDisabled={timeOptions.length === 1}
                    />
                  </Flex>
                ))}
              </SimpleGrid>
            </VStack>
          </TabPanel>

          {/* Event Types */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Flex justify="space-between" align="center">
                <Heading size="md" color="brand.dark">Event Types</Heading>
                <Button leftIcon={<Plus size={16} />} colorScheme="brand" size="sm" onClick={addEventType}>
                  Add Event Type
                </Button>
              </Flex>

              <Box p={4} bg="purple.50" borderRadius="lg" borderLeft="4px" border="purple.400">
                <Text fontSize="sm" color="gray.700">
                  💡 <strong>Tip:</strong> Define event type categories for clients to select when booking.
                </Text>
              </Box>

              <VStack spacing={4}>
                {eventTypes.map((eventType, index) => (
                  <Box key={index} p={4} border="1px solid" borderColor="gray.200" borderRadius="lg" w="full">
                    <Flex justify="space-between" align="center" mb={3}>
                      <Text fontWeight="medium" color="brand.dark">
                        Event Type {index + 1}
                      </Text>
                      <IconButton
                        icon={<Trash2 size={16} />}
                        aria-label="Remove event type"
                        colorScheme="red"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEventType(index)}
                        isDisabled={eventTypes.length === 1}
                      />
                    </Flex>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                      <FormControl>
                        <FormLabel>ID</FormLabel>
                        <Input
                          value={eventType.id}
                          onChange={(e) => updateEventType(index, 'id', e.target.value)}
                          placeholder="wedding-destination-social"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Label</FormLabel>
                        <Input
                          value={eventType.label}
                          onChange={(e) => updateEventType(index, 'label', e.target.value)}
                          placeholder="Wedding / Destination Planning"
                        />
                      </FormControl>
                    </SimpleGrid>
                  </Box>
                ))}
              </VStack>
            </VStack>
          </TabPanel>

          {/* Consultation Types */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Heading size="md" color="brand.dark">Consultation Type Descriptions</Heading>

              <Box p={4} bg="blue.50" borderRadius="lg" borderLeft="4px" border="blue.400">
                <Text fontSize="sm" color="gray.700">
                  💡 <strong>Tip:</strong> Provide detailed descriptions for each consultation type. Use event type IDs as keys.
                </Text>
              </Box>

              <VStack spacing={3}>
                {Object.entries(consultationTypes).map(([key, value]) => (
                  <FormControl key={key}>
                    <FormLabel>{key}</FormLabel>
                    <Textarea
                      value={value}
                      onChange={(e) => setConsultationTypes({ ...consultationTypes, [key]: e.target.value })}
                      rows={2}
                    />
                  </FormControl>
                ))}
              </VStack>

              <Button
                leftIcon={<Plus size={16} />}
                variant="outline"
                size="sm"
                onClick={() => setConsultationTypes({ ...consultationTypes, 'new-type': 'Description here' })}
              >
                Add Consultation Type
              </Button>
            </VStack>
          </TabPanel>

          {/* Date Range */}
          <TabPanel p={6}>
            <VStack spacing={6} align="stretch" maxW="4xl">
              <Heading size="md" color="brand.dark">Booking Availability</Heading>

              <Box p={4} bg="orange.50" borderRadius="lg" borderLeft="4px" border="orange.400">
                <Text fontSize="sm" color="gray.700">
                  💡 <strong>Tip:</strong> Set the date range for which clients can book consultations. Format: YYYY-MM-DD
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl>
                  <HStack spacing={3}>
                    <Calendar size={18} className="text-brand-purple" />
                    <FormLabel mb="0">Start Date</FormLabel>
                  </HStack>
                  <Input
                    type="date"
                    value={dateRange.start_date}
                    onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <HStack spacing={3}>
                    <Calendar size={18} className="text-brand-purple" />
                    <FormLabel mb="0">End Date</FormLabel>
                  </HStack>
                  <Input
                    type="date"
                    value={dateRange.end_date}
                    onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
