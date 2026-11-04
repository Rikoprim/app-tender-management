import { describe, it, expect } from "vitest";
import { formatDate, formatFileSize, formatConfidence } from "../lib/format";

describe("format.ts", () => {
  describe("formatDate", () => {
    it("returns '-' for null or invalid dates", () => {
      expect(formatDate(null)).toBe("-");
      expect(formatDate(undefined)).toBe("-");
      expect(formatDate("invalid-date-string")).toBe("-");
    });

    it("formats ISO string correctly into dd MMM yyyy, HH:mm", () => {
      const formatted = formatDate("2026-11-03T10:15:00.000Z");
      expect(formatted).toMatch(/\d{2} \w{3} 2026, \d{2}:\d{2}/);
    });

    it("includes seconds when requested", () => {
      const formatted = formatDate("2026-11-03T10:15:30.000Z", true);
      expect(formatted).toMatch(/\d{2} \w{3} 2026, \d{2}:\d{2}:\d{2}/);
    });
  });

  describe("formatFileSize", () => {
    it("returns '0 B' for invalid or zero values", () => {
      expect(formatFileSize(null)).toBe("0 B");
      expect(formatFileSize(undefined)).toBe("0 B");
      expect(formatFileSize(-100)).toBe("0 B");
      expect(formatFileSize(0)).toBe("0 B");
    });

    it("formats bytes, KB, and MB appropriately", () => {
      expect(formatFileSize(512)).toBe("512 B");
      expect(formatFileSize(2048)).toBe("2.0 KB");
      expect(formatFileSize(5242880)).toBe("5.0 MB");
    });
  });

  describe("formatConfidence", () => {
    it("formats decimal score (0..1) to percentage", () => {
      expect(formatConfidence(0.95)).toBe("95%");
      expect(formatConfidence(0.999)).toBe("100%");
      expect(formatConfidence(0.854)).toBe("85%");
    });

    it("clamps out of range or NaN scores", () => {
      expect(formatConfidence(1.5)).toBe("100%");
      expect(formatConfidence(-0.2)).toBe("0%");
      expect(formatConfidence(NaN)).toBe("0%");
    });
  });
});

