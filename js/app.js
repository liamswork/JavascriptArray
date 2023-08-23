//Reference to image element. We will manipulate the SRC and ALT attributes based on the json list of objects.
const imageElement = document.getElementById('placeholder-image');

//Client ID key, and endpoint link with key interpolated into it.
const clientID = "T6KWxGFTJusthxNjkZ_VapSy7cBDFYUuNExIrQlnJFQ";
let endpoint = `https://api.unsplash.com/photos/random/?client_id=${clientID}&count=30`

//Image index, will increment when getting a different image from the list.
let imageIndex = 0;
//Image list which holds onto the 30 results fetched from upsplash.
let imageList = [];


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
//TO-DO: When index reaches imageList.length, fetch new list of images.
function newImage(){
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
        console.log("Not at the end of the image list yet.");
        imageIndex++;
    }
}

function addEmail(){
    console.log("Attempting to add email");
}

