export function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

export function formatCount(count: number) {
  if (count < 1000) return count.toString();
  return `${(count / 1000).toFixed(1).replace(".0", "")}k`;
}

export function formatLevel(level: "advanced" | "beginner" | "intermediate") {
  return level[0].toUpperCase() + level.slice(1);
}

export function lessonLabel(moduleIndex: number, lessonIndex: number) {
  return `${moduleIndex + 1}.${lessonIndex + 1}`;
}

export function formatTimestamp(seconds: number) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;
  const clock = `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  return hours > 0 ? `${hours}:${clock}` : clock;
}
