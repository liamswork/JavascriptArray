//Reference to image element. We will manipulate the SRC and ALT attributes based on the json list of objects.
const imageElement = document.getElementById('placeholder-image');
//Reference to add email button. Add listener and pass event to prevent default behaviour later.
const emailButton = document.getElementById('add-email');
emailButton.addEventListener('click', function(event) {
    addEmail(event);
});

const addImageButton = document.getElementById('add-image');
addImageButton.addEventListener('click', function(event) {
    addImage(event);
});

//Reference to the email input field, we will take the value and add to the email select when validated.
const emailField = document.getElementById('email');
//The email select dropdown which will be populated after validation of emails.
const emailSelect = document.getElementById('email-list');

//Client ID key, and endpoint link with key interpolated into it.
const clientID = "T6KWxGFTJusthxNjkZ_VapSy7cBDFYUuNExIrQlnJFQ";
let endpoint = `https://api.unsplash.com/photos/random/?client_id=${clientID}&count=30`

//Image index, will increment when getting a different image from the list.
let imageIndex = 0;
//Image list which holds onto the 30 results fetched from upsplash.
let imageList = [];
//Email array
let emailArray = [];


//Fetch initial list of images. Call this function whenever we exhaust the list of 30 images. Disable this line when not working on JS functionality
//As there is a fetchlimit of 50 requests per hour.
//fetchImages();
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
        //console.log("Displaying image @" + imageIndex)
    }
    if(imageIndex == imageList.length){
        //console.log("End of the image list. Fetching new list and restarting index.");
        imageIndex = 0;
        fetchImages();
    }else{
        //console.log("Not at the end of the image list yet.");
        imageIndex++;
    }
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
        let newOption = document.createElement('option');
        newOption.textContent = emailInput;
        emailSelect.appendChild(newOption);
        emailArray.push(emailInput);
        console.log(emailArray);
    }else{
        console.log("INVALID EMAIL")
    }
}

function addImage(event){

}



