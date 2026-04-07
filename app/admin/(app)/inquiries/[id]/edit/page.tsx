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
import { use } from 'react';
import { useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useInquiries } from '@/src/admin/providers/InquiriesProvider';

export default function EditInquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const toast = useToast();
  const { inquiries, setInquiries } = useInquiries();
  const { id } = use(params);

  const existing = useMemo(() => inquiries.find((i: any) => i.id === id), [inquiries, id]);
  const [draft, setDraft] = useState<any>(() => existing || null);

  if (!existing || !draft) {
    return (
      <Box>
        <Text>Inquiry not found.</Text>
        <Button mt={4} onClick={() => router.push('/inquiries')}>
          Back
        </Button>
      </Box>
    );
  }

  const handleSave = () => {
    if (!draft.name || !draft.email) {
      toast({ title: 'Name and email are required', status: 'error', duration: 2000 });
      return;
    }
    setInquiries(inquiries.map((i: any) => (i.id === existing.id ? draft : i)));
    toast({ title: 'Inquiry updated', status: 'success', duration: 2000 });
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
            Edit Inquiry
          </Text>
        </Flex>
        <Button leftIcon={<Save size={16} />} colorScheme="brand" onClick={handleSave}>
          Save
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

