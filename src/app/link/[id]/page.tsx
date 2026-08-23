import { getLinkById, getWebsiteConfig } from '@/lib/notion';
import { mergeConfig } from '@/config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

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
      <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-lg">
        {/* 图标 + 标题 */}
        <div className="flex items-center gap-4">
          {link.iconfile || link.iconlink ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={link.iconfile || link.iconlink}
              alt={link.name}
              className="w-14 h-14 rounded-xl object-contain bg-white/10"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {link.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-foreground leading-snug break-words">
              {link.name}
            </h1>
            {link.desc && (
              <p className="text-sm text-muted-foreground mt-1 break-words">
                {link.desc}
              </p>
            )}
          </div>
        </div>

        {/* 跳转按钮 */}
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          <ExternalLink className="w-4 h-4" />
          打开链接
        </a>

        {/* 返回首页 */}
        <Link
          href="/"
          className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          返回导航首页
        </Link>
      </div>
    </div>
  );
}
