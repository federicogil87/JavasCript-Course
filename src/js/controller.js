// https://forkify-api.herokuapp.com/v2
import * as model from "./model.js";
import RecipeView from "./views/recipeViews.js";
import SearchView from "./views/searchView.js";
import ResultsView from "./views/resultsView.js";
import BookmarksView from "./views/bookmarksView.js";
import PaginationView from "./views/paginationView.js";
import AddRecipeView from "./views/addRecipeView.js";
import { MODAL_CLOSE_SEC } from "./config.js";

import "core-js/stable";
import "regenerator-runtime/runtime.js";

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    RecipeView.renderSpinner();

    // 1) Update results view to mark selected search result
    ResultsView.update(model.getSearchResultsPage());
    BookmarksView.update(model.state.bookmarks);

    // 2) Load Recipe
    await model.loadRecipe(id);

    // 3) Rendering Recipe
    RecipeView.render(model.state.recipe);
  } catch (err) {
    RecipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    // 1) Go to first page
    model.goToFirstPage();
    // 2) Render Spinner
    ResultsView.renderSpinner();

    // 3) Get search Query
    const query = SearchView.getQuery();
    if (!query) return;

    // 4) Load search results
    await model.loadSearchResults(query);

    // 5) Render results
    ResultsView.render(model.getSearchResultsPage());

    // 6) Render pagination view
    PaginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 1) Render NEW results
  ResultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination buttons
  PaginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // RecipeView.render(model.state.recipe);
  RecipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/Remove Bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update Recipe View
  RecipeView.update(model.state.recipe);

  // 3) Render Bookmarks
  BookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  BookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Render spinner
    AddRecipeView.renderSpinner();

    // Upload Recipe
    await model.uploadRecipe(newRecipe);

    // Render Recipe
    RecipeView.render(model.state.recipe);

    // Render Success message
    AddRecipeView.renderMessage();

    // Render bookmark
    BookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // Close Form
    setTimeout(function () {
      AddRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    AddRecipeView.renderError(err.message);
  }
};

const newFeature = function () {
  console.log("New Feature");
};

const init = function () {
  BookmarksView.addHandlerRender(controlBookmarks);
  RecipeView.addHandlerRender(controlRecipes);
  RecipeView.addHandlerUpdateServings(controlServings);
  RecipeView.addHandlerAddBookmark(controlAddBookmark);
  SearchView.addHandlerSearch(controlSearchResults);
  PaginationView.addHandlerClick(controlPagination);
  AddRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};
init();
