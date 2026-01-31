// Convert Telegram-style markdown to HTML for Telegram Bot API
export function markdownToTelegramHtml(text: string): string {
  let result = text;
  
  // Order matters! Process from most complex to simplest
  
  // Bold: **text** or *text* → <b>text</b>
  result = result.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  result = result.replace(/\*(.+?)\*/g, '<b>$1</b>');
  
  // Italic: _text_ → <i>text</i>
  result = result.replace(/_(.+?)_/g, '<i>$1</i>');
  
  // Underline: __text__ → <u>text</u>
  result = result.replace(/__(.+?)__/g, '<u>$1</u>');
  
  // Strikethrough: ~text~ → <s>text</s>
  result = result.replace(/~(.+?)~/g, '<s>$1</s>');
  
  // Spoiler: ||text|| → <tg-spoiler>text</tg-spoiler>
  result = result.replace(/\|\|(.+?)\|\|/g, '<tg-spoiler>$1</tg-spoiler>');
  
  // Code: `text` → <code>text</code>
  result = result.replace(/`(.+?)`/g, '<code>$1</code>');
  
  // Pre (code block): ```text``` → <pre>text</pre>
  result = result.replace(/```(.+?)```/gs, '<pre>$1</pre>');
  
  // Links: [text](url) → <a href="url">text</a>
  result = result.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  
  // Escape special HTML characters that weren't part of formatting
  // Note: We only escape < and > that are not part of our tags
  // This is tricky, so we'll leave this for now
  
  // Newlines: \n stays as is (Telegram handles them)
  
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
