const pageInput = document.querySelector('#page-number');
const dateInput = document.querySelector('#page-date');
const nextAnchor = document.querySelector('#next');
const backAnchor = document.querySelector('#back');
const cleanerSelect = document.querySelector('#cleaner-select');
const typeSelects = document.querySelectorAll('td select');
const auditInput = document.querySelector('#audit');
const passwordInput = document.querySelector('#password-input');
// form elements on the invisible form
const dateFormInput = document.querySelector('#date');
const roomnumberFormInput = document.querySelector('#roomnumber');
const cleanerFormSelect = document.querySelector('#cleaner');
const typeFormSelect = document.querySelector('#type');
const indexInput = document.querySelector('#index');
const auditScoreFormInput = document.querySelector('#audit-score');
const passwordFormInput = document.querySelector('#password');
const form = document.querySelector('form');

const page = Number(pageInput.value);
const date = new Date(dateInput.value);
let index = Number(indexInput.value);
let cleanerId = typeSelects[index].getAttribute("cleaner");
let auditScore = typeSelects[index].getAttribute("audit-score");

//focus the right typeSelect
typeSelects[index].focus();

//set cleanerSelect
cleanerSelect.value = cleanerId;

//set auditInput
auditInput.value = auditScore;

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
newOption.value = " ";
newOption.textContent = " ";
typeFormSelect.appendChild(newOption);

function onTypeChange(event) {
    const newType = event.target.value;
    const roomnumber = event.target.getAttribute("roomnumber");
    typeFormSelect.value = newType;
    roomnumberFormInput.value = roomnumber;
    auditScoreFormInput.value = auditScore;
    const index = event.target.getAttribute("index");
    indexInput.value = index;
    const password = passwordInput.value;
    passwordFormInput.value = password;
    form.submit();
}

function onTypeFocus(event) {
    const input = event.target;
    index = input.getAttribute("index");
    auditScore = input.getAttribute("audit-score");
    auditInput.value = auditScore;
    const cleanerId = input.getAttribute('cleaner');
    if (cleanerId !== "") cleanerSelect.value = cleanerId;
}

typeSelects.forEach(select => {
    select.addEventListener("change", onTypeChange);
    select.addEventListener("focus", onTypeFocus);
});

function onAuditInputChange() {
    const newAuditScore = auditInput.value;
    if (newAuditScore === auditScore) return;
    if (!cleanerId) return;
    const type = typeSelects[index].value;
    if (!type) return;
    const roomnumber = typeSelects[index].getAttribute("roomnumber");
    typeFormSelect.value = type;
    roomnumberFormInput.value = roomnumber;
    auditScoreFormInput.value = newAuditScore;
    indexInput.value = index;
    form.submit();
}

auditInput.addEventListener("change", onAuditInputChange);