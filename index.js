document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("search-bar");
  const searchButton = document.getElementById("search-button");
  const recipesContainer = document.getElementById("recipes-container");

  let fetchedRecipes = [];

  if (searchBar && searchButton && recipesContainer) {
    // Fetch recipes from JSON file
    fetch("recipes.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched recipes:", data); // Debugging log
        fetchedRecipes = data;
        displayRecipes(data);

        searchButton.addEventListener("click", () => {
          const keyword = searchBar.value.toLowerCase();
          const filteredRecipes = fetchedRecipes.filter(
            (recipe) =>
              recipe.name.toLowerCase().includes(keyword) ||
              recipe.ingredients.some((ing) =>
                ing.toLowerCase().includes(keyword)
              )
          );
          console.log("Filtered recipes:", filteredRecipes); // Debugging log
          displayRecipes(filteredRecipes);
        });
      })
      .catch((error) => console.error("Error fetching recipes:", error));
  }

  // Display recipes
  function displayRecipes(recipes) {
    recipesContainer.innerHTML = "";
    if (recipes.length === 0) {
      recipesContainer.innerHTML =
        "<p class='text-center'>No recipes found.</p>";
      return;
    }
    recipes.forEach((recipe) => {
      const recipeCard = `
                <div class="col-md-4">
                  <div class="card">
                    <img src="${recipe.image}" class="card-img-top" alt="${
        recipe.name
      }">
                    <div class="card-body">
                      <h5 class="card-title">${recipe.name}</h5>
                      <p class="card-text">Ingredients: ${recipe.ingredients.join(
                        ", "
                      )}</p>
                      <button class="btn btn-primary view-recipe-btn" data-recipe-id="${
                        recipe.id
                      }">
                        View Recipe
                      </button>
                      <button class="btn btn-success add-to-planner-btn" data-recipe-id="${
                        recipe.id
                      }">
                        Add to Meal Planner
                      </button>
                    </div>
                  </div>
                </div>
              `;
      recipesContainer.innerHTML += recipeCard;
    });
    console.log("Displayed recipes:", recipes); // Debugging log
  }

  // Recipe modal handling
  const recipeModalElement = document.getElementById("recipeModal");
  const recipeModalBody = document.getElementById("recipeModalBody");

  if (recipeModalElement && recipeModalBody) {
    const recipeModal = new bootstrap.Modal(recipeModalElement);

    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("view-recipe-btn")) {
        const recipeId = e.target.dataset.recipeId;
        console.log("View Recipe button clicked, recipeId:", recipeId); // Debugging log
        const selectedRecipe = fetchedRecipes.find(
          (recipe) => recipe.id == recipeId
        );

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
          recipeModal.show();
        } else {
          console.log("Recipe not found"); // Debugging log
        }
      }

      if (e.target.classList.contains("add-to-planner-btn")) {
        const recipeId = e.target.dataset.recipeId;
        console.log("Add to Planner button clicked, recipeId:", recipeId); // Debugging log
        const selectedRecipe = fetchedRecipes.find(
          (recipe) => recipe.id == recipeId
        );

        if (selectedRecipe) {
          const mealPlan = JSON.parse(localStorage.getItem("mealPlan")) || {};
          showDayAndMealSelectionModal(selectedRecipe, mealPlan);
        }
      }
    });
  }

  // Show day and meal selection modal
  function showDayAndMealSelectionModal(recipe, mealPlan) {
    const dayAndMealSelectionModalBody = `
        <div class="modal fade" id="dayAndMealSelectionModal" tabindex="-1" aria-labelledby="dayAndMealSelectionModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="dayAndMealSelectionModalLabel">Select Day and Meal for ${recipe.name}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <select id="day-select" class="form-select mb-3">
                  <option value="">Select a day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
                <select id="meal-select" class="form-select">
                  <option value="">Select a meal</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="save-day-meal-btn">Save</button>
              </div>
            </div>
          </div>
        </div>
      `;

    document.body.insertAdjacentHTML("beforeend", dayAndMealSelectionModalBody);
    const dayAndMealSelectionModalElement = document.getElementById(
      "dayAndMealSelectionModal"
    );
    const dayAndMealSelectionModal = new bootstrap.Modal(
      dayAndMealSelectionModalElement
    );

    dayAndMealSelectionModal.show();

    document
      .getElementById("save-day-meal-btn")
      .addEventListener("click", () => {
        const selectedDay = document.getElementById("day-select").value;
        const selectedMeal = document.getElementById("meal-select").value;
        if (selectedDay && selectedMeal) {
          if (!mealPlan[selectedDay]) {
            mealPlan[selectedDay] = {};
          }
          mealPlan[selectedDay][selectedMeal] = recipe;
          localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
          alert(
            `${recipe.name} added to your meal planner for ${selectedDay} (${selectedMeal})!`
          );
          dayAndMealSelectionModal.hide();
          dayAndMealSelectionModalElement.remove();
        } else {
          alert("Please select both a day and a meal.");
        }
      });

    dayAndMealSelectionModalElement.addEventListener("hidden.bs.modal", () => {
      dayAndMealSelectionModalElement.remove();
    });
  }
});
