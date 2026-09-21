import { LinkIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const resource = defineType({
  name: "resource",
  title: "Resource",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: ["pdf", "link", "repo", "code", "slides"],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (rule) => rule.required().uri({ scheme: ["https"] }),
    }),
  ],
});
