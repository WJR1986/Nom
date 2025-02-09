import { showAlert } from "./alert.js";
import { createModal } from "./modal.js";
import {
  db,
  auth,
  fetchPantryIngredients,
  saveMealPlanToFirebase,
  loadMealPlanFromFirebase,
  deleteMealPlanFromFirebase,
} from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
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
    fetchPantryIngredients().then((pantryIngredients) => {
      const aggregatedShoppingList = Object.entries(shoppingList).map(
        ([ingredient, quantity]) => {
          const pantryItem = pantryIngredients.find(
            (pantryItem) =>
              pantryItem.name === ingredient.split(" ").slice(1).join(" ") &&
              normalizeUnit(pantryItem.unit) ===
                normalizeUnit(ingredient.split(" ")[0])
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

  function normalizeUnit(unit) {
    // Normalize units to handle variations like "pcs" and "x"
    if (unit === "pcs" || unit === "x") {
      return "pcs";
    }
    return unit;
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
      loadPlanBtn.addEventListener("click", () => {
        loadMealPlanFromFirebase()
          .then((mealPlans) => {
            showLoadMealPlanModal(mealPlans);
          })
          .catch((error) => {
            console.error("Error loading meal plans: ", error);
            showAlert("Error loading meal plans: " + error.message, "danger");
          });
      });
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
