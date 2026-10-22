import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const mappingPath = path.join(rootDir, "src/data/wst-player-mapping.json");
const outDir = path.join(rootDir, "data/generated");
const rawDir = path.join(outDir, "raw");

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchText(text, regex) {
  const match = text.match(regex);
  return match?.[1]?.trim() || null;
}

function parseHighLevelStats(html) {
  const text = stripHtml(html);
  return {
    tripleCrownTitles: matchText(text, /Triple Crown Titles\s+(\d+)/i),
    rankingTitles: matchText(text, /Ranking Titles\s+(\d+)/i),
    rankingFinals: matchText(text, /Ranking Finals\s+(\d+)/i),
    currentWorldRanking: matchText(text, /(?:Current\s+)?World Ranking\s+#?(\d+)/i),
    prizeMoney: matchText(text, /(?:Prize Money|Career Prize Money)\s+(GBP\s+[\d,]+)/i),
    maximum147s:
      matchText(text, /147s\s+(\d+)/i) ||
      matchText(text, /147\s*-\s*(\d+\s+times)/i),
    maximums: matchText(text, /Maximums(?:\s+made)?\s+(\d+)/i),
    centuries: matchText(text, /Centuries(?:\s+Made)?\s+(\d+)/i),
    bestWorldFinish: matchText(text, /(World Championship finalist,\s*\d{4}|Crucible final[^.]*\.)/i),
  };
}

function flattenJsonValues(value, output = []) {
  if (value == null) return output;
  if (typeof value === "string" || typeof value === "number") {
    output.push(String(value));
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) flattenJsonValues(item, output);
    return output;
  }
  if (typeof value === "object") {
    for (const item of Object.values(value)) flattenJsonValues(item, output);
  }
  return output;
}

function parseWstJson(json) {
  const text = flattenJsonValues(json).join(" ");
  return parseHighLevelStats(text);
}

function sectionAfter(html, heading) {
  const start = html.indexOf(`<h6>${heading}</h6>`);
  if (start === -1) return "";
  const rest = html.slice(start);
  const next = rest.indexOf("<h6>", 5);
  return next === -1 ? rest : rest.slice(0, next);
}

function parseCueTrackerStats(html) {
  const rankingWinner = html.match(
    /<td class="text-right">Ranking<\/td>[\s\S]*?\/winner\/all-time">([\d,]+)<\/a>/i
  );
  const ranking = html.match(/Highest ranking:\s*(\d+)/i);
  const prizeSection = sectionAfter(html, "Prize money");
  const prizeTotal = prizeSection.match(/<tr class="sum_row">\s*<td>Total<\/td>\s*<td>([\d,]+)<\/td>/i);
  const centuriesSection = sectionAfter(html, "Centuries");
  const centuriesTotal = centuriesSection.match(
    /<tr class="sum_row">\s*<td>Total<\/td>\s*<td class="text-center">([\d,]+)<\/td>/i
  );

  return {
    rankingTitles: rankingWinner?.[1] || null,
    peakWorldRanking: ranking?.[1] || null,
    prizeMoney: prizeTotal?.[1] ? `GBP ${prizeTotal[1]}` : null,
    centuries: centuriesTotal?.[1] || null,
  };
}

function toOverride(player, generatedStats) {
  const stats = {
    ...generatedStats.highLevel,
    ...generatedStats.detail,
  };
  return {
    name: player.name,
    sourceSnapshot: generatedStats.sources,
    keyFacts: {
      peakRanking: stats.peakWorldRanking ? { value: `No. ${stats.peakWorldRanking}` } : undefined,
    },
    careerStats: {
      bestMajorFinish: stats.bestWorldFinish || undefined,
      tripleCrownTitles: stats.tripleCrownTitles || undefined,
      rankingTitles: stats.rankingTitles || undefined,
      maximum147s: stats.maximum147s || undefined,
      careerPrize: stats.prizeMoney || undefined,
    },
    errors: generatedStats.errors,
  };
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      "user-agent": "biliards-project-data-pipeline/0.1",
      accept: "text/html,application/xhtml+xml,application/json",
    },
  }).finally(() => clearTimeout(timeout));
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function main() {
  const mapping = JSON.parse(await readFile(mappingPath, "utf8"));
  const requestedSlugs = new Set(process.argv.slice(2));
  const entries = requestedSlugs.size
    ? Object.entries(mapping).filter(([slug]) => requestedSlugs.has(slug))
    : Object.entries(mapping);
  await mkdir(rawDir, { recursive: true });

  const generated = {};
  for (const [slug, player] of entries) {
    generated[slug] = {
      name: player.name,
      sources: {
        wstApi: player.wstApiUrl,
        wst: player.wstUrl,
        wpbsa: player.wpbsaUrl,
        cueTracker: player.cueTrackerUrl,
        cueTrackerStats: player.cueTrackerStatsUrl,
      },
      highLevel: {},
      detail: {},
      errors: [],
    };

    for (const [sourceKey, url] of Object.entries(generated[slug].sources)) {
      if (!url) continue;
      try {
        const body = await fetchText(url);
        const extension = sourceKey === "wstApi" ? "json" : "html";
        await writeFile(path.join(rawDir, `${slug}.${sourceKey}.${extension}`), body);
        const parsed =
          sourceKey === "wstApi"
            ? parseWstJson(JSON.parse(body))
            : sourceKey.startsWith("cueTracker")
              ? parseCueTrackerStats(body)
              : parseHighLevelStats(body);
        const bucket = sourceKey.startsWith("cueTracker") ? "detail" : "highLevel";
        generated[slug][bucket] = {
          ...generated[slug][bucket],
          ...Object.fromEntries(Object.entries(parsed).filter(([, value]) => value)),
        };
      } catch (error) {
        generated[slug].errors.push({ source: sourceKey, url, message: error.message });
      }
    }
  }

  await writeFile(path.join(outDir, "player-derived-stats.json"), `${JSON.stringify(generated, null, 2)}\n`);
  await writeFile(
    path.join(outDir, "player-overrides.generated.json"),
    `${JSON.stringify(
      Object.fromEntries(
        Object.entries(generated).map(([slug, stats]) => [slug, toOverride(mapping[slug], stats)])
      ),
      null,
      2
    )}\n`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
