const DEFAULT_DATE = new Date();
const DEFAULT_PAGE = 1;

const pageInput = document.querySelector('input[type="number"]');
const dateInput = document.querySelector('input[type="date"]');
const pageAnchor = document.querySelector('#page-anchor');
const MAX_PAGE = Number(pageInput.max);
const MIN_PAGE = Number(pageInput.min);

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
    pageInput.value = validatePage(page);
    console.log(date.toISOString().slice(0,10));
    if (isDate(date)) dateInput.value = date.toISOString().slice(0,10);
        else dateInput.value = DEFAULT_DATE.toISOString().slice(0,10);
}

function getPageURL() {
    const page = validatePage(pageInput.value);
    let date = dateInput.value;
    if (!isDate(new Date(date))) date = DEFAULT_DATE.toISOString().slice(0,10);
    date = new Date(date)
    date = date.toISOString().slice(0, 10).split('/').join('-');
    return `/hotel/${page}/${date}`;
}

function handleChange() {
    pageAnchor.href = getPageURL();
}

pageInput.addEventListener("change", handleChange);
dateInput.addEventListener("change", handleChange);
pageAnchor.href = getPageURL();