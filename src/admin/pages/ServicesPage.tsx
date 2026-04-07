'use client';

import React from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast } from
'@chakra-ui/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useServices } from '../providers/ServicesProvider';
export function ServicesPage() {
  const router = useRouter();
  const { services, deleteService, isLoading } = useServices();
  const toast = useToast();
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await deleteService(id);
      toast({ title: 'Service deleted', status: 'info', duration: 2000 });
    } catch (error: any) {
      toast({ title: error?.message || 'Failed to delete', status: 'error', duration: 2000 });
    }
  };
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Text
          fontSize="2xl"
          fontFamily="heading"
          fontWeight="bold"
          color="brand.dark">
          
          Service Offerings
        </Text>
        <Button
          leftIcon={<Plus size={18} />}
          colorScheme="brand"
          onClick={() => router.push('/admin/services/new')}>
          
          Add Service
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
              <Th>Title</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th>Updated</Th>
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
            {services.map((service) => (
              <Tr key={service.id}>
                <Td>
                  <Text fontWeight="500">{service.title}</Text>
                  <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="320px">
                    {service.description}
                  </Text>
                </Td>
                <Td>{service.category || '-'}</Td>
                <Td>
                  <Badge colorScheme={service.status === 'published' ? 'green' : 'gray'}>
                    {service.status || 'draft'}
                  </Badge>
                </Td>
                <Td>{service.updated_at ? new Date(service.updated_at).toLocaleDateString() : '-'}</Td>
                <Td textAlign="right">
                  <IconButton
                    aria-label="Edit service"
                    icon={<Edit size={16} />}
                    size="sm"
                    variant="ghost"
                    colorScheme="brand"
                    mr={2}
                    onClick={() => router.push(`/admin/services/${service.id}/edit`)}
                  />
                  <IconButton
                    aria-label="Delete service"
                    icon={<Trash2 size={16} />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleDelete(service.id)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>);

}
