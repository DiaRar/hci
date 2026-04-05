import { ConfigProvider } from 'antd';
import { StyleProvider } from 'antd-style';
import type { ReactNode } from 'react';

import useIllustrationTheme from './illustrationTheme';

export function AppProviders({ children }: { children: ReactNode }) {
  const configProps = useIllustrationTheme();

  return (
    <StyleProvider>
      <ConfigProvider {...configProps}>{children}</ConfigProvider>
    </StyleProvider>
  );
}
