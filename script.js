const currentPage = window.location.pathname;

const aboutLink = document.getElementById("about-link");
const franchiseLink = document.getElementById("franchise-link");
const storeLink = document.getElementById("store-link");

const hamburgerBtn = document.getElementById("hamburger-btn");
const navMenu = document.getElementById("nav-menu");

if (franchiseLink && currentPage === "/franchise.html") {
  franchiseLink.classList.add("active");
}
if (aboutLink && currentPage === "/about.html") {
  aboutLink.classList.add("active");
}

if (storeLink && currentPage === "/stores.html") {
  storeLink.classList.add("active");
}

if (hamburgerBtn) {
  hamburgerBtn.addEventListener("click", function () {
    if (navMenu) navMenu.classList.toggle("show");
  });
}
