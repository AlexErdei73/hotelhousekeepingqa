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
const indexInput = document.querySelector('#index');
const form = document.querySelector('form');

const page = Number(pageInput.value);
const date = new Date(dateInput.value);
const index = Number(indexInput.value);

//focus the right typeSelect
typeSelects[index].focus();

// make >> and << anchors work
function nextURL() {
    const MAX_PAGE = Number(pageInput.max);
    let newPage = page + 1;
    if (newPage > MAX_PAGE) newPage = MAX_PAGE;
    return `/hotel/${newPage}/${date.toISOString().slice(0, 10).split('/').join('-')}/0`;
}

function backURL() {
    const MIN_PAGE = Number(pageInput.min);
    let newPage = page - 1;
    if (newPage < MIN_PAGE) newPage = MIN_PAGE;
    return `/hotel/${newPage}/${date.toISOString().slice(0, 10).split('/').join('-')}/0`;  
}

nextAnchor.href = nextURL();
backAnchor.href = backURL();

// handle cleaner change
function onCleanerChange(event) {
    const cleanerId = event.target.value;
    cleanerFormSelect.value = cleanerId;
}

cleanerSelect.addEventListener("change", onCleanerChange);
onCleanerChange({
    target: cleanerSelect
});

// set date on the invisible form
dateFormInput.value = date.toISOString().slice(0, 10);

// add empty job type option to the invisible form for deleting services
const newOption = document.createElement('option');
newOption.value = "";
newOption.textContent = "";
typeFormSelect.appendChild(newOption);

function onTypeChange(event) {
    const newType = event.target.value;
    const roomnumber = event.target.getAttribute("roomnumber");
    typeFormSelect.value = newType;
    roomnumberFormInput.value = roomnumber;
    const index = event.target.getAttribute("index");
    indexInput.value = index;
    form.submit();
}

typeSelects.forEach(select => select.addEventListener("change", onTypeChange));