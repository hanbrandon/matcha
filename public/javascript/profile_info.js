function popup_close(i) {
    var modal = $("#profile_popup_" + i);
    modal.css("display", "none");
}

function popup(i) {
    var img = $("#profile_pic_" + i);
    var src = img.attr("src");
    var modal = $("#profile_popup_" + i);
    var modalImg = $("#img" + i);
    modal.css("display", "block");
    modalImg.attr("src", src);
}

function report_open() 
{
    $('.report_popup').css("display","block");
}

function report_close() 
{
    $('.report_popup').css("display","none");
}

function block(i, user_id)
{
    $.ajax({
        url: '/report/block',
        method: 'POST',
        data: {
            from_id: i,
            to_id: user_id
        },
    }).done(function (res) {
        if (res && res == "SUCCESS") {
            alert("You have blocked the user.");
            window.location.replace("/");
        }
    })
}

function report(i, user) {

    $.ajax({
        url: '/report',
        method: 'POST',
        data: {
            id: i,
            user: user
        },
    }).done(function (res) {
        console.log(res);
        if (res && res == "SUCCESS") {
            alert("Thank you for reporting!");
            window.location.replace("/");
        }
    })
}

$(function() {
    if (curr_user_id != profile_id) {
        socket.emit('notification', {to: profile_name, to_id: profile_id, from: curr_user, from_id: curr_user_id, notice: "viewed your profile!"});
    }
});