const vnd = new Intl.NumberFormat("vi-VN");

/** 32000 -> "32.000đ" */
export function formatVND(amount: number): string {
  return `${vnd.format(amount)}đ`;
}

/** Strips Vietnamese diacritics so "ca phe" matches "Cà phê". */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}
