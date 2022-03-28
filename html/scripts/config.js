document.addEventListener("click", function(e) {
  if (!e.target.classList.contains("page-choice")) {
    return;
  }

  let chosenPage = "https://" + e.target.textContent;
  browser.tabs.create({
    url: chosenPage
  });

});
