import { defineField, defineType } from "sanity";

export const videoChapter = defineType({
  name: "videoChapter",
  title: "Video chapter",
  type: "object",
  fields: [
    defineField({
      name: "startSeconds",
      title: "Start time (seconds)",
      type: "number",
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { startSeconds: "startSeconds", title: "label" },
    prepare({ startSeconds, title }) {
      const seconds = Number(startSeconds ?? 0);
      const timestamp = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
      return { title: `${timestamp} - ${title ?? "Untitled chapter"}` };
    },
  },
});
