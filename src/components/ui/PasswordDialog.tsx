'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Lock, X } from 'lucide-react';

interface PasswordDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (password: string) => void;
  error?: string;
}

/**
 * 密码验证对话框：加密卡片点击跳转按钮时弹出。
 * 复用站点既有的白底毛玻璃 + slate 色系视觉，居中模态，esc/遮罩点击关闭。
 *
 * 设计要点（与详情页 detail-card 统一）：
 * - 四位独立格子密码框（自动跳格、退格回退、粘贴支持）
 * - 不自动验证，必须点「验证」按钮（Enter 也走 onConfirm）
 * - 错误文案始终渲染并预留高度（min-h-[18px]），避免出现错误时卡片被拉长
 * - 验证按钮缩短为 w-fit
 * - 卡片整体高度预留：标题+描述+输入+错误占位+按钮，一次到位
 */
const PASSWORD_LENGTH = 4;

export default function PasswordDialog({ open, onCancel, onConfirm, error }: PasswordDialogProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState<string[]>(
    Array(PASSWORD_LENGTH).fill(''),
  );

  // 每次打开时清空已输入的数字，让用户重新输入
  useEffect(() => {
    if (!open) return;
    setDigits(Array(PASSWORD_LENGTH).fill(''));
    const t = setTimeout(
      () => inputRefs.current[0]?.focus(),
      50,
    );
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  const submit = useCallback(() => {
    const pwd = digits.join('').trim();
    if (!pwd) return;
    onConfirm(pwd);
  }, [digits, onConfirm]);

  const setDigit = useCallback((idx: number, value: string) => {
    // 只取最后一个数字（处理中文输入法等场景）
    const ch = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = ch;
      return next;
    });
    // 自动跳到下一格（不自动验证，需点按钮）
    if (ch && idx < PASSWORD_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  }, []);

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
        // 退格后跳到前一个空格子
        const target =
          idx > 0 && digits[idx] === ''
            ? idx - 1
            : Math.max(0, idx - (digits[idx] ? 1 : 0));
        setTimeout(() => inputRefs.current[target]?.focus(), 0);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      } else if (e.key === 'ArrowRight' && idx < PASSWORD_LENGTH - 1) {
        inputRefs.current[idx + 1]?.focus();
      }
    },
    [digits, submit],
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
      const lastFilledIdx = Math.min(
        idx + pasted.length,
        PASSWORD_LENGTH - 1,
      );
      setTimeout(() => inputRefs.current[lastFilledIdx]?.focus(), 0);
      // 粘贴填满后不自动验证，需点「验证」按钮
    },
    [],
  );

  if (!open) return null;
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* 卡片 */}
      <div
        className="relative w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="输入密码"
      >
        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="关闭"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* 锁图标 */}
        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 text-slate-600">
            <Lock className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* 标题 */}
        <h3 className="text-center text-sm font-semibold text-slate-900 mb-1.5">
          关注公众号后输入口令下载
        </h3>
        <p className="text-center text-xs text-slate-500 mb-4 leading-relaxed">
          微信搜公众号“榴莲哥”关注，发送关键词：密码，
          <br />
          获取四位数字密码，即可免费下载。密码当天有效。
        </p>

        {/* 四位独立格子密码框（与详情页 detail-card 统一） */}
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
              className={`w-10 h-10 text-center text-base font-semibold rounded-md border-2 outline-none transition-colors bg-white text-slate-900 ${
                error
                  ? 'border-red-400 focus:border-red-500'
                  : digits[idx]
                    ? 'border-primary focus:border-primary'
                    : 'border-slate-300 focus:border-slate-500'
              }`}
            />
          ))}
        </div>

        {/* 错误提示：始终渲染并预留高度（min-h-[18px]），避免卡片被拉长 */}
        <p className="mt-2 min-h-[18px] text-xs text-red-500 text-center leading-[18px]">
          {error || ''}
        </p>

        {/* 验证按钮：缩短为 w-fit，与详情页卡片按钮协调 */}
        <div className="flex justify-center mt-3">
          <button
            type="button"
            onClick={submit}
            className="px-5 py-1.5 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 active:bg-slate-700 transition-colors"
          >
            验证
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}