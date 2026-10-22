import type { Category, Menu, OptionGroup, Product } from "./types";

/**
 * Seed menu. Phase 2 moves this into Supabase (see supabase/schema.sql);
 * until then getMenu() in menu.ts reads from here.
 */

const categories: Category[] = [
  { id: "ca-phe", slug: "ca-phe", name: "Cà phê", description: "Robusta và Arabica Cầu Đất, rang mỗi tuần.", sort: 1 },
  { id: "tra-sua", slug: "tra-sua", name: "Trà sữa", description: "Trà ủ trong ngày, trân châu nấu mỗi 4 tiếng.", sort: 2 },
  { id: "tra", slug: "tra", name: "Trà trái cây", description: "Trà nền thanh, trái cây tươi.", sort: 3 },
  { id: "nuoc-ep", slug: "nuoc-ep", name: "Nước ép & sinh tố", description: "Ép và xay khi có đơn, không pha sẵn.", sort: 4 },
  { id: "banh", slug: "banh", name: "Bánh", description: "Nướng mỗi sáng tại bếp của quán.", sort: 5 },
];

const groups: OptionGroup[] = [
  {
    id: "size",
    name: "Size",
    selectType: "single",
    isRequired: true,
    options: [
      { id: "size-s", name: "Nhỏ", priceDelta: 0, isDefault: true },
      { id: "size-m", name: "Vừa", priceDelta: 6000 },
      { id: "size-l", name: "Lớn", priceDelta: 10000 },
    ],
  },
  {
    id: "sugar",
    name: "Mức đường",
    selectType: "single",
    isRequired: true,
    options: [
      { id: "sugar-100", name: "100%", priceDelta: 0, isDefault: true },
      { id: "sugar-70", name: "70%", priceDelta: 0 },
      { id: "sugar-50", name: "50%", priceDelta: 0 },
      { id: "sugar-30", name: "30%", priceDelta: 0 },
      { id: "sugar-0", name: "Không đường", priceDelta: 0 },
    ],
  },
  {
    id: "ice",
    name: "Mức đá",
    selectType: "single",
    isRequired: true,
    options: [
      { id: "ice-normal", name: "Bình thường", priceDelta: 0, isDefault: true },
      { id: "ice-less", name: "Ít đá", priceDelta: 0 },
      { id: "ice-none", name: "Không đá", priceDelta: 0 },
      { id: "ice-separate", name: "Đá để riêng", priceDelta: 0 },
    ],
  },
  {
    id: "milk",
    name: "Loại sữa",
    selectType: "single",
    isRequired: true,
    options: [
      { id: "milk-condensed", name: "Sữa đặc", priceDelta: 0, isDefault: true },
      { id: "milk-fresh", name: "Sữa tươi", priceDelta: 0 },
      { id: "milk-oat", name: "Sữa yến mạch", priceDelta: 10000 },
    ],
  },
  {
    id: "shot",
    name: "Thêm shot",
    selectType: "multi",
    isRequired: false,
    maxSelect: 1,
    options: [{ id: "shot-extra", name: "Thêm 1 shot espresso", priceDelta: 10000 }],
  },
  {
    id: "topping",
    name: "Topping",
    selectType: "multi",
    isRequired: false,
    maxSelect: 3,
    options: [
      { id: "top-black-pearl", name: "Trân châu đen", priceDelta: 6000 },
      { id: "top-white-pearl", name: "Trân châu trắng", priceDelta: 8000 },
      { id: "top-pudding", name: "Pudding trứng", priceDelta: 8000 },
      { id: "top-peach-jelly", name: "Thạch đào", priceDelta: 6000 },
      { id: "top-salted-cream", name: "Kem muối", priceDelta: 10000 },
    ],
  },
  {
    id: "juice-sweet",
    name: "Độ ngọt",
    selectType: "single",
    isRequired: true,
    options: [
      { id: "jsweet-none", name: "Không thêm đường", priceDelta: 0, isDefault: true },
      { id: "jsweet-less", name: "Ít ngọt", priceDelta: 0 },
      { id: "jsweet-normal", name: "Ngọt vừa", priceDelta: 0 },
    ],
  },
  {
    id: "warm",
    name: "Hâm nóng",
    selectType: "multi",
    isRequired: false,
    maxSelect: 1,
    options: [{ id: "warm-yes", name: "Hâm nóng trước khi giao", priceDelta: 0 }],
  },
  {
    id: "spread",
    name: "Ăn kèm",
    selectType: "multi",
    isRequired: false,
    maxSelect: 2,
    options: [
      { id: "spread-butter", name: "Bơ lạt", priceDelta: 5000 },
      { id: "spread-jam", name: "Mứt dâu", priceDelta: 5000 },
    ],
  },
];

const COFFEE_MILK = ["size", "sugar", "ice", "milk", "shot"];
const COFFEE_BLACK = ["size", "sugar", "ice", "shot"];
const MILK_TEA = ["size", "sugar", "ice", "topping"];
const FRUIT_TEA = ["size", "sugar", "ice"];
const JUICE = ["size", "juice-sweet", "ice"];

const products: Product[] = [
  // Cà phê
  {
    id: "p-den-da", slug: "ca-phe-den-da", categoryId: "ca-phe", name: "Cà phê đen đá",
    image: "/images/products/ca-phe-den-da.webp",
    photo: "/images/photos/ca-phe-den-da.webp",
    description: "Robusta rang đậm, pha phin. Đắng, thơm, hậu vị sô-cô-la.",
    basePrice: 29000, isAvailable: true, optionGroupIds: COFFEE_BLACK,
    art: { kind: "cup", liquid: ["#3b2416", "#1c110a"], ice: true },
  },
  {
    id: "p-sua-da", slug: "ca-phe-sua-da", categoryId: "ca-phe", name: "Cà phê sữa đá",
    image: "/images/products/ca-phe-sua-da.webp",
    photo: "/images/photos/ca-phe-sua-da.webp",
    description: "Phin truyền thống với sữa đặc. Ly quen của người Sài Gòn.",
    basePrice: 32000, isAvailable: true, badge: "bestseller", optionGroupIds: COFFEE_MILK,
    art: { kind: "cup", liquid: ["#a8754b", "#5b3a22"], ice: true },
  },
  {
    id: "p-bac-xiu", slug: "bac-xiu", categoryId: "ca-phe", name: "Bạc xỉu",
    image: "/images/products/bac-xiu.webp",
    photo: "/images/photos/bac-xiu.webp",
    description: "Nhiều sữa, ít cà phê. Ngọt dịu, dễ uống.",
    basePrice: 35000, isAvailable: true, optionGroupIds: COFFEE_MILK,
    art: { kind: "cup", liquid: ["#e3c9a8", "#b88a5e"], cream: "#f4e8d6", ice: true },
  },
  {
    id: "p-ca-phe-muoi", slug: "ca-phe-muoi", categoryId: "ca-phe", name: "Cà phê muối",
    image: "/images/products/ca-phe-muoi.webp",
    photo: "/images/photos/ca-phe-muoi.webp",
    description: "Cà phê sữa phủ lớp kem muối béo mặn. Món riêng của Phjn.",
    basePrice: 39000, isAvailable: true, badge: "signature", optionGroupIds: COFFEE_MILK,
    art: { kind: "cup", liquid: ["#8a5a36", "#3f2716"], cream: "#f2ead8", ice: true },
  },
  {
    id: "p-latte", slug: "latte", categoryId: "ca-phe", name: "Latte",
    image: "/images/products/latte.webp",
    photo: "/images/photos/latte.webp",
    description: "Espresso Arabica Cầu Đất với sữa tươi đánh mịn.",
    basePrice: 45000, isAvailable: true, optionGroupIds: COFFEE_MILK,
    art: { kind: "cup", liquid: ["#d9b994", "#9c6d45"], cream: "#f7efe3" },
  },
  {
    id: "p-americano", slug: "americano", categoryId: "ca-phe", name: "Americano",
    image: "/images/products/americano.webp",
    photo: "/images/photos/americano.webp",
    description: "Espresso pha loãng với nước. Nhẹ hơn cà phê phin, chua thanh.",
    basePrice: 39000, isAvailable: true, optionGroupIds: COFFEE_BLACK,
    art: { kind: "cup", liquid: ["#5a3420", "#2a170c"], ice: true },
  },
  {
    id: "p-cold-brew", slug: "cold-brew-cam-sa", categoryId: "ca-phe", name: "Cold brew cam sả",
    image: "/images/products/cold-brew-cam-sa.webp",
    photo: "/images/photos/cold-brew-cam-sa.webp",
    description: "Cà phê ủ lạnh 16 giờ, thêm cam vàng và sả tươi.",
    basePrice: 49000, isAvailable: true, badge: "new", optionGroupIds: ["size", "ice"],
    art: { kind: "cup", liquid: ["#7a4a24", "#3b210f"], garnish: "#f2a63b", ice: true },
  },
  {
    id: "p-espresso", slug: "espresso", categoryId: "ca-phe", name: "Espresso",
    image: "/images/products/espresso.webp",
    photo: "/images/photos/espresso.webp",
    description: "Một shot Arabica Cầu Đất, crema dày, hậu ngọt.",
    basePrice: 35000, isAvailable: true, optionGroupIds: ["shot"],
    art: { kind: "cup", liquid: ["#4a2b17", "#1e120a"] },
  },
  {
    id: "p-cappuccino", slug: "cappuccino", categoryId: "ca-phe", name: "Cappuccino",
    image: "/images/products/cappuccino.webp",
    photo: "/images/photos/cappuccino.webp",
    description: "Espresso, sữa nóng và lớp bọt dày, vẽ latte art.",
    basePrice: 45000, isAvailable: true, optionGroupIds: COFFEE_MILK,
    art: { kind: "cup", liquid: ["#c8a27a", "#8a5a36"], cream: "#f4ead9" },
  },
  {
    id: "p-mocha", slug: "mocha", categoryId: "ca-phe", name: "Mocha",
    image: "/images/products/mocha.webp",
    photo: "/images/photos/mocha.webp",
    description: "Espresso, sô-cô-la đen và sữa, phủ kem tươi.",
    basePrice: 49000, isAvailable: true, optionGroupIds: COFFEE_MILK,
    art: { kind: "cup", liquid: ["#8a5a36", "#4a2b17"], cream: "#f2e8da" },
  },
  {
    id: "p-ca-phe-trung", slug: "ca-phe-trung", categoryId: "ca-phe", name: "Cà phê trứng",
    image: "/images/products/ca-phe-trung.webp",
    photo: "/images/photos/ca-phe-trung.webp",
    description: "Lòng đỏ đánh bông với sữa đặc trên nền cà phê phin, kiểu Hà Nội.",
    basePrice: 45000, isAvailable: true, badge: "signature", optionGroupIds: COFFEE_BLACK,
    art: { kind: "cup", liquid: ["#e9d3a6", "#8a5a36"], cream: "#f6e7c4" },
  },

  // Trà sữa
  {
    id: "p-ts-truyen-thong", slug: "tra-sua-truyen-thong", categoryId: "tra-sua", name: "Trà sữa truyền thống",
    image: "/images/products/tra-sua-truyen-thong.webp",
    photo: "/images/photos/tra-sua-truyen-thong-v2.webp",
    description: "Hồng trà Assam với sữa, vị trà rõ, không quá ngọt.",
    basePrice: 35000, isAvailable: true, badge: "bestseller", optionGroupIds: MILK_TEA,
    art: { kind: "cup", liquid: ["#d2a77c", "#b07f52"], pearls: "#2a1a10", ice: true },
  },
  {
    id: "p-ts-oolong", slug: "tra-sua-oolong-nuong", categoryId: "tra-sua", name: "Trà sữa ô long nướng",
    image: "/images/products/tra-sua-oolong-nuong.webp",
    photo: "/images/photos/tra-sua-oolong-nuong-v2.webp",
    description: "Ô long rang lửa lớn, thơm mùi khói nhẹ.",
    basePrice: 42000, isAvailable: true, optionGroupIds: MILK_TEA,
    art: { kind: "cup", liquid: ["#c9925f", "#8f5b30"], pearls: "#2a1a10", ice: true },
  },
  {
    id: "p-ts-matcha", slug: "tra-sua-matcha", categoryId: "tra-sua", name: "Trà sữa matcha",
    image: "/images/products/tra-sua-matcha.webp",
    photo: "/images/photos/tra-sua-matcha-v2.webp",
    description: "Matcha Uji đánh tay với sữa tươi.",
    basePrice: 45000, isAvailable: true, optionGroupIds: MILK_TEA,
    art: { kind: "cup", liquid: ["#b5c98a", "#6f8f45"], pearls: "#efe6cf", ice: true },
  },
  {
    id: "p-hong-tra-kem-muoi", slug: "hong-tra-kem-muoi", categoryId: "tra-sua", name: "Hồng trà sữa kem muối",
    image: "/images/products/hong-tra-kem-muoi.webp",
    photo: "/images/photos/hong-tra-kem-muoi-v2.webp",
    description: "Hồng trà sữa phủ kem muối, uống không cần khuấy.",
    basePrice: 45000, isAvailable: false, optionGroupIds: MILK_TEA,
    art: { kind: "cup", liquid: ["#c08b5c", "#87552c"], cream: "#f6eedd", ice: true },
  },
  {
    id: "p-ts-khoai-mon", slug: "tra-sua-khoai-mon", categoryId: "tra-sua", name: "Trà sữa khoai môn",
    image: "/images/products/tra-sua-khoai-mon.webp",
    photo: "/images/photos/tra-sua-khoai-mon-v2.webp",
    description: "Khoai môn nghiền, sữa tươi và trà, béo bùi.",
    basePrice: 45000, isAvailable: true, badge: "new", optionGroupIds: MILK_TEA,
    art: { kind: "cup", liquid: ["#b49ad6", "#8e6fbf"], ice: true },
  },

  // Trà trái cây
  {
    id: "p-tra-dao", slug: "tra-dao-cam-sa", categoryId: "tra", name: "Trà đào cam sả",
    image: "/images/products/tra-dao-cam-sa.webp",
    photo: "/images/photos/tra-dao-cam-sa-v2.webp",
    description: "Trà đen, đào ngâm, cam vàng và sả đập dập.",
    basePrice: 42000, isAvailable: true, badge: "bestseller", optionGroupIds: FRUIT_TEA,
    art: { kind: "cup", liquid: ["#f4b46a", "#d9792f"], garnish: "#ffcf8a", ice: true },
  },
  {
    id: "p-tra-vai", slug: "tra-vai-hoa-hong", categoryId: "tra", name: "Trà vải hoa hồng",
    image: "/images/products/tra-vai-hoa-hong.webp",
    photo: "/images/photos/tra-vai-hoa-hong-v2.webp",
    description: "Trà xanh nhài, vải thiều và siro hoa hồng.",
    basePrice: 42000, isAvailable: true, optionGroupIds: FRUIT_TEA,
    art: { kind: "cup", liquid: ["#f6c9cf", "#e48c9a"], garnish: "#fff4ec", ice: true },
  },
  {
    id: "p-tra-sen", slug: "tra-o-long-sen", categoryId: "tra", name: "Trà ô long sen",
    image: "/images/products/tra-o-long-sen.webp",
    photo: "/images/photos/tra-o-long-sen-v2.webp",
    description: "Ô long ướp hương sen, hạt sen bùi.",
    basePrice: 39000, isAvailable: true, badge: "new", optionGroupIds: FRUIT_TEA,
    art: { kind: "cup", liquid: ["#e8d7a0", "#c1a456"], garnish: "#f3efe0", ice: true },
  },
  {
    id: "p-tra-tac", slug: "tra-tac-mat-ong", categoryId: "tra", name: "Trà tắc mật ong",
    image: "/images/products/tra-tac-mat-ong.webp",
    photo: "/images/photos/tra-tac-mat-ong-v2.webp",
    description: "Trà xanh, tắc tươi và mật ong rừng.",
    basePrice: 29000, isAvailable: true, optionGroupIds: FRUIT_TEA,
    art: { kind: "cup", liquid: ["#f1dc7a", "#d8b234"], garnish: "#9ccb5a", ice: true },
  },

  // Nước ép
  {
    id: "p-ep-cam", slug: "nuoc-ep-cam", categoryId: "nuoc-ep", name: "Cam ép",
    image: "/images/products/nuoc-ep-cam.webp",
    photo: "/images/photos/nuoc-ep-cam.webp",
    description: "Cam sành Vĩnh Long, ép nguyên chất.",
    basePrice: 39000, isAvailable: true, optionGroupIds: JUICE,
    art: { kind: "cup", liquid: ["#ffb347", "#f28a1c"], garnish: "#ffd27a" },
  },
  {
    id: "p-ep-dua-hau", slug: "nuoc-ep-dua-hau", categoryId: "nuoc-ep", name: "Dưa hấu ép",
    image: "/images/products/nuoc-ep-dua-hau.webp",
    photo: "/images/photos/nuoc-ep-dua-hau.webp",
    description: "Dưa hấu Long An, mát và ngọt tự nhiên.",
    basePrice: 35000, isAvailable: true, optionGroupIds: JUICE,
    art: { kind: "cup", liquid: ["#ff7a7a", "#e2444f"], garnish: "#9ad06b", ice: true },
  },
  {
    id: "p-ep-thom-can", slug: "thom-can-tay", categoryId: "nuoc-ep", name: "Thơm cần tây",
    image: "/images/products/thom-can-tay.webp",
    photo: "/images/photos/thom-can-tay.webp",
    description: "Thơm (dứa) và cần tây, thêm chút chanh.",
    basePrice: 42000, isAvailable: true, optionGroupIds: JUICE,
    art: { kind: "cup", liquid: ["#d6e48a", "#9fbf3d"], garnish: "#f5e27a" },
  },
  {
    id: "p-ep-oi", slug: "oi-hong-ep", categoryId: "nuoc-ep", name: "Ổi hồng ép",
    image: "/images/products/oi-hong-ep.webp",
    photo: "/images/photos/oi-hong-ep.webp",
    description: "Ổi ruột hồng, sánh và thơm.",
    basePrice: 39000, isAvailable: true, optionGroupIds: JUICE,
    art: { kind: "cup", liquid: ["#ffb3a7", "#f07a6c"], ice: true },
  },
  {
    id: "p-sinh-to-xoai", slug: "sinh-to-xoai", categoryId: "nuoc-ep", name: "Sinh tố xoài",
    image: "/images/products/sinh-to-xoai.webp",
    photo: "/images/photos/sinh-to-xoai.webp",
    description: "Xoài cát Hòa Lộc xay với sữa chua, sánh mịn.",
    basePrice: 45000, isAvailable: true, optionGroupIds: JUICE,
    art: { kind: "cup", liquid: ["#ffc93c", "#f2a100"], garnish: "#8fc46a" },
  },

  // Bánh
  {
    id: "p-croissant", slug: "croissant-bo", categoryId: "banh", name: "Croissant bơ",
    image: "/images/products/croissant-bo.webp",
    photo: "/images/photos/croissant-bo.webp",
    description: "Bánh sừng bò cán tay với bơ Pháp, vỏ giòn nhiều lớp.",
    basePrice: 35000, isAvailable: true, badge: "bestseller", optionGroupIds: ["warm", "spread"],
    art: { kind: "pastry", shape: "croissant", color: "#d9973f", accent: "#a8641f" },
  },
  {
    id: "p-croissant-hanh-nhan", slug: "croissant-hanh-nhan", categoryId: "banh", name: "Croissant hạnh nhân",
    image: "/images/products/croissant-hanh-nhan.webp",
    photo: "/images/photos/croissant-hanh-nhan.webp",
    description: "Nhân kem hạnh nhân, phủ hạnh nhân lát và đường bột.",
    basePrice: 42000, isAvailable: true, optionGroupIds: ["warm"],
    art: { kind: "pastry", shape: "croissant", color: "#e2ab5c", accent: "#f6efe2" },
  },
  {
    id: "p-tiramisu", slug: "tiramisu", categoryId: "banh", name: "Tiramisu",
    image: "/images/products/tiramisu.webp",
    photo: "/images/photos/tiramisu.webp",
    description: "Bánh ladyfinger thấm espresso, kem mascarpone, cacao.",
    basePrice: 49000, isAvailable: true, badge: "signature", optionGroupIds: [],
    art: { kind: "pastry", shape: "cake", color: "#efe1c6", accent: "#5b3a22" },
  },
  {
    id: "p-cheesecake", slug: "cheesecake-chanh-day", categoryId: "banh", name: "Cheesecake chanh dây",
    image: "/images/products/cheesecake-chanh-day.webp",
    photo: "/images/photos/cheesecake-chanh-day.webp",
    description: "Cheesecake nướng, sốt chanh dây chua nhẹ.",
    basePrice: 49000, isAvailable: true, optionGroupIds: [],
    art: { kind: "pastry", shape: "tart", color: "#f6e6b8", accent: "#f2b630" },
  },
  {
    id: "p-banh-chuoi", slug: "banh-chuoi-nuong", categoryId: "banh", name: "Bánh chuối nướng",
    image: "/images/products/banh-chuoi-nuong.webp",
    photo: "/images/photos/banh-chuoi-nuong.webp",
    description: "Chuối xiêm, nước cốt dừa, nướng thành ổ.",
    basePrice: 32000, isAvailable: true, optionGroupIds: ["warm"],
    art: { kind: "pastry", shape: "loaf", color: "#a86a34", accent: "#e8c48a" },
  },
  {
    id: "p-cookie", slug: "cookie-socola", categoryId: "banh", name: "Cookie sô-cô-la",
    image: "/images/products/cookie-socola.webp",
    photo: "/images/photos/cookie-socola.webp",
    description: "Cookie dày, nhân sô-cô-la đen chảy.",
    basePrice: 25000, isAvailable: true, optionGroupIds: ["warm"],
    art: { kind: "pastry", shape: "cookie", color: "#c98a4b", accent: "#3a2214" },
  },
  {
    id: "p-muffin", slug: "muffin-viet-quat", categoryId: "banh", name: "Muffin việt quất",
    image: "/images/products/muffin-viet-quat.webp",
    photo: "/images/photos/muffin-viet-quat.webp",
    description: "Bánh muffin bơ, việt quất tươi, mặt giòn.",
    basePrice: 35000, isAvailable: true, optionGroupIds: ["warm"],
    art: { kind: "pastry", shape: "cookie", color: "#d39b5a", accent: "#3b3a6b" },
  },
  {
    id: "p-brownie", slug: "brownie", categoryId: "banh", name: "Brownie sô-cô-la",
    image: "/images/products/brownie.webp",
    photo: "/images/photos/brownie.webp",
    description: "Brownie đặc ruột, sô-cô-la đen 70%.",
    basePrice: 39000, isAvailable: true, optionGroupIds: ["warm"],
    art: { kind: "pastry", shape: "cake", color: "#4a2b17", accent: "#2a170c" },
  },
  {
    id: "p-donut", slug: "donut", categoryId: "banh", name: "Donut đường men",
    image: "/images/products/donut.webp",
    photo: "/images/photos/donut.webp",
    description: "Bánh vòng chiên, phủ men đường vani.",
    basePrice: 25000, isAvailable: true, optionGroupIds: [],
    art: { kind: "pastry", shape: "cookie", color: "#e8c08a", accent: "#f6efe2" },
  },
  {
    id: "p-macaron", slug: "macaron", categoryId: "banh", name: "Macaron (3 cái)",
    image: "/images/products/macaron.webp",
    photo: "/images/photos/macaron.webp",
    description: "Vỏ hạnh nhân giòn nhẹ, nhân caramel muối và vani.",
    basePrice: 45000, isAvailable: true, badge: "new", optionGroupIds: [],
    art: { kind: "pastry", shape: "cookie", color: "#d9b99b", accent: "#f3e6d6" },
  },
  {
    id: "p-flan", slug: "banh-flan", categoryId: "banh", name: "Bánh flan",
    image: "/images/products/banh-flan.webp",
    photo: "/images/photos/banh-flan.webp",
    description: "Flan trứng gà ta, caramel đắng nhẹ, thêm cà phê nếu thích.",
    basePrice: 22000, isAvailable: true, optionGroupIds: [],
    art: { kind: "pastry", shape: "tart", color: "#f3d27a", accent: "#8a3f12" },
  },
];

export const seedMenu: Menu = {
  categories,
  products,
  optionGroups: Object.fromEntries(groups.map((g) => [g.id, g])),
};
