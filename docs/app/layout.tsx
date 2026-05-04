import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from '@mantine/core';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import '@mantine/core/styles.css';
import 'nextra-theme-docs/style.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | react-native-waveforms',
    default: 'react-native-waveforms',
  },
  description:
    'Cross-platform audio waveform visualizer for React Native, Expo and Web.',
};

const REPO_URL = 'https://github.com/arbeetrate/react-native-waveforms';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pageMap = await getPageMap();
  const navbar = (
    <Navbar
      logo={<strong>react-native-waveforms</strong>}
      projectLink={REPO_URL}
    />
  );
  const footer = <Footer>© react-native-waveforms</Footer>;
  return (
    <html lang="en" dir="ltr" {...mantineHtmlProps}>
      <Head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </Head>
      <body>
        <MantineProvider defaultColorScheme="auto">
          <Layout
            navbar={navbar}
            pageMap={pageMap}
            docsRepositoryBase={`${REPO_URL}/tree/main/docs`}
            footer={footer}
            sidebar={{ toggleButton: false }}>
            {children}
          </Layout>
        </MantineProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
