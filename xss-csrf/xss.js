const title = document.getElementsByTagName('h1')[0];
const toggleBtn = document.getElementsByClassName('toggle-btn')[0];
const toggleContainer = document.getElementsByClassName('toggle-container')[0];
const commentForm = document.getElementById('commentForm')
const commentInput = document.getElementById('commentInput')
const commentContainer = document.getElementsByClassName('show-comments')[0];
const commentBtn = document.getElementById('commentBtn');
const commentList = document.getElementById('comment-list')
const commentListContainer = document.getElementById('comment-list-container')
const modeText  = document.getElementById('mode-text')
//relfected
const reflectedForm = document.getElementById('reflected-form-reflected')
const responseField = document.getElementsByClassName('search-content-reflected')[0]
//DOM-bssed
const DOMForm = document.getElementById('reflected-form');
const searchedContent = document.getElementsByClassName('search-content')[0]
const DOMSearch = document.getElementById('reflected-search')

const splited = title.innerText.split('');

let isSafeMode;
 
if (!sessionStorage.getItem('hasRun')) {
    // 👇 Code runs once per tab/window
    console.log('First time running in this session/tab');

    sessionStorage.setItem('hasRun', 'true');
    localStorage.setItem('isSafeMode','false')
}

isSafeMode = localStorage.getItem('isSafeMode')
console.log("mode:", isSafeMode)

if(isSafeMode=='true'){
    toggleContainer.classList.toggle('toggle-mode');
    document.body.classList.toggle('safe')
    modeText.innerText = 'SAFE MODE ON'
}else{
    modeText.innerText = 'ATTACK MODE ON'
}
   
const newTitle = splited.map((char, index) => {
    return `<span ">${char === ' ' ? '&nbsp;' : char}</span>`;
}).join('');

title.innerHTML = newTitle;
title.classList.add('animated-title');

gsap.fromTo(
    ".animated-title span",
    { opacity: 0, x: 20 },
    {
        opacity: 1,
        repeat: -1,
        yoyo: true,
        x: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out"
    }
);

toggleBtn.addEventListener('click', (e) => {
    toggleContainer.classList.toggle('toggle-mode');
    document.body.classList.toggle('safe')
    const containSafe = toggleContainer.classList.contains('toggle-mode')
    localStorage.setItem('isSafeMode',containSafe?'true':'false');
    modeText.innerText = containSafe?'SAFE MODE ON':'ATTACK MODE ON'
    location.reload()
})

commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const comment = commentInput.value;
    localStorage.setItem('comment', comment)
    commentInput.value = ""
})

const escapeSpecial = (data) => {
    return data.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}
commentBtn.addEventListener('click', () => {
    commentListContainer.classList.toggle('display')
    if (commentListContainer.classList.contains('display')) {
        const comment = localStorage.getItem('comment');
        commentList.innerHTML += `<li>${isSafeMode=='true' ? escapeSpecial(comment) : comment}</li>`
    }

});
{/* <input autofocus onfocus="alert('XSS')"><video onerror="alert('XSS')"></video><object data="javascript:alert('XSS')"></object><img srcset="x" onerror="alert('XSS')"><iframe src="javascript:alert('XSS')"></iframe> */ }



//relected


const reflectedParams = new URLSearchParams(window.location.search);
const reflectedData = reflectedParams.get('userInputForReflected');

if (reflectedData) {
    const responseField = document.getElementsByClassName('search-content-reflected')[0];


    (async () => {
        try {
            const response = await fetch(`https://xss-csrf-attacks.onrender.com/?userInput=${reflectedData}`);
            const text = await response.text();
            responseField.innerHTML = isSafeMode=='true' ? escapeSpecial(text) : text;
        } catch (error) {
            console.error("Fetch error:", error);
            responseField.innerHTML = "<p>Failed to fetch response.</p>";
        }
    })();
}


//for DOM XSS
const params = new URLSearchParams(window.location.search)
const data = params.get('userInput')
if (data) {
    const p = document.createElement('p');
    if (isSafeMode === 'true') {
        p.textContent = data;  // safest method – no HTML gets parsed
    } else {
        p.innerHTML = data;  // vulnerable mode: allows injection
    }
    searchedContent.appendChild(p);
}








