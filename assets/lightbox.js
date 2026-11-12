// Lightbox: click a thumbnail to see the full-size image in an overlay.
//
// Markup (the link also works without JavaScript and opens the full image):
//   <figure>
//     <a class="lightbox" href="full-size.jpg"><img src="small.jpg" alt="..."></a>
//     <figcaption>Caption.</figcaption>
//   </figure>
//
// Close the overlay with a click, with Esc, or with the close button.

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll("a.lightbox");
  if (links.length === 0 || typeof HTMLDialogElement === "undefined") {
    return; // no images, or an old browser: the plain link still works
  }

  const dialog = document.createElement("dialog");
  dialog.className = "lightbox-dialog";
  dialog.setAttribute("aria-label", "Enlarged image");

  const close = document.createElement("button");
  close.className = "lightbox-close";
  close.type = "button";
  close.setAttribute("aria-label", "Close");
  close.textContent = "×";

  const img = document.createElement("img");
  const caption = document.createElement("p");
  caption.className = "lightbox-caption";

  dialog.append(close, img, caption);
  document.body.appendChild(dialog);

  // A click anywhere on the overlay closes it.
  dialog.addEventListener("click", () => dialog.close());

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const thumbnail = link.querySelector("img");
      const figcaption = link.closest("figure")?.querySelector("figcaption");
      img.src = link.href;
      img.alt = thumbnail ? thumbnail.alt : "";
      caption.textContent = figcaption ? figcaption.textContent : "";
      dialog.showModal();
    });
  });
});
