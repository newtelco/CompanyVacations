// Source: http://webdesign.tutsplus.com/tutorials/htmlcss-tutorials/quick-tip-implement-a-sticky-back-to-top-button/

/* Stiky GOTO Top 
     ======================================================================= */

    // Show or hide the sticky footer button
    simpleBar.getScrollElement().addEventListener('scroll', function(){
        if ($(this).scrollTop() > 200) {
            $('.go-top').fadeIn(600);
        } else {
            $('.go-top').fadeOut(600);
        }
    });

    // $(window).scroll(function() {
    //     if ($(this).scrollTop() > 200) {
    //         $('.go-top').fadeIn(600);
    //     } else {
    //         $('.go-top').fadeOut(600);
    //     }
    // });

    // Animate the scroll to top
    $('.go-top').click(function(event) {
        event.preventDefault();
        let bodyscrollTop = simpleBar.getScrollElement()
        // el = document.getElementById('headerId')
        // el.scrollIntoView()
        bodyscrollTop.scrollTop = 0
        // let bodyScroll = bodyscrollTop.scrollTop
        // $('html, body').animate({bodyscrollTop: 0}, 300);
    })
