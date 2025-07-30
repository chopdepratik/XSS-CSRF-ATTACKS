const title = document.getElementsByTagName('h1')[0];
const splited = title.innerText.split('');

const newTitle = splited.map((char, index) => {
    return `<span ">${char===' '? '&nbsp;':char}</span>`;
}).join('');

title.innerHTML = newTitle;
title.classList.add('animated-title');

 gsap.fromTo(
      ".animated-title span",
      { opacity: 0, x: 20 },
      {
        opacity: 1,
        repeat:-1,
        yoyo: true,
        x: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out"
      }
    );
  
