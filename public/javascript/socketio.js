function load_socket() { $(function() {
    var socket = io();
    var username = curr_user;
    var shiftDown = false;

    $('#send_msg').click(function(e){
        var msg = $('#m').val();
        var to = $('#send_msg').val();
        var to_name = $('#msg_connect_to').val();
        e.preventDefault(); // prevents page reloading
        socket.emit('chat_message', {to: to, by: username, message: msg});
        socket.emit('notification', {to: to_name, from_id: curr_user_id, to_id: to, by: username, notice: "messaged you!"});
        $('#m').val('');
        return false;
    });

    $('#m').keypress(function(e) {
        if(e.which == 13) {
            if ($('#m').is(":focus") && !shiftDown) {
                e.preventDefault();
                $('#send_msg').click();
            }
        }
    })

    $(document).keydown(function (e) {
        if(e.keyCode == 16) shiftDown = true;
    });

    $(document).keyup(function (e) {
        if(e.keyCode == 16) shiftDown = false;
    });

    socket.on('chat_message', function(msg) {
        if (msg.id) {
            var profile_pic = msg.profile_pic.replace('public/', '/');
            $(`#chat_preview_${msg.id}`).html(`
                <div class="chat_profile"
                    style="background-image: url('${profile_pic}')">
                    <div class="chat_username">
                        <h5>${msg.from}<span class="chat_date">${msg.date}</span></h5>
                    </div>
                    <div class="recent_chat">
                        <span>${msg.msg}</span>
                    </div>
                </div>
            `);
        }
        if ($('#msg_box').length) {
            if (msg.from == username) {
                $('#msg_box').append(`
                    <div class="outgoing_msg">
                        <div class="sent_msg">
                            <p><strong>${msg.from} : </strong>
                                ${msg.msg}</p>
                            <span class="time_date"> ${msg.date}</span>
                        </div>
                    </div>
                `);
            } else {
                $('#msg_box').append(`
                    <div class="incoming_msg">
                        <div class="incoming_msg_img" style="background-image: url('${profile_pic}')"></div>
                        <div class="received_msg">
                            <div class="received_withd_msg">
                                <p><strong>${msg.from} : </strong>
                                    ${msg.msg}</p>
                                <span class="time_date"> ${msg.date}</span>
                            </div>
                        </div>
                    </div>
                `);
            }
            updateScroll();
        }
    });


    socket.on('notification', (val) => {
        if ($('#noti_box').is(":visible")) {
            $('.notifications_list').prepend(`
                <div class="notification" style="background-color: rgb(216, 216, 216)">
                    <a href="/profile_info/${val.from_id}">
                        <span><strong>${val.from_name}</strong> ${val.notice}</span><span>${val.date}</span>
                    </a>
                </div>
            `);
            $.ajax({
                url: '/notification/clear',
                method: 'POST',
                data: { username: username }
            }).done((res) => {
                notification_count = 0;
            });
        } else {
            if (val && val.val) {
                notification_count++;
            }
            if (!notification_count) {
                $('#notification_counter').css('display', 'none');
            } else if (notification_count <= 99) {
                $('#notification_counter').css('display', 'block');
                $('#notification_counter').html(`
                    <span>${notification_count}</span>
                `);
            } else {
                $('#notification_counter').css('display', 'block');
                $('#notification_counter').html(`
                    <span>+99</span>
                `);
            }
        }
    });
});}