# Student Grade Calculator

## Project Description

This Student Grade Calculator is a responsive front-end project for a Nigerian university assignment. Users enter a student's name and five subject scores, and JavaScript validates input, calculates totals, averages and letter grades programmatically. Records are stored in an array of objects and shown in a results table. The dashboard identifies the highest-scoring student, handles ties, computes each subject's class average and flags the weakest subject. Labelled demonstration data can be loaded or cleared. Everything runs in plain HTML, CSS and JavaScript, with no backend, build tools or paid services.

## Features

- Student name plus five course scores: Programming, Database Systems, Computer Networks, Mathematics, Software Engineering
- Validation with messages beside each field
- Results table with total, average and colour-coded grade
- Highest-scoring student card (ties handled)
- Class average per subject, with the lowest subject flagged (ties handled)
- Load sample students (labelled Demo), remove single records, or clear everything
- Mobile layout: the table becomes stacked cards on phones

## Grading Scale

| Grade | Average |
|---|---|
| A | 70 – 100 |
| B | 60 – 69.99 |
| C | 50 – 59.99 |
| D | 45 – 49.99 |
| E | 40 – 44.99 |
| F | below 40 |

## Formulas

- **Total** = score1 + score2 + score3 + score4 + score5 (out of 500), added with a `for` loop.
- **Average** = total ÷ 5 (out of 100).
- The grade is chosen from the unrounded average using `if` statements from the highest boundary down.
- Values are rounded to 2 decimal places only for storage and display.

## Highest-Student Calculation

`findTopStudents()` finds the largest `total` in the array, then uses `filter` to return every student whose total equals it. One winner gives a single result; several winners are all shown with a tie note.

## Subject-Average Calculation

`calculateSubjectAverages()` loops over each subject index, adds that subject's score from every student, and divides by the number of students. The smallest average is then found, and every subject equal to it is flagged as lowest, so ties are handled. With no students, a friendly empty state is shown.

## Array and Object Structure

```js
students = [
  {
    id: 1,
    name: "Efion Ekanem",
    scores: [68, 72, 61, 55, 66], // same order as SUBJECTS
    total: 322,
    average: 64.4,
    grade: "B",
    isDemo: true
  }
];
```

The `SUBJECTS` array holds the five course names in the same order as `scores`.

## File Structure

```
index.html   page structure and form
style.css    navy and green design, responsive rules
script.js    validation, calculations, rendering, events
README.md    this file
```

## Running Locally

1. Keep the four files in one folder (or a GitHub repository root).
2. Open `index.html` in any modern browser, or enable GitHub Pages.

No installation, backend or API key is required.

## Limitations

- Records live in memory only and disappear when the page is refreshed.
- All sample students are fictional.
- This is a learning project, not an official results system.
