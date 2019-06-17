var sel_file;

$(document).ready(function () {
    $(".profileImage").on("change", function(event) {
        imageupload(event, $(this).data("id"));
        handleImgFileSelect(event, $(this).data("id"));
    });
    $("img").click(function(event) {
        var id = $(this).data("id");
        if ($("#img" + id).attr("src"))
        {
            var path = $("#img" + id).attr("src");
            var check = 0;
            deleteImgFileSelect(event, id);
            if (path.indexOf("public/uploads/") >= 0)
            {
                check = 1;
            }
            else {
                check = 0;
            }
            imagedelete(event, id, path, check);
        }
    });
});

$(document).ready(function() {
    width = $(window).width();
	$("img").css("width", "100%");
    imgHei = $("img").width();
    $("img").css("height", imgHei);
});
$( window ).resize(function() {
    width = $(window).width();
	$("img").css("width", "100%");
    imgHei = $("img").width();
    $("img").css("height", imgHei);
});

function deleteImgFileSelect(e, imgid) {
    $("#img" + imgid).removeAttr("src");
}

function handleImgFileSelect(e,imgid) {
    var files = e.target.files;
    var filesArr = Array.prototype.slice.call(files);

    filesArr.forEach(function(f) {
        if(!f.type.match("image.*")) {
            alert("image file only");
            return;
        }
        sel_file = f;

        var reader = new FileReader();
        reader.onload = function(e) {
            $("#img" + imgid).attr("src", e.target.result);
        }
        reader.readAsDataURL(f);
    });
}

function imageupload(e, imgid) {
    var formData = new FormData();
    formData.append('image', $("#profileImages"+imgid)[0].files[0]);
    formData.append('id', imgid);
    $.ajax({
        url: '/upload',
        method: 'POST',
        data: formData,
        dataType : "json",
        processData: false,
        contentType: false,
        success: function (data) {
            console.log(data);
        }
    })
}

function imagedelete(e, imgid, path, check) {
    if (check == 0)
    {
        path = "NULL";
    }
    $.ajax({
        url: '/delete',
        method: 'POST',
        data: { 
            path: path,
            id: imgid,
            check: check
        },
        dataType : "json",
        success: function (data) {
            console.log(data);
        }
    })
}

function checkMainPicture() {
    var path = $("#img0").attr("src");
    if (!(path)) {
        alert("Upload your main profile picture!");
    }
    else {
        window.location.href = "/";
    }

}