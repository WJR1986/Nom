function showAlert(message, type = "success") {
  const alertContainer = document.getElementById("alert-container");
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.role = "alert";
  alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
  alertContainer.appendChild(alert);

  // Automatically remove the alert after 5 seconds
  setTimeout(() => {
    alert.classList.remove("show");
    alert.classList.add("hide");
    setTimeout(() => alert.remove(), 500);
  }, 5000);
}

function createModal(modalId, modalTitle, modalBody, modalFooter) {
  // Remove existing modal if it exists
  const existingModal = document.getElementById(modalId);
  if (existingModal) {
    existingModal.remove();
  }

  const modalTemplate = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="${modalId}Label">${modalTitle}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              ${modalBody}
            </div>
            <div class="modal-footer">
              ${modalFooter}
            </div>
          </div>
        </div>
      </div>
    `;

  document.body.insertAdjacentHTML("beforeend", modalTemplate);
  const modalElement = document.getElementById(modalId);
  const modalInstance = new bootstrap.Modal(modalElement);

  modalElement.addEventListener("hidden.bs.modal", () => {
    modalElement.remove();
  });

  return modalInstance;
}

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

  const plannerContainer = document.getElementById("meal-planner");
  const recipeModalElement = document.getElementById("recipeModal");
  const recipeModalBody = document.getElementById("recipeModalBody");
  const generateShoppingListBtn = document.getElementById(
    "generate-shopping-list-btn"
  );
  const shoppingListModalElement = document.getElementById("shoppingListModal");
  const shoppingListModalBody = document.getElementById(
    "shoppingListModalBody"
  );
  const deletePlanBtn = document.getElementById("delete-plan-btn");
  const loadPlanBtn = document.getElementById("load-plan-btn");
  const savePlanBtn = document.getElementById("save-plan-btn");

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const mealPlan = JSON.parse(localStorage.getItem("mealPlan")) || {};

  let recipes = [];
  let pantryIngredients = [];

  function initializeMealPlanner() {
    plannerContainer.innerHTML = "";
    const isMobileView = window.matchMedia("(max-width: 767px)").matches;

    // Load recipes from the database
    db.collection("recipes")
      .get()
      .then((querySnapshot) => {
        recipes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        days.forEach((day, index) => {
          plannerContainer.innerHTML += `
          <div class="col-md-4 mb-3">
            <div class="card">
              <div class="card-header" id="heading${index}">
                <h5 class="mb-0">
                  <button class="btn btn-link ${
                    isMobileView ? "custom-mobile-color" : "d-none"
                  }" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="true" aria-controls="collapse${index}">
                    ${day}
                  </button>
                  <span class="${isMobileView ? "d-none" : ""}">${day}</span>
                </h5>
              </div>
              <div id="collapse${index}" class="collapse ${
            isMobileView ? "" : "show"
          }" aria-labelledby="heading${index}" data-bs-parent="#meal-planner">
                <div class="card-body">
                  ${createMealSelect(day, "breakfast", recipes)}
                  ${createMealSelect(day, "lunch", recipes)}
                  ${createMealSelect(day, "dinner", recipes)}
                </div>
              </div>
            </div>
          </div>
        `;
        });

        document.querySelectorAll(".meal-select").forEach((select) => {
          select.addEventListener("change", handleMealSelectChange);
        });

        document.querySelectorAll(".view-recipe-btn").forEach((button) => {
          button.addEventListener("click", handleViewRecipeClick);
        });
      })
      .catch((error) => {
        console.error("Error loading recipes: ", error);
        showAlert("Error loading recipes: " + error.message, "danger");
      });
  }

  function handleViewRecipeClick(e) {
    const recipeId = e.target.dataset.recipeId;
    const selectedRecipe = recipes.find((recipe) => recipe.id === recipeId);

    if (selectedRecipe) {
      recipeModalBody.innerHTML = `
        <h3>${selectedRecipe.name}</h3>
        <p><strong>Preparation Time:</strong> ${
          selectedRecipe.preparationTime || "N/A"
        }</p>
        <p><strong>Cooking Time:</strong> ${
          selectedRecipe.cookingTime || "N/A"
        }</p>
        <h5>Ingredients:</h5>
        <ul>
          ${selectedRecipe.ingredients
            .map((ingredient) => `<li>${ingredient}</li>`)
            .join("")}
        </ul>
        <h5>Steps:</h5>
        <ol>
          ${selectedRecipe.steps.map((step) => `<li>${step}</li>`).join("")}
        </ol>
      `;
      if (recipeModal) {
        recipeModal.show();
      } else {
        console.error("Modal is not initialized");
      }
    } else {
      console.error("Recipe not found");
    }
  }

  function createMealSelect(day, meal, recipes) {
    const selectedRecipe = mealPlan[day] && mealPlan[day][meal];
    return `
    <h5 class="py-2">${capitalize(meal)}</h5>
    <select class="form-select meal-select" data-day="${day}" data-meal="${meal}">
      <option value="">Select a recipe</option>
      ${recipes
        .map(
          (recipe) =>
            `<option value="${recipe.id}" ${
              selectedRecipe && selectedRecipe.id === recipe.id
                ? "selected"
                : ""
            }>${recipe.name}</option>`
        )
        .join("")}
    </select>
    <button class="btn btn-outline-dark btn-sm py-1 mb-2 mt-2 view-recipe-btn" data-meal="${meal}" data-recipe-id="${
      selectedRecipe ? selectedRecipe.id : ""
    }" ${selectedRecipe ? "" : "disabled"}>
      View Recipe
    </button>
  `;
  }

  function handleMealSelectChange(e) {
    const day = e.target.getAttribute("data-day");
    const meal = e.target.getAttribute("data-meal");
    const recipeId = e.target.value;

    if (!mealPlan[day]) {
      mealPlan[day] = {};
    }

    if (recipeId) {
      const selectedRecipe = recipes.find((recipe) => recipe.id === recipeId);
      mealPlan[day][meal] = selectedRecipe;
    } else {
      delete mealPlan[day][meal];
    }

    localStorage.setItem("mealPlan", JSON.stringify(mealPlan));

    const viewButton = e.target.parentElement.querySelector(
      `.view-recipe-btn[data-meal="${meal}"]`
    );
    if (recipeId) {
      viewButton.dataset.recipeId = recipeId;
      viewButton.disabled = false;
    } else {
      viewButton.disabled = true;
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function generateShoppingList() {
    const shoppingList = {};

    Object.values(mealPlan).forEach((meals) => {
      Object.values(meals).forEach((recipe) => {
        recipe.ingredients.forEach((ingredient) => {
          const match = ingredient.match(
            /^(\d+(\.\d+)?(-\d+(\.\d+)?)?)\s*([a-zA-Z]*)\s+(.*)$/
          );
          if (match) {
            const quantity = parseQuantity(match[1].trim());
            const unit = match[5].trim();
            const ingredientName = normalizeIngredientName(match[6].trim());
            const key = `${unit} ${ingredientName}`.trim();
            if (shoppingList[key]) {
              shoppingList[key] += quantity;
            } else {
              shoppingList[key] = quantity;
            }
          } else {
            console.error("Ingredient format not recognized:", ingredient);
          }
        });
      });
    });

    // Fetch pantry ingredients
    fetchPantryIngredients().then(() => {
      const aggregatedShoppingList = Object.entries(shoppingList).map(
        ([ingredient, quantity]) => {
          const pantryItem = pantryIngredients.find(
            (pantryItem) =>
              pantryItem.name === ingredient.split(" ").slice(1).join(" ") &&
              pantryItem.unit === ingredient.split(" ")[0]
          );
          const isAvailableInPantry = pantryItem !== undefined;
          return {
            ingredient,
            quantity: quantity.toString(),
            isAvailableInPantry,
            pantryItem,
          };
        }
      );

      shoppingListModalBody.innerHTML = `
        <div class="list-group">
          ${aggregatedShoppingList
            .map(
              ({ ingredient, quantity, isAvailableInPantry }) => `
            <div class="list-group-item d-flex align-items-center ${
              isAvailableInPantry ? "text-success" : ""
            }">
              <span>${quantity} ${ingredient}${
                isAvailableInPantry ? " (in pantry)" : ""
              }</span>
            </div>
          `
            )
            .join("")}
        </div>
        <button id="copy-shopping-list-btn" class="btn btn-secondary mt-3">Copy to Clipboard</button>
        <button id="open-notes-app-btn" class="btn btn-secondary mt-3">Open Google Keep</button>
      `;

      const shoppingListModal = new bootstrap.Modal(shoppingListModalElement);
      shoppingListModal.show();

      document
        .getElementById("copy-shopping-list-btn")
        .addEventListener("click", () => {
          const listItems = document.querySelectorAll(".list-group-item span");
          const keepList = Array.from(listItems)
            .map((item) => "- " + item.textContent)
            .join("\n");

          navigator.clipboard
            .writeText(keepList)
            .then(() => {
              // Update pantry quantities
              aggregatedShoppingList.forEach(
                ({ ingredient, quantity, isAvailableInPantry, pantryItem }) => {
                  if (isAvailableInPantry) {
                    const newQuantity =
                      pantryItem.quantity - parseFloat(quantity);
                    if (newQuantity > 0) {
                      db.collection("pantry")
                        .doc(auth.currentUser.uid)
                        .collection("ingredients")
                        .doc(pantryItem.id)
                        .update({ quantity: newQuantity });
                    } else {
                      db.collection("pantry")
                        .doc(auth.currentUser.uid)
                        .collection("ingredients")
                        .doc(pantryItem.id)
                        .delete();
                    }
                  }
                }
              );

              showAlert(
                "Shopping list copied to clipboard. Pantry quantities updated.",
                "success"
              );
            })
            .catch((err) => {
              console.error("Failed to copy: ", err);
              showAlert("Failed to copy shopping list to clipboard.", "danger");
            });
        });

      document
        .getElementById("open-notes-app-btn")
        .addEventListener("click", () => {
          window.open("https://keep.google.com/", "_blank");
        });
    });
  }

  function fetchPantryIngredients() {
    return new Promise((resolve, reject) => {
      const user = auth.currentUser;
      if (user) {
        db.collection("pantry")
          .doc(user.uid)
          .collection("ingredients")
          .get()
          .then((querySnapshot) => {
            pantryIngredients = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            resolve();
          })
          .catch((error) => {
            console.error("Error loading pantry ingredients: ", error);
            showAlert(
              "Error loading pantry ingredients: " + error.message,
              "danger"
            );
            reject(error);
          });
      } else {
        showAlert("User not authenticated. Please sign in.", "warning");
        reject("User not authenticated");
      }
    });
  }

  function normalizeIngredientName(name) {
    // Remove descriptors like "crushed", "grated", etc.
    return name.replace(/,.*$/, "").trim();
  }

  function parseQuantity(quantity) {
    // Handle ranges and convert to a single number (average)
    if (quantity.includes("-")) {
      const [min, max] = quantity.split("-").map(parseFloat);
      return (min + max) / 2;
    }
    return parseFloat(quantity);
  }

  function loadMealPlanFromFirebase() {
    const user = auth.currentUser;
    if (user) {
      db.collection("mealPlans")
        .doc(user.uid)
        .collection("plans")
        .get()
        .then((querySnapshot) => {
          const mealPlans = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          showLoadMealPlanModal(mealPlans);
        })
        .catch((error) => {
          console.error("Error loading meal plans: ", error);
          showAlert("Error loading meal plans: " + error.message, "danger");
        });
    } else {
      showAlert("User not authenticated. Please sign in.", "warning");
    }
  }

  function showLoadMealPlanModal(mealPlans) {
    const modalBody = `
      <select id="mealPlanSelect" class="form-select">
        <option value="">Select a meal plan</option>
        ${mealPlans
          .map((plan) => `<option value="${plan.id}">${plan.name}</option>`)
          .join("")}
      </select>
    `;
    const modalFooter = `
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
      <button type="button" class="btn btn-primary" id="load-meal-plan-btn">Load Meal Plan</button>
      <button type="button" class="btn btn-danger" id="delete-meal-plan-btn">Delete Meal Plan</button>
    `;

    const loadMealPlanModal = createModal(
      "loadMealPlanModal",
      "Load Meal Plan",
      modalBody,
      modalFooter
    );

    loadMealPlanModal.show();

    document
      .getElementById("load-meal-plan-btn")
      .addEventListener("click", () => {
        const selectedPlanId = document.getElementById("mealPlanSelect").value;
        if (selectedPlanId) {
          loadSelectedMealPlanFromFirebase(selectedPlanId);
          loadMealPlanModal.hide();
        } else {
          showAlert("Please select a meal plan to load.", "warning");
        }
      });

    document
      .getElementById("delete-meal-plan-btn")
      .addEventListener("click", () => {
        const selectedPlanId = document.getElementById("mealPlanSelect").value;
        if (selectedPlanId) {
          if (
            confirm(
              `Are you sure you want to delete the meal plan "${selectedPlanId}"?`
            )
          ) {
            deleteMealPlanFromFirebase(selectedPlanId);
            loadMealPlanModal.hide();
          }
        } else {
          showAlert("Please select a meal plan to delete.", "warning");
        }
      });
  }

  function loadSelectedMealPlanFromFirebase(mealPlanId) {
    const user = auth.currentUser;
    if (user) {
      db.collection("mealPlans")
        .doc(user.uid)
        .collection("plans")
        .doc(mealPlanId)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const data = doc.data();
            if (data && data.mealPlan) {
              Object.assign(mealPlan, data.mealPlan);
              localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
              initializeMealPlanner();
              showAlert("Meal plan loaded successfully!", "success");
            }
          }
        })
        .catch((error) => {
          console.error("Error loading meal plan: ", error);
          showAlert("Error loading meal plan: " + error.message, "danger");
        });
    } else {
      showAlert("User not authenticated. Please sign in.", "warning");
    }
  }

  function deleteMealPlanFromFirebase(mealPlanId) {
    const user = auth.currentUser;
    if (user) {
      db.collection("mealPlans")
        .doc(user.uid)
        .collection("plans")
        .doc(mealPlanId)
        .delete()
        .then(() => {
          showAlert(
            `Meal plan "${mealPlanId}" deleted successfully!`,
            "success"
          );
        })
        .catch((error) => {
          console.error("Error deleting meal plan: ", error);
          showAlert("Error deleting meal plan: " + error.message, "danger");
        });
    } else {
      showAlert("User not authenticated. Please sign in.", "warning");
    }
  }

  function saveMealPlanToFirebase(mealPlan, mealPlanName) {
    const user = auth.currentUser;
    if (user) {
      db.collection("mealPlans")
        .doc(user.uid)
        .collection("plans")
        .add({
          mealPlan,
          name: mealPlanName,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          showAlert("Meal plan saved successfully!", "success");
        })
        .catch((error) => {
          console.error("Error saving meal plan: ", error);
          showAlert("Error saving meal plan: " + error.message, "danger");
        });
    } else {
      showAlert("User not authenticated. Please sign in.", "warning");
    }
  }

  if (
    plannerContainer &&
    recipeModalElement &&
    recipeModalBody &&
    generateShoppingListBtn &&
    shoppingListModalElement &&
    shoppingListModalBody
  ) {
    initializeMealPlanner();
    window.addEventListener("resize", initializeMealPlanner);

    let recipeModal;
    try {
      if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
        recipeModal = new bootstrap.Modal(recipeModalElement, {
          keyboard: false,
        });
      } else {
        console.error("Bootstrap Modal is not available");
      }
    } catch (error) {
      console.error("Error initializing modal:", error);
    }

    plannerContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("view-recipe-btn")) {
        const recipeId = e.target.dataset.recipeId;
        const selectedRecipe = Object.values(mealPlan)
          .flatMap((dayPlan) => Object.values(dayPlan))
          .find((recipe) => recipe.id == recipeId);

        if (selectedRecipe) {
          recipeModalBody.innerHTML = `
              <h3>${selectedRecipe.name}</h3>
              <p><strong>Preparation Time:</strong> ${
                selectedRecipe.preparationTime || "N/A"
              }</p>
              <p><strong>Cooking Time:</strong> ${
                selectedRecipe.cookingTime || "N/A"
              }</p>
              <h5>Ingredients:</h5>
              <ul>
                ${selectedRecipe.ingredients
                  .map((ingredient) => `<li>${ingredient}</li>`)
                  .join("")}
              </ul>
              <h5>Steps:</h5>
              <ol>
                ${selectedRecipe.steps
                  .map((step) => `<li>${step}</li>`)
                  .join("")}
              </ol>
            `;
          if (recipeModal) {
            recipeModal.show();
          } else {
            console.error("Modal is not initialized");
          }
        } else {
          console.log("Recipe not found");
        }
      }
    });

    generateShoppingListBtn.addEventListener("click", generateShoppingList);

    if (deletePlanBtn) {
      deletePlanBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear your meal plan?")) {
          localStorage.removeItem("mealPlan");
          showAlert("Meal plan cleared!", "success");
          location.reload();
        }
      });
    } else {
      console.error("Delete plan button not found");
    }

    if (loadPlanBtn) {
      loadPlanBtn.addEventListener("click", loadMealPlanFromFirebase);
    } else {
      console.error("Load plan button not found");
    }

    if (savePlanBtn) {
      savePlanBtn.addEventListener("click", () => {
        console.log("Save Meal Plan button clicked");
        const mealPlanName = prompt("Enter a name for your meal plan:");
        if (mealPlanName) {
          saveMealPlanToFirebase(mealPlan, mealPlanName);
        } else {
          showAlert("Meal plan name is required to save.", "warning");
        }
      });
    } else {
      console.error("Save plan button not found");
    }
  } else {
    console.error("Required elements not found");
  }
});
