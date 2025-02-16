//index ejs
$(document).ready(function () {
    // Initialize Owl Carousel after dynamically adding items
    $(".owl-show-events").owlCarousel({
        loop: true,
        margin: 10,
        nav: true,
        autoplay: true,
        autoplayTimeout: 3000,
        responsive: {
            0: { items: 1 },
            600: { items: 3 },
            1000: { items: 4 }
        }
    });
});

