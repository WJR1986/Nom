import { showAlert } from "./alert.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDuVh-xD3Hf1Xzcbbis_9LebyVVFYaVf8c",
  authDomain: "recipes-4872e.firebaseapp.com",
  projectId: "recipes-4872e",
  storageBucket: "recipes-4872e.appspot.com",
  messagingSenderId: "758237483981",
  appId: "1:758237483981:web:654888328a83b0e8536a84",
};

firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
export const auth = firebase.auth();

export function fetchPantryIngredients() {
  return new Promise((resolve, reject) => {
    const user = auth.currentUser;
    if (user) {
      db.collection("pantry")
        .doc(user.uid)
        .collection("ingredients")
        .get()
        .then((querySnapshot) => {
          const pantryIngredients = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          resolve(pantryIngredients);
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

export function saveMealPlanToFirebase(mealPlan, mealPlanName) {
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

export function loadMealPlanFromFirebase() {
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
        resolve(mealPlans);
      })
      .catch((error) => {
        console.error("Error loading meal plans: ", error);
        showAlert("Error loading meal plans: " + error.message, "danger");
        reject(error);
      });
  } else {
    showAlert("User not authenticated. Please sign in.", "warning");
    reject("User not authenticated");
  }
}

export function deleteMealPlanFromFirebase(mealPlanId) {
  const user = auth.currentUser;
  if (user) {
    db.collection("mealPlans")
      .doc(user.uid)
      .collection("plans")
      .doc(mealPlanId)
      .delete()
      .then(() => {
        showAlert(`Meal plan "${mealPlanId}" deleted successfully!`, "success");
      })
      .catch((error) => {
        console.error("Error deleting meal plan: ", error);
        showAlert("Error deleting meal plan: " + error.message, "danger");
      });
  } else {
    showAlert("User not authenticated. Please sign in.", "warning");
  }
}
