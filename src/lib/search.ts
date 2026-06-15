/**
 * Normalizes Arabic characters to their basic forms to handle typos and spelling variations.
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "ء")
    .replace(/ئ/g, "ء")
    .replace(/[\u064b-\u0652]/g, "") // remove diacritics
    .trim();
}

/**
 * Gets equivalent terms for common queries in the mobile shop.
 */
export function getEquivalentTerms(term: string): string[] {
  const normalized = normalizeArabic(term);
  const equivalents = [normalized];

  if (/^شاحن|^شواحن|^شحن/.test(normalized)) {
    equivalents.push("شاحن", "شواحن", "شحن");
  }
  if (/^سماعه|^سماعة|^سماعات/.test(normalized)) {
    equivalents.push("سماعه", "سماعة", "سماعات");
  }
  if (/^كفر|^كفرات|^حافظه|^حافظة|^بيت/.test(normalized)) {
    equivalents.push("كفر", "كفرات", "حافظه", "حافظة", "بيت");
  }
  if (/^كابل|^كابلات|^كيبل|^سلك|^واير/.test(normalized)) {
    equivalents.push("كابل", "كابلات", "كيبل", "سلك", "واير");
  }
  if (/^موبايل|^موبايلات|^هاتف|^تلفون|^جوال|^جوالات/.test(normalized)) {
    equivalents.push("موبايل", "موبايلات", "هاتف", "تلفون", "جوال", "جوالات");
  }
  if (/^ملحق|^ملحقات|^اكسسوار|^اكسسوارات/.test(normalized)) {
    equivalents.push("ملحق", "ملحقات", "اكسسوار", "اكسسوارات");
  }

  return Array.from(new Set(equivalents));
}

/**
 * Matches a query against a product's search fields.
 */
export function matchProduct(product: any, query: string): boolean {
  if (!query || !query.trim()) return true;

  const searchTerms = normalizeArabic(query).split(/\s+/).filter(Boolean);
  if (searchTerms.length === 0) return true;

  const prodNameNorm = normalizeArabic(product.name || "");
  const prodNameEnNorm = normalizeArabic(product.nameEn || "");
  const prodCatNorm = normalizeArabic(product.category || "");
  const prodDescNorm = normalizeArabic(product.description || "");
  const prodSpecsNorm = normalizeArabic(product.specs || "");

  // Every single term in the search query must match at least one field of the product (or match via synonyms)
  return searchTerms.every(term => {
    const equivalents = getEquivalentTerms(term);
    return equivalents.some(eq => 
      prodNameNorm.includes(eq) ||
      prodNameEnNorm.includes(eq) ||
      prodCatNorm.includes(eq) ||
      prodDescNorm.includes(eq) ||
      prodSpecsNorm.includes(eq)
    );
  });
}
