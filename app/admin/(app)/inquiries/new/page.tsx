'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useInquiries } from '@/src/admin/providers/InquiriesProvider';

export default function NewInquiryPage() {
  const router = useRouter();
  const toast = useToast();
  const { inquiries, setInquiries } = useInquiries();

  const [draft, setDraft] = useState<any>({
    name: '',
    email: '',
    eventType: 'Wedding',
    date: new Date().toISOString().split('T')[0],
    status: 'New'
  });

  const handleCreate = () => {
    if (!draft.name || !draft.email) {
      toast({ title: 'Name and email are required', status: 'error', duration: 2000 });
      return;
    }
    const next = { ...draft, id: Date.now().toString() };
    setInquiries([next, ...inquiries]);
    toast({ title: 'Inquiry created', status: 'success', duration: 2000 });
    router.push('/inquiries');
  };

  return (
    <Box maxW="800px">
      <Flex justify="space-between" align="center" mb={6}>
        <Flex align="center" gap={3}>
          <Button leftIcon={<ArrowLeft size={16} />} variant="ghost" onClick={() => router.push('/inquiries')}>
            Back
          </Button>
          <Text fontSize="2xl" fontFamily="heading" fontWeight="bold" color="brand.dark">
            New Inquiry
          </Text>
        </Flex>
        <Button leftIcon={<Save size={16} />} colorScheme="brand" onClick={handleCreate}>
          Create
        </Button>
      </Flex>

      <VStack spacing={5} align="stretch">
        <FormControl isRequired>
          <FormLabel>Client Name</FormLabel>
          <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
        </FormControl>
        <Flex gap={4} flexDir={{ base: 'column', md: 'row' }}>
          <FormControl>
            <FormLabel>Event Type</FormLabel>
            <Input value={draft.eventType} onChange={(e) => setDraft({ ...draft, eventType: e.target.value })} />
          </FormControl>
          <FormControl>
            <FormLabel>Date Submitted</FormLabel>
            <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
          </FormControl>
        </Flex>
        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Booked">Booked</option>
            <option value="Closed">Closed</option>
          </Select>
        </FormControl>
      </VStack>
    </Box>
  );
}

