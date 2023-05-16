import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';

// import { set } from 'core-js/core/dict';

const recipeContainer = document.querySelector('.recipe');

// if (module.hot) {
//   module.hot.accept();
// }

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // update results view to mark selected search result (seçilen arama sonucunu işaretlemek için sonuç görünümünü güncelle)
    resultsView.update(model.getSearchResultsPage());
    //  updating bookmarks view (yer imlerini güncelleme)
    bookmarksView.update(model.state.bookmarks);

    // 1 loading recipe data (tarif verileri yüklendi)
    await model.loadRecipe(id);

    /// 2 rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    // get search query(arama sorgusunu alın)
    const query = searchView.getQuery();
    if (!query) return;
    resultsView.renderSpinner();

    // load search results (arama sonuçlarını yükle)
    await model.loadSearchResults(query);

    // render results (sonuçları renderla)
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // render initial pagination buttons (başlangıç sayfası düğmelerini renderla)
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
// controlSearchResults();

const controlPagination = function (goToPage) {
  // render NEW results (YENİ sonuçları renderla)
  resultsView.render(model.getSearchResultsPage(goToPage));

  // render NEW pagination buttons (YENİ sayfalama düğmelerini renderla)
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update the recipe servings (tarif porsiyonlarını güncelle)
  model.updateServings(newServings);

  // update the recipe view (tarif görünümünü güncelle)
  // recipeView.render(model.state.recipe); // render() bu şekilde yaparsak tüm sayfa yenilenir.
  recipeView.update(model.state.recipe); // update() bu şekilde sadece değişen kısım yenilenir.
};

// window.addEventListener('hashchange', showRecipe);
// window.addEventListener('load', showRecipe);

const controlAddBookmark = function () {
  // 1 add/remove bookmark (yer imini ekle/kaldır)
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2 update recipe view (tarif görünümünü güncelle)
  recipeView.update(model.state.recipe);

  // 3 render bookmarks (yer imlerini renderla)
  bookmarksView.render(model.state.bookmarks);
};

const controlAddBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // show loading spinner (yükleniyor simgesini göster)
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    /// render recipe (tarifi renderla)
    recipeView.render(model.state.recipe);

    /// success message (başarılı mesajı)
    addRecipeView.renderMessage();

    /// render bookmark view (yer imlerini renderla)
    bookmarksView.render(model.state.bookmarks);

    /// change ID in URL (URL'deki kimliği değiştir)
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    /// close form window (form penceresini kapat)
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('🤯', err);
    addRecipeView.renderError(err.message);
  }
  // // upload the new recipe data (yeni tarif verilerini yükle)
};

const init = function () {
  bookmarksView.addHandlerRender(controlAddBookmarks);
  recipeView.addHandlerRender(controlRecipes); // burada fonksiyonu çağırmıyoruz sadece referansını veriyoruz.
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
