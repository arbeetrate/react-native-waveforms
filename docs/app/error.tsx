'use client';

import {
  Anchor,
  Button,
  Code,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in the browser console for debugging.
    console.error(error);
  }, [error]);

  return (
    <Container size="sm" py="xl">
      <Stack gap="md" align="flex-start">
        <Text size="sm" c="dimmed" ff="monospace">
          500
        </Text>
        <Title order={1}>Something went wrong</Title>
        <Text c="dimmed">
          An unexpected error occurred while rendering this page.
        </Text>
        {error.digest && (
          <Text size="sm" c="dimmed">
            Reference: <Code>{error.digest}</Code>
          </Text>
        )}
        <Group mt="md">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Anchor component={Link} href="/">
            ← Back to home
          </Anchor>
        </Group>
      </Stack>
    </Container>
  );
}
