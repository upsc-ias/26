document.addEventListener("DOMContentLoaded", function () {
  const TOTAL_QUESTIONS = 100;

  const correctInput = document.getElementById("correct");
  const wrongInput = document.getElementById("wrong");
  const skippedInput = document.getElementById("skipped");
  const resultDiv = document.getElementById("result");

  correctInput.addEventListener("input", updateCalculator);
  wrongInput.addEventListener("input", updateCalculator);

  function updateCalculator() {
    let correct = correctInput.value === "" ? 0 : Number(correctInput.value);
    let wrong = wrongInput.value === "" ? 0 : Number(wrongInput.value);

    if (correct + wrong > TOTAL_QUESTIONS) {
      resultDiv.innerText = "Correct + Wrong cannot exceed 100.";
      skippedInput.value = "";
      return;
    }

    let attempted = correct + wrong;
    let skipped = TOTAL_QUESTIONS - attempted;
    skippedInput.value = skipped;

    let score = 2 * correct - (2 / 3) * wrong;

    let accuracy = attempted === 0 ? 0 : (correct / attempted) * 100;

    resultDiv.innerHTML = `
            <div class="attempted">
                Total Attempted: ${attempted}
            </div>
            <div class="score">
                ${score.toFixed(2)} / 200
            </div>
            <div class="accuracy">
                Accuracy: ${accuracy.toFixed(2)}%
            </div>
        `;
  }

  let chart;
  const generateBtn = document.getElementById("generateBtn");
  generateBtn.addEventListener("click", generateGraph);

  function generateGraph() {
    const desiredScore = Number(document.getElementById("desiredScore").value);
    const resultsDiv = document.getElementById("results");

    // Read AI filter values (fallback to placeholder if empty)
    const accMinInput = document.getElementById("accMin");
    const accMaxInput = document.getElementById("accMax");
    const attMinInput = document.getElementById("attMin");
    const attMaxInput = document.getElementById("attMax");

    const accMin =
      accMinInput.value === ""
        ? Number(accMinInput.placeholder)
        : Number(accMinInput.value);
    const accMax =
      accMaxInput.value === ""
        ? Number(accMaxInput.placeholder)
        : Number(accMaxInput.value);
    const attMin =
      attMinInput.value === ""
        ? Number(attMinInput.placeholder)
        : Number(attMinInput.value);
    const attMax =
      attMaxInput.value === ""
        ? Number(attMaxInput.placeholder)
        : Number(attMaxInput.value);

    let validPoints = [];
    let validCombos = [];

    for (let c = 0; c <= 100; c++) {
      for (let w = 0; w <= 100; w++) {
        if (c + w > 100) continue;

        let attempted = c + w;
        let skipped = 100 - attempted;
        let score = 2 * c - (2 / 3) * w;

        if (score >= desiredScore) {
          let accuracy = attempted === 0 ? 0 : (c / attempted) * 100;

          if (
            accuracy >= accMin &&
            accuracy <= accMax &&
            attempted >= attMin &&
            attempted <= attMax
          ) {
            validPoints.push({ x: c, y: w });

            validCombos.push({
              correct: c,
              wrong: w,
              skipped: skipped,
              attempted: attempted,
              score: score,
              accuracy: accuracy,
            });
          }
        }
      }
    }

    validCombos.sort((a, b) => a.accuracy - b.accuracy);

    let tableHTML = `
            <table>
                <tr>
                    <th>Correct</th>
                    <th>Wrong</th>
                    <th>Skipped</th>
                    <th>Attempted</th>
                    <th>Score</th>
                    <th>Accuracy (%)</th>
                </tr>
        `;

    if (validCombos.length === 0) {
      tableHTML += `
                <tr>
                    <td colspan="6" style="color:#ff4d4d;">
                        No feasible combinations in selected range.
                    </td>
                </tr>
            `;
    }

    validCombos.forEach((row) => {
      tableHTML += `
                <tr>
                    <td>${row.correct}</td>
                    <td>${row.wrong}</td>
                    <td>${row.skipped}</td>
                    <td>${row.attempted}</td>
                    <td>${row.score.toFixed(2)}</td>
                    <td style="color:#00ff88; font-weight:bold;">
                        ${row.accuracy.toFixed(2)}
                    </td>
                </tr>
            `;
    });

    tableHTML += "</table>";
    resultsDiv.innerHTML = tableHTML;

    const ctx = document.getElementById("chart");
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Feasible (Correct, Wrong) Pairs",
            data: validPoints,
            pointRadius: 3,
            borderColor: "#00adb5",
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: { display: true, text: "Correct", color: "white" },
            ticks: { color: "white" },
            min: 0,
            max: 100,
          },
          y: {
            title: { display: true, text: "Wrong", color: "white" },
            ticks: { color: "white" },
            min: 0,
            max: 100,
          },
        },
        plugins: {
          legend: { labels: { color: "white" } },
        },
      },
    });
  }

  /* =========================
   Difficulty Preset Logic
========================== */

  const diffButtons = document.querySelectorAll(".difficulty-btn");

  diffButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const isAlreadyActive = this.classList.contains("difficulty-active");

      // First remove all active classes
      diffButtons.forEach((btn) => btn.classList.remove("difficulty-active"));

      const accMinInput = document.getElementById("accMin");
      const accMaxInput = document.getElementById("accMax");
      const attMinInput = document.getElementById("attMin");
      const attMaxInput = document.getElementById("attMax");

      // If already active → deselect everything
      if (isAlreadyActive) {
        accMinInput.placeholder = "";
        accMaxInput.placeholder = "";
        attMinInput.placeholder = "";
        attMaxInput.placeholder = "";

        accMinInput.value = "";
        accMaxInput.value = "";
        attMinInput.value = "";
        attMaxInput.value = "";

        return;
      }

      // Otherwise activate clicked button
      this.classList.add("difficulty-active");

      const level = this.getAttribute("data-level");

      if (level === "easy") {
        accMinInput.placeholder = "65";
        accMaxInput.placeholder = "78";
        attMinInput.placeholder = "95";
        attMaxInput.placeholder = "100";
      }

      if (level === "medium") {
        accMinInput.placeholder = "68";
        accMaxInput.placeholder = "75";
        attMinInput.placeholder = "88";
        attMaxInput.placeholder = "94";
      }

      if (level === "hard") {
        accMinInput.placeholder = "69";
        accMaxInput.placeholder = "74";
        attMinInput.placeholder = "81";
        attMaxInput.placeholder = "86";
      }

      accMinInput.value = "";
      accMaxInput.value = "";
      attMinInput.value = "";
      attMaxInput.value = "";
    });
  });
});

// disabling inspect element
document.addEventListener("contextmenu", function(e){
    e.preventDefault(); //this prevents right click
});
document.onkeydown=function(e){
    if(event.keycode==123){
        return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode=="I".charCodeAt(0)){
        return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode=="C".charCodeAt(0)){
        return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode=="J".charCodeAt(0)){
        return false;
    }
    if(e.ctrlKey && e.keyCode=="U".charCodeAt(0)){
        return false;
    }
    if(e.ctrlKey && e.keyCode=="S".charCodeAt(0)){
        return false;
    }
};
