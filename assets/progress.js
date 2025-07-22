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

    const bottom = this.bottom;
    const top = this.top;
    const totalHeight = bottom - top;
    const gapCount = 2;
    const gapTotal = gapSize * gapCount;
    const segmentHeight = (totalHeight - gapTotal) / 3;

    // Segment ranges
    const range1 = split1Low - min;
    const range2 = split2Low - split1High;
    const range3 = max - split2High;

    if (value <= split1Low) {
      const ratio = (value - min) / range1;
      return bottom - ratio * segmentHeight;
    } else if (value >= split1High && value <= split2Low) {
      const ratio = (value - split1High) / range2;
      return bottom - segmentHeight - gapSize - ratio * segmentHeight;
    } else if (value >= split2High) {
      const ratio = (value - split2High) / range3;
      return bottom - 2 * segmentHeight - 2 * gapSize - ratio * segmentHeight;
    } else {
      // Value falls inside a gap
      return NaN;
    }
  }

  getValueForPixel(pixel) {
    const { min, max, split1Low, split1High, split2Low, split2High, gapSize } =
      this.options;

    const bottom = this.bottom;
    const top = this.top;
    const totalHeight = bottom - top;
    const gapCount = 2;
    const gapTotal = gapSize * gapCount;
    const segmentHeight = (totalHeight - gapTotal) / 3;

    const range1 = split1Low - min;
    const range2 = split2Low - split1High;
    const range3 = max - split2High;

    const y = bottom - pixel;

    if (y <= segmentHeight) {
      const ratio = y / segmentHeight;
      return min + ratio * range1;
    } else if (y <= segmentHeight * 2 + gapSize) {
      const ratio = (y - segmentHeight - gapSize) / segmentHeight;
      return split1High + ratio * range2;
    } else if (y <= segmentHeight * 3 + 2 * gapSize) {
      const ratio = (y - 2 * segmentHeight - 2 * gapSize) / segmentHeight;
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
    const scaleY = chart.scales.y;
    const { ctx, chartArea } = chart;
    const { split1Low, split1High, split2Low, split2High, gapSize } =
      scaleY.options;

    // Compute break Y positions
    const totalHeight = scaleY.bottom - scaleY.top;
    const segmentHeight = (totalHeight - gapSize * 2) / 3;

    const break1Y = scaleY.bottom - segmentHeight - gapSize / 2;
    const break2Y = scaleY.top + (scaleY.bottom - scaleY.top - gapSize / 2) / 3;

    const markHeight = gapSize / 2;
    const markWidth = 32;

    ctx.save();
    ctx.lineWidth = 1.5;

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((bar, index) => {
        const value = dataset.data[index];
        if (value == null) return;

        const barCenterX = bar.x;

        const drawBreakMark = (y) => {
          const xLeft = barCenterX - markWidth / 2;
          const xRight = barCenterX + markWidth / 2;
          const yTop = y - markHeight / 2;
          const yBottom = y + markHeight / 2;

          // Fill rectangle
          ctx.fillStyle = "white";
          ctx.fillRect(xLeft, yTop, markWidth, markHeight);

          // Two horizontal lines
          ctx.strokeStyle = "black";
          ctx.beginPath();
          ctx.moveTo(xLeft, yTop);
          ctx.lineTo(xRight, yTop);
          ctx.moveTo(xLeft, yBottom);
          ctx.lineTo(xRight, yBottom);
          ctx.stroke();
        };

        if (value > split1Low && value < split1High) return; // inside gap 1 → skip
        if (value > split2Low && value < split2High) return; // inside gap 2 → skip

        // if (value >= split1High && value < split2Low) {
        if (value >= split1High) {
          drawBreakMark(break1Y);
        }
        if (value >= split2High) {
          drawBreakMark(break2Y);
        }
      });
    });

    // Draw the break indicators on the y-axis (left edge) too
    const drawAxisMark = (x, y) => {
      const xAxisLeft = chartArea.left - markWidth / 2;
      const xAxisWidth = markWidth;
      const xRight = x + markWidth / 2;
      const yTop = y - markHeight / 2;
      const yBottom = y + markHeight / 2;

      ctx.fillStyle = "white";
      ctx.fillRect(xAxisLeft, yTop, markWidth, markHeight);

      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.moveTo(xAxisLeft, yTop);
      ctx.lineTo(xRight, yTop);
      ctx.moveTo(xAxisLeft, yBottom);
      ctx.lineTo(xRight, yBottom);
      ctx.stroke();
    };

    drawAxisMark(chartArea.left, break1Y);
    drawAxisMark(chartArea.left, break2Y);

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
    new Array(Math.max(targetLength - arr.length, 0)).fill(null),
  );
}

fetch(`${folder}filelist.json`)
  .then((res) => res.json())
  .then((fileList) => {
    const sortedFiles = fileList.sort(); // Optional: sort alphabetically
    return Promise.all(
      sortedFiles.map((file) =>
        fetch(`${folder}${file}`)
          .then((res) => res.text())
          .then((text) => ({ file, text })),
      ),
    );
  })
  .then((fileDataList) => {
    const labels = [];
    const labelToValuesMap = {};
    const allCategories = new Set();
    let finalCategoryOrder = [];

    fileDataList.forEach(({ file, text }, index) => {
      const lines = text.trim().split("\n");

      const headers = lines[0]
        .split(",")
        .slice(1)
        .map((h) => h.trim()); // skip "Label"
      const values_tmp = lines[1].split(",").map((v) => v.trim());

      const label = values_tmp[0];
      labels.push(label);
      const values = values_tmp.slice(1);
      if (index === fileDataList.length - 1) {
        finalCategoryOrder = headers; // use order from last file
      }

      const entryMap = {};
      headers.forEach((cat, i) => {
        const num = values[i] === "" ? null : Number(values[i]);
        entryMap[cat] = isNaN(num) ? null : num;
        allCategories.add(cat);
      });

      labelToValuesMap[label] = entryMap;
    });

    // Ensure all datasets are padded with nulls for missing entries
    const labelCount = labels.length;
    finalCategoryOrder.forEach((cat) => {
      fileDataList.forEach(({ file }) => {
        const label = file.replace(".csv", "");
        if (!labelToValuesMap[label]) labelToValuesMap[label] = {};
        if (!(cat in labelToValuesMap[label])) {
          labelToValuesMap[label][cat] = null;
        }
      });
    });

    const datasets = finalCategoryOrder.map((category, i) => {
      const data = labels.map((label) => {
        const val = labelToValuesMap[label]?.[category];
        return val !== undefined ? val : null;
      });

      return {
        label: category,
        data: data,
        backgroundColor: colorList[i % colorList.length],
      };
    });

    window.labels = labels;
    window.datasets = datasets;
    createChart(); // initial render
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
      indexAxis: "x",
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Total number of images already provided to the AqQua Project so far, split by instrument",
          font: {
            size: 18,
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
        y: {
          // type: "brokenLinear",
          type: useLog ? "logarithmic" : "brokenLinear",
          reverse: false,
          title: {
            display: true,
            text: "Value (broken axis)",
          },
          min: 1_000_000,
          max: 2_000_000_000,
          ticks: {
            callback: function (value) {
              if (value >= 1e9) return (value / 1e9).toFixed(1) + " Billion";
              if (value >= 1e6) return (value / 1e6).toFixed(1) + " Million";
              if (value >= 1e3) return (value / 1e3).toFixed(0) + "Thousand";
              return value.toString();
            },
            major: {
              enabled: true,
            },
            font: {
              size: 16,
            },
          },
          grid: {
            drawTicks: true,
            drawOnChartArea: true,
          },
          afterBuildTicks: (scale) => {
            // Override the auto-generated ticks:
            useLog
              ? (scale.ticks = [
                  { value: 1e6 },
                  { value: 1e7 },
                  { value: 1e8 },
                  { value: 1e9 },
                  { value: 2e9 },
                ])
              : 0;
          },
        },
        x: {
          stacked: false,
          ticks: {
            font: {
              size: 16,
            },
          },
        },
      },
    },
  });
}
