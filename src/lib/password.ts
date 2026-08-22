import { sha256 } from 'js-sha256';

/**
 * 计算字符串的 SHA-256 十六进制摘要（64 位 hex）。
 * 用于加密卡片的密码比对：Notion 数据库 password 字段存哈希，
 * 用户输入后计算哈希与存储值比对，避免明文泄露。
 */
export function sha256Digest(str: string): string {
  return sha256(String(str));
}

/**
 * 判断字符串是否为已预计算的 SHA-256（64 位 hex）。
 * Notion 里可直接填明文（由代码转哈希），也可直接填 64 位哈希值。
 */
export function isSHA256Digest(str: string): boolean {
  return typeof str === 'string' && /^[a-fA-F0-9]{64}$/.test(str.trim());
}

/**
 * 校验用户输入密码是否匹配存储的哈希。
 * - 若 storedHash 为空：无密码要求，直接通过（对应公开/草稿，正常不会走到这里）
 * - 若 storedHash 本身是 64 位哈希：直接比对输入哈希
 * - 否则视为明文：转哈希后比对（兼容性兜底）
 */
export function verifyPassword(input: string, storedHash: string): boolean {
  if (!storedHash) return true;
  const normalized = storedHash.trim();
  if (isSHA256Digest(normalized)) {
    return sha256Digest(input) === normalized.toLowerCase();
  }
  // 兜底：存储的是明文（历史数据），转哈希比对
  return sha256Digest(input) === sha256Digest(normalized);
}
