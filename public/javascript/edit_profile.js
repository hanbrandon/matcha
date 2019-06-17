$(function () {
    $('#interests').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13' || keycode == '32') {
            event.preventDefault();
            var tag = $('#interests').val();
            var value = $('#tags').val();
            $('#interests').val("");
            if (!(value.indexOf(tag) >= 0)) {
                if (tag.charAt(0) == "#") {
                    var temp = tag.substring(1);
                    if (!(temp.indexOf("#") >= 0)) {
                        var i = $('#count_tag').val();
                        $('.interests').append(`<a href="#" id="atag<%= i %>" onclick="deletetag(` + i + `)";return false;><span id="spantag<%= i %>" data-id="` + i + `">` + tag + `</span>`)
                        i++;
                        $('#count_tag').val(i);
                        var tags = $('#tags').val();
                        $('#tags').val(tags + ", " + tag);
                        addtag(tag);
                    }
                }
                else {
                    alert("Use hash tag!")
                }
            }
        }
    })
});
function deletetag(id) {
    var value = $('#tags').val();
    var tag = $('#spantag' + id).html();
    $("#atag" + id).remove();
    if (value.indexOf(tag) >= 0) {
        var newValue = value.replace(tag, "");
        var newValue = newValue.replace(", ,", ", ");
        $('#tags').val(newValue);
    }
}

function addtag(tag) {
    $.ajax({
        url: '/add_tag',
        method: 'POST',
        data: {
            tag: tag
        },
        dataType: "json",
        success: function (data) {
            // console.log(data);
        }
    })
}