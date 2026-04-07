'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  FormControl,
  FormLabel,
  Input,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  useToast } from
'@chakra-ui/react';
import { Save } from 'lucide-react';
import { useSettings } from '../providers/SettingsProvider';
export function SettingsPage() {
  const { settings, saveSettings, isLoading } = useSettings();
  const [draft, setDraft] = useState<any>(settings);
  const toast = useToast();
  useEffect(() => {
    setDraft(settings);
  }, [settings]);
  const handleSave = async () => {
    try {
      await saveSettings(draft);
      toast({
        title: 'Settings updated',
        status: 'success',
        duration: 2000
      });
    } catch (error: any) {
      toast({ title: error?.message || 'Failed to save settings', status: 'error', duration: 2500 });
    }
  };
  return (
    <Box maxW="1000px">
      <Flex justify="space-between" align="center" mb={6}>
        <Text
          fontSize="2xl"
          fontFamily="heading"
          fontWeight="bold"
          color="brand.dark">
          
          Global Settings
        </Text>
        <Button
          leftIcon={<Save size={18} />}
          colorScheme="brand"
          isDisabled={isLoading || !draft}
          onClick={handleSave}>
          
          Save Settings
        </Button>
      </Flex>

      {isLoading || !draft ? (
        <Text color="gray.500">Loading...</Text>
      ) : (
      <VStack spacing={6} align="stretch">
        <Card
          shadow="sm"
          border="1px solid"
          borderColor="gray.100"
          borderRadius="xl">
          
          <CardBody>
            <Text fontSize="lg" fontWeight="bold" color="brand.dark" mb={4}>
              Business Information
            </Text>
            <SimpleGrid
              columns={{
                base: 1,
                md: 2
              }}
              spacing={6}>
              
              <FormControl>
                <FormLabel>Company Name</FormLabel>
                <Input value={draft.companyName || ''} onChange={(e) => setDraft({ ...draft, companyName: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Contact Email</FormLabel>
                <Input type="email" value={draft.email || ''} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input value={draft.phone || ''} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Physical Address</FormLabel>
                <Input value={draft.address || ''} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        <Card
          shadow="sm"
          border="1px solid"
          borderColor="gray.100"
          borderRadius="xl">
          
          <CardBody>
            <Text fontSize="lg" fontWeight="bold" color="brand.dark" mb={4}>
              Social Media
            </Text>
            <SimpleGrid
              columns={{
                base: 1,
                md: 2
              }}
              spacing={6}>
              
              <FormControl>
                <FormLabel>Instagram Handle</FormLabel>
                <Input value={draft.instagram || ''} onChange={(e) => setDraft({ ...draft, instagram: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Facebook Page</FormLabel>
                <Input value={draft.facebook || ''} onChange={(e) => setDraft({ ...draft, facebook: e.target.value })} />
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        <Card
          shadow="sm"
          border="1px solid"
          borderColor="gray.100"
          borderRadius="xl">
          
          <CardBody>
            <Text fontSize="lg" fontWeight="bold" color="brand.dark" mb={4}>
              SEO Defaults
            </Text>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Default Meta Title</FormLabel>
                <Input value={draft.metaTitle || ''} onChange={(e) => setDraft({ ...draft, metaTitle: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Default Meta Description</FormLabel>
                <Input
                  value={draft.metaDescription || ''}
                  onChange={(e) => setDraft({ ...draft, metaDescription: e.target.value })}
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
      )}
    </Box>);

}
