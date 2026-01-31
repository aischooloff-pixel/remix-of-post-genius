import { describe, it, expect } from 'vitest';
import { markdownToTelegramHtml, stripMarkdown } from './telegram-formatter';

describe('markdownToTelegramHtml', () => {
  it('converts links correctly', () => {
    const input = '[позволит](https://t.me/shagulin)';
    const expected = '<a href="https://t.me/shagulin">позволит</a>';
    expect(markdownToTelegramHtml(input)).toBe(expected);
  });

  it('handles link in middle of text', () => {
    const input = 'Это [позволит](https://t.me/shagulin) оптимизировать';
    const expected = 'Это <a href="https://t.me/shagulin">позволит</a> оптимизировать';
    expect(markdownToTelegramHtml(input)).toBe(expected);
  });

  it('handles multiple links', () => {
    const input = '[one](https://a.com) and [two](https://b.com)';
    const expected = '<a href="https://a.com">one</a> and <a href="https://b.com">two</a>';
    expect(markdownToTelegramHtml(input)).toBe(expected);
  });

  it('converts bold correctly', () => {
    expect(markdownToTelegramHtml('**bold**')).toBe('<b>bold</b>');
    expect(markdownToTelegramHtml('*bold*')).toBe('<b>bold</b>');
  });

  it('converts italic correctly', () => {
    expect(markdownToTelegramHtml('_italic_')).toBe('<i>italic</i>');
  });

  it('converts underline correctly', () => {
    expect(markdownToTelegramHtml('__underline__')).toBe('<u>underline</u>');
  });

  it('converts strikethrough correctly', () => {
    expect(markdownToTelegramHtml('~strike~')).toBe('<s>strike</s>');
  });

  it('converts spoiler correctly', () => {
    expect(markdownToTelegramHtml('||spoiler||')).toBe('<tg-spoiler>spoiler</tg-spoiler>');
  });

  it('converts code correctly', () => {
    expect(markdownToTelegramHtml('`code`')).toBe('<code>code</code>');
  });

  it('handles complex mixed formatting', () => {
    const input = '**Bold** and _italic_ with [link](https://t.me)';
    const expected = '<b>Bold</b> and <i>italic</i> with <a href="https://t.me">link</a>';
    expect(markdownToTelegramHtml(input)).toBe(expected);
  });
});
