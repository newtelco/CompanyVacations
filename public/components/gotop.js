// Show or hide the sticky footer button
simpleBar.getScrollElement().addEventListener('scroll', function(){
    if ($(this).scrollTop() > 200) {
        $('.go-top').fadeIn(600);
    } else {
        $('.go-top').fadeOut(600);
    }
});

// Animate the scroll to top
$('.go-top').click(function(event) {
    event.preventDefault();
    let bodyscrollTop = simpleBar.getScrollElement()
    // el = document.getElementById('headerId')
    // el.scrollIntoView()
    // bodyscrollTop.scrollTop = 0
    // let bodyScroll = bodyscrollTop.scrollTop
    // $('html, body').animate({bodyscrollTop: 0}, 300);
    console.log($('#headerId')[0])
    $('#newvacaheader')[0].scrollIntoView({ behavior: 'smooth' })
})
