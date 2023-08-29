document.addEventListener("DOMContentLoaded", function() {

    //Event listeners
    const emailButton = document.getElementById('add-email');
    emailButton.addEventListener('click', function(event) {
        addEmail(event);
    });
    const addImageButton = document.getElementById('add-image');
    addImageButton.addEventListener('click', function(event) {
        addImage(event);
    });

    const newImageButton = document.getElementById('new-image');
    newImageButton.addEventListener('click', function(event) {
        newImage(event);
    });

  

    //Reference to image element. We will manipulate the SRC and ALT attributes based on the json list of objects.
    const imageElement = document.getElementById('placeholder-image');
    //Reference to the email input field, we will take the value and add to the email select when validated.
    const emailField = document.getElementById('email');
    //The email select dropdown which will be populated after validation of emails.
    const emailSelect = document.getElementById('email-list');
    //Reference to the status text
    const statusText = document.getElementById('status');
    //Reference to receieved image container to append images to
    const receivedContainer = document.getElementById('received');

    //Client ID key, and endpoint link with key interpolated into it.
    const clientID = "T6KWxGFTJusthxNjkZ_VapSy7cBDFYUuNExIrQlnJFQ";
    let endpoint = `https://api.unsplash.com/photos/random/?client_id=${clientID}&count=30`

    //Image index, will increment when getting a different image from the list.
    let imageIndex = 0;
    //Image list which holds onto the 30 results fetched from upsplash.
    let imageList = [];
    //Email array
    let userArray = [];

    //Fetch initial list of images. Call this function whenever we exhaust the list of 30 images. Disable this line when not working on JS functionality
    //As there is a fetchlimit of 50 requests per hour.
    fetchImages();
    function fetchImages(){
        fetch(endpoint)
        .then(function (response){
            return response.json();
        })
        .then(function (jsonData){
            console.log(jsonData);
            imageList = jsonData;
            newImage();
        })
        .catch(function (error){
            console.log("error: " + error);
        })
    }

    //Display image at current index. Index is incremented by button click.
    function newImage(){
        //If there are images in the list, and our index is less than the length of the list
        //then assign the current image at the list index to the image element.
        if(imageList.length > 0 && imageIndex < imageList.length){
            const currentImage = imageList[imageIndex];
            imageElement.src = currentImage.urls.regular;
            imageElement.alt = currentImage.description;
            console.log("Displaying image @" + imageIndex)
        }
        if(imageIndex == imageList.length){
            console.log("End of the image list. Fetching new list and restarting index.");
            imageIndex = 0;
            fetchImages();
        }else{
            //console.log("Not at the end of the image list yet.");
            imageIndex++;
        }
        console.log(imageList);
    }

    //This function is called when the "Add Email" button is pressed.
    //Default behaviour for the form button is prevented, then the email is validated.
    //If validation is successful, the email is added to an array of emails accessible by a dropdown menu.
    //If unsuccessful, an error message is added.
    function addEmail(event){
        //Prevent page refresh
        event.preventDefault();
        //Update emailInput value with current field value.
        let emailInput = emailField.value;

        if(isValidEmail(emailInput)){
            if(isUniqueEmail(emailInput)){
            //Create new select option
            let newOption = document.createElement('option');
            newOption.textContent = emailInput;
            emailSelect.appendChild(newOption);
            createUser(emailInput);
            //Remove disabled option if it exists, so the select index matches the array.
            var disabledOption = emailSelect.querySelector('option[disabled]');
            if (disabledOption) {
                emailSelect.removeChild(disabledOption);
            }
            updateStatus("Email added!", "success");
            }else{
                updateStatus("Duplicate email", "error");
            }
        }else{
            updateStatus("Invalid email format", "error");
        }
    }

    //Adds image to Currently selected email.
    function addImage(event){
        event.preventDefault();
        if(userArray.length === 0){
            updateStatus("Please add an email to begin.", "error");
        }else{
            //Currently selected context variables.
            const selectedIndex = emailSelect.selectedIndex;
            const selectedEmail = emailSelect.options[selectedIndex].value;
            const selectedEmailObj = userArray.find(obj => obj.email === selectedEmail)
            const imageUrl = imageList[imageIndex - 1].urls.regular;
            if(selectedEmailObj){
                if(isUniqueImage(selectedEmailObj,imageUrl)){
                    selectedEmailObj.images.push(imageUrl);
                    updateStatus("New image added!", "success");
                    updateImages(imageUrl);
                }else{
                    updateStatus("Duplicate image.", "error")
                }
            }

        }
    }

    //Creates a new user object, taking the email as a parameter.
    function createUser(uemail){
        var newuser = {
            email: `${uemail}`,
            images: []
        };
        userArray.push(newuser);
        console.log(newuser);
        updateStatus("New email added!", "success");
    }

    //Checks to see if any of the user objects contains the supplied email.
    function isUniqueEmail(uemail){
        if(userArray.length > 0){
            var isUnique = true;
            userArray.forEach(function(emailObj){
                if(emailObj.email === uemail){
                    isUnique = false;
                }
            });
            return isUnique;
        }else{
            return true;
        }
    }

    //Checks to see if the image is assigned to the current email.
    function isUniqueImage(obj,urlToCheck){
        var isUnique = true;
        obj.images.forEach(function(url){
            if(url === urlToCheck){
                isUnique = false
            }
        });
        return isUnique;
    }

    //Pass a status message to this function, and it will update the status text.
    //May possibly take a second parameter "state", for error/success. Colours depending on argument passed.
    function updateStatus(statusMessage, style){

        if(style){
            if(style === "error"){
                statusText.style.color = "red";
            }else if(style === "success"){
                statusText.style.color = "green";
            }else{
                statusText.style.color = "blue";
                statusText.innerHTML = "UNRECOGNISED ERROR TYPE.";
                console.log("Unrecognised style passed: ", style);
            }
        }else{
            statusText.style.color = "white";
        }
        statusText.innerHTML = statusMessage;
    }

    function updateImages(src){
        const newImg = document.createElement("img");

        newImg.src = src;
        //img.alt = 
        console.log(newImg);
        receivedContainer.appendChild(newImg);
    }

});