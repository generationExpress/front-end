const trackingInput =  document.getElementById("tracking-input");
const btn =  document.getElementById("tracking-button");

const form = document.querySelector("#tracking-form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log(trackingInput.value)
})


//TODO: ADD THE LOGIC OF THE TRACKING PAGE
/*IT NEEDS TO HAVE A REQUEST, IF EXISTS A TRACKING PACKAGE WITH THAT NUMBER GUIDE
I NEED TO FETCH THE DATA AND SEND THE USER TO THE OTHER PAGE WITH ALL THE DATA OF THE 
GUIDE, IF DOESNT, SHOW THE ERROR MESSAGE */