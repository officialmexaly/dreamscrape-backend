'use client';

import React from 'react';
import {
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Box } from
'@chakra-ui/react';
import { LucideIcon } from 'lucide-react';
interface StatCardProps {
  title: string;
  value: string | number;
  helpText?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
}
export function StatCard({
  title,
  value,
  helpText,
  icon: Icon,
  trend
}: StatCardProps) {
  return (
    <Card
      shadow="sm"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="xl">
      
      <CardBody>
        <Flex justifyContent="space-between" alignItems="flex-start">
          <Stat>
            <StatLabel
              color="gray.500"
              fontSize="sm"
              fontWeight="medium"
              mb={1}>
              
              {title}
            </StatLabel>
            <StatNumber fontSize="3xl" fontWeight="bold" color="brand.dark">
              {value}
            </StatNumber>
            {helpText &&
            <StatHelpText
              color={
              trend === 'up' ?
              'green.500' :
              trend === 'down' ?
              'red.500' :
              'gray.500'
              }
              mt={2}
              mb={0}>
              
                {helpText}
              </StatHelpText>
            }
          </Stat>
          <Box p={3} bg="brand.gray" borderRadius="lg" color="brand.primary">
            <Icon size={24} />
          </Box>
        </Flex>
      </CardBody>
    </Card>);

}
