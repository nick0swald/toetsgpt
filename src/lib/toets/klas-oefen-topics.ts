export const KLAS_TOPICS = [
  { id: "h10-p1", hoofdstukId: "h10", label: "H10 §1 Soorten krachten" },
  { id: "h10-p2", hoofdstukId: "h10", label: "H10 §2 Krachten in constructies" },
  { id: "h10-p3", hoofdstukId: "h10", label: "H10 §3 Krachten samenstellen" },
  { id: "h10-p4", hoofdstukId: "h10", label: "H10 §4 Krachten ontbinden" },
  { id: "h14-p1", hoofdstukId: "h14", label: "H14 §1 Werken met hefbomen" },
  { id: "h14-p2", hoofdstukId: "h14", label: "H14 §2 Hefbomen en zwaartekracht" },
  { id: "h14-p3", hoofdstukId: "h14", label: "H14 §3 Katrollen en takels" },
  { id: "h14-p4", hoofdstukId: "h14", label: "H14 §4 Druk" },
] as const;

export type KlasTopicId = (typeof KLAS_TOPICS)[number]["id"];
