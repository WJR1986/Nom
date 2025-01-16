document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded event fired"); // Debugging log

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

  if (
    plannerContainer &&
    recipeModalElement &&
    recipeModalBody &&
    generateShoppingListBtn &&
    shoppingListModalElement &&
    shoppingListModalBody
  ) {
    console.log("Elements found"); // Debugging log

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

    console.log("Meal plan:", mealPlan); // Debugging log

    // Initialize meal planner
    plannerContainer.innerHTML = ""; // Clear container before populating
    days.forEach((day) => {
      plannerContainer.innerHTML += `
              <div class="col-md-4 mb-3">
                  <div class="card">
                      <div class="card-header">${day}</div>
                      <div class="card-body">
                          <h5>Breakfast</h5>
                          <select class="form-select meal-select" data-day="${day}" data-meal="breakfast">
                              <option value="">Select a recipe</option>
                              ${
                                mealPlan[day] && mealPlan[day].breakfast
                                  ? `
                                  <option value="${mealPlan[day].breakfast.id}" selected>
                                      ${mealPlan[day].breakfast.name}
                                  </option>
                              `
                                  : ""
                              }
                          </select>
                          <button class="btn btn-info mt-2 view-recipe-btn" data-recipe-id="${
                            mealPlan[day] && mealPlan[day].breakfast
                              ? mealPlan[day].breakfast.id
                              : ""
                          }" ${
        mealPlan[day] && mealPlan[day].breakfast ? "" : "disabled"
      }>
                              View Recipe
                          </button>
                          <h5>Lunch</h5>
                          <select class="form-select meal-select" data-day="${day}" data-meal="lunch">
                              <option value="">Select a recipe</option>
                              ${
                                mealPlan[day] && mealPlan[day].lunch
                                  ? `
                                  <option value="${mealPlan[day].lunch.id}" selected>
                                      ${mealPlan[day].lunch.name}
                                  </option>
                              `
                                  : ""
                              }
                          </select>
                          <button class="btn btn-info mt-2 view-recipe-btn" data-recipe-id="${
                            mealPlan[day] && mealPlan[day].lunch
                              ? mealPlan[day].lunch.id
                              : ""
                          }" ${
        mealPlan[day] && mealPlan[day].lunch ? "" : "disabled"
      }>
                              View Recipe
                          </button>
                          <h5>Dinner</h5>
                          <select class="form-select meal-select" data-day="${day}" data-meal="dinner">
                              <option value="">Select a recipe</option>
                              ${
                                mealPlan[day] && mealPlan[day].dinner
                                  ? `
                                  <option value="${mealPlan[day].dinner.id}" selected>
                                      ${mealPlan[day].dinner.name}
                                  </option>
                              `
                                  : ""
                              }
                          </select>
                          <button class="btn btn-info mt-2 view-recipe-btn" data-recipe-id="${
                            mealPlan[day] && mealPlan[day].dinner
                              ? mealPlan[day].dinner.id
                              : ""
                          }" ${
        mealPlan[day] && mealPlan[day].dinner ? "" : "disabled"
      }>
                              View Recipe
                          </button>
                      </div>
                  </div>
              </div>
            `;
    });

    // Save meal plan changes
    const mealSelects = document.querySelectorAll(".meal-select");

    mealSelects.forEach((select) => {
      select.addEventListener("change", (e) => {
        const day = e.target.getAttribute("data-day");
        const meal = e.target.getAttribute("data-meal");
        const recipeId = e.target.value;
        const selectedRecipe = Object.values(mealPlan)
          .flatMap((dayPlan) => Object.values(dayPlan))
          .find((recipe) => recipe.id == recipeId);

        if (!mealPlan[day]) {
          mealPlan[day] = {};
        }

        if (recipeId) {
          mealPlan[day][meal] = selectedRecipe;
        } else {
          delete mealPlan[day][meal]; // Remove if none is selected
        }

        localStorage.setItem("mealPlan", JSON.stringify(mealPlan));

        // Update View Recipe button
        const viewButton = select.parentElement.querySelector(
          `.view-recipe-btn[data-meal="${meal}"]`
        );
        if (selectedRecipe) {
          viewButton.dataset.recipeId = selectedRecipe.id;
          viewButton.disabled = false;
        } else {
          viewButton.disabled = true;
        }
      });
    });

    // Initialize the modal
    let recipeModal;
    console.log("recipeModal instance:", recipeModal); // Debugging log
    try {
      if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
        recipeModal = new bootstrap.Modal(recipeModalElement, {
          keyboard: false,
        });
        console.log("Modal initialized successfully"); // Debugging log
      } else {
        console.error("Bootstrap Modal is not available"); // Debugging log
      }
    } catch (error) {
      console.error("Error initializing modal:", error); // Debugging log
    }

    // Add event listener for meal plan items
    plannerContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("view-recipe-btn")) {
        const recipeId = e.target.dataset.recipeId;
        console.log("View Recipe button clicked, recipeId:", recipeId); // Debugging log
        const selectedRecipe = Object.values(mealPlan)
          .flatMap((dayPlan) => Object.values(dayPlan))
          .find((recipe) => recipe.id == recipeId);

        if (selectedRecipe) {
          console.log("Selected recipe for modal:", selectedRecipe); // Debugging log
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
          console.log("Showing modal"); // Debugging log
          if (recipeModal) {
            recipeModal.show();
          } else {
            console.error("Modal is not initialized"); // Debugging log
          }
        } else {
          console.log("Recipe not found"); // Debugging log
        }
      }
    });

    // Generate shopping list
    generateShoppingListBtn.addEventListener("click", () => {
      const shoppingList = {};

      Object.values(mealPlan).forEach((meals) => {
        Object.values(meals).forEach((recipe) => {
          recipe.ingredients.forEach((ingredient) => {
            const match = ingredient.match(/^(\d+(\.\d+)?)?\s*(.*)$/);
            if (match) {
              const quantity = match[1] ? parseFloat(match[1]) : 1;
              const ingredientName = match[3];
              if (shoppingList[ingredientName]) {
                shoppingList[ingredientName] += quantity;
              } else {
                shoppingList[ingredientName] = quantity;
              }
            } else {
              console.error("Ingredient format not recognized:", ingredient);
            }
          });
        });
      });

      console.log("Generated shopping list:", shoppingList); // Debugging log

      shoppingListModalBody.innerHTML = `
        <h5>Shopping List</h5>
        <ul>
          ${Object.entries(shoppingList)
            .map(
              ([ingredient, quantity]) => `<li>${quantity} ${ingredient}</li>`
            )
            .join("")}
        </ul>
      `;

      const shoppingListModal = new bootstrap.Modal(shoppingListModalElement);
      shoppingListModal.show();
    });
  } else {
    console.error("Required elements not found"); // Debugging log
  }

  // Clear meal plan
  const deletePlanBtn = document.getElementById("delete-plan-btn");

  if (deletePlanBtn) {
    deletePlanBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your meal plan?")) {
        localStorage.removeItem("mealPlan");
        alert("Meal plan cleared!");
        location.reload(); // Reload the page to reflect changes
      }
    });
  } else {
    console.error("Delete plan button not found"); // Debugging log
  }
});
