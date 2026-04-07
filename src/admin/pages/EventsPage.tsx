'use client';

import React from 'react';
import {
  Box,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  Image,
  Text } from
'@chakra-ui/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEvents } from '../providers/EventsProvider';
export function EventsPage() {
  const router = useRouter();
  const { events, deleteEvent, isLoading } = useEvents();
  const toast = useToast();
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    await deleteEvent(id);
    toast({
      title: 'Event deleted',
      status: 'info',
      duration: 2000
    });
  };
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Text
          fontSize="2xl"
          fontFamily="heading"
          fontWeight="bold"
          color="brand.dark">

          Blog Posts
        </Text>
        <Button
          leftIcon={<Plus size={18} />}
          colorScheme="brand"
          onClick={() => router.push('/admin/events/new')}>
          
          Add Event
        </Button>
      </Flex>

      <Box
        bg="white"
        borderRadius="xl"
        shadow="sm"
        border="1px solid"
        borderColor="gray.100"
        overflow="hidden">
        
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Event</Th>
              <Th>Category</Th>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading && (
              <Tr>
                <Td colSpan={5}>
                  <Text color="gray.500">Loading...</Text>
                </Td>
              </Tr>
            )}
            {events.map((event) =>
            <Tr key={event.id}>
                <Td>
                  <Flex align="center" gap={3}>
                    <Image
                    src={event.featured_image || event.featuredImage || ''}
                    alt={event.title}
                    boxSize="40px"
                    borderRadius="md"
                    objectFit="cover" />
                  
                    <Text fontWeight="500">{event.title}</Text>
                  </Flex>
                </Td>
                <Td>{event.event_type}</Td>
                <Td>{event.event_date ? new Date(event.event_date).toLocaleDateString() : '—'}</Td>
                <Td>
                  <Badge
                  colorScheme={
                  event.status === 'published' ? 'green' : 'yellow'
                  }>
                  
                    {event.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                </Td>
                <Td textAlign="right">
                  <IconButton
                  aria-label="Edit"
                  icon={<Edit size={16} />}
                  size="sm"
                  variant="ghost"
                  mr={2}
                  onClick={() => router.push(`/admin/events/${event.id}/edit`)} />
                
                  <IconButton
                  aria-label="Delete"
                  icon={<Trash2 size={16} />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => handleDelete(event.id)} />
                
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>);

}
