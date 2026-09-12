// ponytail: seven strings, not worth a string table or a fetch. cat/index.html sets
// window.LANG='ca' before this file; the root page omits it and falls through to English.
var T = (window.LANG === 'ca') ? {
    calTitle: "El casament d'en Peter i l'Elena",
    calDescription: "Estem desitjant veure't el nostre gran dia. Per a qualsevol dubte, contacta amb en Peter Brosten al \+34 641 93 62 45.",
    addToCal: 'Afegeix-ho al calendari',
    badCode: "<strong>Ho sentim!</strong> Aquest codi d'invitació no és correcte; comprova el que hi ha al teu save the date.",
    saving: '<strong>Un moment!</strong> Estem desant les teves dades.',
    netError: "<strong>Ho sentim!</strong> No hem pogut connectar amb el servidor; comprova la connexió i torna-ho a provar."
} : {
    calTitle: "Peter and Elena's Wedding",
    calDescription: "We can't wait to see you on our big day. For any queries or issues, reach out to Peter Brosten at \+34 641 93 62 45.",
    addToCal: 'Add to Calendar',
    badCode: "<strong>Sorry!</strong> That invite code isn't right; please check the one on your save the date.",
    saving: '<strong>Just a sec!</strong> We are saving your details.',
    netError: "<strong>Sorry!</strong> We couldn't reach the server; please check your connection and try again."
};

$(document).ready(function () {

    /***************** Waypoints ******************/

    $('.wp1').waypoint(function () {
        $('.wp1').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp2').waypoint(function () {
        $('.wp2').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });
    $('.wp3').waypoint(function () {
        $('.wp3').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp4').waypoint(function () {
        $('.wp4').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });
    $('.wp5').waypoint(function () {
        $('.wp5').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp6').waypoint(function () {
        $('.wp6').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });
    $('.wp8').waypoint(function () {
        $('.wp8').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp9').waypoint(function () {
        $('.wp9').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });

    /***************** Nav Transformicon ******************/

    /* When user clicks the Icon */
    $('.nav-toggle').click(function () {
        $(this).toggleClass('active');
        $('.header-nav').toggleClass('open');
        event.preventDefault();
    });
    /* When user clicks a link */
    $('.header-nav li a').click(function () {
        $('.nav-toggle').toggleClass('active');
        $('.header-nav').toggleClass('open');

    });

    /***************** Header BG Scroll ******************/

    $(function () {
        $(window).scroll(function () {
            var scroll = $(window).scrollTop();

            if (scroll >= 20) {
                $('section.navigation').addClass('fixed');
                $('header').css({
                    "border-bottom": "none",
                    "padding": "35px 0"
                });
                $('header .member-actions').css({
                    "top": "26px",
                });
                $('header .navicon').css({
                    "top": "34px",
                });
            } else {
                $('section.navigation').removeClass('fixed');
                $('header').css({
                    "border-bottom": "solid 1px rgba(255, 255, 255, 0.2)",
                    "padding": "50px 0"
                });
                $('header .member-actions').css({
                    "top": "41px",
                });
                $('header .navicon').css({
                    "top": "48px",
                });
            }
        });
    });
    /***************** Smooth Scrolling ******************/

    $(function () {

        $('a[href*=#]:not([href=#])').click(function () {
            if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {

                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top - 90
                    }, 2000);
                    return false;
                }
            }
        });

    });

    /********************** Toggle Map Content **********************/
    $('#btn-show-map').click(function () {
        $('#map-content').toggleClass('toggle-map-content');
        $('#btn-show-content').toggleClass('toggle-map-content');
    });
    $('#btn-show-content').click(function () {
        $('#map-content').toggleClass('toggle-map-content');
        $('#btn-show-content').toggleClass('toggle-map-content');
    });

    /********************** Add to Calendar **********************/
    // Read by js/vendor/ouical.js for its button label — the one user-facing string it owns.
    window.OUICAL_ADD_LABEL = T.addToCal;
    var myCalendar = createCalendar({
        options: {
            class: '',
            // You can pass an ID. If you don't, one will be generated for you
            id: ''
        },
        data: {
            // Event title
            title: T.calTitle,

            // Barcelona time (+02:00 = CEST in September). Keep the offset: without it the
            // string is parsed in the *guest's* timezone and everyone abroad gets the wrong hour.
            start: new Date('2027-09-10T16:00:00+02:00'),
            end: new Date('2027-09-11T04:00:00+02:00'),

            // Event Address. Catalan throughout — "Masia" without the accent, not the venue's own
            // "Masía". This is a third copy of the venue name; index.html:418 and :435 are the others.
            address: 'Masia Can Plantada, L\'Ametlla del Vallès',

            // Event Description
            description: T.calDescription
        }
    });

    $('#add-to-cal').html(myCalendar);


    /********************** RSVP **********************/
    // Posts straight to the Google Form's formResponse endpoint (URL is the form's action
    // attribute, so cat/index.html needs no separate JS).
    $('#rsvp-form').on('submit', function (e) {
        e.preventDefault();
        var form = this;
        var btn = $(form).find('button');

        // Entries must be lowercase; guests' input is trimmed and lowercased before comparing.
        var CODES = ['pe2027'];
        if (CODES.indexOf($('#invite_code').val().trim().toLowerCase()) === -1) {
            $('#alert-wrapper').html(alert_markup('danger', T.badCode));
            return;
        }

        $('#alert-wrapper').html(alert_markup('info', T.saving));
        btn.prop('disabled', true);

        // ponytail: no-cors means we cannot read Google's reply, so a Google-side rejection
        // looks like success. Mitigated by keeping every Form question optional and doing
        // all validation in the browser — see site-wiki/planning/rsvp-google-form.md.
        fetch(form.action, {
            method: 'POST',
            mode: 'no-cors',
            body: new URLSearchParams(new FormData(form))  // urlencoded is CORS-safelisted
        }).then(function () {
            $('#alert-wrapper').html('');
            // Once the thank-you modal closes, land on the travel tips. #recommendations is
            // English-only, so on cat/ this is a no-op. Same offset/duration as the nav links.
            var next = $('#recommendations');
            if (next.length) {
                $('#rsvp-modal').one('hidden.bs.modal', function () {
                    $('html,body').animate({scrollTop: next.offset().top - 90}, 1000);
                });
            }
            $('#rsvp-modal').modal('show');
        }).catch(function () {
            $('#alert-wrapper').html(alert_markup('danger', T.netError));
        }).finally(function () {
            btn.prop('disabled', false);
        });
    });

});

/********************** Extras **********************/

// alert_markup
function alert_markup(alert_type, msg) {
    return '<div class="alert alert-' + alert_type + '" role="alert">' + msg + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span>&times;</span></button></div>';
}
