'use client';
import { ConfigProvider, App } from 'antd';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6750A4',
          colorPrimaryBg: '#EDE7F6',
          borderRadius: 8,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
        components: {
          Button: { borderRadius: 8 },
          Card: { borderRadius: 12 },
          Input: { borderRadius: 8 },
          Select: { borderRadius: 8 },
          Tag: { borderRadius: 999 },
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
