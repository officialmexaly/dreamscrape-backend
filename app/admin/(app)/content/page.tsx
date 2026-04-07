'use client';

import React from 'react';
import { Box, Text, SimpleGrid, Card, CardBody, Flex, Badge, Button, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { Home, User, Briefcase, Mail, Settings, ChevronRight, BookOpen, Heart, Calendar, FileText } from 'lucide-react';

const pages = [
  { id: 'home', label: 'Home', icon: Home, description: 'Hero slides, brand intro, statistics, services preview', color: 'purple' },
  { id: 'about', label: 'About', icon: User, description: 'Story, philosophy, team information', color: 'blue' },
  { id: 'services', label: 'Services', icon: Briefcase, description: 'Services page content and introduction', color: 'green' },
  { id: 'contact', label: 'Contact', icon: Mail, description: 'Contact information and forms', color: 'orange' },
  { id: 'love_notes', label: 'Love Notes', icon: Heart, description: 'Client testimonials and reviews', color: 'red' },
  { id: 'consultation', label: 'Consultation', icon: Calendar, description: 'Consultation booking configuration', color: 'teal' },
  { id: 'consultation_editorial', label: 'Consultation Editorial', icon: FileText, description: 'Consultation options and editorial content', color: 'cyan' },
];

export default function ContentRoute() {
  const router = useRouter();

  return (
    <Box>
      <Text fontSize="2xl" fontFamily="heading" fontWeight="bold" color="brand.dark" mb={2}>
        Site Content
      </Text>
      <Text color="gray.600" mb={6}>Edit all website content with easy-to-use forms</Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {pages.map((page) => {
          const Icon = page.icon;
          return (
            <Card
              key={page.id}
              variant="outline"
              borderWidth="2px"
              borderColor="gray.100"
              _hover={{ borderColor: `${page.color}.200`, shadow: 'lg', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
              cursor="pointer"
              onClick={() => router.push(`/admin/content/${page.id}`)}
            >
              <CardBody>
                <Flex align="flex-start" gap={4}>
                  <Box p={3} borderRadius="lg" bg={`${page.color}.50`}>
                    <Icon size={24} className={`text-${page.color}-600`} />
                  </Box>
                  <Box flex={1}>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontSize="lg" fontWeight="bold" color="brand.dark">
                        {page.label} Page
                      </Text>
                      <ChevronRight size={20} className="text-gray-400" />
                    </Flex>
                    <Text fontSize="sm" color="gray.600" mb={3}>
                      {page.description}
                    </Text>
                    <Badge colorScheme={page.color}>Easy Editor</Badge>
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          );
        })}

        {/* Advanced: Table View Option */}
        <Card
          variant="outline"
          borderWidth="2px"
          borderColor="gray.200"
          borderStyle="dashed"
          _hover={{ borderColor: 'gray.300', bg: 'gray.50' }}
          transition="all 0.2s"
          cursor="pointer"
          onClick={() => router.push('/admin/content/advanced')}
        >
          <CardBody>
            <Flex align="flex-start" gap={4}>
              <Box p={3} borderRadius="lg" bg="gray.100">
                <Settings size={24} className="text-gray-600" />
              </Box>
              <Box flex={1}>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="lg" fontWeight="bold" color="brand.dark">
                    Advanced View
                  </Text>
                  <ChevronRight size={20} className="text-gray-400" />
                </Flex>
                <Text fontSize="sm" color="gray.600">
                  Table-based editing for all content items
                </Text>
                <Badge colorScheme="gray" mt={2}>For Advanced Users</Badge>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
