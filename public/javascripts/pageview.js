const pageInput = document.querySelector('#page-number');
const dateInput = document.querySelector('#page-date');
const nextAnchor = document.querySelector('#next');
const backAnchor = document.querySelector('#back');
const cleanerSelect = document.querySelector('#cleaner-select');
const typeSelects = document.querySelectorAll('td select');
// form elements on the invisible form
const dateFormInput = document.querySelector('#date');
const roomnumberFormInput = document.querySelector('#roomnumber');
const cleanerFormSelect = document.querySelector('#cleaner');
const typeFormSelect = document.querySelector('#type');
const form = document.querySelector('form');

const page = Number(pageInput.value);
const date = new Date(dateInput.value);

function nextURL() {
    const MAX_PAGE = Number(pageInput.max);
    let newPage = page + 1;
    if (newPage > MAX_PAGE) newPage = MAX_PAGE;
    return `/hotel/${newPage}/${date.toISOString().slice(0, 10).split('/').join('-')}`;
}

function backURL() {
    const MIN_PAGE = Number(pageInput.min);
    let newPage = page - 1;
    if (newPage < MIN_PAGE) newPage = MIN_PAGE;
    return `/hotel/${newPage}/${date.toISOString().slice(0, 10).split('/').join('-')}`;  
}

nextAnchor.href = nextURL();
backAnchor.href = backURL();

function onCleanerChange(event) {
    const cleanerId = event.target.value;
    cleanerFormSelect.value = cleanerId;
}

cleanerSelect.addEventListener("change", onCleanerChange);
onCleanerChange({
    target: cleanerSelect
});

dateFormInput.value = date.toISOString().slice(0, 10);

const newOption = document.createElement('option');
newOption.value = "";
newOption.textContent = "";
typeFormSelect.appendChild(newOption);


function onTypeChange(event) {
    const newType = event.target.value;
    const roomnumber = event.target.getAttribute("roomnumber");
    typeFormSelect.value = newType;
    roomnumberFormInput.value = roomnumber;
    form.submit();
}

typeSelects.forEach(select => select.addEventListener("change", onTypeChange));