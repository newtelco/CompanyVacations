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
    $('#newvacaheader')[0].scrollIntoView({ behavior: 'smooth' })
})
