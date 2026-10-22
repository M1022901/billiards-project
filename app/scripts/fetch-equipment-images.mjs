import { access, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const outDir = path.join(rootDir, "src/assets/equipment");
const force = process.argv.includes("--force");
const hasMagick = spawnSync("magick", ["-version"], { stdio: "ignore" }).status === 0;

// Sources for the Equipment Bag demo (Simulation case 04).
//
// These are the canonical Wikimedia Commons URLs behind src/assets/equipment.
// The page imports the downloaded files, so it keeps working offline.
//
// Notes on the picks:
// - "Playing cue" deliberately avoids File:Snooker_Cue.jpg, which is a close-up of a
//   cue's tip and looked identical to the cue-tip card. Snooker_Cue_and_case.jpg was
//   also rejected because the cue leaves the frame at the top-right corner, so the cue
//   never appeared whole. Snooker_cue_and_extensions.png is the one Commons photo that
//   shows an entire cue (butt to tip); the two screw-on extension pieces below it are
//   called out in the card copy.
// - "Rest / bridge" uses the barfisch photo of the three common rest heads rather than
//   a portrait crop that hid most of the rest.
// - "Cue case" uses a wide (2:1) photo that fits the viewer without being cut off.
//
// Wikimedia only serves a fixed set of thumbnail widths, so we fetch a 1280px thumb and
// let ImageMagick shrink it to 1200px while converting PNG sources to JPEG.
const images = [
  {
    file: "playing-cue.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Snooker_cue_and_extensions.png/1280px-Snooker_cue_and_extensions.png",
    page: "https://commons.wikimedia.org/wiki/File:Snooker_cue_and_extensions.png",
  },
  {
    file: "rest-bridge.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Rests_for_cue_sports.png/1280px-Rests_for_cue_sports.png",
    page: "https://commons.wikimedia.org/wiki/File:Rests_for_cue_sports.png",
  },
  {
    file: "cue-tip.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Ferrule_for_snooker_cue.jpg/1280px-Ferrule_for_snooker_cue.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Ferrule_for_snooker_cue.jpg",
  },
  {
    file: "chalk.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Billiard_Chalk_and_Cue.jpg/1280px-Billiard_Chalk_and_Cue.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Billiard_Chalk_and_Cue.jpg",
  },
  {
    file: "cue-case.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Snooker_cue_case_%2851223529470%29.jpg/1280px-Snooker_cue_case_%2851223529470%29.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Snooker_cue_case_(51223529470).jpg",
  },
];

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Wikimedia rate-limits bursts (HTTP 429), so retry with backoff and honour Retry-After.
async function download(url, attempts = 4) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(url, {
      headers: { "user-agent": "biliards-project/0.1 (educational; contact: project maintainer)" },
    });
    if (response.ok) return Buffer.from(await response.arrayBuffer());

    lastError = new Error(`${response.status} ${response.statusText} for ${url}`);
    if (response.status !== 429 && response.status < 500) throw lastError;

    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : attempt * 3000;
    if (attempt < attempts) {
      console.warn(`retry  ${response.status} for ${path.basename(new URL(url).pathname)}; waiting ${delay} ms`);
      await wait(delay);
    }
  }
  throw lastError;
}

function convert(source, target) {
  const result = spawnSync(
    "magick",
    [source, "-auto-orient", "-strip", "-resize", "1200x>", "-quality", "85", target],
    { stdio: "inherit" }
  );
  if (result.status !== 0) {
    throw new Error(`ImageMagick failed on ${path.basename(source)}`);
  }
}

async function main() {
  if (!hasMagick) {
    console.error(
      "ImageMagick is required: some sources are PNG and have to be converted to JPEG.\n" +
        "Install it (macOS: brew install imagemagick) and run the script again."
    );
    process.exitCode = 1;
    return;
  }

  await mkdir(outDir, { recursive: true });

  for (const [index, image] of images.entries()) {
    const target = path.join(outDir, image.file);
    if (!force && (await exists(target))) {
      console.log(`skip   ${image.file} (already present; pass --force to refetch)`);
      continue;
    }

    // Space out requests so a cold run does not trip the rate limiter.
    if (index > 0) await wait(1200);

    const temp = `${target}.part`;
    const buffer = await download(image.url);
    await writeFile(temp, buffer);
    console.log(`fetch  ${image.file}  ${(buffer.length / 1024).toFixed(0)} KB  <- ${image.page}`);

    convert(temp, target);
    await rm(temp, { force: true });
  }

  console.log("");
  let total = 0;
  for (const image of images) {
    const target = path.join(outDir, image.file);
    if (await exists(target)) {
      const { size } = await stat(target);
      total += size;
      console.log(`asset  ${image.file}  ${(size / 1024).toFixed(0)} KB`);
    }
  }
  console.log(`\nDone. ${(total / 1024 / 1024).toFixed(1)} MB in ${path.relative(rootDir, outDir)}/`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
