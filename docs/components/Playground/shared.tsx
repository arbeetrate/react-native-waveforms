'use client';
import {
  Card,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  type CardProps,
} from '@mantine/core';
import type { ReactNode } from 'react';

export const Stage = ({ children }: { children: ReactNode }) => (
  <Paper
    withBorder
    radius="md"
    p="lg"
    bg="transparent"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 140,
    }}
  >
    {children}
  </Paper>
);

export const ControlPanel = ({
  children,
  ...rest
}: { children: ReactNode } & Omit<CardProps, 'children'>) => (
  <Card withBorder radius="md" mt="md" bg="transparent" p="lg" {...rest}>
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="md">
      {children}
    </SimpleGrid>
  </Card>
);

/** Mantine's `<Slider>` only shows its value as a drag tooltip. For the
 * playground we want a static label + value row above and an optional
 * description below - same shape as Mantine's native Input description. */
export const SliderField = ({
  label,
  value,
  description,
  children,
}: {
  label: string;
  value: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) => (
  <Stack gap={4}>
    <Group justify="space-between">
      <Text size="sm" fw={500}>
        {label}
      </Text>
      <Text size="sm" ff="monospace" c="dimmed">
        {value}
      </Text>
    </Group>
    {children}
    {description && (
      <Text size="xs" c="dimmed">
        {description}
      </Text>
    )}
  </Stack>
);
