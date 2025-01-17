document.addEventListener("DOMContentLoaded", () => {
  // Your Firebase config object
  const firebaseConfig = {
    apiKey: "AIzaSyDuVh-xD3Hf1Xzcbbis_9LebyVVFYaVf8c",
    authDomain: "recipes-4872e.firebaseapp.com",
    projectId: "recipes-4872e",
    storageBucket: "recipes-4872e.appspot.com",
    messagingSenderId: "758237483981",
    appId: "1:758237483981:web:654888328a83b0e8536a84",
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const auth = firebase.auth();

  const addRecipeForm = document.getElementById("add-recipe-form");
  const signInMessage = document.getElementById("sign-in-message");
  const recipeImageInput = document.getElementById("recipe-image");

  // Check if user is signed in
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("User is signed in:", user);
      addRecipeForm.style.display = "block";
      signInMessage.style.display = "none";
    } else {
      console.log("No user is signed in");
      addRecipeForm.style.display = "none";
      signInMessage.style.display = "block";
    }
  });

  // Handle image pasting
  recipeImageInput.addEventListener("paste", (e) => {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          recipeImageInput.value = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  });

  addRecipeForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const recipeName = document.getElementById("recipe-name").value;
    const recipeImage = document.getElementById("recipe-image").value;
    const recipeIngredients = document
      .getElementById("recipe-ingredients")
      .value.split(",");
    const recipeSteps = document
      .getElementById("recipe-steps")
      .value.split(",");
    const preparationTime = document.getElementById("preparation-time").value;
    const cookingTime = document.getElementById("cooking-time").value;

    const newRecipe = {
      name: recipeName,
      image: recipeImage,
      ingredients: recipeIngredients.map((ingredient) => ingredient.trim()),
      steps: recipeSteps.map((step) => step.trim()),
      preparationTime: preparationTime,
      cookingTime: cookingTime,
    };

    db.collection("recipes")
      .add(newRecipe)
      .then(() => {
        alert("Recipe added successfully!");
        addRecipeForm.reset();
      })
      .catch((error) => {
        console.error("Error adding recipe:", error);
        alert("An error occurred while adding the recipe.");
      });
  });
});
