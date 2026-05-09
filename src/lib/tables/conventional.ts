/**
 * Conventional radiography reference doses.
 * Source: doses sheet rows 28-41 — Anexo II da IN 90/2021 (DEP máxima permitida).
 *
 * `thicknessCm` is the standard adult anatomical thickness used by the
 * spreadsheet for the geometric correction. `maxDepMgy` is the maximum
 * permitted entrance skin dose (mGy) for that exam.
 */
export type ConventionalExam = {
  slug: string;
  label: string;
  thicknessCm: number;
  maxDepMgy: number;
};

export const conventionalExams: ConventionalExam[] = [
  { slug: "lombar-ap", label: "Coluna Lombar AP", thicknessCm: 23, maxDepMgy: 10 },
  { slug: "lombar-lat", label: "Coluna Lombar LAT", thicknessCm: 30, maxDepMgy: 30 },
  { slug: "lombar-jls", label: "Coluna Lombar JLS", thicknessCm: 20, maxDepMgy: 40 },
  { slug: "abdomen-ap", label: "Abdômen AP", thicknessCm: 23, maxDepMgy: 10 },
  { slug: "urografia-ap", label: "Urografia AP", thicknessCm: 23, maxDepMgy: 10 },
  { slug: "colecistografia-ap", label: "Colecistografia AP", thicknessCm: 23, maxDepMgy: 10 },
  { slug: "pelve-ap", label: "Pelve AP", thicknessCm: 23, maxDepMgy: 10 },
  { slug: "bacia-ap", label: "Bacia AP", thicknessCm: 23, maxDepMgy: 10 },
  { slug: "torax-pa", label: "Tórax PA", thicknessCm: 23, maxDepMgy: 0.4 },
  { slug: "torax-lat", label: "Tórax LAT", thicknessCm: 32, maxDepMgy: 1.4 },
  { slug: "toracica-ap", label: "Coluna Torácica AP", thicknessCm: 23, maxDepMgy: 7 },
  { slug: "toracica-lat", label: "Coluna Torácica LAT", thicknessCm: 32, maxDepMgy: 20 },
  { slug: "cranio-ap", label: "Crânio AP", thicknessCm: 19, maxDepMgy: 5 },
  { slug: "cranio-lat", label: "Crânio LAT", thicknessCm: 15, maxDepMgy: 3 },
];
