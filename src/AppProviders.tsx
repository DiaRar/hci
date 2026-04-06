import { ConfigProvider } from 'antd';
import { StyleProvider } from 'antd-style';
import type { ReactNode } from 'react';
import { HappyProvider } from '@ant-design/happy-work-theme';
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
