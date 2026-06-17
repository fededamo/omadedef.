import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('should merge basic tailwind classes', () => {
    expect(cn('p-2', 'm-2')).toBe('p-2 m-2');
  });

  it('should resolve tailwind conflicts correctly', () => {
    // tailwind-merge resolves conflicts, so the last one wins
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('should handle conditional classes (clsx behavior)', () => {
    const isTrue = true;
    const isFalse = false;
    expect(cn('p-2', isTrue && 'm-2', isFalse && 'bg-red-500')).toBe('p-2 m-2');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['p-2', 'm-2'], 'bg-blue-500')).toBe('p-2 m-2 bg-blue-500');
  });

  it('should handle undefined, null, and false gracefully', () => {
    expect(cn('p-2', undefined, null, false, 'm-2')).toBe('p-2 m-2');
  });

  it('should handle empty strings', () => {
    expect(cn('', 'p-2', '')).toBe('p-2');
  });
});
