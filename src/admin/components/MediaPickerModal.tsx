'use client';

import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Image,
  Box,
  Text } from
'@chakra-ui/react';
import { useMedia } from '../providers/MediaProvider';
interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}
export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect
}: MediaPickerModalProps) {
  const { media, isLoading } = useMedia();
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Media</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {isLoading && <Text color="gray.500">Loading...</Text>}
          <SimpleGrid
            columns={{
              base: 2,
              md: 3,
              lg: 4
            }}
            spacing={4}>
            
            {media.map((item) =>
            <Box
              key={item.id}
              cursor="pointer"
              borderRadius="md"
              overflow="hidden"
              border="2px solid transparent"
              _hover={{
                borderColor: 'brand.primary',
                transform: 'scale(1.02)'
              }}
              transition="all 0.2s"
              onClick={() => {
                onSelect(item.url);
                onClose();
              }}>
              
                <Image
                src={item.url}
                alt={item.name}
                h="150px"
                w="full"
                objectFit="cover" />
              
                <Box p={2} bg="gray.50">
                  <Text fontSize="xs" noOfLines={1} fontWeight="medium">
                    {item.name}
                  </Text>
                </Box>
              </Box>
            )}
          </SimpleGrid>
        </ModalBody>
      </ModalContent>
    </Modal>);

}
