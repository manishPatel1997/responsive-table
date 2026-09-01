import { describe, it, expect } from 'vitest';
import {
  clamp,
  parseWidthValue,
  sampleRowIndices,
  generateColumnsFingerprint,
} from '../utils';

describe('Engine Utilities', () => {
  describe('clamp', () => {
    it('clamps values within bounds', () => {
      expect(clamp(50, 100, 200)).toBe(100);
      expect(clamp(150, 100, 200)).toBe(150);
      expect(clamp(250, 100, 200)).toBe(200);
    });
  });

  describe('parseWidthValue', () => {
    it('parses numbers and px strings', () => {
      expect(parseWidthValue(150)).toBe(150);
      expect(parseWidthValue('150px')).toBe(150);
      expect(parseWidthValue('150')).toBe(150);
      expect(parseWidthValue('  200px  ')).toBe(200);
    });

    it('returns null for undefined, null, or invalid strings', () => {
      expect(parseWidthValue(undefined)).toBeNull();
      expect(parseWidthValue(null as unknown as undefined)).toBeNull();
      expect(parseWidthValue('100%')).toBeNull();
      expect(parseWidthValue('auto')).toBeNull();
      expect(parseWidthValue(-50)).toBeNull();
    });
  });

  describe('sampleRowIndices', () => {
    it('returns all indices when dataset <= sampleSize', () => {
      expect(sampleRowIndices(5, 50)).toEqual([0, 1, 2, 3, 4]);
      expect(sampleRowIndices(0, 50)).toEqual([]);
    });

    it('samples first 10, last 10, and distributed middle for large dataset', () => {
      const sampled = sampleRowIndices(100, 50);
      expect(sampled.length).toBeLessThanOrEqual(50);
      // Contains first 10
      for (let i = 0; i < 10; i++) {
        expect(sampled).toContain(i);
      }
      // Contains last 10
      for (let i = 90; i < 100; i++) {
        expect(sampled).toContain(i);
      }
    });
  });

  describe('generateColumnsFingerprint', () => {
    it('generates deterministic JSON string', () => {
      const fp1 = generateColumnsFingerprint([
        { key: 'a', minWidth: 50, nowrap: true },
      ]);
      const fp2 = generateColumnsFingerprint([
        { key: 'a', minWidth: 50, nowrap: true },
      ]);
      const fp3 = generateColumnsFingerprint([
        { key: 'a', minWidth: 60, nowrap: true },
      ]);

      expect(fp1).toBe(fp2);
      expect(fp1).not.toBe(fp3);
    });
  });
});
