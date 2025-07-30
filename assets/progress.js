// ######################################################
// To add new entries please create a new csv file
// in assets/data and add it to assets/data/filelist.json
// ######################################################

class BrokenLinearScale extends Chart.Scale {
  static id = "brokenLinear";
  static defaults = {
    min: 0,
    max: 1_500_000_000,
    split1Low: 100_000_000,
    split1High: 200_000_000,
    split2Low: 250_000_000,
    split2High: 600_000_000,
    gapSize: 32,
  };

  getPixelForValue(value) {
    const { min, max, split1Low, split1High, split2Low, split2High, gapSize } =
      this.options;

    const left = this.left;
    const right = this.right;
    const totalWidth = right - left;
    const gapCount = 2;
    const gapTotal = gapSize * gapCount;
    const segmentWidth = (totalWidth - gapTotal) / 3;

    // Segment ranges
    const range1 = split1Low - min;
    const range2 = split2Low - split1High;
    const range3 = max - split2High;

    if (value <= split1Low) {
      const ratio = (value - min) / range1;
      return left + ratio * segmentWidth;
    } else if (value >= split1High && value <= split2Low) {
      const ratio = (value - split1High) / range2;
      return left + segmentWidth + gapSize + ratio * segmentWidth;
    } else if (value >= split2High) {
      const ratio = (value - split2High) / range3;
      return left + 2 * segmentWidth + 2 * gapSize + ratio * segmentWidth;
    } else {
      // Value falls inside a gap
      return NaN;
    }
  }

  getValueForPixel(pixel) {
    const { min, max, split1Low, split1High, split2Low, split2High, gapSize } =
      this.options;

    const left = this.left;
    const right = this.right;
    const totalWidth = right - left;
    const gapCount = 2;
    const gapTotal = gapSize * gapCount;
    const segmentWidth = (totalWidth - gapTotal) / 3;

    const range1 = split1Low - min;
    const range2 = split2Low - split1High;
    const range3 = max - split2High;

    const x = pixel - left;

    if (x <= segmentWidth) {
      const ratio = x / segmentWidth;
      return min + ratio * range1;
    } else if (x <= segmentWidth * 2 + gapSize) {
      const ratio = (x - segmentWidth - gapSize) / segmentWidth;
      return split1High + ratio * range2;
    } else if (x <= segmentWidth * 3 + 2 * gapSize) {
      const ratio = (x - 2 * segmentWidth - 2 * gapSize) / segmentWidth;
      return split2High + ratio * range3;
    } else {
      return NaN;
    }
  }

  buildTicks() {
    const { min, max, split1Low, split1High, split2Low, split2High } =
      this.options;

    const ticks = [];

    const step1 = (split1Low - min) / 5;
    for (let i = min; i <= split1Low; i += step1) {
      ticks.push({ value: i });
    }

    const step2 = (split2Low - split1High) / 5;
    for (let i = split1High; i <= split2Low; i += step2) {
      ticks.push({ value: i });
    }

    const step3 = (max - split2High) / 5;
    for (let i = split2High; i <= max; i += step3) {
      ticks.push({ value: i });
    }

    return ticks;
  }

  // For tooltips
  getLabelForValue(value) {
    if (value >= 1e9) return (value / 1e9).toFixed(1) + "B";
    if (value >= 1e6) return (value / 1e6).toFixed(1) + "M";
    if (value >= 1e3) return (value / 1e3).toFixed(0) + "k";
    return value.toString();
  }
}

const BrokenAxisMarkPlugin = {
  id: "brokenAxisMarkerOverlay",
  afterDatasetsDraw(chart) {
    const scaleX = chart.scales.x; // Now x is the value axis
    const scaleY = chart.scales.y; // Now y is the category axis
    const { ctx, chartArea } = chart;
    const { split1Low, split1High, split2Low, split2High, gapSize } =
      scaleX.options;

    // Compute break X positions for horizontal chart
    const totalWidth = scaleX.right - scaleX.left;
    const segmentWidth = (totalWidth - gapSize * 2) / 3;

    const break1X = scaleX.left + segmentWidth + gapSize / 2;
    const break2X = scaleX.right - segmentWidth - gapSize / 2;

    const markWidth = gapSize / 2;
    const markHeight = 32;

    ctx.save();
    ctx.lineWidth = 1.5;

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((bar, index) => {
        const value = dataset.data[index];
        if (value == null) return;

        const barCenterY = bar.y;

        const drawBreakMark = (x) => {
          const xLeft = x - markWidth / 2;
          const xRight = x + markWidth / 2;
          const yTop = barCenterY - markHeight / 2;
          const yBottom = barCenterY + markHeight / 2;

          // Fill rectangle
          ctx.fillStyle = "white";
          ctx.fillRect(xLeft, yTop, markWidth, markHeight);

          // Two vertical lines for horizontal chart
          ctx.strokeStyle = "black";
          ctx.beginPath();
          ctx.moveTo(xLeft, yTop);
          ctx.lineTo(xLeft, yBottom);
          ctx.moveTo(xRight, yTop);
          ctx.lineTo(xRight, yBottom);
          ctx.stroke();
        };

        if (value > split1Low && value < split1High) return; // inside gap 1 → skip
        if (value > split2Low && value < split2High) return; // inside gap 2 → skip

        if (value >= split1High) {
          drawBreakMark(break1X);
        }
        if (value >= split2High) {
          drawBreakMark(break2X);
        }

        // Draw previous months reference lines
        const category = chart.data.labels[index];

        // Draw a reference line for each previous month
        if (window.allPreviousData && window.allPreviousMonths) {
          console.log(`Drawing reference lines for category: ${category}`);
          console.log("Available previous months:", window.allPreviousMonths);
          console.log("Previous data:", window.allPreviousData);

          window.allPreviousMonths.forEach((monthLabel, monthIndex) => {
            const previousValue =
              window.allPreviousData[monthLabel] &&
              window.allPreviousData[monthLabel][category];
            console.log(`${monthLabel} - ${category}: ${previousValue}`);

            if (previousValue && previousValue > 0) {
              const previousX = scaleX.getPixelForValue(previousValue);
              console.log(`Pixel position for ${previousValue}: ${previousX}`);

              if (!isNaN(previousX)) {
                const barTop = bar.y - bar.height / 2;
                const barBottom = bar.y + bar.height / 2;

                // Draw previous month reference line
                ctx.save();
                // Use the same colors/styles as defined in the legend
                const colors = [
                  "#222222",
                  "#666666",
                  "#888888",
                  "#AAAAAA",
                  "#CCCCCC",
                ];
                const dashPatterns = [
                  [2, 2],
                  [4, 2],
                  [6, 2],
                  [8, 2],
                  [10, 2],
                ];

                ctx.strokeStyle = colors[monthIndex % colors.length];
                ctx.lineWidth = 1.5; // Match legend lineWidth
                ctx.setLineDash(dashPatterns[monthIndex % dashPatterns.length]);
                ctx.beginPath();
                ctx.moveTo(previousX, barTop);
                ctx.lineTo(previousX, barBottom);
                ctx.stroke();
                ctx.setLineDash([]); // Reset line dash
                ctx.restore();

                console.log(
                  `Drew reference line for ${monthLabel} at x=${previousX}`
                );
              }
            }
          });
        }
      });
    });

    // Draw the break indicators on the x-axis (bottom edge) too
    const drawAxisMark = (x, y) => {
      const yAxisBottom = chartArea.bottom - markHeight / 2;
      const yAxisHeight = markHeight;
      const xLeft = x - markWidth / 2;
      const xRight = x + markWidth / 2;
      const yBottom = y + markHeight / 2;

      ctx.fillStyle = "white";
      ctx.fillRect(xLeft, yAxisBottom, markWidth, markHeight);

      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.moveTo(xLeft, yAxisBottom);
      ctx.lineTo(xLeft, yBottom);
      ctx.moveTo(xRight, yAxisBottom);
      ctx.lineTo(xRight, yBottom);
      ctx.stroke();
    };

    drawAxisMark(break1X, chartArea.bottom);
    drawAxisMark(break2X, chartArea.bottom);

    ctx.restore();
  },
};

Chart.register(BrokenLinearScale);
Chart.register(BrokenAxisMarkPlugin); //

const ctx = document.getElementById("canvas");

const folder = "assets/data/";

// List of colors
const colorList = [
  "#88B04B",
  "#9F00A7",
  "#EFC050",
  "#34568B",
  "#E47A2E",
  "#BC70A4",
  "#92A8D1",
  "#A3B18A",
  "#45B8AC",
  "#6B5B95",
  "#F7CAC9",
  "#E8A798",
  "#9C9A40",
  "#9C4722",
  "#6B5876",
  "#CE3175",
  "#00A591",
  "#EDD59E",
  "#1E7145",
  "#E9FF70",
  "#FDAC53",
  "#9BB7D4",
  "#B55A30",
  "#F5DF4D",
  "#0072B5",
  "#A0DAA9",
  "#E9897E",
  "#00A170",
  "#926AA6",
  "#EFE1CE",
  "#9A8B4F",
  "#FFA500",
  "#56C6A9",
  "#4B5335",
  "#798EA4",
  "#E0B589",
  "#00758F",
  "#FA7A35",
  "#578CA9",
  "#95DEE3",
];

let labels = [];
let datasets = [];
let chartInstance = null;

document.getElementById("scaleToggle").addEventListener("change", () => {
  createChart(); // re-render on toggle
});

function padWithNulls(arr, targetLength) {
  return arr.concat(
    new Array(Math.max(targetLength - arr.length, 0)).fill(null)
  );
}

// Load filelist.json first, then load all CSV files
fetch(`${folder}filelist.json`)
  .then((res) => res.json())
  .then((fileList) => {
    // Sort files to ensure proper order (assuming YYYY_MM.csv format)
    const sortedFiles = fileList.sort();

    // Get the latest file and all previous files
    const latestFile = sortedFiles[sortedFiles.length - 1];
    const previousFiles = sortedFiles.slice(0, -1); // All files except the latest

    console.log(`Loading latest data: ${latestFile}`);
    console.log(
      `Loading comparison data for ${previousFiles.length} previous months:`,
      previousFiles
    );

    // Load all CSV files
    const loadPromises = [
      fetch(`${folder}${latestFile}`).then((res) => res.text()),
    ];

    // Add promises for all previous files
    previousFiles.forEach((file) => {
      loadPromises.push(fetch(`${folder}${file}`).then((res) => res.text()));
    });

    return Promise.all(loadPromises).then((allTexts) => {
      const latestText = allTexts[0];
      const previousTexts = allTexts.slice(1);
      return { latestText, previousTexts, latestFile, previousFiles };
    });
  })
  .then(({ latestText, previousTexts, latestFile, previousFiles }) => {
    // Parse latest month data (main chart data)
    const latestLines = latestText.trim().split("\n");
    const latestHeaders = latestLines[0]
      .split(",")
      .slice(1)
      .map((h) => h.trim());
    const latestValues = latestLines[1]
      .split(",")
      .slice(1)
      .map((v) => v.trim());

    // Parse all previous months data (comparison/reference lines)
    const allPreviousData = {};
    const allPreviousMonths = [];

    previousFiles.forEach((file, fileIndex) => {
      const previousText = previousTexts[fileIndex];
      const previousLines = previousText.trim().split("\n");
      const previousHeaders = previousLines[0]
        .split(",")
        .slice(1)
        .map((h) => h.trim());
      const previousValues = previousLines[1]
        .split(",")
        .slice(1)
        .map((v) => v.trim());

      const previousData = {};
      previousHeaders.forEach((cat, i) => {
        const num = previousValues[i] === "" ? null : Number(previousValues[i]);
        previousData[cat] = isNaN(num) ? null : num;
      });

      const monthLabel = file.replace(".csv", "").replace("_", "/");
      allPreviousData[monthLabel] = previousData;
      allPreviousMonths.push(monthLabel);
    });

    // Create latest data object
    const latestData = {};
    latestHeaders.forEach((cat, i) => {
      const num = latestValues[i] === "" ? null : Number(latestValues[i]);
      latestData[cat] = isNaN(num) ? null : num;
    });

    // Extract month/year info from filenames for display
    const latestMonth = latestFile.replace(".csv", "").replace("_", "/");

    // Create categories list (use latest data as primary)
    const categories = latestHeaders;

    // Create Chart.js dataset
    const datasets = [
      {
        label: latestMonth,
        data: categories.map((cat) => latestData[cat]),
        backgroundColor: colorList.slice(0, categories.length),
        borderColor: categories.map((_, i) => colorList[i % colorList.length]),
        borderWidth: 1,
      },
    ];

    // Store data globally for chart access
    window.labels = categories;
    window.datasets = datasets;
    window.allPreviousData = allPreviousData; // Store all previous months data
    window.allPreviousMonths = allPreviousMonths; // Store all previous month labels
    window.latestMonth = latestMonth;

    // Calculate total images for latest month
    window.totalLatestImages = categories.reduce((total, cat) => {
      const value = latestData[cat];
      return total + (value || 0);
    }, 0);

    createChart(); // initial render
  })
  .catch((error) => {
    console.error("Error loading data:", error);
    // Fallback to hardcoded files if filelist.json fails
    console.log("Falling back to direct file loading...");

    Promise.all([
      fetch(`${folder}2025_07.csv`).then((res) => res.text()),
      fetch(`${folder}2025_06.csv`).then((res) => res.text()),
    ]).then(([latestText, previousText]) => {
      // Parse as before but with generic variable names
      const latestLines = latestText.trim().split("\n");
      const latestHeaders = latestLines[0]
        .split(",")
        .slice(1)
        .map((h) => h.trim());
      const latestValues = latestLines[1]
        .split(",")
        .slice(1)
        .map((v) => v.trim());

      const previousLines = previousText.trim().split("\n");
      const previousHeaders = previousLines[0]
        .split(",")
        .slice(1)
        .map((h) => h.trim());
      const previousValues = previousLines[1]
        .split(",")
        .slice(1)
        .map((v) => v.trim());

      const latestData = {};
      const previousData = {};

      latestHeaders.forEach((cat, i) => {
        const num = latestValues[i] === "" ? null : Number(latestValues[i]);
        latestData[cat] = isNaN(num) ? null : num;
      });

      previousHeaders.forEach((cat, i) => {
        const num = previousValues[i] === "" ? null : Number(previousValues[i]);
        previousData[cat] = isNaN(num) ? null : num;
      });

      const categories = latestHeaders;
      const datasets = [
        {
          label: "2025/07",
          data: categories.map((cat) => latestData[cat]),
          backgroundColor: colorList.slice(0, categories.length),
          borderColor: categories.map(
            (_, i) => colorList[i % colorList.length]
          ),
          borderWidth: 1,
        },
      ];

      window.labels = categories;
      window.datasets = datasets;
      window.allPreviousData = { "2025/06": previousData }; // Fallback format
      window.allPreviousMonths = ["2025/06"]; // Fallback format
      window.latestMonth = "2025/07";
      window.totalLatestImages = categories.reduce((total, cat) => {
        const value = latestData[cat];
        return total + (value || 0);
      }, 0);

      createChart();
    });
  });

// Chart creation function with toggle
function createChart() {
  const useLog = document.getElementById("scaleToggle").checked;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = document.getElementById("canvas").getContext("2d");

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: window.labels,
      datasets: window.datasets,
    },
    options: {
      indexAxis: "y", // Change to horizontal bars
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: [
            `Total number of images provided to the AqQua Project by instrument (${
              window.latestMonth || "07/2025"
            })`,
            `Total: ${(
              (window.totalLatestImages || window.totalJulyImages) / 1e9
            ).toFixed(2)} Billion images collected`,
          ],
          font: {
            size: 18,
          },
        },
        legend: {
          display: true,
          labels: {
            generateLabels: function (chart) {
              // Don't generate labels for the main dataset, only add reference lines for all previous months
              const labels = [];

              // Add reference lines for all previous months to legend
              if (window.allPreviousMonths) {
                const colors = [
                  "#222222",
                  "#666666",
                  "#888888",
                  "#AAAAAA",
                  "#CCCCCC",
                ];
                const dashPatterns = [
                  [2, 2],
                  [4, 2],
                  [6, 2],
                  [8, 2],
                  [10, 2],
                ];

                window.allPreviousMonths.forEach((monthLabel, monthIndex) => {
                  labels.push({
                    text: `${monthLabel} (reference line)`,
                    fillStyle: "transparent",
                    strokeStyle: colors[monthIndex % colors.length],
                    lineWidth: 1.5,
                    lineDash: dashPatterns[monthIndex % dashPatterns.length],
                    pointStyle: "line",
                    boxWidth: 0,
                    boxHeight: 0,
                    usePointStyle: true,
                  });
                });
              }

              return labels;
            },
            usePointStyle: true, // Enable point style for all legend items
            pointStyle: "line", // Default to line style
            },
          },
          },
          datasets: {
          bar: {
            maxBarThickness: 64,
            categoryPercentage: 0.6667,
            barPercentage: 1.0,
          },
          },
          scales: {
          x: {
            // Now x-axis is the value axis (was y)
            type: useLog ? "logarithmic" : "brokenLinear",
            reverse: false,
            title: {
            display: true,
            text: useLog ? "Number of images provided" : "Number of images provided (broken axis)",
            },
            min: 1_000_000,
            max: 2_000_000_000,
            ticks: {
            callback: function (value) {
              if (value >= 1e9) return (value / 1e9).toFixed(1) + " Billion";
              if (value >= 1e6) return (value / 1e6).toFixed(0) + " Million";
              if (value >= 1e3) return (value / 1e3).toFixed(0) + "Thousand";
              return value.toString();
            },
            major: {
              enabled: true,
            },
            font: {
              size: 16,
            },
            maxRotation: 45, // Angle labels for both scales
            minRotation: 45,
          },
          grid: {
            drawTicks: true,
            drawOnChartArea: true,
          },
          afterBuildTicks: (scale) => {
            // Override the auto-generated ticks:
            if (useLog) {
              scale.ticks = [
                { value: 1e6 },
                { value: 2e6 },
                { value: 5e6 },
                { value: 1e7 },
                { value: 2e7 },
                { value: 5e7 },
                { value: 1e8 },
                { value: 2e8 },
                { value: 5e8 },
                { value: 1e9 },
                { value: 2e9 },
              ];
            }
          },
        },
        y: {
          // Now y-axis is the category axis (was x)
          stacked: false,
          ticks: {
            font: {
              size: 16,
            },
            maxTicksLimit: false, // Show all labels
            autoSkip: false, // Don't skip any labels
          },
        },
      },
    },
  });
}
