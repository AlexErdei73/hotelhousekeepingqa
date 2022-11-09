//auditAnchor is declared in sidebar.js
const radioInputs = document.querySelectorAll('input[type="radio"]');

function onClick(event) {
    const hrefWords = auditAnchor.href.split('/');
    hrefWords[5] = event.target.value;
    auditAnchor.href = hrefWords.join('/');
    auditAnchor.click();
}

radioInputs.forEach(radioInput => radioInput.addEventListener("click", onClick));