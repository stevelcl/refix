export function findCategoryByKeyword(categories = [], keyword = "") {
  if (!keyword) return null;
  const normalized = keyword.toLowerCase();

  return categories.find((category) => {
    const name = (category?.name || "").toLowerCase();
    const id = (category?.id || "").toLowerCase();
    return name.includes(normalized) || id.includes(normalized);
  }) || null;
}

export function buildDeviceRoute(categoryName, brandName) {
  if (!categoryName || !brandName) return "/device";
  const encodedCategory = encodeURIComponent(categoryName);
  const encodedBrand = encodeURIComponent(brandName);
  return `/device/${encodedCategory}/${encodedBrand}`;
}

export function sortSubcategories(subcategories = []) {
  const getOrderValue = (item = {}) => {
    const { displayOrder } = item;
    if (typeof displayOrder === "number") return displayOrder;
    const parsed = Number(displayOrder);
    if (!Number.isNaN(parsed)) return parsed;
    return Number.MAX_SAFE_INTEGER;
  };

  return [...subcategories].sort((a, b) => {
    const orderDiff = getOrderValue(a) - getOrderValue(b);
    if (orderDiff !== 0) return orderDiff;
    return (a?.name || "").localeCompare(b?.name || "");
  });
}

