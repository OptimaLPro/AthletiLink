function fileChange(id = "") {
    var fileName = $(`#profilePicture${id}`).val().split("\\").pop();

    // if filename longer than 50 characters, replace the rest with '...'
    if (fileName.length > 50) {
        fileName = fileName.substring(0, 47) + '...';
    }

    $(`#profilePictureLabel${id}`).text(fileName);

    var file = document.getElementById(`profilePicture${id}`);
    var form = new FormData();
    form.append("image", file.files[0]);

    fetch('http://localhost:5500/uploadImage')
        .then(response => response.json())
        .then(data => {
            var apiKey = data.apiKey;
            console.log(apiKey);

            var settings = {
                "url": `https://api.imgbb.com/1/upload?key=${apiKey}`,
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
                            $(`#uploadProgressBar${id}`)
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
                $(`#profilePictureUrl${id}`).val(response_json.data.url);
                // After the image is uploaded, submit the form with the image URL
                uploaded = true;
                $(`#uploadProgressBar${id}`).width('0%').attr('aria-valuenow', 0).text('');
                $(".progress").hide();
            }).fail(function () {
                // Handle failures here
                $(`#uploadProgressBar${id}`).width('0%').attr('aria-valuenow', 0).text('');
                $(".progress").hide();
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
