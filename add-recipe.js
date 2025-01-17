document.addEventListener("DOMContentLoaded", () => {
  const addRecipeForm = document.getElementById("add-recipe-form");
  const signInMessage = document.getElementById("sign-in-message");
  const ingredientsContainer = document.getElementById("ingredients-container");
  const addIngredientBtn = document.getElementById("add-ingredient-btn");
  const stepsContainer = document.getElementById("steps-container");
  const addStepBtn = document.getElementById("add-step-btn");

  // Initialize Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyDuVh-xD3Hf1Xzcbbis_9LebyVVFYaVf8c",
    authDomain: "recipes-4872e.firebaseapp.com",
    projectId: "recipes-4872e",
    storageBucket: "recipes-4872e.appspot.com",
    messagingSenderId: "758237483981",
    appId: "1:758237483981:web:654888328a83b0e8536a84",
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const auth = firebase.auth();

  auth.onAuthStateChanged((user) => {
    if (user) {
      signInMessage.style.display = "none";
      addRecipeForm.style.display = "block";
    } else {
      signInMessage.style.display = "block";
      addRecipeForm.style.display = "none";
    }
  });

  addIngredientBtn.addEventListener("click", () => {
    const ingredientInputGroup = document.createElement("div");
    ingredientInputGroup.className = "input-group mb-2";
    ingredientInputGroup.innerHTML = `
      <input type="number" class="form-control ingredient-quantity" placeholder="Quantity" required>
      <select class="form-select ingredient-unit">
        <option value="">Unit</option>
        <option value="g">grams</option>
        <option value="ml">mls</option>
        <option value="litres">litres</option>
        <option value="cups">cups</option>
        <option value="tbsp">tbsp</option>
        <option value="tsp">tsp</option>
        <option value="pcs">pieces</option>
      </select>
      <input type="text" class="form-control ingredient-input" placeholder="Enter ingredient" required>
      <button type="button" class="btn btn-outline-secondary remove-ingredient-btn">&times;</button>
    `;
    ingredientsContainer.appendChild(ingredientInputGroup);
  });

  addStepBtn.addEventListener("click", () => {
    const stepInputGroup = document.createElement("div");
    stepInputGroup.className = "input-group mb-2";
    stepInputGroup.innerHTML = `
      <input type="text" class="form-control step-input" placeholder="Enter step" required>
      <button type="button" class="btn btn-outline-secondary remove-step-btn">&times;</button>
    `;
    stepsContainer.appendChild(stepInputGroup);
  });

  ingredientsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-ingredient-btn")) {
      e.target.parentElement.remove();
    }
  });

  stepsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-step-btn")) {
      e.target.parentElement.remove();
    }
  });

  addRecipeForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const recipeName = document.getElementById("recipe-name").value;
    const recipeImage = document.getElementById("recipe-image").value;
    const preparationTime = document.getElementById("preparation-time").value;
    const cookingTime = document.getElementById("cooking-time").value;

    const ingredients = Array.from(
      document.querySelectorAll(".ingredient-input")
    ).map((input, index) => {
      const quantity = document.querySelectorAll(".ingredient-quantity")[index]
        .value;
      const unit = document.querySelectorAll(".ingredient-unit")[index].value;
      return `${quantity} ${unit} ${input.value}`.trim();
    });
    const steps = Array.from(document.querySelectorAll(".step-input")).map(
      (input) => input.value
    );

    const recipe = {
      name: recipeName,
      image: recipeImage,
      ingredients: ingredients,
      steps: steps,
      preparationTime: preparationTime,
      cookingTime: cookingTime,
    };

    const user = auth.currentUser;
    if (user) {
      db.collection("recipes")
        .add(recipe)
        .then(() => {
          showAlert("Recipe added successfully!", "success");
          addRecipeForm.reset();
          ingredientsContainer.innerHTML = `
            <div class="input-group mb-2">
              <input type="number" class="form-control ingredient-quantity" placeholder="Quantity" required>
              <select class="form-select ingredient-unit">
                <option value="">Unit</option>
                <option value="g">grams</option>
                <option value="ml">mls</option>
                <option value="litres">litres</option>
                <option value="cups">cups</option>
                <option value="tbsp">tbsp</option>
                <option value="tsp">tsp</option>
                <option value="pcs">pieces</option>
              </select>
              <input type="text" class="form-control ingredient-input" placeholder="Enter ingredient" required>
              <button type="button" class="btn btn-outline-secondary remove-ingredient-btn">&times;</button>
            </div>
          `;
          stepsContainer.innerHTML = `
            <div class="input-group mb-2">
              <input type="text" class="form-control step-input" placeholder="Enter step" required>
              <button type="button" class="btn btn-outline-secondary remove-step-btn">&times;</button>
            </div>
          `;
        })
        .catch((error) => {
          console.error("Error adding recipe: ", error);
          showAlert("Error adding recipe: " + error.message, "danger");
        });
    } else {
      showAlert("User not authenticated. Please sign in.", "warning");
    }
  });

  function showAlert(message, type) {
    const alertContainer = document.createElement("div");
    alertContainer.className = `alert alert-${type} alert-dismissible fade show`;
    alertContainer.role = "alert";
    alertContainer.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.insertAdjacentElement("afterbegin", alertContainer);

    setTimeout(() => {
      alertContainer.classList.remove("show");
      alertContainer.classList.add("hide");
      setTimeout(() => alertContainer.remove(), 500);
    }, 5000);
  }
});
