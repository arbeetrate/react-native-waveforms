import { Anchor, Container, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

export const metadata = {
  title: '404 — Page not found',
};

export default function NotFound() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="md" align="flex-start">
        <Text size="sm" c="dimmed" ff="monospace">
          404
        </Text>
        <Title order={1}>Page not found</Title>
        <Text c="dimmed">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        </Text>
        <Anchor component={Link} href="/" mt="md">
          ← Back to home
        </Anchor>
      </Stack>
    </Container>
  );
}
