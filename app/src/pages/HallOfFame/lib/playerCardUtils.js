import playerOverrides from "../../../data/player-overrides.json";
import playerSources from "../../../data/player-sources.json";
import wstPlayerMapping from "../../../data/wst-player-mapping.json";

export const statIconLabels = {
  trophy: "🏆",
  medal: "🏅",
  crown: "♛",
  rank: "#",
  "147": "147",
  century: "100",
  package: "RUN",
  table: "▦",
  tv: "TV",
  globe: "◎",
  target: "◉",
  spark: "✦",
  alert: "!",
};

export function filterPlayersForRegion(players, regionId) {
  if (regionId === "uk") return players;
  if (regionId === "us") return players;
  if (regionId === "china") {
    return players.filter((player) => ["China", "Hong Kong"].includes(player.country));
  }
  return players;
}

const snookerMajorLabels = ["World titles", "UK titles", "Masters"];
const rankStatLabels = ["Peak rank", "Top 16", "Top 10"];
const bestFinishLabels = ["Best world finish", "World titles", "World 9-ball", "World SF", "World finals", "UK final", "2025 WPA"];
const maximumLabels = ["147s", "100 centuries", "Centuries season"];
const topTitleTooltip =
  "For snooker, majors means Triple Crown events: World Championship, UK Championship and the Masters.";

function findStat(stats = [], labels) {
  return stats.find((stat) => labels.includes(stat.label));
}

function formatStat(stat, fallbackLabel = stat?.label) {
  if (!stat) return "";
  return `${fallbackLabel}: ${stat.value}`;
}

function asNumber(value) {
  const parsed = Number.parseInt(String(value ?? "").replace(/[^0-9-]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function playerSourceKey(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function mergePlayerOverride(player) {
  const override = playerOverrides[playerSourceKey(player.name)];
  return override ? { ...player, ...override } : player;
}

function uniqueSources(sources) {
  const seen = new Set();
  return sources.filter((source) => {
    if (!source?.url || seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}

export function buildResolvedSources(sourceKey) {
  const configured = playerSources[sourceKey];
  if (!configured) return null;

  const mapping = wstPlayerMapping[sourceKey];
  const configuredProfile = [...(configured.profile || []), ...(configured.stats || [])];
  const filteredProfile = configuredProfile.filter((source) => {
    if (source.label?.includes("BCA Hall of Fame")) return false;
    if (source.label !== "WST profile") return true;
    return mapping?.wstUrl && source.url === mapping.wstUrl;
  });
  const mappedProfile = [
    mapping?.wstUrl ? { label: "WST profile", url: mapping.wstUrl } : null,
    mapping?.wpbsaUrl ? { label: "WPBSA profile", url: mapping.wpbsaUrl } : null,
  ].filter(Boolean);

  return {
    ...configured,
    profile: uniqueSources([...mappedProfile, ...filteredProfile]),
    stats: [],
  };
}

function buildTopTitleSummary(player) {
  const configured = player.keyFacts?.topTitles;
  if (configured) {
    return {
      ...configured,
      tooltip: configured.tooltip || (player.discipline?.includes("Snooker") ? topTitleTooltip : undefined),
    };
  }

  const stats = player.stats || [];
  const explicitTripleCrown = findStat(stats, ["Triple Crowns"]);
  if (explicitTripleCrown) {
    return {
      value: explicitTripleCrown.value,
      detail: "World Championship + UK Championship + Masters",
      tooltip: topTitleTooltip,
    };
  }

  if (player.discipline?.includes("Snooker")) {
    const majorStats = snookerMajorLabels.map((label) => findStat(stats, [label])).filter(Boolean);
    const total = majorStats.reduce((sum, stat) => sum + (asNumber(stat.value) || 0), 0);
    return {
      value: majorStats.length ? String(total) : "0",
      detail: majorStats.length ? majorStats.map(formatStat).join(" · ") : "No Triple Crown title verified",
      tooltip: topTitleTooltip,
    };
  }

  const nonSnookerMajor = findStat(stats, ["World 9-ball", "U.S. Open 9-ball", "World titles", "World Masters", "Heyball worlds"]);
  return {
    value: nonSnookerMajor ? nonSnookerMajor.value : "Elite",
    detail: nonSnookerMajor ? formatStat(nonSnookerMajor) : player.honors?.[0] || "Elite competition record",
  };
}

export function buildPlayerHonorPanels(player) {
  const stats = player.stats || [];
  const topTitles = buildTopTitleSummary(player);
  const peakRankStat = findStat(stats, rankStatLabels);
  const weeksStat = findStat(stats, ["No.1 weeks"]);
  const configuredPeak = player.keyFacts?.peakRanking;
  const peakValue = configuredPeak?.value || (peakRankStat ? peakRankStat.value : "Unranked");
  const peakDetail = configuredPeak?.note || (weeksStat ? `${weeksStat.value} total weeks at No. 1` : "");
  const signature = player.keyFacts?.signature || {
    value: player.nickname || player.eraRole,
    detail: player.eraRole,
  };

  return [
    {
      label: "Major titles",
      value: topTitles.value,
      detail: topTitles.detail,
      tooltip: topTitles.tooltip,
      icon: "trophy",
    },
    {
      label: "Peak ranking",
      value: peakValue,
      detail: peakDetail,
      icon: "rank",
    },
    {
      label: "Signature",
      value: signature.value,
      detail: signature.detail,
      icon: "spark",
    },
  ];
}

export function buildCareerStats(player) {
  if (player.careerStats) {
    return [
      { label: "Best major finish", value: player.careerStats.bestMajorFinish || player.careerStats.bestWorldFinish },
      { label: "Ranking titles", value: player.careerStats.rankingTitles },
      { label: "147s", value: player.careerStats.maximum147s },
      { label: "Career prize money", value: player.careerStats.careerPrize },
    ].filter((fact) => fact.value);
  }

  const stats = player.stats || [];
  const bestFinish = findStat(stats, bestFinishLabels);
  const rankingTitles = findStat(stats, ["Ranking titles"]);
  const prizeMoney = findStat(stats, ["Career prize"]);
  const maximums = findStat(stats, maximumLabels);

  return [
    { label: "Best major finish", value: bestFinish ? formatStat(bestFinish) : null },
    { label: "Ranking titles", value: rankingTitles?.value },
    { label: player.discipline?.includes("Snooker") ? "147s" : "Signature scoring mark", value: maximums?.value },
    { label: "Career prize money", value: prizeMoney?.value },
  ].filter((fact) => fact.value);
}
