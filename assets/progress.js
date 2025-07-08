const ctx = document.getElementById("canvas");

// ######################################################
// To add new entries please create a new csv file
// in assets/data and add it to assets/data/filelist.json
// ######################################################

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

function padWithNulls(arr, targetLength) {
  return arr.concat(
    new Array(Math.max(targetLength - arr.length, 0)).fill(null),
  );
}

fetch(`${folder}filelist.json`)
  .then((res) => res.json())
  .then((fileList) => {
    // Sort files in alphanumerically decreasing order
    const sortedFiles = fileList.sort().reverse();

    return Promise.all(
      sortedFiles.map((file) =>
        fetch(`${folder}${file}`).then((res) => res.text()),
      ),
    );
  })
  .then((fileContents) => {
    const labels = [];
    const categoryNames = [];
    const categoryDataMap = {}; // { "Category A": [..], ... }

    fileContents.forEach((csv, index) => {
      const lines = csv.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      if (index === 0) {
        categoryNames.push(...headers.slice(1));
        categoryNames.forEach((name) => (categoryDataMap[name] = []));
      }

      const values = lines[1].split(",").map((v) => v.trim());
      labels.push(values[0]);

      for (let j = 1; j < values.length; j++) {
        const num = values[j] === "" ? null : Number(values[j]);
        categoryDataMap[categoryNames[j - 1]].push(isNaN(num) ? null : num);
      }
    });

    const reversedLabels = [...labels].reverse();

    const datasets = categoryNames.map((name, i) => ({
      label: name,
      data: padWithNulls(categoryDataMap[name], labels.length).reverse(),
      backgroundColor: colorList[i % colorList.length],
      stack: "Stack 1",
      // stack: i < 2 ? "Stack 1" : "Stack 2",
    }));
    const data = {
      labels: reversedLabels,
      datasets: datasets,
    };

    const config = {
      type: "bar",
      data: data,
      plugins: [
        {
          id: "barSumLabels",
          afterDatasetsDraw(chart) {
            const {
              ctx,
              data,
              chartArea: { top },
              scales,
            } = chart;
            const meta = chart.getDatasetMeta(0);
            const barHeight = meta.data[0].height;

            data.labels.forEach((label, i) => {
              let total = 0;
              data.datasets.forEach((ds) => {
                const val = ds.data[i];
                if (val != null) total += val;
              });

              const lastBar = meta.data[i];
              const x = scales.x.getPixelForValue(total);
              const y = lastBar.y;

              ctx.save();
              ctx.font = "bold 16px sans-serif";
              ctx.textAlign = "left";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "black";
              ctx.fillText(total.toExponential(2), x + 5, y);
              ctx.restore();
            });
          },
        },
      ],
	options: {
            indexAxis: "y",
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
		  categoryPercentage: 1.0,
		  barPercentage: 1.0,
              },
        },
          scales: {
              x: {
		  title: {
		      display: true,
		      text: "Number of images",
		      font: {
			  size: 18,
		      },
            },
              stacked: true,
              ticks: {
		  // callback: function (value) {
		  //   return [0, 1e8, 2e8, 1e9].includes(value) ? value : "";
		  // },
		  stepSize: 5e7,
              // min: 0,
              // max: 5e9,
              font: {
                size: 16,
              },
            },
          },
          y: {
            stacked: true,
            ticks: {
              font: {
                  size: 16,
              },
            },
          },
        },
      },
    };

      new Chart(ctx, config);
  });
