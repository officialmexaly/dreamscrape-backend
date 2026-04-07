'use client';

import React from 'react';
import {
  Box,
  SimpleGrid,
  Flex,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Heading,
  HStack,
  Icon,
  Divider } from
'@chakra-ui/react';
import {
  Calendar,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  Plus,
  ArrowUpRight,
  Sparkles } from
'lucide-react';
import { StatCard } from '../components/StatCard';
import { mockData } from '../data/mockData';
import { useRouter } from 'next/navigation';
export function DashboardPage() {
  const router = useRouter();
  const recentInquiries = mockData.inquiries.slice(0, 5);
  const upcomingEvents = mockData.events.
  filter((e) => new Date(e.date) > new Date()).
  slice(0, 3);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'blue';
      case 'Contacted':
        return 'yellow';
      case 'Booked':
        return 'green';
      case 'Closed':
        return 'gray';
      default:
        return 'gray';
    }
  };
  return (
    <Box>
      <Flex
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={4}
        mb={8}>
        
        <Box>
          <HStack spacing={3} mb={1}>
            <Flex
              w="34px"
              h="34px"
              borderRadius="xl"
              bg="linear-gradient(135deg, rgba(123,45,110,0.16) 0%, rgba(201,168,76,0.12) 100%)"
              align="center"
              justify="center">
              
              <Icon as={Sparkles} boxSize={5} color="brand.primary" />
            </Flex>
            <Heading size="lg" fontFamily="heading" color="brand.dark">
              Dashboard
            </Heading>
          </HStack>
          <Text color="gray.500">Quick overview and recent activity.</Text>
        </Box>

        <HStack spacing={3}>
          <Button variant="outline" onClick={() => router.push('/admin/blog')}>
            Manage Blog
          </Button>
          <Button
            leftIcon={<Plus size={18} />}
            colorScheme="brand"
            onClick={() => router.push('/admin/events/new')}>
            
            New Event
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid
        columns={{
          base: 1,
          md: 2,
          lg: 4
        }}
        spacing={6}
        mb={8}>
        
        <StatCard
          title="Total Events"
          value={mockData.events.length}
          icon={Calendar}
          trend="up"
          helpText="+2 this month" />
        
        <StatCard
          title="Pending Inquiries"
          value={mockData.inquiries.filter((i) => i.status === 'New').length}
          icon={MessageSquare}
          trend="up"
          helpText="Needs attention" />
        
        <StatCard
          title="Blog Posts"
          value={mockData.blogPosts.length}
          icon={FileText} />
        
        <StatCard
          title="Media Items"
          value={mockData.media.length}
          icon={ImageIcon} />
        
      </SimpleGrid>

      <SimpleGrid
        columns={{
          base: 1,
          lg: 3
        }}
        spacing={8}>
        
        <Card
          gridColumn={{
            lg: 'span 2'
          }}>
          
          <CardHeader pb={0}>
            <Flex justify="space-between" align="center">
              <Heading size="md" fontFamily="heading" color="brand.dark">
                Recent Inquiries
              </Heading>
              <Button
                variant="link"
                colorScheme="brand"
                size="sm"
                onClick={() => router.push('/admin/inquiries')}>
                
                View all
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg="surface.subtle">
                  <Tr>
                    <Th>Name</Th>
                    <Th>Event Type</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th textAlign="right">Open</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recentInquiries.map((inquiry) =>
                  <Tr key={inquiry.id}>
                      <Td fontWeight="500">{inquiry.name}</Td>
                      <Td>{inquiry.eventType}</Td>
                      <Td>{new Date(inquiry.date).toLocaleDateString()}</Td>
                      <Td>
                        <Badge
                        colorScheme={getStatusColor(inquiry.status)}
                        borderRadius="full"
                        px={2}>
                        
                          {inquiry.status}
                        </Badge>
                      </Td>
                      <Td textAlign="right">
                        <Button
                          size="xs"
                          variant="ghost"
                          rightIcon={<ArrowUpRight size={14} />}
                          onClick={() => router.push(`/admin/inquiries/${inquiry.id}/edit`)}>
                          
                          Open
                        </Button>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>

        <Card
        >
          <CardHeader pb={0}>
            <Flex justify="space-between" align="center">
              <Heading size="md" fontFamily="heading" color="brand.dark">
              Upcoming Events
              </Heading>
              <Button variant="link" colorScheme="brand" size="sm" onClick={() => router.push('/admin/events')}>
                View all
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <Flex direction="column" gap={4}>
              {upcomingEvents.map((event) =>
              <Flex
                key={event.id}
                align="center"
                gap={4}
                p={3}
                bg="surface.subtle"
                borderRadius="xl"
                border="1px solid"
                borderColor="rgba(15, 23, 42, 0.06)">
                
                  <Box
                  w="48px"
                  h="48px"
                  borderRadius="md"
                  overflow="hidden"
                  flexShrink={0}>
                  
                    <img
                    src={event.image}
                    alt={event.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }} />
                  
                  </Box>
                  <Box flex={1}>
                    <Text fontWeight="600" fontSize="sm" noOfLines={1}>
                      {event.title}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(event.date).toLocaleDateString()}
                    </Text>
                  </Box>
                  <Badge colorScheme="brand" variant="subtle" fontSize="2xs">
                    {event.category}
                  </Badge>
                </Flex>
              )}

              <Divider />
              <Button variant="outline" onClick={() => router.push('/admin/events/new')}>
                Add event
              </Button>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>);

}
