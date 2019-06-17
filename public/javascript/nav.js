var socket = io();
var notification_count = 0;
$(function() {
    if (curr_user && curr_user_id && typeof curr_user_id !== 'undefined') {
        $.ajax({
            url: '/notification',
            method: 'POST',
            data: { username: curr_user }
        }).done((res) => {
            if (res && res != 'ERROR') {
                notification_count += res[0];
                if (notification_count <= 99 && notification_count > 0) {
                    $('#notification_counter').css('display', 'block');
                    $('#notification_counter').html(`
                        <span>${notification_count}</span>
                    `);
                } else if (notification_count > 99) {
                    $('#notification_counter').css('display', 'block');
                    $('#notification_counter').html(`
                        <span>+99</span>
                    `);
                }
                else {
                    $('#notification_counter').css('display', 'none');
                }
            }
        });
    }
});

function show_notification() {
    if ($('#noti_box').is(":visible")) {
        $('#noti_box').css("display", "none");
        $('.notifications_list').html(``);
    } else {
        $.ajax({
            url: '/notification/load',
            method: 'POST',
            data: { username: curr_user }
        }).done((res) => {
            $('#noti_box').css("display", "block");
            $('#notification_counter').css('display', 'none');
            if (res && res[0]) {
                res.forEach((notif) => {
                    var fullname = notif.firstname + " " + notif.lastname;
                    if (notif.checked == 0) {
                        $('.notifications_list').prepend(`
                            <div class="notification" style="background-color: rgb(216, 216, 216)">
                                <a href="/profile_info/${notif.from_id}">
                                    <span><strong>${fullname}</strong> ${notif.notice}</span><span id="time">${notif.time}</span>
                                </a>
                            </div>
                        `);
                    } else {
                        $('.notifications_list').prepend(`
                            <div class="notification">
                                <a href="/profile_info/${notif.from_id}">
                                    <span><strong>${fullname}</strong> ${notif.notice}</span><span id="time">${notif.time}</span>
                                </a>
                            </div>
                        `);
                    }
                });
                $.ajax({
                    url: '/notification/clear',
                    method: 'POST',
                    data: { username: curr_user }
                }).done((res) => {
                    notification_count = 0;
                });
            }
        });
    }
}