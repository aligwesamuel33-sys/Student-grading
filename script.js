(function () {
  "use strict";

  // The five courses. Their order matches the score inputs (score0 ... score4).
  var SUBJECTS = ["Programming", "Database Systems", "Computer Networks", "Mathematics", "Software Engineering"];

  // The "database": an array of student objects.
  // { id, name, scores: [5 numbers], total, average, grade, isDemo }
  var students = [];
  var nextId = 1;

  // Fictional demo data (Mathematics is deliberately the weakest course).
  var DEMO = [
    { name: "Efion Ekanem",      scores: [68, 72, 61, 55, 66] },
    { name: "Chiamaka Okafor",   scores: [88, 91, 84, 79, 90] },
    { name: "Basiru Ibrahim",    scores: [58, 63, 52, 47, 60] },
    { name: "Oluwaseun Adeyemi", scores: [74, 69, 77, 65, 71] },
    { name: "Zainab Musa",       scores: [49, 45, 52, 41, 48] },
    { name: "Chinedu Nwosu",     scores: [44, 46, 40, 38, 42] },
    { name: "Ifeanyi Obi",       scores: [35, 38, 30, 28, 40] }
  ];

  var $ = function (id) { return document.getElementById(id); };
  var form = $("gradeForm");
  var messageBox = $("message");

  /* ---------- Calculation helpers ---------- */

  // Round to 2 decimal places so floating-point noise (e.g. 0.1 + 0.2) never affects comparisons.
  function round2(n) { return Math.round(n * 100) / 100; }

  // Total = sum of all five scores (maximum 500), found with a loop.
  function calculateTotal(scores) {
    var sum = 0;
    for (var i = 0; i < scores.length; i++) { sum += scores[i]; }
    return round2(sum);
  }

  // Average = total / number of subjects (so it is out of 100).
  function calculateAverage(total, count) { return round2(total / count); }

  // Grade scale, checked from highest to lowest boundary.
  function getGrade(average) {
    if (average >= 70) { return "A"; }
    if (average >= 60) { return "B"; }
    if (average >= 50) { return "C"; }
    if (average >= 45) { return "D"; }
    if (average >= 40) { return "E"; }
    return "F";
  }

  // Build a complete student record. Nothing calculated is hardcoded.
  function createStudent(name, scores, isDemo) {
    var total = calculateTotal(scores);
    var rawAverage = total / scores.length;
    return {
      id: nextId++,
      name: name,
      scores: scores,
      total: total,
      average: round2(rawAverage),
      grade: getGrade(rawAverage), // graded on the unrounded average so 49.996 is not bumped up to 50
      isDemo: !!isDemo
    };
  }

  // Highest scorer(s): find the maximum total, then collect EVERY student who has it (handles ties).
  function findTopStudents() {
    if (students.length === 0) { return []; }
    var max = students[0].total;
    for (var i = 1; i < students.length; i++) {
      if (students[i].total > max) { max = students[i].total; }
    }
    return students.filter(function (s) { return s.total === max; });
  }

  // Class average for each subject: add up that subject's column, then divide by the number of students.
  function calculateSubjectAverages() {
    var averages = [];
    for (var j = 0; j < SUBJECTS.length; j++) {
      var sum = 0;
      for (var i = 0; i < students.length; i++) { sum += students[i].scores[j]; }
      averages.push(students.length ? round2(sum / students.length) : 0);
    }
    return averages;
  }

  /* ---------- Validation ---------- */

  function validateName(value) {
    var v = value.trim();
    if (v.length < 2) { return "Enter a name of at least 2 characters."; }
    if (!/^\p{L}[\p{L}\s.'\-]*$/u.test(v)) { return "Use letters, spaces, apostrophes, dots or hyphens only."; }
    return "";
  }

  function validateScore(value) {
    var v = value.trim();
    if (v === "") { return "Score is required."; }
    if (!/^\d+(\.\d+)?$/.test(v)) { return "Enter a number, e.g. 67 or 67.5."; }
    var n = Number(v);
    if (n < 0 || n > 100) { return "Score must be between 0 and 100."; }
    return "";
  }

  function setFieldState(id, error) {
    var input = $(id);
    $(id + "-error").textContent = error;
    input.classList.toggle("invalid", !!error);
    input.classList.toggle("valid", !error && input.value.trim() !== "");
    input.setAttribute("aria-invalid", error ? "true" : "false");
  }

  function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = text ? type : "";
  }

  /* ---------- Rendering ---------- */

  function cell(row, label, content) {
    var td = document.createElement("td");
    td.setAttribute("data-label", label);
    if (content instanceof Node) { td.appendChild(content); } else { td.textContent = content; }
    row.appendChild(td);
  }

  function summaryLine(big, meta, extraClass) {
    var wrap = document.createElement("div");
    wrap.className = "winner";
    var b = document.createElement("span");
    b.className = "big" + (extraClass ? " " + extraClass : "");
    b.textContent = big;
    var m = document.createElement("span");
    m.className = "meta";
    m.textContent = meta;
    wrap.appendChild(b);
    wrap.appendChild(m);
    return wrap;
  }

  function renderTable(topIds) {
    var body = $("resultsBody");
    body.innerHTML = "";
    students.forEach(function (s, index) {
      var tr = document.createElement("tr");
      if (topIds.indexOf(s.id) !== -1) { tr.className = "is-top"; }

      var nameWrap = document.createElement("span");
      nameWrap.textContent = s.name + " ";
      if (s.isDemo) {
        var badge = document.createElement("span");
        badge.className = "badge demo";
        badge.textContent = "Demo";
        nameWrap.appendChild(badge);
      }
      cell(tr, "#", index + 1);
      cell(tr, "Name", nameWrap);
      for (var j = 0; j < SUBJECTS.length; j++) { cell(tr, SUBJECTS[j], s.scores[j]); }
      cell(tr, "Total /500", s.total);
      cell(tr, "Average", s.average.toFixed(2));

      var g = document.createElement("span");
      g.className = "grade grade-" + s.grade;
      g.textContent = s.grade;
      cell(tr, "Grade", g);

      var rm = document.createElement("button");
      rm.type = "button";
      rm.className = "btn small";
      rm.textContent = "Remove";
      rm.setAttribute("data-id", s.id);
      rm.setAttribute("aria-label", "Remove " + s.name);
      cell(tr, "", rm);
      body.appendChild(tr);
    });
    $("resultsTable").hidden = students.length === 0;
    $("emptyState").hidden = students.length > 0;
    $("studentCount").textContent = students.length + (students.length === 1 ? " student" : " students");
  }

  function renderTopStudent(tops) {
    var box = $("topStudent");
    box.innerHTML = "";
    if (tops.length === 0) { box.textContent = "No records yet."; return; }
    tops.forEach(function (s) {
      box.appendChild(summaryLine(s.name, "Total " + s.total + " / 500 · Average " + s.average.toFixed(2) + " · Grade " + s.grade));
    });
    if (tops.length > 1) {
      var tie = document.createElement("p");
      tie.className = "meta";
      tie.textContent = "Tie: " + tops.length + " students share the highest total.";
      box.appendChild(tie);
    }
  }

  function renderSubjectAverages() {
    var grid = $("subjectAverages");
    var summary = $("subjectSummary");
    grid.innerHTML = "";
    summary.innerHTML = "";
    if (students.length === 0) { summary.textContent = "Add students to see class averages by subject."; return; }

    var averages = calculateSubjectAverages();
    // Lowest class average: find the minimum, then flag every subject that equals it (handles ties).
    var min = averages[0];
    for (var k = 1; k < averages.length; k++) { if (averages[k] < min) { min = averages[k]; } }
    var lowestNames = [];

    for (var j = 0; j < SUBJECTS.length; j++) {
      var isLowest = averages[j] === min;
      if (isLowest) { lowestNames.push(SUBJECTS[j]); }
      var item = document.createElement("div");
      item.className = "avg-item" + (isLowest ? " lowest" : "");
      item.innerHTML = '<div class="name"></div><div class="val"></div><div class="bar"><span></span></div>';
      item.querySelector(".name").textContent = SUBJECTS[j];
      item.querySelector(".val").textContent = averages[j].toFixed(2);
      item.querySelector(".bar span").style.width = averages[j] + "%";
      if (isLowest) {
        var tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = "Lowest";
        item.appendChild(tag);
      }
      grid.appendChild(item);
    }
    var label = lowestNames.length > 1 ? "Lowest class averages (tie): " : "Lowest class average: ";
    summary.appendChild(summaryLine(label + lowestNames.join(" & "), "Class average " + min.toFixed(2) + " across " + students.length + (students.length === 1 ? " student" : " students"), "low"));
  }

  // Re-draw every summary whenever the records change.
  function renderAll() {
    var tops = findTopStudents();
    renderTable(tops.map(function (s) { return s.id; }));
    renderTopStudent(tops);
    renderSubjectAverages();
    $("clearAll").disabled = students.length === 0;
  }

  /* ---------- Events ---------- */

  var scoreIds = SUBJECTS.map(function (_, i) { return "score" + i; });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var hasError = false;
    var firstBad = null;
    var scores = [];

    var nameError = validateName($("studentName").value);
    setFieldState("studentName", nameError);
    if (nameError) { hasError = true; firstBad = "studentName"; }

    for (var i = 0; i < scoreIds.length; i++) {
      var err = validateScore($(scoreIds[i]).value);
      setFieldState(scoreIds[i], err);
      if (err) { hasError = true; if (!firstBad) { firstBad = scoreIds[i]; } }
      else { scores.push(Number($(scoreIds[i]).value.trim())); }
    }

    if (hasError) {
      showMessage("Please correct the highlighted fields. All five scores must be numbers from 0 to 100.", "fail");
      $(firstBad).focus();
      return;
    }

    var name = $("studentName").value.trim();
    var student = createStudent(name, scores, false);
    students.push(student);
    form.reset();
    ["studentName"].concat(scoreIds).forEach(function (id) { setFieldState(id, ""); $(id).classList.remove("valid"); });
    renderAll();
    showMessage(name + " added: total " + student.total + "/500, average " + student.average.toFixed(2) + ", grade " + student.grade + ". Add another student whenever you are ready.", "success");
    $("studentName").focus();
  });

  // Live feedback on blur / while correcting.
  ["studentName"].concat(scoreIds).forEach(function (id) {
    var validator = id === "studentName" ? validateName : validateScore;
    $(id).addEventListener("blur", function () { if ($(id).value !== "") { setFieldState(id, validator($(id).value)); } });
    $(id).addEventListener("input", function () { if ($(id).classList.contains("invalid")) { setFieldState(id, validator($(id).value)); } });
  });

  $("loadDemo").addEventListener("click", function () {
    var added = 0;
    DEMO.forEach(function (d) {
      var exists = students.some(function (s) { return s.isDemo && s.name === d.name; });
      if (!exists) { students.push(createStudent(d.name, d.scores.slice(), true)); added++; }
    });
    renderAll();
    showMessage(added ? added + " fictional demo student(s) loaded." : "Sample students are already loaded.", "info");
  });

  $("clearAll").addEventListener("click", function () {
    var n = students.length;
    students = [];
    renderAll();
    showMessage(n + " record(s) cleared. The form is ready for a new student.", "info");
  });

  // One listener on the table handles every Remove button (event delegation).
  $("resultsBody").addEventListener("click", function (event) {
    var btn = event.target.closest("button[data-id]");
    if (!btn) { return; }
    var id = Number(btn.getAttribute("data-id"));
    students = students.filter(function (s) { return s.id !== id; });
    renderAll();
    showMessage("Record removed. Summaries updated.", "info");
  });

  renderAll();
})();
