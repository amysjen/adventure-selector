/**
 * v1.0 - Copyright 2014 Madden Media - All rights reserved.
 *
 * Content-specific layout functionality. These functions
 *	make many assumptions about content contained in the page.
 *
 * NOTE: Assumes that madden-content-frameworks-v1.0.js has been loaded and
 *	that the initial view types (mobile, tablet, etc.) have been defined.
 */

// mobile can call resize during scroll - we can cache width
//	and check if an actual resize happens
var _winWidth = 0;

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
// STOCK EVENT FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////


// for snow
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var container;
var particle;
var camera;
var scene;
var renderer;
var mouseX = 0;
var mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var particles = []; 


var glam = 0;
var gritty = 0;


//
// Called on document ready
//

contentOnReady = function () {
	
	// set the window width
	_winWidth = $(window).width();
	
	
	if ( (getIsLarge()) || (getIsNewerIPad()) ) {
		var adjust = (getIsNewerIPad()) ? -.12 : .18;	
		// $("#ci0").parallaxBG({ adjustY: adjust, bgXPosition: 'center' });	
	}
		
	
	// Recommended Reads links
	
	var relatedLinks = [
		{ "title": "How to Plan and Execute the Perfect Ogden Ski Trip", "link": "https://www.visitogden.com/blog/how-to-plan-and-execute-the-perfect-ogden-ski-trip/" },
		{ "title": "Five Ways to Elevate Your Winter Vacation in Ogden", "link": "https://www.visitogden.com/blog/5-ways-to-elevate-your-winter-vacation-in-ogden/" },
		{ "title": "25 Things to Do on Historic 25th Street", "link": "https://www.visitogden.com/blog/25-things-to-do-on-historic-25th-street/" }
	];

	
	// footer links
	buildRelatedLinks(relatedLinks);
	
	equalizeElementHeightsToTallest($(".linkTitleWrapper"));
	
	// End Recommended Reads links


	if(!getIsSmall()) {
		// resize snow
		$("#snow").css({ "width": $("#hero").width(), "height": $("#hero").height() });

		// snow!
		letItSnow('snow');
	}

	
	// ipad pro will use large size, but needs backgrounds set to scroll, not fixed
	unFixBGImagesForIPads();
	
	customAdjustLayout(true);
	
	// add the complete class to the loader
	$('#loading').addClass('complete');


	// Take Quiz button scroll 
	$('.quiz_btn').click(function(){
		$('html,body').animate({
		   scrollTop: $("#q1").offset().top
		});
	});
	

	// Functionality for each category
	$('.answers_container').each(function(){
		var parentBox = $(this);

		// When the answer button (circle) is clicked
		$(this).find('.answer_title').click(function(){
			var optionBtn = $(this);

			// Specially for the 1st Question box only
			if(parentBox.hasClass('q1')) {
				// "Or" fades away
				parentBox.find('.or').fadeOut(function(){
					$(this).removeClass('show');
				});
				// Show contents inside container
				optionBtn.parent().addClass('selected');
				optionBtn.fadeOut();
				window.setTimeout(function(){
					optionBtn.next('.listing_detail_container').fadeIn();

					if(optionBtn.closest('.answer_wrap').hasClass('gritty')) {
						gritty += 1;
					} else if(optionBtn.closest('.answer_wrap').hasClass('glam')) {
						glam += 1;
					}

				},1000);
			} else { // For all other questions
				showListings($(this));
			}
		});

		// Close current choice/listings and go back to original screen
		parentBox.find('.to_other').click(function(){
			var cur_answer = $(this).parent('.answer_wrap');
			if(cur_answer.hasClass('selected')) {
				$(this).fadeOut();

				$(this).next('.answer_title').removeClass('active');

				// Listings disappear
				var list_wrap = $(this).siblings('.listings_container');
				list_wrap.removeClass('show');

				window.setTimeout(function(){
					list_wrap.removeClass('widen');

					// Current answer container go back to 50% width 
					cur_answer.removeClass('selected');

					// OR fades back in
					cur_answer.closest('.answers_container').find('.or').fadeIn(function(){
						$(this).addClass('show');
					});

				},800);

				window.setTimeout(function(){
					if(getIsSmall()) {
						cur_answer.find('.answer_title').fadeIn();
					}
				},1700);

			}
		});


		// When a listing is clicked
		parentBox.find('.listing').click(function(){
			$(this).closest('.answer_wrap').find('.to_other').addClass('disable');
			var target = $(this).data('name');
			$(this).closest('.listings_container').siblings('.listing_detail_container').each(function(){
				if($(this).data('listing') == target) {
					$(this).fadeIn();

					if($(this).closest('.answer_wrap').hasClass('gritty')) {
						gritty += 1;
					} else if($(this).closest('.answer_wrap').hasClass('glam')) {
						glam += 1;
					}
				}
			});

			$(this).closest('.listings_container').fadeOut();
			$(this).closest('.listings_container').siblings('.answer_title').fadeOut();

		});

		// Close button click
		parentBox.find('.listing_detail_container .close, .listing_detail_container').click(function(){
			var target = $(this).closest('.answer_wrap');

			// 1st Question box specifically
			if($(this).closest('.answers_container').hasClass('q1')) {
				if($(this).closest('.answer_wrap').hasClass('selected')) {
					target.find('.listing_detail_container').fadeOut();
					target.find('.answer_title').fadeIn();
					window.setTimeout(function(){
						target.removeClass('selected');
						target.siblings('.or').fadeIn(function(){
							window.setTimeout(function(){
								target.siblings('.or').addClass('show');
							},500);
						});
					},600);
				}
			} else {
				target.find('.listing_detail_container').fadeOut();
				target.find('.to_other').removeClass('disable');
				target.find('.listings_container').fadeIn();
				if(!getIsSmall()) {
					target.find('.listings_container').siblings('.answer_title').fadeIn();
				}
			}

			if(target.hasClass('gritty')) {
				gritty -= 1;
			} else if(target.hasClass('glam')) {
				glam -= 1;
			}

		});
		// Prevents the actual listing detail container from closing the entire thing
		$('.listing_detail').click(function(e){
			e.stopPropagation();
		});

		parentBox.find('.listing_detail_container').each(function(){
			$(this).find('.listing_info').append('<img src="https://maddencdn.com/content/images/2019/ogden/utahskiingadventure/selected.png" class="selectBtn" alt="Selected">');
		});

		parentBox.find('.listings_container').each(function(){
			$(this).prepend('<h3>Choose one:</h3>');
		});

	});


	// Display Quiz Score based on how many listings are visible
	$('#quiz_score .show_btn').click(function(){
		var counter = 0;

		$('#quiz_score .result').empty();

		$('.answers_container').each(function(){
			$(this).find('.listing_detail_container').each(function(){
				if($(this).is(':visible')) {
					counter++;
				}
			});
		});

		var glam_score = Math.round(glam / counter * 100);
		var gritty_score = Math.round(gritty / counter * 100);

		if(counter < 1) {
			$('#quiz_score .result').append('<span class="no_result">Please select at least one listing above!</span>');
		} else {
			$('#quiz_score .show_btn').text('Reload Results');

			$('#quiz_score .result').append('<div class="glam score">Glam: ' + glam_score + '%</div><div class="gritty score">Gritty: ' + gritty_score + '%</div>');

			$('#quiz_score .glam').animate({
				width: glam_score+'%'
			},'slow');
			$('#quiz_score .gritty').animate({
				width: gritty_score+'%'
			},'slow');

		}

	});

}

// Opens container of the option picked
function showListings(option) {

	// "Or" fades away
	option.closest('.answers_container').find('.or').fadeOut(function(){
		$(this).removeClass('show');
	});
	// Show contents inside container
	option.prev('.to_other').fadeIn('slow');
	option.parent().addClass('selected');

	if(getIsSmall()) {
		option.fadeOut();
	}

	listings = option.next('.listings_container');

	window.setTimeout(function(){
		listings.addClass('widen');
	},1000);

	window.setTimeout(function(){
		listings.addClass('show');
	},2000);

	// Keeps this button on active (hover) state
	option.addClass('active');
}



// 
// https://github.com/sebleedelisle/live-coding-presentations/tree/master/2011/JSSnow
//
letItSnow = function (containerEl) {
	
	var particleImage = new Image();
	// particleImage.src = 'https://maddencdn.com/content/images/2016/tampa_bay/protest_winter/particle_smoke.png'; 
	particleImage.src = 'https://maddencdn.com/content/images/2019/ogden/utahskiingadventure/snowflake.png'; 

	container = document.getElementById(containerEl);

	camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
	camera.position.z = 1000;

	scene = new THREE.Scene();
	scene.add(camera);
		
	renderer = new THREE.CanvasRenderer();
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	var material = new THREE.ParticleBasicMaterial( { map: new THREE.Texture(particleImage) } );
		
	for (var i = 0; i < 500; i++) {
		particle = new Particle3D( material);
		particle.position.x = Math.random() * 2000 - 1000;
		particle.position.y = Math.random() * 2000 - 1000;
		particle.position.z = Math.random() * 2000 - 1000;
		particle.scale.x = particle.scale.y =  1;
		scene.add( particle );
		
		particles.push(particle); 
	}

	container.appendChild( renderer.domElement );

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );
	
	setInterval( loopSnow, 1000 / 60 );		
}

// for snow
loopSnow = function () {
	for(var i = 0; i<particles.length; i++) {
		var particle = particles[i]; 
		particle.updatePhysics(); 

		with(particle.position) {
			if(y<-1000) y+=2000; 
			if(x>1000) x-=2000; 
			else if(x<-1000) x+=2000; 
			if(z>1000) z-=2000; 
			else if(z<-1000) z+=2000; 
		}				
	}

	camera.position.x += ( mouseX - camera.position.x ) * 0.05;
	camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
	camera.lookAt(scene.position); 

	renderer.render( scene, camera );
}	

// for snow
onDocumentMouseMove = function (event) {
	
	return;
	
	mouseX = event.clientX - windowHalfX;
	mouseY = event.clientY - windowHalfY;
}

// for snow
onDocumentTouchStart = function (event) {
	
	return;
	
	if ( event.touches.length == 1 ) {
		event.preventDefault();
		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;
	}
}

// for snow
onDocumentTouchMove = function (event) {
	
	return;
	
	if ( event.touches.length == 1 ) {
		event.preventDefault();
		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;
	}
}



  
//
// Called on document scroll
//
contentOnScroll = function () {	
	$('.or').each(function(){
		if(getItemInViewport($(this))) {
			$(this).addClass('show');
		} else {
			$(this).removeClass('show');
		}
	});
}

//
// Called on a touch move on mobile
//
contentOnTouchMove = function () { }

//
// Called on document resize
//
contentOnResize = function () { 
	customAdjustLayout();
}

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
// CUSTOM FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

//
// The frameworks was given this function to handle setting chapter buttons 
//	when the chapter is set
//
// chapterEl: The chapter link DOM element 
// on: Is it being turned on? (true|false)
//
customChapterLinkAdjust = function (chapterEl, on) {
	$(chapterEl).attr("class", ((on) ? "navLink chapterLink noGA on" : "navLink chapterLink noGA"));
}

//
// Adjust this specific layout after a load or resize event
//
// isLoad: Is this being called by a load or resize event?
//
customAdjustLayout = function (isLoad) {

	var localNotJustTouchScroll = isLoad;

	equalizeElementHeightsToTallest($(".linkTitleWrapper"));
	
	// is it really a resize?
	if ($(window).width() != _winWidth) {
    	// yes
		localNotJustTouchScroll = true;
		_winWidth = $(window).width();
	}

	if ( (localNotJustTouchScroll) || (isLoad) ) {
		// resize footer links to be equal height of the tallest one
		//equalizeRelatedLlinks();	
	}


}