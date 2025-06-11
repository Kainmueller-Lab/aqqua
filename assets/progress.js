(function () {
  // Total number of images (in millions)
  const total = 3_000;
  // Number of images loaded so far
  const acquired = 100;
  const bar = document.getElementById("bar");
  bar.style.width = acquired / total + "%";
  bar.textContent = acquired + "M";
})();
