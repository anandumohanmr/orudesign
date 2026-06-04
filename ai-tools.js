/* =========================================
   HERO PARALLAX EFFECT
========================================= */

const hero = document.querySelector('.ai-hero');

hero.addEventListener('mousemove', (e) => {

    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    document.querySelector('.glow-1').style.transform =
    `translate(${x * 40}px, ${y * 40}px)`;

    document.querySelector('.glow-2').style.transform =
    `translate(-${x * 40}px, -${y * 40}px)`;

});

/* =========================================
   BUTTON HOVER SOUND EFFECT FEEL
========================================= */

const buttons = document.querySelectorAll(
'.primary-btn, .secondary-btn, .ai-header-btn'
);

buttons.forEach(btn => {

    btn.addEventListener('mouseenter', () => {

        btn.style.letterSpacing = '5px';

    });

    btn.addEventListener('mouseleave', () => {

        btn.style.letterSpacing = '3px';

    });

});

/* =========================================
   SCROLL HEADER EFFECT
========================================= */

window.addEventListener('scroll', () => {

    const header = document.querySelector('.ai-header');

    if(window.scrollY > 50){

        header.style.background = 'rgba(0,0,0,0.92)';

    }

    else{

        header.style.background = 'rgba(0,0,0,0.72)';

    }

});


/* =========================================
   TOOLS CARD ANIMATION
========================================= */

const toolCards =
document.querySelectorAll('.tool-card');

toolCards.forEach((card) => {

    card.addEventListener('mousemove', (e) => {

        const rect =
        card.getBoundingClientRect();

        const x =
        e.clientX - rect.left;

        const y =
        e.clientY - rect.top;

        card.style.background = `
        radial-gradient(
        circle at ${x}px ${y}px,
        rgba(223,255,0,0.12),
        rgba(255,255,255,0.03)
        )
        `;

    });

    card.addEventListener('mouseleave', () => {

        card.style.background = `
        linear-gradient(
        145deg,
        rgba(255,255,255,0.05),
        rgba(255,255,255,0.02)
        )
        `;

    });

});

/* =========================================
   FEATURED CARD MOUSE EFFECT
========================================= */

const featuredCard =
document.querySelector('.featured-main-card');

featuredCard.addEventListener('mousemove', (e) => {

    const rect =
    featuredCard.getBoundingClientRect();

    const x =
    e.clientX - rect.left;

    const y =
    e.clientY - rect.top;

    featuredCard.style.background = `
    radial-gradient(
    circle at ${x}px ${y}px,
    rgba(223,255,0,0.18),
    rgba(255,255,255,0.03)
    )
    `;

});

featuredCard.addEventListener('mouseleave', () => {

    featuredCard.style.background = `
    linear-gradient(
    145deg,
    rgba(255,255,255,0.06),
    rgba(255,255,255,0.02)
    )
    `;

});



/* =========================================
   COUNTER ANIMATION
========================================= */

const counters =
document.querySelectorAll('.counter');

const speed = 120;

counters.forEach(counter => {

    const updateCount = () => {

        const target =
        +counter.getAttribute('data-target');

        const count =
        +counter.innerText;

        const increment =
        target / speed;

        if(count < target){

            counter.innerText =
            Math.ceil(count + increment);

            setTimeout(updateCount, 20);

        }

        else{

            counter.innerText = target;

        }

    };

    updateCount();

});


/* =========================================
   PROCESS SCROLL ANIMATION
========================================= */

const processItems =
document.querySelectorAll('.process-item');

window.addEventListener('scroll', () => {

    processItems.forEach(item => {

        const itemTop =
        item.getBoundingClientRect().top;

        if(itemTop < window.innerHeight - 100){

            item.style.opacity = "1";

            item.style.transform =
            "translateY(0px)";

        }

    });

});

/* INITIAL STATE */

processItems.forEach(item => {

    item.style.opacity = "0";

    item.style.transform =
    "translateY(80px)";

    item.style.transition =
    "all 0.8s ease";

});


/* =========================================
   TESTIMONIAL PARALLAX
========================================= */

const testimonialCards =
document.querySelectorAll('.testimonial-card');

testimonialCards.forEach(card => {

    card.addEventListener('mousemove', (e) => {

        const rect =
        card.getBoundingClientRect();

        const x =
        e.clientX - rect.left;

        const y =
        e.clientY - rect.top;

        card.style.background = `
        radial-gradient(
        circle at ${x}px ${y}px,
        rgba(223,255,0,0.16),
        rgba(255,255,255,0.03)
        )
        `;

    });

    card.addEventListener('mouseleave', () => {

        card.style.background = `
        linear-gradient(
        145deg,
        rgba(255,255,255,0.05),
        rgba(255,255,255,0.02)
        )
        `;

    });

});


/* =========================================
   FINAL SECTION PARALLAX
========================================= */

const finalSection =
document.querySelector('.ai-final-section');

finalSection.addEventListener('mousemove', (e) => {

    const x =
    e.clientX / window.innerWidth;

    const y =
    e.clientY / window.innerHeight;

    document.querySelector('.glow-left').style.transform =
    `translate(${x * 40}px, ${y * 40}px)`;

    document.querySelector('.glow-right').style.transform =
    `translate(-${x * 40}px, -${y * 40}px)`;

});

/* =========================================
   FLOATING CARD HOVER
========================================= */

const statCards =
document.querySelectorAll('.mini-stat');

statCards.forEach(card => {

    card.addEventListener('mousemove', (e) => {

        const rect =
        card.getBoundingClientRect();

        const x =
        e.clientX - rect.left;

        const y =
        e.clientY - rect.top;

        card.style.background = `
        radial-gradient(
        circle at ${x}px ${y}px,
        rgba(223,255,0,0.14),
        rgba(255,255,255,0.03)
        )
        `;

    });

    card.addEventListener('mouseleave', () => {

        card.style.background = `
        linear-gradient(
        145deg,
        rgba(255,255,255,0.05),
        rgba(255,255,255,0.02)
        )
        `;

    });

});