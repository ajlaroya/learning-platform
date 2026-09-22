import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Vertex Content")
    .items([
      S.listItem()
        .title("Courses")
        .child(S.documentTypeList("course").title("Courses")),
      S.listItem()
        .title("Lessons")
        .child(S.documentTypeList("lesson").title("Lessons")),
      S.listItem()
        .title("Instructors")
        .child(S.documentTypeList("instructor").title("Instructors")),
      S.listItem()
        .title("Categories")
        .child(S.documentTypeList("category").title("Categories")),
    ]);
