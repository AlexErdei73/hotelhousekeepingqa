const DEFAULT_DATE = new Date();
const DEFAULT_PAGE = 1;

const pageInputElement = document.querySelector('input[type="number"]');
const dateInputElement = document.querySelector('input[type="date"]');
const pageAnchor = document.querySelector("#page-anchor");
const homeAnchor = document.querySelector("#home-anchor");
const feedbacksAnchor = document.querySelector('#feedbacks-anchor');
const auditAnchor = document.querySelector("#audit-anchor");
const MAX_PAGE = Number(pageInputElement.max);
const MIN_PAGE = Number(pageInputElement.min);

function isDate(date) {
  return date instanceof Date && !isNaN(date.valueOf());
}

function validatePage(page) {
  if (!Number(page)) page = DEFAULT_PAGE;
  else page = Number(page);
  if (page !== Math.floor(page)) page = DEFAULT_PAGE;
  if (page > MAX_PAGE || page < MIN_PAGE) page = DEFAULT_PAGE;
  return page;
}

function setInputValues(page, date) {
  pageInputElement.value = validatePage(page);
  console.log(date.toISOString().slice(0, 10));
  if (isDate(date)) dateInputElement.value = date.toISOString().slice(0, 10);
  else dateInputElement.value = DEFAULT_DATE.toISOString().slice(0, 10);
}

function getDate() {
  let date = dateInputElement.value;
  if (!isDate(new Date(date))) date = DEFAULT_DATE.toISOString().slice(0, 10);
  date = new Date(date);
  return date.toISOString().slice(0, 10).split("/").join("-");
}

function getPageURL() {
  const page = validatePage(pageInputElement.value);
  return `/hotel/${page}/${getDate()}/0`;
}

function getHomeURL() {
  return `/hotel/${getDate()}`;
}

function getFeedbacksURL() {
  return `/hotel/feedbacks/${getDate()}`;
}

function getAuditAnchorURL() {
  return `/hotel/audit/daily/${getDate()}`;
}

function handleChange() {
  pageAnchor.href = getPageURL();
  homeAnchor.href = getHomeURL();
  feedbacksAnchor.href = getFeedbacksURL();
  auditAnchor.href = getAuditAnchorURL();
}

pageInputElement.addEventListener("change", handleChange);
dateInputElement.addEventListener("change", handleChange);
handleChange();
