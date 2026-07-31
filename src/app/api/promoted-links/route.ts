// src/app/api/promoted-links/route.ts
import { getLinks } from '@/lib/notion';
import { NextResponse } from 'next/server';
import { BADGE_TAGS, MAX_PROMOTED } from '@/lib/tags';

export const revalidate = 3600;

export async function GET() {
  try {
    const allLinks = await getLinks();

    // 命中角标标签（原置顶推广标签）的链接进入推广位，不再剥离角标标签
    const promotedLinks = allLinks
      .filter((link) => link.tags?.some((t) => BADGE_TAGS.includes(t)))
      .slice(0, MAX_PROMOTED);

    return NextResponse.json({ links: promotedLinks });
  } catch (error) {
    console.error('获取推广链接失败:', error);
    return NextResponse.json(
      { error: '获取推广链接失败' },
      { status: 500 }
    );
  }
}
