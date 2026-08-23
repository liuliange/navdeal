'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Link } from '@/types';
import NextLink from 'next/link';
import { ExternalLink } from 'lucide-react';
import { verifyPassword } from '@/lib/password';

// 卡片详情落地页的卡片内容（客户端组件）。
// 与首页 LinkCard 一致的加密逻辑：加密卡片在卡片内输入四位格子密码验证，
// 验证通过才能拿到真实 URL；公开卡片直接打开。真实跳转 URL 不暴露给未验证用户。
// 设计为单步动作：四位格子密码框内嵌卡片，不弹二次弹窗。

const PASSWORD_LENGTH = 4;

export default function LinkDetailCard({ link }: { link: Link }) {
  const isEncrypted = link.status === 'Encrypted';
  const [unlocked, setUnlocked] = useState(false);
  const [digits, setDigits] = useState<string[]>(
    Array(PASSWORD_LENGTH).fill(''),
  );
  const [error, setError] = useState('');
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (isEncrypted && !unlocked) {
      const t = setTimeout(
        () => inputRefs.current[0]?.focus(),
        50,
      );
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isEncrypted, unlocked]);

  const handleVerify = useCallback(() => {
    const pwd = digits.join('').trim();
    if (!pwd) return;
    if (verifyPassword(pwd, link.passwordHash)) {
      setUnlocked(true);
      setError('');
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } else {
      setError('密码错误，请重新输入');
      setDigits(Array(PASSWORD_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  }, [digits, link.passwordHash, link.url]);

  const setDigit = useCallback(
    (idx: number, value: string) => {
      // 只取最后一个数字（处理中文输入法等场景）
      const ch = value.replace(/\D/g, '').slice(-1);
      setDigits((prev) => {
        const next = [...prev];
        next[idx] = ch;
        return next;
      });
      setError('');
      // 自动跳到下一格（不自动验证，需点按钮）
      if (ch && idx < PASSWORD_LENGTH - 1) {
        inputRefs.current[idx + 1]?.focus();
      }
    },
    [],
  );

  const handleKeyDown = useCallback(
    (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        setDigits((prev) => {
          const next = [...prev];
          if (next[idx]) {
            next[idx] = '';
          } else if (idx > 0) {
            next[idx - 1] = '';
          }
          return next;
        });
        setError('');
        // 退格后跳到前一个空格子
        const target = idx > 0 && digits[idx] === '' ? idx - 1 : Math.max(0, idx - (digits[idx] ? 1 : 0));
        setTimeout(() => inputRefs.current[target]?.focus(), 0);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleVerify();
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      } else if (e.key === 'ArrowRight' && idx < PASSWORD_LENGTH - 1) {
        inputRefs.current[idx + 1]?.focus();
      }
    },
    [digits, handleVerify],
  );

  const handlePaste = useCallback(
    (idx: number, e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, PASSWORD_LENGTH - idx);
      if (!pasted) return;
      setDigits((prev) => {
        const next = [...prev];
        for (let i = 0; i < pasted.length; i++) {
          next[idx + i] = pasted[i];
        }
        return next;
      });
      setError('');
      const lastFilledIdx = Math.min(
        idx + pasted.length,
        PASSWORD_LENGTH - 1,
      );
      setTimeout(() => inputRefs.current[lastFilledIdx]?.focus(), 0);
      // 粘贴填满后不自动验证，需点「验证并打开」按钮
    },
    [],
  );

  return (
    <div className="w-full max-w-[280px] rounded-2xl border border-border/50 bg-card p-4 shadow-lg">
      {/* 图标 + 标题 */}
      <div className="flex items-center gap-2.5">
        {link.iconfile || link.iconlink ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={link.iconfile || link.iconlink}
            alt={link.name}
            className="w-10 h-10 rounded-lg object-contain bg-white/10 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
            {link.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-foreground leading-snug break-words line-clamp-2">
            {link.name}
          </h1>
          {link.desc && (
            <p className="text-[11px] text-muted-foreground mt-0.5 break-words line-clamp-2">
              {link.desc}
            </p>
          )}
        </div>
      </div>

      {/* 加密卡片：四位格子密码框（单步动作，不弹二次弹窗） */}
      {isEncrypted && !unlocked && (
        <div className="mt-3">
          <p className="text-[11px] text-slate-500 leading-relaxed text-center mb-2 px-1">
            微信搜公众号“榴莲哥”关注，发送关键词：密码，
            获取四位数字密码，即可免费下载。密码当天有效。
          </p>
          {/* 四位独立格子密码框 */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: PASSWORD_LENGTH }).map((_, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digits[idx]}
                onChange={(e) => setDigit(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={(e) => handlePaste(idx, e)}
                onFocus={(e) => e.currentTarget.select()}
                aria-label={`第 ${idx + 1} 位密码`}
                className={`w-10 h-10 text-center text-base font-semibold rounded-md border-2 outline-none transition-colors bg-background text-foreground ${
                  error
                    ? 'border-red-400 focus:border-red-500'
                    : digits[idx]
                      ? 'border-primary focus:border-primary'
                      : 'border-slate-300 focus:border-primary'
                }`}
              />
            ))}
          </div>
          <p className="mt-2 min-h-[18px] text-[11px] text-red-500 text-center leading-[18px]">
            {error}
          </p>
          <div className="flex justify-center mt-2.5">
            <button
              type="button"
              onClick={handleVerify}
              className="px-5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 active:opacity-80 transition-opacity"
            >
              验证并打开
            </button>
          </div>
        </div>
      )}

      {/* 跳转按钮：公开卡片直接显示；加密卡片验证后显示 */}
      {(!isEncrypted || unlocked) && (
        <div className="flex justify-center mt-3">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            打开链接
          </a>
        </div>
      )}

      {/* 返回首页按钮 */}
      <div className="flex justify-center mt-2">
        <NextLink
          href="/"
          className="px-5 py-1.5 rounded-md border border-border text-foreground text-xs font-medium hover:bg-accent transition-colors"
        >
          返回首页
        </NextLink>
      </div>
    </div>
  );
}