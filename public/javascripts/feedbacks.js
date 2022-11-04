const anchor = document.querySelector("#analyse-anchor");
const checkboxYearToDate = document.querySelector("#yeartodate");
const checkboxStayover = document.querySelector("#stayover");

checkboxYearToDate.addEventListener("change", onChange);
checkboxStayover.addEventListener("change", onChange);

function onChange(event) {
  const MONTHLY = "monthly";
  const YEAR_TO_DATE = "yeartodate";
  const STAYOVER = "stayover";
  const DEPART = "depart";
  const checkbox = event.target;
  const href = anchor.href;
  const hrefWords = href.split("/");
  if (checkbox.getAttribute("id") === "yeartodate") {
    if (checkbox.checked) hrefWords[6] = YEAR_TO_DATE;
    else hrefWords[6] = MONTHLY;
  } else {
    if (checkbox.checked) hrefWords[5] = STAYOVER;
    else hrefWords[5] = DEPART;
  }
  anchor.href = hrefWords.join("/");
}
