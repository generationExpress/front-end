const trackingGuideId =  document.getElementById("tracking-input");
const btn =  document.getElementById("tracking-button");


btn.addEventListener("click", (e) => {
  e.preventDefault();
  console.log(trackingGuideId.value)
  
})

//TODO: ADD THE LOGIC OF THE TRACKING PAGE
/*IT NEEDS TO HAVE A REQUEST, IF EXISTS A TRACKING PACKAGE WITH THAT NUMBER GUIDE
I NEED TO FETCH THE DATA AND SEND THE USER TO THE OTHER PAGE WITH ALL THE DATA OF THE 
GUIDE, IF DOESNT, SHOW THE ERROR MESSAGE */