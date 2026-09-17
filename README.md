# Alexandr Rîcov — Resume

Senior Frontend Engineer · React · TypeScript · Frontend Architecture · Accessibility

[View master resume](./Alexandr_Ricov_Resume.md) ·
[Read it as a page](https://alexandrricov.github.io/alexandrricov/) ·
[Download the PDF](./dist/Alexandr_Ricov_Senior_Frontend_Engineer.pdf)

## Source of truth

[`Alexandr_Ricov_Resume.md`](./Alexandr_Ricov_Resume.md) is the single source of truth for all resume
content. `index.html` and everything in `dist/` are generated from it and must never be edited directly —
any change there is overwritten on the next build.

Private notes live in an HTML comment at the bottom of the master file. The build strips HTML comments, so
they never reach the published output.

## Build

```sh
npm install
npm run resume
```

Reads the master Markdown, converts it to semantic HTML, applies
[`templates/resume.html`](./templates/resume.html), and writes the page and the PDF. The build exits
non-zero with a readable message if any stage fails.

The PDF is built for real applications: a single column, selectable text, logical reading order, no layout
tables and no text rendered as an image.

## Layout

```
Alexandr_Ricov_Resume.md   master resume — edit this
templates/resume.html      styles and page shell, shared by screen and print
scripts/build-resume.mjs   Markdown -> HTML -> PDF
index.html                 generated page, served by GitHub Pages
dist/                      generated PDF
```

Supporting measurements behind the resume are kept in an untracked `metrics.md`, alongside earlier drafts in
`archive/`. Both stay local.
