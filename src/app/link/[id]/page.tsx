import { getLinkById, getWebsiteConfig } from '@/lib/notion';
import { mergeConfig } from '@/config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LinkDetailCard from './detail-card';

// 分享详情页：微信/微博/朋友圈分享出去的卡片链接落地页。
// 通过 generateMetadata 输出 OG 元数据（标题/描述/图标），
// 让微信/微博等平台抓取后展示卡片预览（图标 + 标题 - 描述）。

type Props = {
  params: Promise<{ id: string }>;
};

export const revalidate = 43200;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const link = await getLinkById(id);
  const config = mergeConfig(await getWebsiteConfig());

  if (!link) {
    return {
      title: '卡片不存在',
      description: config.SITE_DESCRIPTION,
    };
  }

  const description = link.desc || config.SITE_DESCRIPTION || '';
  // OG 图标：优先 iconfile/iconlink，其次站点 favicon
  const ogImage = link.iconfile || link.iconlink || '/favicon.ico';

  return {
    title: link.name,
    description,
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      title: link.name,
      description,
      siteName: config.SITE_TITLE || '导航',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary',
      title: link.name,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function LinkDetailPage({ params }: Props) {
  const { id } = await params;
  const link = await getLinkById(id);

  if (!link) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
      <LinkDetailCard link={link} />
    </div>
  );
}
