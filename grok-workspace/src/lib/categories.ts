import type { CategoryId, TxType } from "./types";
import { CATEGORIES } from "./types";

const RULES: { id: CategoryId; pattern: RegExp }[] = [
  {
    id: "food",
    pattern:
      /\b(kartoshka|sabzi|piyoz|banan|ovqat|oziqovqat|mahsulot|bozor|dokon|oshxona|osh|taom|non|nonushta|tushlik|kechki ovqat|buyurtma|yetkazib berish|gosht|baliq|tovuq|meva|sabzavot|shakar|qand|yogurt|sut|qatiq|kefir|tuz|murch|baqlajon|pomidor|bodring|guruch|makaron|moy|un|choy|qahva|shirinlik|muzqaymoq|somsa|manti|lagmon|shorva|kabob|lavash|pizza|kolbasa|suv|ichimlik|gazlangan|mineral)\b/i,
  },
  {
    id: "transport",
    pattern:
      /\b(taksi|taxi|avtobus|metro|poyezd|poezd|mashina|avtomobil|avto|yol haqi|yol kira|benzin|yoqilgi|gaz|moy|shina|ehtiyot qism|tamirlash|haydovchi|bekat|bilet|samolyot|transport|uber|yandex)\b/i,
  },
  {
    id: "housing",
    pattern:     /\b(ijara|uy|xonadon|kvartira|hovli|yotoqxona|uyjoy|bino|xona|qurilish|tamirlash|boyoq|mebel|jihoz|matras|konditsioner)\b/i,
  },
  {
    id: "bills",
    pattern:
      /\b(tolov|hisob|qarz|komissiya|kommunal|elektr|elektr toki|suv|gaz|internet|wifi|telefon|mobil aloqa|sim karta|tarif|abonent tolovi|jarima|soliq|chek)\b/i,
  },
  {
    id: "health",
    pattern:
      /\b(shifoxona|poliklinika|klinika|doktor|shifokor|dori|doridarmon|dorixona|vitamin|tahlil|analiz|davolanish|muolaja|salomatlik|sogliq|tish|tish shifokori|tez yordam|jarrohlik|korik)\b/i,
  },
  {
    id: "education",
    pattern:
      /\b(kurs|oquv kursi|maktab|universitet|oliygoh|kollej|talim|dars|oqish|oqituvchi|ustoz|kitob|daftar|qalam|imtihon|kontrakt|stipendiya|maktab formasi)\b/i,
  },
  {
    id: "entertainment",
    pattern:
      /\b(kino|film|teatr|konsert|musiqa|qoshiq|park|sayr|dam olish|sport|futbol|tennis|oyin|oyinkulgi|tadbir|tomosha|muzey|basseyn|zal|netflix|game|spotify)\b/i,
  },
  {
    id: "gifts",
    pattern:
      /\b(sovga|hadya|tugilgan kun|toy|nikoh|bayram|mehmon|mehmondorchilik|duo|marosim|chaqaloq|tabrik)\b/i,
  },
  {
    id: "travel",
    pattern:
      /\b(safar|sayohat|mehmonxona|yotoq|aviachipta|samolyot|poyezd|yol|tur|dam olish maskani|viza|pasport|bagaj|bilet)\b/i,
  },
  {
    id: "shopping",
    pattern:
      /\b(xarid|sotib olish|olish|dokon|bozor|kiyim|ustbosh|poyabzal|koylak|shim|kurtka|palto|romol|sumka|soat|telefon|kompyuter|noutbuk|quloqchin|elektronika|aksessuar|oyinchoq|idish|uyrozgor|uzum|shop|store)\b/i,
  },
  {
    id: "work",
    pattern: /\b(salary|maosh|ishhaq|oylik|paycheck|pension|stipendiya|daromad|ish|ish haqi|menejment|zarp|zarpata|qarz|bonus|freelance)\b/i,
  },
];

export function inferCategory(note: string, type: TxType): CategoryId {
  if (type === "income") {
    return RULES.find((rule) => rule.id === "work" && rule.pattern.test(note))?.id ?? "other";
  }
  for (const rule of RULES) {
    if (rule.pattern.test(note)) return rule.id;
  }
  return "other";
}

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? "Other";
}
