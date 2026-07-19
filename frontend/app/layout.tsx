import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CustomerServiceWidget } from '@/components/CustomerServiceWidget';

export const metadata: Metadata = {
  title: '小Young商城',
  description: '农产品售卖、订单管理、物流跟踪一体化平台'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="shell">
          <header className="topbar">
            <div>
              <p className="eyebrow">Agro Commerce</p>
              <h1>农产优选项目</h1>
            </div>
            <nav>
              <Link href="/">商城首页</Link>
              <Link href="/admin">后台管理</Link>
            </nav>
          </header>
          <main>{children}</main>
        </div>
        <CustomerServiceWidget />
      </body>
    </html>
  );
}
