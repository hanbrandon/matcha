var isopen = 0;
var width = $(window).width();
var position = width - 70;

$(window).resize(function () {
    width = $(window).width();
    position = width - 70;
    if (isopen) {
        $(".search_ico").css("left", position);
    }
});

function openSearch() {
    if (isopen) {
        $("#searchBar").fadeOut(500);
        $(".index_list").css("margin-top", 0);
        $(".search_ico").animate({ "left": "18px" }, "slow");
        $(".search_ico").css('box-shadow', '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)');
        isopen = 0;
        filter();
    }
    else {
        $("#searchBar").delay(450).fadeIn(500);
        $(".search_ico").animate({ "left": position }, "slow");
        $(".search_ico").css('box-shadow', '0px 0px 0px #888');
        isopen = 1;

    }
}

function filter() {
    $(".card").remove();
    getLocation();
    $.ajax({
        url: '/load_index',
        method: 'POST',
        data: { 'curr_user_id': curr_user_id }
    }).done(function(res) {
        res.forEach(profile => {
            var user_age = getAge(curr_user_dob);
            var overall = profile.overall;
            var liked = profile.liked;
            var rating = 0;
            var filter_gender = $('#gender option:selected').val();
            if (filter_gender == "Select Gender" || filter_gender == "all") {
                filter_gender = "uncheck";
            }
            var filter_ageGap = $('#ageGap').val();
            if (!(filter_ageGap)) {
                filter_ageGap = "0";
            }
            var filter_fameRating = $('#fameRating').val();
            if (!(filter_fameRating)) {
                filter_fameRating = "0";
            }
            var filter_distance = $('#distance').val();
            if (!(filter_distance)) {
                filter_distance = "0";
            }
            var hidden_tags = $('#hidden_tags').val();
            if (!(hidden_tags)) {
                hidden_tags = "0"; //Display All
            }
            else {
            var hidden_tags = hidden_tags.split(", ");
            }
            var rating_ico = `<i class="far fa-meh-blank fa-3x"></i>`
            if (overall != 0)
            {
                rating = 100 * liked/overall;
                if (rating != 0)
                {
                    if (rating < 50) {
                        rating_ico =`<i class="far fa-frown-open fa-3x"></i>`;
                    } else if (rating < 60) {
                        rating_ico = `<i class="far fa-frown fa-3x"></i>`;
                    } else if (rating < 70) {
                        rating_ico = `<i class="far fa-meh fa-3x"></i>`;
                    } else if (rating > 80) {
                        rating_ico = `<i class="far fa-smile fa-3x"></i>`;
                    }
                }
            }
            if (profile && profile.image_1 && profile.firstname && profile.lastname && profile.gender && profile.dob && profile.occupation && profile.school && profile.latitude && profile.longitude && profile.tags) {
                var profile_image = profile.image_1.replace('public/', '');
                var distance_calc = distance(curr_lat, curr_lon, profile.latitude, profile.longitude).toFixed(2);
                var res_distance = distance_calc;
                var profile_age = getAge(profile.dob);
                var res_ageGap = profile_age - user_age;
                if (res_ageGap < 0) {
                    res_ageGap = res_ageGap * (-1);
                }
                if (distance_calc < 1) {
                    distance_calc = "Less than 1 Mile Away";
                } else if (distance_calc == 1) {
                    distance_calc = "1 Mile Away";
                } else {
                    distance_calc += " Miles Away";
                }

                // console.log("filter_gender: " + filter_gender);
                // console.log("profile.gender: " + profile.gender);
                // console.log("filter_ageGap: " + filter_ageGap);
                // console.log("Agegap:" + filter_ageGap + "<=" + res_ageGap);
                // console.log("filter_fameRating: " + filter_fameRating);
                // console.log("rating: " + rating );
                // console.log("filter_distance: " + filter_distance );
                // console.log("res_distance: " + res_distance);
                // console.log("profile tag: " + profile.tags);
                // console.log("hidden_tags: " + hidden_tags);
                // console.log("----------------------");

                //Adv Search for Interest tag
                var check = hidden_tags.length;
                if (!(hidden_tags == 0)){
                    while (check != 0) {
                        if (profile.tags.includes(hidden_tags[check - 1])) {
                            check--;
                        }
                        else {
                            break;
                        }
                    }
                    console.log("포함됐어? ->" + check);
                }
                
                if ((filter_gender == "uncheck" || filter_gender == profile.gender) && (filter_ageGap == 0 || filter_ageGap >= res_ageGap) && (filter_fameRating == 0 || rating >= filter_fameRating) && (filter_distance == 0 || filter_distance >= res_distance) && (check == 0))
                {
                    $('.index_list').append(`
                    <div class="card" id="user_${profile.id}">
                        <a href="/profile_info/${profile.id}">
                            <div class="profile_picture"
                                style="background-image: url('${profile_image}')"
                                ;>
                                <span class="name">${profile.firstname} ${profile.lastname}, <span class="age">${profile_age}</span></span>
                            </div>
                        </a>
                        <div class="profile_details">
                            <div class="occupation"><i class="fas fa-briefcase"></i>${profile.occupation}</div>
                            <div class="location"><i class="fas fa-map-marker-alt"></i> ${distance_calc}</div>
                            <div class="school"><i class="fas fa-graduation-cap"></i>${profile.school}</div>
                            <div class="school"><i class="fas fa-tag"></i>${profile.tags}</div>
                            <div class="like" id="like_user_${profile.id}" onclick="like_dislike('${curr_user}', ${profile.id}, 1)"><i class="fas fa-heart"></i></div>
                            <div class="dislike" id="like_user_${profile.id}" onclick="like_dislike('${curr_user}', ${profile.id}, 0)"><i class="fas fa-times"></i></div>
                            <div class="rating">${rating_ico}</div>
                        </div>
                    </div>
                    `);
                }
            }
        });
    });
    load_socket();
}

$(function () {
    $.ajax({
        url: '/search_tags',
        method: 'POST',
        dataType: 'json',

    }).done((res) => {
        var availableTags = res.map(function (a) { return a.tag_name; });
        $("#tags").autocomplete({
            source: availableTags
        });
    });
});

function removetag(id) {
    var tag = $("#span_" + id).text();
    var tags = $('#hidden_tags').val();
    var split_tags = tags.split(", ");
    $("#a_tag_" + id).remove();
    var j = 0;
    var temp_arr = [];
    while (j < split_tags.length) {
        if (split_tags[j] != tag) {
            temp_arr.push(split_tags[j]);
        }
        j++;
    }
    $('#hidden_tags').val((temp_arr.join(", ")));
}

$(function () {
    $('#tags').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13' || keycode == '32') {
            event.preventDefault();
            var tag = $('#tags').val();
            // Get Search Input Value
            $('#tags').val("");
            // Delete Search Input Value
            if (tag.charAt(0) == "#") {
                var temp = tag.substring(1);
                var i;
                if ($('#count_tag').val()) {
                    i = $('#count_tag').val();
                }
                else {
                    i = -1;
                }
                if (!(temp.indexOf("#") >= 0)) {
                    var tags = $('#hidden_tags').val();
                    var split_tags = tags.split(", ");
                    if (split_tags) {
                        var j = 0;
                        var check = 0;
                        while (j < split_tags.length) {
                            if (split_tags[j] == tag) {
                                check = 1;
                            }
                            j++;
                        }
                        if (check == 0) {
                            if (tags) {
                                $('#hidden_tags').val(tags + ", " + tag);
                            }
                            else {
                                $('#hidden_tags').val(tag);
                            }
                            i++;
                            $('.tag_list').append(`<a id="a_tag_` + i + `" onclick="removetag(` + i + `)";return false;><span id="span_` + i + `">` + tag + `</span>`)
                            $('#count_tag').val(i);
                        }
                        else {
                            alert("This tag selected already");
                        }
                    }
                }
            }
            else {
                alert("Use hash tag!");
            }
        }
    })
});