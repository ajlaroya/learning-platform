import { PlayIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

const supportedVideo =
  /^(https:\/\/)?([^/]+\.)?(youtube\.com|youtu\.be|vimeo\.com|bunny\.net)(\/|$)/i;

export const lesson = defineType({
  name: "lesson",
  title: "Lesson",
  type: "document",
  icon: PlayIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      validation: (rule) =>
        rule
          .required()
          .uri({ scheme: ["https"] })
          .custom((value) =>
            !value || supportedVideo.test(value)
              ? true
              : "Use a YouTube, Vimeo, or Bunny URL",
          ),
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "duration",
      title: "Duration (seconds)",
      type: "number",
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: "freePreview",
      title: "Free preview",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "studentCount",
      title: "Student count",
      type: "number",
      validation: (rule) => rule.min(0),
    }),
    defineField({ name: "notes", title: "Notes", type: "blockContent" }),
    defineField({
      name: "keyPoints",
      title: "Key points",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.max(6),
    }),
    defineField({ name: "proTip", title: "Pro tip", type: "text", rows: 3 }),
    defineField({
      name: "resources",
      title: "Resources",
      type: "array",
      of: [defineArrayMember({ type: "resource" })],
    }),
  ],
  preview: {
    select: { title: "title", media: "thumbnail", subtitle: "duration" },
  },
});
