const pageInput = document.querySelector('#page-number');
const dateInput = document.querySelector('#page-date');
const nextAnchor = document.querySelector('#next');
const backAnchor = document.querySelector('#back');

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