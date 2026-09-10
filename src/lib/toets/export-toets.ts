import { serializeBriefje, type OefenBriefje } from "./briefje";
import { nlCijfer } from "./format";
import type { Question, Toets, ToetsUitslag } from "./types";

function punten(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n).replace(".", ",");
}

export function juistAntwoord(q: Question): string {
  if (q.type === "mc") {
    const opt = q.options.find((o) => o.letter === q.correctLetter);
    return opt ? `${opt.letter}. ${opt.text}` : q.modelAnswer;
  }
  return q.modelAnswer;
}

export function gegevenAntwoord(q: Question, given: string): string {
  if (!given.trim()) return "Geen antwoord.";
  if (q.type === "mc") {
    const opt = q.options.find((o) => o.letter === given.toUpperCase());
    return opt ? `${opt.letter}. ${opt.text}` : given;
  }
  return given;
}

function soort(q: Question): string {
  if (q.type === "mc") return "meerkeuze";
  if (q.type === "invul") return "invul";
  return "open";
}

export function toetsBestandsnaam(toets: Toets, ext: "txt" | "docx"): string {
  const slug = (toets.title || "oefentoets")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `toetsgpt-${slug || "oefentoets"}.${ext}`;
}

/** Volledige toets + leerlingantwoord + juist antwoord + punten. */
export function volledigeToetsTekst(
  toets: Toets,
  uitslag: ToetsUitslag,
  briefje: OefenBriefje,
  wie?: string,
): string {
  const regels: string[] = [
    "ToetsGPT",
    toets.title || "Oefentoets",
    toets.subject ? `Vak: ${toets.subject}` : "",
    wie ? `Leerling: ${wie}` : "",
    `Punten: ${punten(uitslag.behaald)} / ${punten(uitslag.totaal)}`,
    `Oefenscore: ${nlCijfer(uitslag.cijfer)} (geen echt cijfer)`,
    "",
    briefje.feedback,
    "",
  ];

  uitslag.perVraag.forEach((v, i) => {
    const q = v.question;
    regels.push(`Vraag ${i + 1} · ${soort(q)} · ${punten(v.points)} / ${punten(v.max)}`);
    if (q.stof?.label) regels.push(q.stof.label);
    if (q.situation.trim()) regels.push(q.situation.trim());
    regels.push(q.prompt.trim());
    if (q.type === "mc") {
      for (const o of q.options) regels.push(`${o.letter}. ${o.text}`);
    }
    regels.push(`Jouw antwoord: ${gegevenAntwoord(q, v.given)}`);
    regels.push(`Juist: ${juistAntwoord(q)}`);
    if (q.why.trim()) regels.push(`Waarom: ${q.why.trim()}`);
    regels.push("");
  });

  regels.push("Oefenscore. Geen officieel cijfer.");
  regels.push("");
  regels.push(serializeBriefje(briefje).trim());
  regels.push("");
  return regels.filter((line, i, all) => !(line === "" && all[i - 1] === "")).join("\n").trim() + "\n";
}

export function downloadTekst(naam: string, tekst: string, type = "text/plain"): void {
  const file = new Blob([tekst], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = naam;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadDocx(naam: string, tekst: string): void {
  const blob = new Blob([docxBytes(tekst)], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = naam;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

const MAIL_GRENS = 1600;

export async function mailVolledigeToets(input: {
  naar?: string;
  onderwerp: string;
  tekst: string;
  txtNaam: string;
}): Promise<"mail" | "gedeeld" | "geknipt"> {
  const naar = (input.naar ?? "").trim();
  const file = new File([input.tekst], input.txtNaam, { type: "text/plain" });
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };

  if (!naar && nav.share && (!nav.canShare || nav.canShare({ files: [file] }))) {
    try {
      await nav.share({ files: [file], title: input.onderwerp, text: "ToetsGPT-toets met antwoorden en punten." });
      return "gedeeld";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "gedeeld";
    }
  }

  const body =
    input.tekst.length <= MAIL_GRENS
      ? input.tekst
      : `${input.tekst.slice(0, 900).trim()}\n\n… De mail knipt lange tekst af. De volledige toets staat op het klembord en in het txt-bestand.`;

  if (input.tekst.length > MAIL_GRENS) {
    try {
      await navigator.clipboard.writeText(input.tekst);
    } catch {
      /* klembord mag falen */
    }
    downloadTekst(input.txtNaam, input.tekst);
  }

  const adres = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(naar) ? naar : "";
  const href = `mailto:${adres}?subject=${encodeURIComponent(input.onderwerp)}&body=${encodeURIComponent(body)}`;
  window.location.href = href;
  return input.tekst.length > MAIL_GRENS ? "geknipt" : "mail";
}

function xml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function docxBytes(tekst: string): Uint8Array {
  const paras = tekst.replace(/\r\n/g, "\n").split("\n");
  const body = paras
    .map((line) => {
      const leeg = line.trim() === "";
      const tekstNode = leeg ? "" : `<w:t xml:space="preserve">${xml(line)}</w:t>`;
      return `<w:p><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr>${tekstNode}</w:r></w:p>`;
    })
    .join("");
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`;
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
  return zipStored([
    { name: "[Content_Types].xml", data: utf8(contentTypes) },
    { name: "_rels/.rels", data: utf8(rels) },
    { name: "word/document.xml", data: utf8(documentXml) },
  ]);
}

function utf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function crc32(data: Uint8Array): number {
  let c = ~0;
  for (let i = 0; i < data.length; i++) {
    c ^= data[i]!;
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

function u16(n: number): number[] {
  return [n & 255, (n >> 8) & 255];
}
function u32(n: number): number[] {
  return [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >> 24) & 255];
}

function zipStored(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const parts: number[] = [];
  const central: number[] = [];
  let offset = 0;
  for (const f of files) {
    const name = utf8(f.name);
    const crc = crc32(f.data);
    const local = [
      ...u32(0x04034b50),
      ...u16(20),
      ...u16(0x800),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(f.data.length),
      ...u32(f.data.length),
      ...u16(name.length),
      ...u16(0),
      ...name,
      ...f.data,
    ];
    parts.push(...local);
    central.push(
      ...u32(0x02014b50),
      ...u16(20),
      ...u16(20),
      ...u16(0x800),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(f.data.length),
      ...u32(f.data.length),
      ...u16(name.length),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(offset),
      ...name,
    );
    offset += local.length;
  }
  const centralStart = offset;
  parts.push(...central);
  const centralSize = central.length;
  parts.push(
    ...u32(0x06054b50),
    ...u16(0),
    ...u16(0),
    ...u16(files.length),
    ...u16(files.length),
    ...u32(centralSize),
    ...u32(centralStart),
    ...u16(0),
  );
  return new Uint8Array(parts);
}

