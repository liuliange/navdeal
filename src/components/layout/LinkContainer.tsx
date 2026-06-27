// src/components/LinkContainer.tsx
"use client";

import React, { useState, useEffect, useMemo, memo } from "react";
import LinkCard from "@/components/ui/LinkCard";
import * as Icons from "lucide-react";
import { Link, Category } from '@/types';
import { useSearchContext } from "@/components/search-context";

interface LinkContainerProps {
  initialLinks: Link[];
  enabledCategories: Set<string>;
  categories: Category[];
}

const LinkContainer = memo(function LinkContainer({
  initialLinks,
  enabledCategories,
  categories,
}: LinkContainerProps) {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const { searchQuery } = useSearchContext();

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
  }, []);

  // 按一级和二级分类组织链接，只包含启用的分类，并支持搜索过滤
  const linksByCategory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    return initialLinks.reduce((acc, link) => {
      const cat1 = link.category1;
      const cat2 = link.category2;

      // 搜索过滤：匹配标题或描述
      if (query) {
        const title = (link.name || '').toLowerCase();   // ✅ 改为 name
        const desc = (link.desc || '').toLowerCase();
        if (!title.includes(query) && !desc.includes(query)) {
          return acc;
        }
      }

      if (enabledCategories.has(cat1)) {
        if (!acc[cat1]) {
          acc[cat1] = {};
        }
        if (!acc[cat1][cat2]) {
          acc[cat1][cat2] = [];
        }
        acc[cat1][cat2].push(link);
      }
      return acc;
    }, {} as Record<string, Record<string, Link[]>>);
  }, [initialLinks, enabledCategories, searchQuery]);

  const formatDate = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(/\//g, '-');
  };

  // 计算过滤后的总链接数
  const totalLinks = useMemo(() => {
    let count = 0;
    Object.values(linksByCategory).forEach(catGroup => {
      Object.values(catGroup).forEach(links => {
        count += links.length;
      });
    });
    return count;
  }, [linksByCategory]);

  return (
    <div className="space-y-16 pb-12 w-full min-w-0">
      {/* 搜索结果显示数量 */}
      {searchQuery.trim() && (
        <div className="text-sm text-muted-foreground border-b pb-2">
          找到 <span className="font-medium text-foreground">{totalLinks}</span> 个相关的结果
        </div>
      )}
      {categories.map((category) => {
        const categoryLinks = linksByCategory[category.name];
        if (!categoryLinks) return null;

        return (
          <section key={category.id} id={category.id} className="space-y-8">
            <div className="flex items-center space-x-3 pb-2 border-b">
              {category.iconName &&
              Icons[category.iconName as keyof typeof Icons] ? (
                <div className="w-7 h-7 p-1 rounded-lg bg-primary/5 text-primary">
                  {React.createElement(
                    Icons[
                      category.iconName as keyof typeof Icons
                    ] as React.ComponentType<{ className: string }>,
                    { className: "w-5 h-5" }
                  )}
                </div>
              ) : null}
              <h2 className="text-2xl font-bold tracking-tight">{category.name}</h2>
            </div>

            <div className="space-y-12">
              {Object.entries(categoryLinks).map(([subCategory, links]) => (
                <div
                  key={`${category.id}-${subCategory
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  id={`${category.id}-${subCategory
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-1 rounded-full bg-primary"></div>
                    <h3 className="text-lg font-medium text-foreground/90">
                      {subCategory}
                    </h3>
                    <div className="text-sm text-muted-foreground">({links.length})</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 w-full">
                    {links.map((link) => (
                      <LinkCard key={link.id} link={link} className="w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
      {/* 搜索无结果提示 */}
      {searchQuery.trim() && totalLinks === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">没有找到与“<span className="font-medium text-foreground">{searchQuery.trim()}</span>”相关的结果，添加客服微信525821377帮忙查询</p>
        </div>
      )}
      {mounted && currentTime && (
        <div className="mt-12 text-center text-sm text-muted-foreground">
          最近更新：{formatDate(currentTime)}
        </div>
      )}
    </div>
  );
});

export default LinkContainer;
