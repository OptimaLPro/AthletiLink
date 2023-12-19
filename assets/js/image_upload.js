function fileChange() {
    var fileName = $("#profilePicture").val().split("\\").pop();
    $("#profilePictureLabel").text(fileName);
    var file = document.getElementById('profilePicture');
    var form = new FormData();
    form.append("image", file.files[0]);

    var settings = {
        "url": "https://api.imgbb.com/1/upload?key=7045717abf171aa1e4b75a833e125006",
        "method": "POST",
        "timeout": 0,
        "processData": false,
        "mimeType": "multipart/form-data",
        "contentType": false,
        "data": form,
        "xhr": function () {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    percentComplete = parseInt(percentComplete * 100);

                    // Update the progress bar
                    $("#uploadProgressBar")
                        .width(percentComplete + '%')
                        .attr('aria-valuenow', percentComplete)
                        .text(percentComplete < 100 ? percentComplete + '%' : 'Processing...');
                }
            }, false);
            return xhr;
        }
    }

    $(".progress").show();

    $.ajax(settings).done(function (response) {
        var response_json = JSON.parse(response);
        console.log(response_json.data.url);
        $("#profilePictureUrl").val(response_json.data.url);
        // After the image is uploaded, submit the form with the image URL
        uploaded = true;
        $("#uploadProgressBar").width('0%').attr('aria-valuenow', 0).text('');
        $(".progress").hide();
    }).fail(function () {
        // Handle failures here
        $("#uploadProgressBar").width('0%').attr('aria-valuenow', 0).text('');
        $(".progress").hide();
    });
}
