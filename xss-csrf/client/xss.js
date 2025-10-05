const title = document.getElementsByTagName('h1')[0];
const toggleBtn = document.getElementsByClassName('toggle-btn')[0];
const toggleContainer = document.getElementsByClassName('toggle-container')[0];
const commentForm = document.getElementById('commentForm')
const commentInput = document.getElementById('commentInput')
const commentContainer = document.getElementsByClassName('show-comments')[0];
const commentBtn = document.getElementById('commentBtn');
const commentList = document.getElementById('comment-list')
const commentListContainer = document.getElementById('comment-list-container')
const modeText = document.getElementById('mode-text')
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
    localStorage.setItem('isSafeMode', 'false')
}

isSafeMode = localStorage.getItem('isSafeMode')
console.log("mode:", isSafeMode)

if (isSafeMode == 'true') {
    toggleContainer.classList.toggle('toggle-mode');
    document.body.classList.toggle('safe')
    modeText.innerText = 'SAFE MODE ON'
} else {
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
    localStorage.setItem('isSafeMode', containSafe ? 'true' : 'false');
    modeText.innerText = containSafe ? 'SAFE MODE ON' : 'ATTACK MODE ON'
    location.reload()
})

commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const comment = commentInput.value;
    localStorage.setItem('comment', comment);
    commentInput.value = "";

    // determine mode from current localStorage flag
    const mode = (localStorage.getItem('isSafeMode') === 'true') ? 'safe' : 'unsafe';

    // Prepare payloads
    const payload = { content: comment, mode };

    // 1) try JSON POST
    try {
        await fetch('http://localhost/xss_server/index.php/stored', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'   // server can parse JSON if express.json() is enabled
            },
            body: JSON.stringify(payload),
        });
        // we don't await response body — best-effort fire-and-forget
    } catch (err) {
        console.warn('JSON POST to /stored failed (will try fallback):', err);

    }
});


const escapeSpecial = (data) => {
    return data.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}
commentBtn.addEventListener('click', async () => {
    commentListContainer.classList.toggle('display');

    if (commentListContainer.classList.contains('display')) {
        commentList.innerHTML = ""; // clear old list

        try {
            // Fetch all comments from backend
            const res = await fetch('http://localhost/xss_server/index.php/storedFetch');
            const data = await res.json();

            const mode = (localStorage.getItem('isSafeMode') === 'true') ? 'safe' : 'unsafe';


            // Render each comment safely or unsafely based on current mode
            data.forEach(entry => {
                const li = document.createElement('li');

                if (mode ==='safe') {
                    li.textContent = entry.content;
                } else {
                    li.innerHTML = entry.content;
                }
                // sanitized

                commentList.appendChild(li);
            });
        } catch (err) {
            console.error('Error fetching comments:', err);
            commentList.innerHTML = "<li>Failed to load comments.</li>";
        }
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
            const response = await fetch(`http://localhost/xss_server/index.php/?userInput=${reflectedData}`);
            const text = await response.text();
            responseField.innerHTML = isSafeMode == 'true' ? escapeSpecial(text) : text;
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
