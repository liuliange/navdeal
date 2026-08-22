'use client';

import React, { useEffect, useRef, useState } from 'react';
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
 */
export default function PasswordDialog({ open, onCancel, onConfirm, error }: PasswordDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!open) return;
    setValue('');
    // 等待 portal 挂载后聚焦
    const t = setTimeout(() => inputRef.current?.focus(), 50);
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

  if (!open) return null;
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    onConfirm(v);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* 卡片 */}
      <div
        className="relative w-full max-w-xs rounded-2xl bg-white p-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
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

        {/* 密码输入 */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <input
            ref={inputRef}
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="请输入四位数字密码"
            autoFocus
            className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-900 outline-none transition-colors ${
              error
                ? 'border-red-400 focus:border-red-500'
                : 'border-slate-300 focus:border-slate-500'
            }`}
          />

          {/* 错误提示 */}
          {error && (
            <p className="mt-1.5 text-xs text-red-500 animate-in fade-in slide-in-from-top-1 duration-150">
              {error}
            </p>
          )}

          {/* 确认按钮 */}
          <button
            type="submit"
            className="mt-3 w-full py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 active:bg-slate-700 transition-colors"
          >
            验证
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
