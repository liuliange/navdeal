'use client';

import { useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { useSearchContext } from './search-context';

// 搜索框滚动展示的关键词
const SCROLL_KEYWORDS = [
  '购物优惠',
  '吃喝玩乐',
  '外卖红包',
  '酒店民宿',
  '出行打车',
  '景点门票',
  '团购优惠',
  '电影演出',
  '特惠寄件',
  '四大运营商流量卡',
];

export function Search() {
  const { searchQuery, setSearchQuery } = useSearchContext();
  const [focused, setFocused] = useState(false);

  // 仅在未聚焦且无输入时展示滚动关键词，避免遮挡输入内容
  const showScroll = !focused && !searchQuery;

  return (
    <div className='relative flex items-center w-full max-w-xs'>
      {/* 搜索图标（左侧） */}
      <SearchIcon className='size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none' />

      <input
        type='text'
        placeholder=''
        className='w-full pl-8 pr-3 py-1.5 text-base text-left rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCorrect='off'
        autoCapitalize='off'
        spellCheck='false'
      />

      {/* 关键词向上滚动层：未聚焦且无输入时展示，向上无限循环 */}
      {showScroll && (
        <div className='absolute left-8 right-3 top-1/2 -translate-y-1/2 h-[1.5em] overflow-hidden pointer-events-none'>
          <div className='search-scroll-track'>
            {[...SCROLL_KEYWORDS, ...SCROLL_KEYWORDS].map((keyword, index) => (
              <div
                key={index}
                className='text-base leading-[1.5em] text-gray-400'
              >
                {keyword}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
