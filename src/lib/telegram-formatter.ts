// Convert Telegram-style markdown to HTML for Telegram Bot API
export function markdownToTelegramHtml(text: string): string {
  let result = text;
  
  // CRITICAL: Process links FIRST before other formatting
  // This prevents other regex from breaking link structure
  // Links: [text](url) → <a href="url">text</a>
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Pre (code block): ```text``` → <pre>text</pre>
  // Process before inline code to avoid conflicts
  result = result.replace(/```([\s\S]+?)```/g, '<pre>$1</pre>');
  
  // Code: `text` → <code>text</code>
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Spoiler: ||text|| → <tg-spoiler>text</tg-spoiler>
  result = result.replace(/\|\|([^|]+)\|\|/g, '<tg-spoiler>$1</tg-spoiler>');
  
  // Underline: __text__ → <u>text</u>
  // Process BEFORE italic to avoid _ matching inside __
  result = result.replace(/__([^_]+)__/g, '<u>$1</u>');
  
  // Bold: **text** → <b>text</b>
  // Process double asterisks before single
  result = result.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  
  // Bold single: *text* → <b>text</b>
  result = result.replace(/\*([^*]+)\*/g, '<b>$1</b>');
  
  // Italic: _text_ → <i>text</i>
  result = result.replace(/_([^_]+)_/g, '<i>$1</i>');
  
  // Strikethrough: ~text~ → <s>text</s>
  result = result.replace(/~([^~]+)~/g, '<s>$1</s>');
  
  return result;
}

// Clean text by removing markdown syntax for plain display
export function stripMarkdown(text: string): string {
  let result = text;
  
  result = result.replace(/\*\*(.+?)\*\*/g, '$1');
  result = result.replace(/\*(.+?)\*/g, '$1');
  result = result.replace(/_(.+?)_/g, '$1');
  result = result.replace(/__(.+?)__/g, '$1');
  result = result.replace(/~(.+?)~/g, '$1');
  result = result.replace(/\|\|(.+?)\|\|/g, '$1');
  result = result.replace(/`(.+?)`/g, '$1');
  result = result.replace(/```(.+?)```/gs, '$1');
  result = result.replace(/\[(.+?)\]\((.+?)\)/g, '$1');
  
  return result;
}

// Escape HTML special characters for safe display
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
