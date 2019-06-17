function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}
var curr_lat, curr_lon;
function showPosition(position) {
    curr_lat = position.coords.latitude;
    curr_lon = position.coords.longitude; 
}

function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist;
    }
}

$(function() {
    getLocation();
    $.ajax({
        url: '/load_index',
        method: 'POST',
        data: { 'curr_user_id': curr_user_id }
    }).done(function(res) {
        res.forEach(profile => {
            var overall = profile.overall;
            var liked = profile.liked;
            var rating = 0;
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
            if (profile && profile.image_1 && profile.firstname && profile.lastname && profile.dob && profile.occupation && profile.school && profile.latitude && profile.longitude && profile.tags) {
                var profile_image = profile.image_1.replace('public/', '');
                var distance_calc = distance(curr_lat, curr_lon, profile.latitude, profile.longitude).toFixed(2);
                if (distance_calc < 1) {
                    distance_calc = "Less than 1 Mile Away";
                } else if (distance_calc == 1) {
                    distance_calc = "1 Mile Away";
                } else {
                    distance_calc += " Miles Away";
                }
                $('.index_list').append(`
                <div class="card" id="user_${profile.id}">
                    <a href="/profile_info/${profile.id}">
                        <div class="profile_picture"
                            style="background-image: url('${profile_image}')"
                            ;>
                            <span class="name">${profile.firstname} ${profile.lastname},</span> <span class="age">${getAge(profile.dob)}</span>
                        </div>
                    </a>
                    <div class="profile_details">
                        <div class="occupation"><i class="fas fa-briefcase"></i>${profile.occupation}</div>
                        <div class="location"><i class="fas fa-map-marker-alt"></i> ${distance_calc}</div>
                        <div class="school"><i class="fas fa-graduation-cap"></i>${profile.school}</div>
                        <div class="tags"><i class="fas fa-tag"></i>${profile.tags}</div>
                        <div class="like" id="like_user_${profile.id}" onclick="like_dislike('${curr_user}', ${profile.id}, 1)"><i class="fas fa-heart"></i></div>
                        <div class="dislike" id="like_user_${profile.id}" onclick="like_dislike('${curr_user}', ${profile.id}, 0)"><i class="fas fa-times"></i></div>
                        <div class="rating">${rating_ico}</div>
                    </div>
                </div>
                `);
            }
        });
    });
    load_socket();
});

function like_dislike(from, to, checker) {
    $(`#user_${to}`).remove();
    $.ajax({
        url: '/like_user',
        method: 'POST',
        data: { 'from_id':from,
                'to_id':to,
                'likes':checker }
    }).done((res) => {
        //send notification here
        if (res && res != "FAIL") {
            socket.emit('notification', {to: res.oppose_name, from_id: res.from_id, to_id: to, by: res.from_name, notice: res.checker});
        }
    });
}