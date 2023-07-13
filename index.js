$(document).ready(function () {
  // Initialize Firebase
  var firebaseConfig = {
    apiKey: "AIzaSyDncXawcMTUeRGfBlE7knbDUdJWnx8jIFI",
  authDomain: "movie-suggestion-ff465.firebaseapp.com",
  databaseURL: "https://movie-suggestion-ff465-default-rtdb.firebaseio.com",
  projectId: "movie-suggestion-ff465",
  storageBucket: "movie-suggestion-ff465.appspot.com",
  messagingSenderId: "171432738",
  appId: "1:171432738:web:1712655a2e27c2a8b2a37b",
  measurementId: "G-LVHKDCEGXQ"
  };
  firebase.initializeApp(firebaseConfig);

  // Get a reference to the Firebase Realtime Database
  var database = firebase.database();

  // Code to check if the user has logged in before
  var loggedInUser = localStorage.getItem("loggedInUser");
  if (loggedInUser) {
    $("#loginForm").hide();
    $("#movieSuggestions").show();
    displayMovies();
  }

  // Code to handle the Login form submission
  $("#loginBtn").click(function (event) {
    event.preventDefault();
    var username = $("#username").val();
    if (username) {
      localStorage.setItem("loggedInUser", username);
      $("#loginForm").hide();
      $("#movieSuggestions").show();
      displayMovies();
    }
  });

  // Code to handle the Logout button click
  $("#logoutBtn").click(function (event) {
    event.preventDefault();
    localStorage.removeItem("loggedInUser");
    $("#movieSuggestions").hide();
    $("#loginForm").show();
  });

  // Code to handle the Suggest button click
  $("#suggestBtn").click(function (event) {
    event.preventDefault();
    var title = $("#movieTitle").val();
    var rating = 5;
    var user = localStorage.getItem("loggedInUser");
    if (title) {
      saveMovie(title, rating, user);
      $("#movieTitle").val("");
      displayMovies();
    }
  });

  // Code to handle the movie title auto-suggest
  $("#movieTitle").on("input", function () {
    var input = $(this).val().trim().toLowerCase();
    if (input === "") {
      $("#suggestionsList").empty();
      return;
    }
    var suggestions = getMovieSuggestions(input);
    displayMovieSuggestions(suggestions);
  });

  function getMovieSuggestions(input) {
    var movies = [];
    database.ref("movies").orderByChild("title").startAt(input).endAt(input + "\uf8ff").once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var movie = childSnapshot.val();
        movies.push(movie.title);
      });
    });
    return movies;
  }

  function displayMovieSuggestions(suggestions) {
    var suggestionsList = $("#suggestionsList");
    suggestionsList.empty();
    for (var i = 0; i < suggestions.length; i++) {
      var suggestion = $("<li>")
        .addClass("suggestion")
        .text(suggestions[i]);
      suggestionsList.append(suggestion);
    }
  }

  $(document).on("click", ".suggestion", function () {
    var suggestion = $(this).text();
    $("#movieTitle").val(suggestion);
    $("#suggestionsList").empty();
  });

  // Code to fetch suggested movies from the database and display them on the website
  function displayMovies() {
    database.ref("movies").orderByChild("rating").once("value").then(function (snapshot) {
      var movies = [];
      snapshot.forEach(function (childSnapshot) {
        var movie = childSnapshot.val();
        movies.push(movie);
      });

      // Sort the movies by rating in descending order
      movies.sort(function (a, b) {
        return b.rating - a.rating;
      });

      var moviesList = $("#moviesList");
      moviesList.empty();
      for (var i = 0; i < movies.length; i++) {
        var movie = movies[i];
        var ratingInput = $("<input>").attr({
          type: "range",
          min: 0,
          max: 10,
          step: 0.5,
          value: movie.rating,
          class: "ratingInput",
          "data-movie-id": movie.id,
        });
        var ratingDiv = $("<div>")
          .addClass("rating")
          .append(ratingInput)
          .append($("<span>").addClass("ratingValue").text(movie.rating));
        var commentForm = $("<form>")
          .addClass("commentForm")
          .attr("data-movie-id", movie.id);
        var commentInput = $("<input>").attr({
          type: "text",
          class: "form-control commentInput",
          placeholder: "Add a comment",
        });
        var commentBtn = $("<button>")
          .attr("type", "submit")
          .addClass("btn btn-primary")
          .text("Submit");
        commentForm.append(commentInput).append(commentBtn);
        var commentsList = $("<ul>").addClass("commentsList");
        if (movie.comments) {
          for (var j = 0; j < movie.comments.length; j++) {
            var comment = $("<li>").text(movie.comments[j]);
            commentsList.append(comment);
          }
        }
        var movieDiv = $("<div>").addClass("movie");
        var posterImg = $("<img>")
          .addClass("poster")
          .attr("src", movie.poster)
          .attr("alt", movie.title);
        var titleDiv = $("<div>")
          .addClass("title")
          .text(movie.title);
        var summaryDiv = $("<div>")
          .addClass("summary")
          .text(movie.summary);
        var userDiv = $("<div>")
          .addClass("user")
          .text("Suggested by: " + movie.user);
        movieDiv.append(posterImg);
        movieDiv.append(titleDiv);
        movieDiv.append(summaryDiv);
        movieDiv.append(userDiv);
        movieDiv.append(ratingDiv);
        movieDiv.append(commentForm);
        movieDiv.append(commentsList);
        moviesList.append(movieDiv);
      }
    });
  }

  // Code to save a movie to the database
  function saveMovie(title, rating, user) {
    var id = Date.now();
    var movie = {
      id: id,
      title: title,
      rating: rating,
      user: user,
      comments: [],
      poster: "",
      summary: "",
    };
    database.ref("movies/" + id).set(movie);
    fetchMovieDetails(title, id);
  }

  // Code to fetch additional movie details (poster and summary) from the OMDb API
  function fetchMovieDetails(title, id) {
    var apiUrl =
      "https://www.omdbapi.com/?apikey=YOUR_API_KEY&type=movie&t=" + title;
    $.ajax({
      url: apiUrl,
      method: "GET",
    }).then(function (response) {
      if (response.Response === "True") {
        var movie = {
          id: id,
          title: response.Title,
          rating: 5,
          user: "",
          comments: [],
          poster: response.Poster,
          summary: response.Plot,
        };
        database.ref("movies/" + id).set(movie);
      }
    });
  }

  // Code to handle the movie rating input change
  $(document).on("input", ".ratingInput", function () {
    var rating = $(this).val();
    var id = $(this).data("movie-id");
    updateMovieRating(id, rating);
  });

  // Code to handle the movie comment form submission
  $(document).on("submit", ".commentForm", function (event) {
    event.preventDefault();
    var comment = $(this).find(".commentInput").val();
    var id = $(this).data("movie-id");
    addMovieComment(id, comment);
    $(this).find(".commentInput").val("");
  });

  // Code to update the rating of a movie in the database
  function updateMovieRating(id, rating) {
    database.ref("movies/" + id).update({
      rating: rating,
    });
  }

  // Code to add a comment to a movie in the database
  function addMovieComment(id, comment) {
    database.ref("movies/" + id + "/comments").push(comment);
  }
});