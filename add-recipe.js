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

  // Sign in anonymously
  auth.signInAnonymously().catch((error) => {
    console.error("Error signing in anonymously:", error);
  });

  const form = document.getElementById("add-recipe-form");

  form.addEventListener("submit", (e) => {
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
        form.reset();
      })
      .catch((error) => {
        console.error("Error adding recipe:", error);
        alert("An error occurred while adding the recipe.");
      });
  });
});
