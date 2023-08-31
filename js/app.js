document.addEventListener("DOMContentLoaded", function() {

    //Event listeners//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Add email button listener
    const emailButton = document.getElementById('add-email');
    emailButton.addEventListener('click', function(event) {
        addEmail(event);
    });
    //Add image button listener
    const addImageButton = document.getElementById('add-image');
    addImageButton.addEventListener('click', function(event) {
        addImage(event);
    });
    //New image button listener
    const newImageButton = document.getElementById('new-image');
    newImageButton.addEventListener('click', function(event) {
        newImage(event);
    });
    //Help tooltip listener
    const helpButton = document.getElementById('help');
    helpButton.addEventListener('click', function(event) {
        toggleHelp(event);
    });
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //References to elements that I will use multiple times. Single use elements are referenced only where appropriate.////////////////////
    //Reference to image element. We will manipulate the SRC and ALT attributes based on the json list of objects.
    const imageElement = document.getElementById('placeholder-image');
    //Reference to the email input field, we will take the value and add to the email select when validated.
    const emailField = document.getElementById('email');
    //The email select dropdown which will be populated after validation of emails.
    const emailSelect = document.getElementById('email-list');
    //Reference to the status text
    const statusText = document.getElementById('status');
    //Reference to image element. We will manipulate the SRC and ALT attributes based on the json list of objects.
    const mainContainer = document.getElementById('main-container');
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //Client ID key, and endpoint link with key interpolated into it.//////////////////////////////////////////////////////////////////////
    const clientID = "T6KWxGFTJusthxNjkZ_VapSy7cBDFYUuNExIrQlnJFQ";
    let endpoint = `https://api.unsplash.com/photos/random/?client_id=${clientID}&count=30`
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //Image index, will increment when getting a different image from the list.
    let imageIndex = 0;
    //Image list which holds onto the 30 results fetched from upsplash.
    let imageList = [];
    //Email array
    let userArray = [];

    //Fetch initial list of images. Call this function whenever we exhaust the list of 30 images. Disable this line when not working on JS functionality
    //As there is a fetchlimit of 50 requests per hour.
    fetchImages();

    //Fetch function that receives a response of 30 images. We parse this response to json and store it in imageList[]. New image is called when this happens.
    function fetchImages(){
        fetch(endpoint)
        .then(function (response){
            return response.json();
        })
        .then(function (jsonData){
            imageList = jsonData;
            newImage();
        })
        .catch(function (error){
            console.log("error: " + error);
        })
    }

    //Display image at current imageList[] index. Index is incremented by button click.
    function newImage(){
        //If there are images in the list, and our index is less than the length of the list
        //then assign the current image at the list index to the image element.
        if(imageList.length > 0 && imageIndex < imageList.length){
            const currentImage = imageList[imageIndex];
            imageElement.src = currentImage.urls.regular;
            imageElement.alt = currentImage.description;
        }
        //If we've reached the end of the list, fetch a new list.
        if(imageIndex == imageList.length){
            imageIndex = 0;
            fetchImages();
        }else{
            imageIndex++;
        }
    }

    //Add email. This takes the input, decides if the email is valid && unique, if so, creates a new user and new option to select when needed.
    function addEmail(event){
        event.preventDefault();
        //Update emailInput value with current field value.
        let emailInput = emailField.value;

        if(isValidEmail(emailInput)){
            if(isUniqueEmail(emailInput)){
                let newOption = document.createElement('option');               //Create new option in the dom.
                newOption.textContent = emailInput;                             //Set the content of the new option to what was submitted in the input.
                newOption.value = emailInput;                                   //Set the value to the same.
                emailSelect.appendChild(newOption);                             //Append this option to the option list.
                emailSelect.value = emailInput;                                 //Select the newest option, feels more intuitive but this part is not mandatory.
                createUser(emailInput);                                         //Create a new user object. Passing this email will set the objects email property.
                updateStatus("Email added!", "success");
                //Remove disabled option if it exists, so the select index matches the array.
                var disabledOption = emailSelect.querySelector('option[disabled]');
                if (disabledOption) {
                    emailSelect.removeChild(disabledOption);
                }
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
        //Prevents adding images to non existant email.
        if(userArray.length === 0){
            updateStatus("Please add an email to begin.", "error");
        }else{
            const selectedIndex = emailSelect.selectedIndex;                                //Takes the index of whatever option is currently selected.
            const selectedEmail = emailSelect.options[selectedIndex].value;                 //Get the value of that option.
            const selectedEmailObj = userArray.find(obj => obj.email === selectedEmail)     //Find the object that the email belongs to.
            const imageUrl = imageList[imageIndex - 1].urls.regular;                        //Get the url of the image we are currently selecting. -1 because we increment index elsewhere.

            if(selectedEmailObj){
                if(isUniqueImage(selectedEmailObj,imageUrl)){                               //If the image is unique to this user
                    selectedEmailObj.images.push(imageUrl);                                 //Add this image objects URL to the user.
                    updateImages(selectedIndex);                                            //Refresh the image display box for this user.
                    updateStatus("New image added!", "success");        

                }else{
                    updateStatus("Duplicate image.", "error")
                }
            }

        }
    }

    function updateImages(boxindex){
        //Clear current box
        const currentBox = document.getElementById(`box-${boxindex}`);
        currentBox.innerHTML = '';

        //Whatever index was passed to us, will be the user we update. If we updated all users, may cause load time issues with high image count.
        const currentUser = userArray[boxindex];

        //Loop each image within user
        for(let j = 0; j < currentUser.images.length; j++){
            const newImg = document.createElement("img");               //Create a new element in the dom.
            newImg.src = currentUser.images[j];                         //Set the src attribute to the respective indexed image in the user object image list
            currentBox.appendChild(newImg);                             //Add the image to the end of the image box.
            newImg.addEventListener('click',                            //Add an event listener to remove this if the user chooses. Called with a click.
            function(){
                removeImage(j,currentUser)
            });
        }
        
    }

    //Listener added by updateImages(). When image is clicked, it is removed and the image is spliced.
    function removeImage(jindex,user) {
        const userIndex = userArray.indexOf(user);                   //Get current users index
        user.images.splice(jindex, 1);                               //Splice the image from the index passed in from updateImages() (jindex)
        updateImages(userIndex);                                     //Call the update function to loop and display the images belonging to this user.
        updateStatus("Image removed!", "success")
    }

    //Checks to see if any of the user objects contains the supplied email.
    function isUniqueEmail(uemail){
        //If we have a user to check.
        if(userArray.length > 0){
            var isUnique = true;                        //Start as true, until told otherwise.
            userArray.forEach(function(emailObj){       //Loop through each email in the array, passing the object to a comparison check
                if(emailObj.email === uemail){          //If this the email currently selected in the email list matches our new email
                    isUnique = false;                   //set return value as false (returned after loop) and fail the check
                }
            });
            return isUnique;
        }else{
            return true;
        }
    }

    //Checks to see if the image is assigned to the current email.
    function isUniqueImage(obj,urlToCheck){
        var isUnique = true;                                    //Start as unique until stated otherwise.
        obj.images.forEach(function(url){                       //Each image url in the object
            if(url === urlToCheck){                             //Check current url against the url we've been given to check.
                isUnique = false                                //If it is equal, set return value to false, returned at the end of loop.
            }
        });
        return isUnique;
    }

    //Pass a status message to this function, and it will update the status text. Second parameter determines colour of message. Current accepts "error" and "success"
    function updateStatus(statusMessage, style){
        if(style){
            if(style === "error"){
                statusText.style.color = "red";                         //Set status to red because it's an error
                statusText.classList.add("updated-error");              //Add style class "updated error" which adds a glow to the text.
                setTimeout(function() {                                 //Remove the "updated error" class after .5 seconds.
                    statusText.classList.remove("updated-error");       
                }, 500);    
            }else if(style === "success"){                              //Same as above, but green.
                statusText.style.color = "green";
                statusText.classList.add("updated-success");
                setTimeout(function() {
                    statusText.classList.remove("updated-success");
                }, 500);
            }else{                                                      //If there is a blue message, it's an unexpected error type.
                statusText.style.color = "blue";
                statusText.innerHTML = "UNRECOGNISED ERROR TYPE.";
            }
        }else{
            statusText.style.color = "white";                           //Default status text to white when page loads.
        }
        statusText.innerHTML = statusMessage;                           //Set status message to whatever message was passed to us.
 
    }

    //Creates a new user object, taking the email as a parameter.
    function createUser(uemail, uindex){
        //Create a new user object with the email given to us, and start an empty array of images.
        var newuser = {
            email: `${uemail}`,
            images: []
        };
        //Push the new user to the userArray[].
        userArray.push(newuser);
        updateStatus("New email added!", "success");
        //Insert HTML which will display the users box. This interpolates the user email as the box title, and also the index of the user as the id of the image container.
        //The image container ID  (e.g. box-0 for the first user), will be how we reference it, and append images to it.
        mainContainer.insertAdjacentHTML(
            'beforeend',
            `<!--Images received box-->
            <div class="image-receiver">
                <p>${uemail}</p>    
                <div class="received-container" id="box-${userArray.length - 1}">
    
                </div>
            </div>`
        );
    }

    //Toggle help function that toggles the class "tooltip-shown". The shown class moves the position of the tooltip display onto the screen. When removed, it goes off the screen with a transition.
    function toggleHelp(){
        const tooltipdisplay = document.getElementById('tooltiptext');
        tooltipdisplay.classList.toggle("tooltip-shown");
        console.log("toggling help display");
    }
});