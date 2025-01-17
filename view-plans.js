import {
  showAlert,
  capitalize,
  showSavedMealPlanModal,
} from "./meal-planner.js";

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

  const mealPlanSelect = document.getElementById("mealPlanSelect");
  const mealPlanDetails = document.getElementById("mealPlanDetails");

  function loadMealPlans() {
    const user = auth.currentUser;
    if (user) {
      db.collection("mealPlans")
        .doc(user.uid)
        .collection("plans")
        .get()
        .then((querySnapshot) => {
          const mealPlans = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }));
          populateMealPlanSelect(mealPlans);
        })
        .catch((error) => {
          console.error("Error loading meal plans from Firebase: ", error);
          showAlert(
            "Error loading meal plans from Firebase: " + error.message,
            "danger"
          );
        });
    } else {
      showAlert("User not authenticated. Please sign in.", "warning");
    }
  }

  function populateMealPlanSelect(mealPlans) {
    mealPlans.forEach((plan) => {
      const option = document.createElement("option");
      option.value = plan.id;
      option.textContent = plan.id;
      mealPlanSelect.appendChild(option);
    });
  }

  function loadSelectedMealPlan(mealPlanName) {
    const user = auth.currentUser;
    if (user) {
      db.collection("mealPlans")
        .doc(user.uid)
        .collection("plans")
        .doc(mealPlanName)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const data = doc.data();
            if (data && data.mealPlan) {
              showMealPlanDetails(data.mealPlan);
            }
          }
        })
        .catch((error) => {
          console.error("Error loading meal plan from Firebase: ", error);
          showAlert(
            "Error loading meal plan from Firebase: " + error.message,
            "danger"
          );
        });
    } else {
      showAlert("User not authenticated. Please sign in.", "warning");
    }
  }

  function showMealPlanDetails(mealPlan) {
    const mealPlanDetailsBody = `
      ${Object.entries(mealPlan)
        .map(
          ([day, meals]) => `
        <h5>${day}</h5>
        ${Object.entries(meals)
          .map(([meal, recipe]) => {
            const uniqueId = `${day}-${meal}-${recipe.id}`;
            return `
                <div class="card mb-2">
                  <div class="card-header" id="heading${uniqueId}">
                    <h5 class="mb-0">
                      <button class="btn btn-link" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${uniqueId}" aria-expanded="true" aria-controls="collapse${uniqueId}">
                        ${capitalize(meal)}: ${recipe.name}
                      </button>
                    </h5>
                  </div>
                  <div id="collapse${uniqueId}" class="collapse" aria-labelledby="heading${uniqueId}" data-bs-parent="#mealPlanDetails">
                    <div class="card-body">
                      <p><strong>Preparation Time:</strong> ${
                        recipe.preparationTime || "N/A"
                      }</p>
                      <p><strong>Cooking Time:</strong> ${
                        recipe.cookingTime || "N/A"
                      }</p>
                      <h5>Ingredients:</h5>
                      <ul>
                        ${recipe.ingredients
                          .map((ingredient) => `<li>${ingredient}</li>`)
                          .join("")}
                      </ul>
                      <h5>Steps:</h5>
                      <ol>
                        ${recipe.steps
                          .map((step) => `<li>${step}</li>`)
                          .join("")}
                      </ol>
                    </div>
                  </div>
                </div>
              `;
          })
          .join("")}
      `
        )
        .join("")}
    `;
    mealPlanDetails.innerHTML = mealPlanDetailsBody;
  }

  mealPlanSelect.addEventListener("change", (e) => {
    const selectedPlan = e.target.value;
    if (selectedPlan) {
      loadSelectedMealPlan(selectedPlan);
    } else {
      mealPlanDetails.innerHTML = "";
    }
  });

  auth.onAuthStateChanged((user) => {
    if (user) {
      loadMealPlans();
    } else {
      showAlert("User not authenticated. Please sign in.", "warning");
    }
  });
});
