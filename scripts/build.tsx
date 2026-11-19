/**
 * Renders every design in src/ the way the Hyper Elements template gallery does, into out/:
 *
 *   <slug>.html, <slug>.txt          the HTML and plain text render() writes (an Email or a Page also on a phone)
 *   <slug>.outline.txt               outline(): each block laid out, with its width
 *   <slug>.diagnostics.json          every diagnostic, with the email client checks
 *   <slug>.png                       a Canvas, drawn by renderImage()
 *   <slug>.pdf, <slug>-page-N.png    a Document, drawn by renderPdf(), and each page as an image
 *   <slug>-desktop.png, -phone.png   an Email or a Page, as a browser shows it
 *
 * Fonts are loaded as the gallery's own generator loads them: each Google font the root names, as TTF.
 * Exits 1 when a design has an error or a warning.
 *
 *   npm run build              every source example and values file
 *   npm run build -- src/x.tsx one design
 *   npm run build -- designs/x.values.json  each selected paper size
 */
import { execFileSync } from "node:child_process";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { ElementsError, outline, render } from "@hyper-elements/react";
import { readValuesFile, templateOf } from "@hyper-elements/react/template";
import { emailClients } from "@hyper-elements/email-clients";
import { fontsFor, imagesFor } from "./assets.ts";

type Diagnostic = { severity: string; code: string; message: string; path?: string };

const root = resolve(".");
const outDir = join(root, "out");
await mkdir(outDir, { recursive: true });

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const files = args.length ? args : [
  ...(await readdir(join(root, "src"))).filter((f) => f.endsWith(".tsx")).map((f) => join("src", f)),
  ...(await readdir(join(root, "designs"))).filter((f) => f.endsWith(".values.json")).map((f) => join("designs", f)),
];

let failed = false;
for await (const { file, slug, element, rootEl, rootName } of examples(files)) {
  const { html, text, diagnostics } = await render(element, { plugins: [await emailClients()] });
  const all: Diagnostic[] = diagnostics.map(({ severity, code, message, path }: Diagnostic) => ({ severity, code, message, path }));
  await writeFile(join(outDir, `${slug}.html`), html);
  await writeFile(join(outDir, `${slug}.txt`), text);
  await writeFile(join(outDir, `${slug}.outline.txt`), outline(element));

  if (rootName === "Canvas" || rootName === "Document") {
    const fonts = await fontsFor(rootEl);
    const images = await imagesFor(root);
    if (rootName === "Canvas") {
      const { renderImage } = await import("@hyper-elements/react/image");
      const out = await renderImage(element, { fonts, images, scale: 1 });
      await writeFile(join(outDir, `${slug}.png`), out.image);
      all.push(...out.diagnostics.map(({ severity, code, message, path }: Diagnostic) => ({ severity, code, message, path })));
    } else {
      const { renderPdf } = await import("@hyper-elements/react/pdf");
      const out = await renderPdf(element, { fonts, images });
      const pdf = join(outDir, `${slug}.pdf`);
      await writeFile(pdf, out.pdf);
      all.push(...out.diagnostics.map(({ severity, code, message, path }: Diagnostic) => ({ severity, code, message, path })));
      try {
        execFileSync("pdftoppm", ["-png", "-r", "110", pdf, join(outDir, `${slug}-page`)]);
      } catch {
        console.log("  (pdftoppm not found: the PDF's pages aren't written as images)");
      }
    }
  } else {
    await writeFile(join(outDir, `${slug}.root`), rootName);
    try {
      await screenshots(slug, rootName);
    } catch {
      console.log(`  (no browser here: ../shots-watcher writes out/${slug}-desktop.png and -phone.png within a few seconds)`);
    }
  }

  await writeFile(join(outDir, `${slug}.diagnostics.json`), JSON.stringify(all, null, 2));
  const bad = all.filter((d) => d.severity === "error" || d.severity === "warning");
  const infos = all.length - bad.length;
  console.log(`${bad.length ? "✗" : "✓"} ${file} (${rootName}): ${bad.length} errors and warnings, ${infos} notes`);
  for (const d of bad) console.log(`    ${d.severity} ${d.code} at ${d.path}: ${d.message}`);
  if (process.argv.includes("--notes")) for (const d of all.filter((d) => !bad.includes(d))) console.log(`    ${d.severity} ${d.code} at ${d.path}: ${d.message}`);
  if (bad.length) failed = true;
}
process.exitCode = failed ? 1 : 0;

/** Read an example module or render each selected format from a local values file. */
async function* examples(files: string[]) {
  for (const file of files) {
    if (!file.endsWith(".values.json")) {
      const mod = await import(pathToFileURL(resolve(file)).href);
      if (!mod.meta || typeof mod.default !== "function") continue;
      const Example = mod.default;
      yield { file, slug: basename(file, ".tsx"), element: <Example />, rootEl: Example(), rootName: mod.meta.root };
      continue;
    }

    const input = JSON.parse(await readFile(file, "utf8"));
    const modulePath = input?.template?.module;
    if (typeof modulePath !== "string") throw new Error(`${file}: missing template module.`);
    const moduleFile = resolve(dirname(file), modulePath);
    const fromTemplates = relative(resolve(root, "templates"), moduleFile);
    if (!fromTemplates || fromTemplates === ".." || fromTemplates.startsWith(`..${sep}`)) {
      throw new Error(`${file}: use a template from templates/.`);
    }
    const mod = await import(pathToFileURL(moduleFile).href);
    const template = templateOf(mod.default);
    if (!template) throw new Error(`${file}: the named module does not export a template.`);
    const opened = readValuesFile(input, template);
    if (!opened.values) throw new ElementsError(opened.diagnostics);
    for (const format of opened.formats ?? [undefined]) {
      const checked = template.check(opened.values, { format });
      const element = checked.snapshots[format ?? "default"];
      if (!element) throw new ElementsError(checked.diagnostics);
      yield {
        file: format ? `${file} [${format}]` : file,
        slug: [basename(file, ".values.json"), format].filter(Boolean).join("."),
        element,
        rootEl: template.design(opened.values, { format }),
        rootName: template.root,
      };
    }
  }
}

/** An Email or a Page in Chromium, on a desktop and on a phone, full length. */
async function screenshots(slug: string, rootName: string) {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    return console.log("  (playwright not installed: no screenshots)");
  }
  const browser = await chromium.launch();
  const file = pathToFileURL(join(outDir, `${slug}.html`)).href;
  const views: Array<[string, number, number]> = [
    ["desktop", rootName === "Page" ? 1280 : 760, 2],
    ["phone", 390, 3],
  ];
  for (const [name, width, scale] of views) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: scale });
    await page.goto(file, { waitUntil: "networkidle" });
    await page.screenshot({ path: join(outDir, `${slug}-${name}.png`), fullPage: true });
    await page.close();
  }
  await browser.close();
}
