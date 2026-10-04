export function normalizeText(value) {
  return String(value ?? "")
    .replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp|#39);/gi, decodeEntity)
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntity(entity) {
  const key = entity.slice(1, -1).toLowerCase();
  const named = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    "#39": "'",
  };
  if (named[key]) return named[key];

  const codePoint = key.startsWith("#x")
    ? Number.parseInt(key.slice(2), 16)
    : Number.parseInt(key.slice(1), 10);
  if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff)
    return "";
  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return "";
  }
}

export function chunkTranscript(
  cues,
  { maxSeconds = 45, maxCharacters = 350 } = {},
) {
  const ordered = cues
    .map((cue) => ({
      startSeconds: Number(cue.startSeconds),
      text: normalizeText(cue.text),
    }))
    .filter(
      (cue) =>
        Number.isFinite(cue.startSeconds) && cue.startSeconds >= 0 && cue.text,
    )
    .sort((left, right) => left.startSeconds - right.startSeconds);

  const chunks = [];
  let current;

  for (const cue of ordered) {
    const elapsed = current ? cue.startSeconds - current.firstCueSeconds : 0;
    const combinedText = current ? `${current.text} ${cue.text}` : cue.text;
    if (
      current &&
      (elapsed >= maxSeconds || combinedText.length > maxCharacters)
    ) {
      chunks.push({
        startSeconds: Math.floor(current.firstCueSeconds),
        text: current.text,
      });
      current = undefined;
    }

    if (!current) {
      current = { firstCueSeconds: cue.startSeconds, text: cue.text };
    } else {
      current.text = `${current.text} ${cue.text}`;
    }
  }

  if (current) {
    chunks.push({
      startSeconds: Math.floor(current.firstCueSeconds),
      text: current.text,
    });
  }

  return chunks;
}
