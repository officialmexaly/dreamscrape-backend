'use client';

import React from 'react';
import {
  Box,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  IconButton,
  Button,
  useToast } from
'@chakra-ui/react';
import { Mail, Plus, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInquiries } from '../providers/InquiriesProvider';
export function InquiriesPage() {
  const router = useRouter();
  const { inquiries, deleteInquiry, isLoading } = useInquiries();
  const toast = useToast();
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'blue';
      default:
        return 'gray';
    }
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this inquiry?')) return;
    await deleteInquiry(id);
    toast({ title: 'Inquiry deleted', status: 'info', duration: 2000 });
  };
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Text
          fontSize="2xl"
          fontFamily="heading"
          fontWeight="bold"
          color="brand.dark">
          
          Consultation Inquiries
        </Text>
        <Button
          leftIcon={<Plus size={18} />}
          colorScheme="brand"
          onClick={() => router.push('/admin/inquiries/new')}>
          
          Add Inquiry
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
              <Th>Client Name</Th>
              <Th>Contact Info</Th>
              <Th>Event Type</Th>
              <Th>Date Submitted</Th>
              <Th>Status</Th>
              <Th textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading && (
              <Tr>
                <Td colSpan={6}>
                  <Text color="gray.500">Loading...</Text>
                </Td>
              </Tr>
            )}
            {inquiries.map((inquiry) =>
            <Tr key={inquiry.id}>
                <Td fontWeight="500">{inquiry.name}</Td>
                <Td>
                  <Flex align="center" gap={2} color="gray.600">
                    <Mail size={14} />
                    <Text fontSize="sm">{inquiry.email}</Text>
                  </Flex>
                </Td>
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
                  <Flex justify="flex-end" gap={2}>
                    <IconButton
                      aria-label="Edit inquiry"
                      icon={<Edit size={16} />}
                      size="sm"
                      variant="ghost"
                      isDisabled
                      onClick={() => router.push(`/admin/inquiries/${inquiry.id}/edit`)}
                    />

                    <IconButton
                      aria-label="Delete inquiry"
                      icon={<Trash2 size={16} />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDelete(inquiry.id)}
                    />
                  </Flex>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>);

}
