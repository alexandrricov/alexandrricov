# Alexandr Rîcov — Resume

Senior Frontend Engineer · React · TypeScript · Frontend Architecture · Accessibility

[View master resume](./Alexandr_Ricov_Resume.md)

Latest generated PDF:
[Alexandr_Ricov_Senior_Frontend_Engineer.pdf](./dist/Alexandr_Ricov_Senior_Frontend_Engineer.pdf)

## Source of truth

[`Alexandr_Ricov_Resume.md`](./Alexandr_Ricov_Resume.md) is the single source of truth for all public resume
content. The HTML and PDF in `dist/` are generated from it and must never be edited directly — any change
there is overwritten on the next build.

Private notes live in an HTML comment at the bottom of the master file. The build strips HTML comments, so
they never reach the published PDF.

[`metrics.md`](./metrics.md) holds the repository-derived evidence behind the resume. It is not resume
content; it exists to be consulted when editing the master file.

## Build

```sh
npm install
npm run resume
```

Reads the master Markdown, converts it to semantic HTML, applies
[`templates/resume.html`](./templates/resume.html), and writes both files to `dist/`. The build exits
non-zero with a readable message if any stage fails.

## Layout

```
Alexandr_Ricov_Resume.md   master resume — edit this
metrics.md                 supporting evidence, not resume content
templates/resume.html      print stylesheet and page shell
scripts/build-resume.mjs   Markdown -> HTML -> PDF
dist/                      generated output, committed so the PDF is linkable
archive/                   earlier drafts, kept for reference only
```
