"use client";

import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { ArrowUp, Send, Plus, MessageSquare, Share2 } from "lucide-react";
import { SiNotion, SiTencentqq } from "react-icons/si";
import { FaWeixin } from "react-icons/fa6";

const SHARE_TEXT = "特价团 · 你的省钱生活指南https://tejiatuan.cn";

// 轻量 Toast - 在按钮左侧对齐分享按钮，不挡菜单
function Toast({ msg, show }: { msg: string; show: boolean }) {
  if (!show) return null;

  return (
    <div
      className="absolute right-full bottom-0 mr-2 z-[100] pointer-events-none
                px-3 py-1.5 rounded-lg bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/85
                border border-white/20 shadow-lg text-xs text-popover-foreground
                animate-in fade-in slide-in-from-right-2 duration-200 whitespace-nowrap"
    >
      {msg}
    </div>
  );
}

type MenuItem = {
  key: string;
  label: string;
  icon: () => ReactNode;
  action: "top" | "link" | "share";
  href?: string;
};

const MENU_ITEMS: MenuItem[] = [
  { key: "top", label: "回到顶部", icon: () => <ArrowUp className="w-4 h-4" />, action: "top" },
  {
    key: "notion",
    label: "Notion 资源库",
    icon: () => <SiNotion className="w-4 h-4" />,
    action: "link",
    href: "https://199909.notion.site/faebd1c82aca47669b20fa1b8c37106b?source=copy_link",
  },
  {
    key: "wechat",
    label: "微信公众号",
    icon: () => <FaWeixin className="w-4 h-4" />,
    action: "link",
    href: "https://my.feishu.cn/wiki/RMKjwYflBiru4qkyktjcHl7mnLh?from=from_copylink",
  },
  {
    key: "feishu",
    label: "飞书资源库",
    icon: () => <Send className="w-4 h-4" />,
    action: "link",
    href: "https://my.feishu.cn/wiki/VYxcwTey8iHJVpkBoA9cOqG8nqh",
  },
  {
    key: "qq",
    label: "QQ群",
    icon: () => <SiTencentqq className="w-4 h-4" />,
    action: "link",
    href: "https://qm.qq.com/q/Dhu9fAUUDe",
  },
  {
    key: "info",
    label: "信息反馈",
    icon: () => <MessageSquare className="w-4 h-4" />,
    action: "link",
    href: "https://durians.notion.site/3b51c233e9d98085bca8e3627964765a?pvs=105",
  },
  { key: "share", label: "分享", icon: () => <Share2 className="w-4 h-4" />, action: "share" },
];

export function FloatingMenu() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      isMobile.current = window.matchMedia("(hover: none)").matches;
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast({ show: true, msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ show: false, msg: "" }), 2000);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const handleShare = useCallback(async () => {
    const mobile = isMobile.current;

    if (mobile) {
      // 移动端：复制 + 提示
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(SHARE_TEXT);
          showToast("复制成功，快去分享吧！");
        } catch {
          showToast("复制失败，请手动复制");
        }
      } else {
        showToast("复制失败，请手动复制");
      }
    } else {
      // 桌面端：只提示，不复制
      showToast("按住Ctrl+D键，加入你的收藏夹，每天都能帮你省一笔！");
    }
  }, [showToast]);

  const handleItemClick = (item: MenuItem) => {
    if (item.action === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (item.href && item.href !== "#") {
      window.open(item.href, "_blank", "noopener,noreferrer");
    }
    setOpen(false);
  };

  const btnBase =
    "flex items-center justify-center rounded-full text-primary-foreground bg-primary shadow-md transition-all duration-200 ease-out h-8 w-8 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus:ring-0";

  return (
    <div className="fixed right-4 md:right-6 bottom-20 z-50 flex flex-col items-end">
      <div className="absolute bottom-full right-0 flex flex-col items-end gap-2.5 mb-2.5">
        {MENU_ITEMS.map((item, idx) =>
          item.action === "share" ? (
            <div key={item.key} className="relative flex items-center">
              <Toast msg={toast.msg} show={toast.show} />
              <button
                type="button"
                aria-label={item.label}
                onClick={handleShare}
                className={[
                  btnBase,
                  open
                    ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                    : "opacity-0 translate-y-2 scale-95 pointer-events-none",
                ].join(" ")}
              style={{ transitionDelay: open ? `${idx * 30}ms` : "0ms" }}
            >
              {item.icon()}
            </button>
            </div>
          ) : (
            <button
              key={item.key}
              type="button"
              aria-label={item.label}
              onClick={() => handleItemClick(item)}
              className={[
                btnBase,
                open
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                  : "opacity-0 translate-y-2 scale-95 pointer-events-none",
              ].join(" ")}
              style={{ transitionDelay: open ? `${idx * 30}ms` : "0ms" }}
            >
              {item.icon()}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        aria-label={open ? "收起菜单" : "展开菜单"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={[btnBase, "hover:scale-105", open ? "rotate-45" : "rotate-0"].join(" ")}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
