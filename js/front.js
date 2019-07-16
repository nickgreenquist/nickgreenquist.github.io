if ($.cookie("theme_csspath")) {
    $('link#theme-stylesheet').attr("href", $.cookie("theme_csspath"));
}

$(window).load(function () {
  
  //before animation
  
  onReady(function () {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('all').style.display = 'block';
    document.getElementById('navbar').style.display = 'block';
    
    windowWidth = $(window).width();
    $(this).alignElementsSameHeight();

    
    //after animation
    masonry();
    animations();
    sliders();
    fullScreenContainer();
    utils();
    sliding();
    //contactForm();
    map();
    counters();
    parallax();
    demo();
  });

});
$(window).resize(function () {

    newWindowWidth = $(window).width();

    if (windowWidth !== newWindowWidth) {
	setTimeout(function () {
	    $(this).alignElementsSameHeight();
	    fullScreenContainer();
	    waypointsRefresh();
	}, 205);
	windowWidth = newWindowWidth;
    }

});


function onReady(callback) {
    var intervalID = window.setInterval(checkReady, 500); //Pac Man
  
    function checkReady() {
        if (document.getElementsByTagName('body')[0] !== undefined) {
            window.clearInterval(intervalID);
            callback.call(this);
        }
    }
}



/* =========================================
 *  for demo purpose only - can be deleted 
 *  =======================================*/

function demo() {

    if ($.cookie("theme_csspath")) {
	$('link#theme-stylesheet').attr("href", $.cookie("theme_csspath"));
    }

    $("#colour").change(function () {

	if ($(this).val !== '') {

	    var colour = $(this).val();
	    var introImage = $('body').find('#intro .item');

	    introImage.removeClass();
	    introImage.addClass('item');
	    introImage.addClass(colour);


	    var theme_csspath = 'css/style.' + $(this).val() + '.css';
	    $('link#theme-stylesheet').attr("href", theme_csspath);
	    $.cookie("theme_csspath", theme_csspath, {expires: 365, path: '/'});
	}

	return false;
    });
}

/* =========================================
 *  animations
 *  =======================================*/

function animations() {

    if (Modernizr.csstransitions) {

	delayTime = 0;
	$('[data-animate]').css({opacity: '0'});
	$('[data-animate]').waypoint(function (direction) {
	    delayTime += 150;
	    $(this).delay(delayTime).queue(function (next) {
		$(this).toggleClass('animated');
		$(this).toggleClass($(this).data('animate'));
		delayTime = 0;
		next();
		//$(this).removeClass('animated');
		//$(this).toggleClass($(this).data('animate'));
	    });
	},
		{
		    offset: '95%',
		    triggerOnce: true
		});
	$('[data-animate-hover]').hover(function () {
	    $(this).css({opacity: 1});
	    $(this).addClass('animated');
	    $(this).removeClass($(this).data('animate'));
	    $(this).addClass($(this).data('animate-hover'));
	}, function () {
	    $(this).removeClass('animated');
	    $(this).removeClass($(this).data('animate-hover'));
	});
    }

}

/* =========================================
 * sliding 
 *  =======================================*/

function sliding() {
    $('.scrollTo, #navigation a').click(function (event) {
     var full_url = this.href;
     var fileName = full_url.replace(/^.*[\\\/]/, '')

     if(fileName.includes("#")) {
		var parts = full_url.split("#");
		var trgt = parts[1];
		event.preventDefault();
		
		$("html, body").animate({
		 scrollTop: $('#' + trgt).offset().top
		 });
 
		//$('body').scrollTo($('#' + trgt), 800, {offset: -80});
	  }
	  
      
      else {
       //open like normal
      }

	});
}

/* =========================================
 * sliders 
 *  =======================================*/

function sliders() {
    if ($('.owl-carousel').length) {

	$(".customers").owlCarousel({
	    items: 6,
	    itemsDesktopSmall: [990, 4],
	    itemsTablet: [768, 2],
	    itemsMobile: [480, 1]
	});
	$(".testimonials").owlCarousel({
	    items: 4,
	    itemsDesktopSmall: [1170, 3],
	    itemsTablet: [970, 2],
	    itemsMobile: [750, 1]
	});
    }

}

/* =========================================
 * counters 
 *  =======================================*/

function counters() {

    $('.counter').counterUp({
	delay: 10,
	time: 1000
    });

}

/* =========================================
 * parallax 
 *  =======================================*/

function parallax() {

    $('.text-parallax').parallax("50%", 0.1);
    
}

/* =========================================
 *  masonry 
 *  =======================================*/

function masonry() {

    $('#references-masonry').css({visibility: 'visible'});

    $('#references-masonry').masonry({
	itemSelector: '.reference-item:not(.hidden)',
	isFitWidth: true,
	isResizable: true,
	isAnimated: true,
	animationOptions: {
	    duration: 200,
	    easing: 'linear',
	    queue: true
	},
	gutter: 30
    });
    scrollSpyRefresh();
    waypointsRefresh();
}


/* =========================================
 * filter 
 *  =======================================*/

$('#filter a').click(function (e) {
    e.preventDefault();



    $('#filter li').removeClass('active');
    $(this).parent('li').addClass('active');

    var categoryToFilter = $(this).attr('data-filter');

    $('.reference-item').each(function () {
	if ($(this).data('category') === categoryToFilter || categoryToFilter === 'all') {
	    $(this).removeClass('hidden');
	}
	else {
	    $(this).addClass('hidden');
	}
    });

    if ($('#detail').hasClass('open')) {
	closeReference();
    }
    else {
	$('#references-masonry').masonry('reloadItems').masonry('layout');

    }

    scrollSpyRefresh();
    waypointsRefresh();
});


/* =========================================
 *  open reference 
 *  =======================================*/

$('.reference-item').click(function (e) {
	var element = $(this);
	var link = element.find('a:first').attr('href');

	if(link.length <= 1) {
		e.preventDefault();
	}

    var title = element.find('.reference-title').text();
    var description = element.find('.reference-description').html();

    images = element.find('.reference-description').data('images').split(',');

    if (images.length > 0) {
	slider = '';
	for (var i = 0; i < images.length; ++i) {
	    slider = slider + '<div class="item"><img src=' + images[i] + ' alt="" class="img-responsive"></div>';
	}
    }
    else {
	slider = '';
    }



    $('#detail-title').text(title);
    $('#detail-content').html(description);
    $('#detail-slider').html(slider);

    openReference();

});


function openReference() {

    $('#detail').addClass('open');
    $('#references-masonry').animate({opacity: 0}, 300);
    $('#detail').animate({opacity: 1}, 300);

    setTimeout(function () {
	$('#detail').slideDown();
	$('#references-masonry').slideUp();

	if ($('#detail-slider').html() !== '') {

	    $('#detail-slider').owlCarousel({
		slideSpeed: 300,
		paginationSpeed: 400,
		autoPlay: true,
		stopOnHover: true,
		singleItem: true,
		afterInit: ''
	    });
	}
    }, 300);

    setTimeout(function () {
	$('body').scrollTo($('#detail'), 1000, {offset: -80});
    }, 500);

}

function closeReference() {

    $('#detail').removeClass('open');
    $('#detail').animate({'opacity': 0}, 300);

    setTimeout(function () {
	$('#detail').slideUp();
	$('#detail-slider').data('owlCarousel').destroy();
	$('#references-masonry').slideDown().animate({'opacity': 1}, 300).masonry('reloadItems').masonry();

    }, 300);

    setTimeout(function () {
	$('body').scrollTo($('#filter'), 1000, {offset: -110});
    }, 500);


    setTimeout(function () {
	$('#references-masonry').masonry('reloadItems').masonry();
    }, 800);

}


$('#detail .close').click(function () {
    closeReference(true);
})


/* =========================================
 * full screen intro 
 *  =======================================*/

function fullScreenContainer() {

    var screenWidth = $(window).width() + "px";
    var screenHeight = '';
    if ($(window).height() > 500) {
	screenHeight = $(window).height() + "px";
    }
    else {
	screenHeight = "500px";
    }


    $("#intro, #intro .item").css({
	width: screenWidth,
	height: screenHeight
    });
}

/* =========================================
 *  map 
 *  =======================================*/

function map() {

    var styles = [{"featureType": "landscape", "stylers": [{"saturation": -100}, {"lightness": 65}, {"visibility": "on"}]}, {"featureType": "poi", "stylers": [{"saturation": -100}, {"lightness": 51}, {"visibility": "simplified"}]}, {"featureType": "road.highway", "stylers": [{"saturation": -100}, {"visibility": "simplified"}]}, {"featureType": "road.arterial", "stylers": [{"saturation": -100}, {"lightness": 30}, {"visibility": "on"}]}, {"featureType": "road.local", "stylers": [{"saturation": -100}, {"lightness": 40}, {"visibility": "on"}]}, {"featureType": "transit", "stylers": [{"saturation": -100}, {"visibility": "simplified"}]}, {"featureType": "administrative.province", "stylers": [{"visibility": "off"}]}, {"featureType": "water", "elementType": "labels", "stylers": [{"visibility": "on"}, {"lightness": -25}, {"saturation": -100}]}, {"featureType": "water", "elementType": "geometry", "stylers": [{"hue": "#ffff00"}, {"lightness": -25}, {"saturation": -97}]}];
    map = new GMaps({
	el: '#map',
	lat: 25,
	lng: -96,
	zoomControl: true,
	zoomControlOpt: {
	    style: 'SMALL',
	    position: 'RIGHT_TOP'
	},
	panControl: false,
    zoom: 2.5,
	streetViewControl: false,
	mapTypeControl: false,
	overviewMapControl: false,
	scrollwheel: false,
	draggable: true,
	styles: styles
    });

    var image = '../img/marker.png';
    var star = '../img/star.png';
    var baby = '../img/baby.png';

    map.addMarker({ //Spring Lake
	lat: 40.166692,
	lng: -74.021636,
	icon: star
    }, '../img/map/springlake.png', 'Lifeguard Photo Contest - Winning Photo, Spring Lake 2014');
    map.addMarker({ //GDYNIA
	lat: 54.518195,
	lng: 18.530690,
	icon: image
    }, '../img/map/gdynia.png', 'Me with Mom at my 22nd birthday dinner, Gdynia 2016');
    map.addMarker({ //Vegas
	lat: 36.169912,
	lng: -115.131055,
	icon: image
    }, '../img/map/vegas.png', 'Hoover Dam with Dad, Las Vegas 2015');
	map.addMarker({ //Grand Canyon
	lat: 36.1070,
	lng: -112.1130,
	icon: image
    }, '../img/map/grandcanyon.png', 'Hanging on for dear life, Grand Canyon 2015');
    map.addMarker({ //Tornoto
	lat: 43.653691,
	lng: -79.364325,
	icon: image
    }, '../img/map/toronto.png', 'Top of the CN Tower, Toronto 2017');
	map.addMarker({ //Chicago
	lat: 41.8781,
	lng: -87.6298,
	icon: image
    }, '../img/map/chicago.png', 'D3 Wrestling Exchange Trip first practice, Chicago 2015');
	map.addMarker({ //Pittsburgh
	lat: 40.4406,
	lng: -79.9959,
	icon: image
    }, '../img/map/pittsburgh.png', 'Watching the US Womens Soccer Team with my good friend Kasey, Pittsburgh 2015');
    map.addMarker({ //San Fran
	lat: 37.775612,
	lng: -122.415284,
	icon: image
    }, '../img/map/sanfran.png', 'Golden Gate Bridge, San Francisco 2014');
	map.addMarker({ //Stewarts Point
	lat: 38.6524,
	lng: -123.3989,
	icon: image
    }, '../img/map/stewartspoint.png', 'Hiking with Uncle Charlie, Melinda, and Dahlia, Stewarts Point 2014');
    map.addMarker({ //LA
	lat: 34.050908,
	lng: -118.256591,
	icon: image
    }, '../img/map/la.png', 'Hiking the Hollywood sign with my friend Jake, LA 2016');
    map.addMarker({ //Istanbul
	lat: 41.011200,
	lng: 28.979184,
	icon: image
    }, '../img/map/istanbul.png', 'Hagia Sophia with Tate from the D3 Wrestling Exchange Trip, Istanbul 2015');
    map.addMarker({ //Paris
	lat: 48.857031,
	lng: 2.350301,
	icon: image
    }, '../img/map/paris.png', 'D3 Wrestling Exchange Trip\'s version of the Eiffel Tower, Paris 2015');
    map.addMarker({ //Stockholm
	lat: 59.327818,
	lng: 18.062383,
	icon: image
    }, '../img/map/stockholm.png', 'First time visiting Sweden since I was born, Stockholm 2016');
    map.addMarker({ //Chichen Itza
	lat: 20.684425,
	lng: -88.567085,
	icon: image
    }, '../img/map/chichenitza.png', 'Looking confused in the bottom right corner, Chichen Itza ????');
    map.addMarker({ //Biucharest
	lat: 44.427934,
	lng: 26.096002,
	icon: image
    }, '../img/map/bucharest.png', 'Streets of Bucharest with Jake from the D3 Wrestling Exchange Trip, Bucharest 2015');
    // map.addMarker({ //Key West
	// lat: 24.555082,
	// lng: -81.780176,
	// icon: image
    // });
    map.addMarker({ //Marietta
	lat: 33.9526,
	lng: -84.5499,
	icon: image
    }, '../img/map/marrieta.png', 'Graduating Primrose Preschool, Marietta 1998');
    map.addMarker({ //DC
	lat: 38.906746,
	lng: -77.039295,
	icon: image
    }, '../img/map/dc.png', 'Touring the captial with my sister Iris, Washington DC 2015');
    map.addMarker({ //Park City
	lat: 40.646838,
	lng: -111.500307,
	icon: image
    }, '../img/map/pc.png', 'Neff Land with the boys during Spring Break, Park City 2015');
    map.addMarker({ //Kennebunkport
	lat: 43.361770,
	lng: -70.481091,
	icon: image
    }, '../img/map/kennebunk.png', 'Rugosa Lobster Tour, Kennebunkport 2017');
	// map.addMarker({ //Freeport
	// lat: 43.8579,
	// lng: -70.1034,
	// icon: image
    // }, '../img/map/freeport.png');
	// map.addMarker({ //BoothBay
	// lat: 43.8763,
	// lng: -69.6337,
	// icon: image
    // }, '../img/map/boothbay.png');
    map.addMarker({ //Dominican Republic
	lat: 18.858900,
	lng: -70.045139,
	icon: image
    }, '../img/map/dominicanrepublic.png', 'Exploring the countryside, Dominican Republic ????');
    map.addMarker({ //Miami
	lat: 25.761593,
	lng: -80.192554,
	icon: image
    }, '../img/map/miami.png', 'Jungle Island, Miami 2016');
    map.addMarker({ //Orlando
	lat: 28.3852,
	lng: -81.5639,
	icon: image
    }, '../img/map/orlando.png', '4th of July in Disney World with Kayla, Orlando 2016');
	map.addMarker({ //Tampa
	lat: 27.9506,
	lng: -82.4572,
	icon: image
    }, '../img/map/tampa.png', 'Kayaking with my sister Dahlia, Kayla, and Codie, Tampa 2016');
	map.addMarker({ //Naples
	lat: 26.2741,
	lng: -81.8218,
	icon: image
    }, '../img/map/naples.png', 'Visiting Grandpa Tom, Naples 2016');
	map.addMarker({ //Killington
	lat: 43.6045,
	lng: -72.8201,
	icon: image
    }, '../img/map/killington.png', 'Ski trip to Lauren\'s house in Vermont, Killington 2016');
	map.addMarker({ //Hamilton
	lat: 43.0521,
	lng: -75.4061,
	icon: image
    }, '../img/map/hamilton.png', 'Iris\' Graduation, Hamilton College 2012');
	map.addMarker({ //ROC
	lat: 43.0861,
	lng: -77.6705,
	icon: image
    }, '../img/map/roc.png', 'Graduating from Rochester Institute of Technology, Rochester 2017');
    map.addMarker({ //Bahamas
	lat: 24.0685,
	lng: -74.5353,
	icon: image
    }, '../img/map/bahamas.png', 'Acting in a play at Club Med, Bahamas ????');
    map.addMarker({ //Krakv
	lat: 50.066519,
	lng: 19.943754,
	icon: image
    }, '../img/map/krakow.png', 'Visiting Wawel Castle with my Mom and my sister Iris, Krakow 2013');
    map.addMarker({ //Warsaw
	lat: 52.227388,
	lng: 20.998015,
	icon: image
    }, '../img/map/warsaw.png', 'First Christmas, Warsaw 1994');
    map.addMarker({ //Myrtle Beach
	lat: 33.688879,
	lng: -78.885677,
	icon: image
    }, '../img/map/myrtlebeach.png', 'Summer vacation with the Menezes family, Myrtle Beach ????');
    map.addMarker({ //Amalfi
	lat: 40.631020,
	lng:  14.577926,
	icon: image
    }, '../img/map/amalfi.png', 'Kurt Glaser\'s mother\'s wedding day, Amalfi Coast 2007');
    map.addMarker({ //Bulgaria
	lat: 43.7622,
	lng:  27.6727,
	icon: image
    }, '../img/map/bulgaria.png', 'Competing in a traditional Bulgarian wrestling festival, Cherna 2015');
    map.addMarker({ //Born here
	lat: 58.28454,
	lng:  12.291748,
	icon: baby,
    animation:google.maps.Animation.DROP,
	}, '../img/map/trollhatan.png', 'Start of the journey, Trollhattan 1994');
	map.addMarker({ //Suzhou, China
	lat: 31.298974,
	lng:  120.585289,
	icon: image,
	animation:google.maps.Animation.DROP,
	}, '../img/map/suzhou.png', 'Presenting research paper at IEEE Conference at Xi\'an Jiaotong-Liverpool University, Suzhou 2019');
	map.addMarker({ //Tokyo, Japan
	lat: 35.6762,
	lng:  139.6503,
	icon: image,
	animation:google.maps.Animation.DROP,
	}, '../img/map/tokyo.png', 'Action packed 5 days in this incredible city, Tokyo 2019');
	map.addMarker({ //Kyoto, Japan
	lat: 35.0116,
	lng:  135.7681,
	icon: image,
	animation:google.maps.Animation.DROP,
	}, '../img/map/kyoto.png', 'Gion District, Fushimi Inari Shrine, Arashiyama Bamboo Grove and Monkey Park, and so much more, Kyoto 2019');
	map.addMarker({ //Nara, Japan
	lat: 34.6851,
	lng:  135.8048,
	icon: image,
	animation:google.maps.Animation.DROP,
	}, '../img/map/nara.png', 'Feeding a tame deer at Nara Park, Nara 2019');
	map.addMarker({ //Osaka, Japan
	lat: 34.6937,
	lng:  135.5023,
	icon: image,
	animation:google.maps.Animation.DROP,
	}, '../img/map/osaka.png', 'Dotonbori, Osaka Castle, and Ramen Museum, Osaka 2019');
	map.addMarker({ //Bali, Indonesia
	lat: -8.3405,
	lng:  115.0920,
	icon: image,
	animation:google.maps.Animation.DROP,
	}, '../img/map/bali.png', 'Small taste of the incredible natural beauty of this island, Bali 2019');
	map.addMarker({ //Ha Long Bay, Vietnam
	lat: 20.9101,
	lng:  107.1839,
	icon: image,
	animation:google.maps.Animation.DROP,
	}, '../img/map/halong.png', 'Party Cruise on the Natural World Wonder of Ha Long Bay, Vietnam 2019');
	map.addMarker({ //Hanoi, Vietnam
	lat: 21.0278,
	lng:  105.8342,
	icon: image,
	animation:google.maps.Animation.DROP,
	}, '../img/map/hanoi.png', 'Old Quarter views with Omar, Hanoi 2019');
	map.addMarker({ //Phong Nha, Vietnam
	lat: 17.5983,
	lng:  106.2949,
	icon: image,
	animation:google.maps.Animation.DROP,
	}, '../img/map/phongnha.png', 'Feeding a baby duck at the Duck Stop, Phong Nha 2019');
	map.addMarker({ //Hoi An, Vietnam
	lat: 15.8801,
	lng:  108.3380,
	icon: image,
	animation:google.maps.Animation.DROP,
	}, '../img/map/hoian.png', 'Solo motorbike journey over the Hai Van Pass, near Hoi An 2019');
	map.addMarker({ //Saigon, Vietnam
	lat: 10.8231,
	lng:  106.6297,
	icon: image,
	animation:google.maps.Animation.DROP,
	}, '../img/map/saigon.png', 'Rooftop parties, Bitexco Tower, Heineken World, and Cu Chi Tunnels, Saigon 2019');
	map.addMarker({ //Angkor Wat, Vietnam
	lat: 13.4125,
	lng:  103.8670,
	icon: image,
	animation:google.maps.Animation.DROP,
	}, '../img/map/angkor.png', 'Wonder of the World: Angkor Wat Temple, Cambodia 2019');
}

/* =========================================
 *  UTILS
 *  =======================================*/

function utils() {

    /* tooltips */

    $('[data-toggle="tooltip"]').tooltip();

    /* external links in new window*/

    $('.external').on('click', function (e) {

	e.preventDefault();
	window.open($(this).attr("href"));
    });
    /* animated scrolling */

}

$.fn.alignElementsSameHeight = function () {
    $('.same-height-row').each(function () {

	var maxHeight = 0;
	var children = $(this).find('.same-height');
	children.height('auto');
	if ($(window).width() > 768) {
	    children.each(function () {
		if ($(this).innerHeight() > maxHeight) {
		    maxHeight = $(this).innerHeight();
		}
	    });
	    children.innerHeight(maxHeight);
	}

	maxHeight = 0;
	children = $(this).find('.same-height-always');
	children.height('auto');
	children.each(function () {
	    if ($(this).height() > maxHeight) {
		maxHeight = $(this).innerHeight();
	    }
	});
	children.innerHeight(maxHeight);
    });
}

/* refresh scrollspy */
function scrollSpyRefresh() {
    setTimeout(function () {
	$('body').scrollspy('refresh');
    }, 1000);
}

/* refresh waypoints */
function waypointsRefresh() {
    setTimeout(function () {
	$.waypoints('refresh');
    }, 1000);
}

/* ajax contact form */

/*
function contactForm() {
    $("#contact-form").submit(function () {

	var url = "contact.php"; // the script where you handle the form input.

	$.ajax({
	    type: "POST",
	    url: url,
	    data: $(this).serialize(), // serializes the form's elements.
	    success: function (data)
	    {
		var messageAlert = 'alert-' + data.type;
		var messageText = data.message;
		var alertBox = '<div class="alert ' + messageAlert + ' alert-dismissable animated bounceIn"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + messageText + '</div>';
		if (messageAlert && messageText) {
		    $('#contact-form').find('.messages').html(alertBox);
		}
	    }
	});
	return false; // avoid to execute the actual submit of the form.
    });
}
*/