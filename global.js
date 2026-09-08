/* =========================================================
   ORU DESIGN — GLOBAL SITE CHROME BEHAVIOUR
   Sticky header state, mobile nav toggle, active link marking.
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    var header = document.querySelector("[data-site-header]");
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.getElementById("site-mobile-nav");

    /* --- Sticky header background swap on scroll --- */
    if (header) {
        var updateHeaderState = function () {
            if (window.scrollY > 12) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        };
        updateHeaderState();
        window.addEventListener("scroll", updateHeaderState, { passive: true });
    }

    /* --- Mobile nav toggle --- */
    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            var isOpen = mobileNav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });

        mobileNav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                mobileNav.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* --- Mark the current page's nav link as active --- */
    var currentPage = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (currentPage === "") { currentPage = "index.html"; }

    document.querySelectorAll(".site-nav__link, .site-mobile-nav a").forEach(function (link) {
        var href = (link.getAttribute("href") || "").toLowerCase();
        if (href === currentPage) {
            link.classList.add("is-active");
        }
    });

});
