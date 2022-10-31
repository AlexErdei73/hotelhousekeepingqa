const anchor = document.querySelector("#analyse-anchor");
const href = anchor.href;
const checkboxYearToDate = document.querySelector("#yeartodate");

checkboxYearToDate.addEventListener("change", onChange);

function onChange(event) {
  const MONTHLY = "monthly";
  const YEAR_TO_DATE = "yeartodate";
  const checkbox = event.target;
  const hrefWords = href.split("/");
  if (checkbox.checked) hrefWords[5] = YEAR_TO_DATE;
  else hrefWords[5] = MONTHLY;
  anchor.href = hrefWords.join("/");
}
