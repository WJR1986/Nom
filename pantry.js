document.addEventListener("DOMContentLoaded", () => {
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

  const pantryForm = document.getElementById("pantry-form");
  const pantryList = document.getElementById("pantry-list");
  const ingredientInput = document.getElementById("ingredient-name");

  let ingredientsList = [];

  // Load the JSON file for auto-suggestions
  fetch("unique_ingredients.json")
    .then((response) => response.json())
    .then((data) => {
      ingredientsList = data.ingredients;
      applyAutoSuggestion(ingredientInput);
    })
    .catch((error) => console.error("Error loading ingredients:", error));

  auth.onAuthStateChanged((user) => {
    if (user) {
      loadPantry();
    } else {
      alert("Please sign in to manage your pantry.");
    }
  });

  pantryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const ingredientName = document.getElementById("ingredient-name").value;
    const ingredientQuantity = document.getElementById(
      "ingredient-quantity"
    ).value;
    const ingredientUnit = document.getElementById("ingredient-unit").value;

    const ingredient = {
      name: ingredientName,
      quantity: parseFloat(ingredientQuantity),
      unit: ingredientUnit,
    };

    const user = auth.currentUser;
    if (user) {
      db.collection("pantry")
        .doc(user.uid)
        .collection("ingredients")
        .add(ingredient)
        .then(() => {
          alert("Ingredient added to pantry!");
          pantryForm.reset();
          loadPantry();
        })
        .catch((error) => {
          console.error("Error adding ingredient: ", error);
          alert("Error adding ingredient: " + error.message);
        });
    } else {
      alert("User not authenticated. Please sign in.");
    }
  });

  function loadPantry() {
    const user = auth.currentUser;
    if (user) {
      db.collection("pantry")
        .doc(user.uid)
        .collection("ingredients")
        .get()
        .then((querySnapshot) => {
          pantryList.innerHTML = "";
          querySnapshot.forEach((doc) => {
            const ingredient = doc.data();
            const ingredientItem = document.createElement("div");
            ingredientItem.className = "list-group-item";
            ingredientItem.innerHTML = `
              <span>${ingredient.quantity} ${ingredient.unit} ${ingredient.name}</span>
              <button class="btn btn-outline-danger btn-sm py-0 px-1" data-id="${doc.id}">&times;</button>
            `;
            pantryList.appendChild(ingredientItem);
          });

          document.querySelectorAll(".btn-outline-danger").forEach((button) => {
            button.addEventListener("click", (e) => {
              const ingredientId = e.target.getAttribute("data-id");
              deleteIngredient(ingredientId);
            });
          });
        })
        .catch((error) => {
          console.error("Error loading pantry: ", error);
          alert("Error loading pantry: " + error.message);
        });
    } else {
      alert("User not authenticated. Please sign in.");
    }
  }

  function deleteIngredient(ingredientId) {
    const user = auth.currentUser;
    if (user) {
      db.collection("pantry")
        .doc(user.uid)
        .collection("ingredients")
        .doc(ingredientId)
        .delete()
        .then(() => {
          alert("Ingredient removed from pantry!");
          loadPantry();
        })
        .catch((error) => {
          console.error("Error removing ingredient: ", error);
          alert("Error removing ingredient: " + error.message);
        });
    } else {
      alert("User not authenticated. Please sign in.");
    }
  }

  function applyAutoSuggestion(ingredientInput) {
    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.className = "autocomplete-suggestions";
    ingredientInput.parentNode.appendChild(suggestionsContainer);

    ingredientInput.addEventListener("input", () => {
      const query = ingredientInput.value.toLowerCase();
      suggestionsContainer.innerHTML = "";
      if (query.length > 0) {
        const filteredIngredients = ingredientsList.filter((ingredient) =>
          ingredient.toLowerCase().includes(query)
        );
        filteredIngredients.forEach((ingredient) => {
          const suggestionItem = document.createElement("div");
          suggestionItem.className = "suggestion-item";
          suggestionItem.textContent = ingredient;
          suggestionItem.addEventListener("click", () => {
            ingredientInput.value = ingredient;
            suggestionsContainer.innerHTML = "";
          });
          suggestionsContainer.appendChild(suggestionItem);
        });
      }
    });

    // Hide suggestions when clicking outside
    document.addEventListener("click", (event) => {
      if (
        !suggestionsContainer.contains(event.target) &&
        event.target !== ingredientInput
      ) {
        suggestionsContainer.innerHTML = "";
      }
    });

    // Style the suggestions container
    suggestionsContainer.style.position = "absolute";
    suggestionsContainer.style.backgroundColor = "#fff";
    suggestionsContainer.style.border = "1px solid #ccc";
    suggestionsContainer.style.zIndex = "1000";
    suggestionsContainer.style.width = `${ingredientInput.offsetWidth}px`;
    suggestionsContainer.style.maxHeight = "150px"; // Set max height
    suggestionsContainer.style.overflowY = "auto"; // Enable vertical scrolling

    // Position the suggestions container below the input field
    ingredientInput.addEventListener("focus", () => {
      const rect = ingredientInput.getBoundingClientRect();
      suggestionsContainer.style.top = `${
        ingredientInput.offsetTop + ingredientInput.offsetHeight
      }px`;
      suggestionsContainer.style.left = `${ingredientInput.offsetLeft}px`;
    });

    // Adjust the position on window resize
    window.addEventListener("resize", () => {
      suggestionsContainer.style.width = `${ingredientInput.offsetWidth}px`;
      suggestionsContainer.style.top = `${
        ingredientInput.offsetTop + ingredientInput.offsetHeight
      }px`;
      suggestionsContainer.style.left = `${ingredientInput.offsetLeft}px`;
    });
  }
});
