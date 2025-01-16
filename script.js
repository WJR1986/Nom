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

  // Recipe form handling
  const recipeForm = document.getElementById("recipe-form");
  const successMessage = document.getElementById("submission-success");

  if (recipeForm) {
    recipeForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("recipe-name").value.trim();
      const ingredients = document
        .getElementById("recipe-ingredients")
        .value.split(",")
        .map((item) => item.trim());
      const instructions = document
        .getElementById("recipe-instructions")
        .value.trim();
      const tags = document
        .getElementById("recipe-tags")
        .value.split(",")
        .map((tag) => tag.trim());
      const image = document.getElementById("recipe-image").value.trim();

      const newRecipe = {
        id: Date.now(), // Unique ID based on timestamp
        name,
        ingredients,
        instructions,
        tags,
        image: image || "assets/images/placeholder.jpg", // Default image
      };

      // Save to LocalStorage
      const savedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];
      savedRecipes.push(newRecipe);
      localStorage.setItem("recipes", JSON.stringify(savedRecipes));

      // Show success message
      successMessage.classList.remove("d-none");

      // Reset form
      recipeForm.reset();
    });
  }

  // Meal Planner handling
  const plannerContainer = document.getElementById("meal-planner");

  if (plannerContainer) {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const savedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];
    const mealPlan = JSON.parse(localStorage.getItem("mealPlan")) || {};

    // Initialize meal planner
    plannerContainer.innerHTML = ""; // Clear container before populating
    days.forEach((day) => {
      const selectedRecipe = mealPlan[day] ? mealPlan[day].id : "";
      plannerContainer.innerHTML += `
          <div class="col-md-4 mb-3">
              <div class="card">
                  <div class="card-header">${day}</div>
                  <div class="card-body">
                      <select class="form-select meal-select" data-day="${day}">
                          <option value="">Select a recipe</option>
                          ${savedRecipes
                            .map(
                              (recipe) => `
                                  <option value="${recipe.id}" ${
                                recipe.id === selectedRecipe ? "selected" : ""
                              }>
                                      ${recipe.name}
                                  </option>
                              `
                            )
                            .join("")}
                      </select>
                      <button class="btn btn-info mt-2 view-recipe-btn" data-recipe-id="${selectedRecipe}" disabled>
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
        const recipeId = e.target.value;
        const selectedRecipe = savedRecipes.find(
          (recipe) => recipe.id === recipeId
        );

        if (recipeId) {
          mealPlan[day] = selectedRecipe;
        } else {
          delete mealPlan[day]; // Remove if none is selected
        }

        localStorage.setItem("mealPlan", JSON.stringify(mealPlan));

        // Update View Recipe button
        const viewButton =
          select.parentElement.querySelector(".view-recipe-btn");
        if (selectedRecipe) {
          viewButton.dataset.recipeId = selectedRecipe.id;
          viewButton.disabled = false;
        } else {
          viewButton.disabled = true;
        }
      });
    });
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
          const day = prompt("Enter the day for this meal (e.g., Monday):");
          if (day) {
            mealPlan[day] = selectedRecipe;
            localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
            alert(
              `${selectedRecipe.name} added to your meal planner for ${day}!`
            );
          }
        }
      }
    });
  }

  // Automatically display meal plan summary on meal-planner.html
  const planSummary = document.getElementById("meal-plan-summary");
  const mealPlanList = document.getElementById("mealPlanList");

  if (planSummary && mealPlanList) {
    const mealPlan = JSON.parse(localStorage.getItem("mealPlan")) || {};
    mealPlanList.innerHTML = "";

    if (Object.keys(mealPlan).length === 0) {
      mealPlanList.innerHTML =
        '<div class="list-group-item text-danger">No meals planned yet!</div>';
    } else {
      Object.entries(mealPlan).forEach(([day, recipe]) => {
        mealPlanList.innerHTML += `
          <button type="button" class="list-group-item list-group-item-action" data-recipe-id="${recipe.id}">
            ${day}: ${recipe.name}
          </button>
        `;
      });
    }

    planSummary.classList.remove("d-none");

    // Add event listener for meal plan items
    mealPlanList.addEventListener("click", (e) => {
      if (e.target.classList.contains("list-group-item-action")) {
        const recipeId = e.target.dataset.recipeId;
        const selectedRecipe = fetchedRecipes.find(
          (recipe) => recipe.id == recipeId
        );

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
          recipeModal.show();
        }
      }
    });
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
});
