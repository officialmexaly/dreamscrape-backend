'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  Image,
  Button,
  VStack,
  HStack,
  Container,
} from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useServices } from '../providers/ServicesProvider';

export function ServicesPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = ((params?.id as string) || '').trim().replace(/\s+/g, '');
  const { services } = useServices();
  const [service, setService] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fromStore = services.find((s) => s.id === id || s.slug === id);
    if (fromStore) {
      setService(fromStore);
      return;
    }
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/services/${id}`, { cache: 'no-store' });
        const json = await res.json();
        if (res.ok && json?.item) setService(json.item);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, services]);

  if (isLoading) {
    return <Box p={8}>Loading preview...</Box>;
  }
  if (!service) {
    return <Box p={8}>Service not found.</Box>;
  }

  const routeId = service.slug || service.id;
  const listItems = service.list_items || [];

  return (
    <Box bg="white" minH="100vh" m={-8}>
      <Flex
        bg="brand.dark"
        color="white"
        p={3}
        justify="space-between"
        align="center"
        position="sticky"
        top={0}
        zIndex={100}>
        <HStack>
          <Button
            size="sm"
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => router.push(`/admin/services/${routeId}/edit`)}>
            Back to Editor
          </Button>
          <Text fontSize="sm" opacity={0.8}>
            Preview Mode
          </Text>
        </HStack>
      </Flex>

      <section className="py-24 bg-brand-light">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="w-full lg:w-1/2">
              <div className="relative aspect-[4/5] w-full">
                <img
                  src={service.image || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc'}
                  alt={service.title}
                  className="w-full h-full object-cover rounded-sm shadow-xl"
                />
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <h2 className="text-xs tracking-[0.2em] uppercase text-brand-gray mb-4">
                {service.category || 'Service'}
              </h2>
              <h3 className="text-3xl md:text-4xl font-serif text-brand-dark mb-6">
                {service.title}
              </h3>
              <p className="text-brand-gray font-light leading-relaxed mb-10">
                {service.description}
              </p>

              {listItems.length > 0 && (
                <div className="space-y-4 mb-10">
                  <p className="text-sm uppercase tracking-[0.16em] text-brand-pink">
                    Planning Options (Preview Only)
                  </p>
                  <ul className="space-y-3 text-brand-gray font-light">
                    {listItems.map((item: string, index: number) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <a
                href={service.cta_link || '/consultation-editorial'}
                className="inline-block rounded-full border border-brand-purple px-6 py-3 text-sm uppercase tracking-[0.14em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-white">
                {service.cta_text || 'Start Planning'}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Container maxW="1200px" py={16} />
    </Box>
  );
}
