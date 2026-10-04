import { defineField, defineType } from "sanity";

export const videoChunk = defineType({
  name: "videoChunk",
  title: "Transcript chunk",
  type: "object",
  fields: [
    defineField({
      name: "startSeconds",
      title: "Start time (seconds)",
      type: "number",
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: "text",
      title: "Transcript text",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { startSeconds: "startSeconds", title: "text" },
    prepare({ startSeconds, title }) {
      const seconds = Number(startSeconds ?? 0);
      const timestamp = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
      const excerpt = typeof title === "string" ? title.slice(0, 72) : "";
      return { title: `${timestamp} - ${excerpt}` };
    },
  },
});
