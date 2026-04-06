import { ConfigProvider } from 'antd';
import { StyleProvider } from 'antd-style';
import { HappyProvider } from '@ant-design/happy-work-theme';

import type { ReactNode } from 'react';

import useIllustrationTheme from './illustrationTheme';

export function AppProviders({ children }: { children: ReactNode }) {
  const configProps = useIllustrationTheme();

  return (
    <StyleProvider>
      <ConfigProvider {...configProps}>
        <HappyProvider>
          {children}
        </HappyProvider>
      </ConfigProvider>
    </StyleProvider>
  );
}
