// Code to fetch suggested movies from the database and display them on the website
function displayMovies() {
    // Code to fetch suggested movies from the database
    let movies = [];
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      if (key.startsWith("movie")) {
        let movie = JSON.parse(localStorage.getItem(key));
        movies.push(movie);
      }
    }
  
    // Sort the movies by rating in descending order
    movies.sort(function (a, b) {
      return b.rating - a.rating;
    });
  
    // Code to display suggested movies on the website
    let moviesList = $("#moviesList");
    moviesList.empty();
    for (let i = 0; i < movies.length; i++) {
      let movie = movies[i];
      let ratingInput = $("<input>").attr({
        type: "range",
        min: 0,
        max: 10,
        step: 0.5,
        value: movie.rating,
        class: "ratingInput",
        "data-movie-id": movie.id,
      });
      let ratingDiv = $("<div>")
        .addClass("rating")
        .append(ratingInput)
        .append(movie.rating);
      let commentForm = $("<form>")
        .addClass("commentForm")
        .attr("data-movie-id", movie.id);
      let commentInput = $("<input>").attr({
        type: "text",
        class: "form-control commentInput",
        placeholder: "Add a comment",
      });
      let commentBtn = $("<button>")
        .attr("type", "submit")
        .addClass("btn btn-primary")
        .text("Submit");
      commentForm.append(commentInput).append(commentBtn);
      let commentsList = $("<ul>").addClass("commentsList");
      for (let j = 0; j < movie.comments.length; j++) {
        let comment = $("<li>").addClass("comment").text(movie.comments[j]);
        commentsList.append(comment);
      }
      let movieDiv = $("<div>").addClass("movie").attr("data-movie-id", movie.id);
      let poster = $("<img>").addClass("poster").attr("src", movie.posterUrl);
      let title = $("<h3>").addClass("title").text(movie.title);
      let summary = $("<p>").addClass("summary").text(movie.summary);
      let user = $("<p>")
        .addClass("user")
        .text("Suggested by " + movie.user);
      movieDiv
        .append(poster)
        .append(title)
        .append(summary)
        .append(ratingDiv)
        .append(user)
        .append(commentForm)
        .append(commentsList);
      movieDiv.append(commentsList);
      moviesList.append(movieDiv);
    }
  }
  
  // Code to save the suggested movie to the database
  function saveMovie(title, rating, user) {
    let movieInfo = {
      title: title,
      rating: rating,
      user: user,
      summary: "",
      posterUrl: "",
    };
  
    // Code to fetch movie summary and poster URL from the OMDB API
    $.ajax({
      url: "https://www.omdbapi.com/",
      data: { t: title, apikey: "368967f2" },
      success: function (response) {
        if (response.Response == "True") {
          movieInfo.summary = response.Plot;
          movieInfo.posterUrl = response.Poster;
        }
        saveMovieSuggestion(movieInfo);
      },
      error: function () {
        saveMovieSuggestion(movieInfo);
      },
    });
  }
  
  function saveMovieSuggestion(movieInfo) {
    // Code to save the suggested movie to the database
    let movieId = "movie" + Date.now();
    let movie = {
      id: movieId,
      title: movieInfo.title,
      summary: movieInfo.summary,
      posterUrl: movieInfo.posterUrl,
      rating: movieInfo.rating,
      user: movieInfo.user,
      comments: [],
    };
    localStorage.setItem(movieId, JSON.stringify(movie));
  }
  
  // Code to update the rating of a suggested movie in the database
  function updateMovieRating(movieId, rating) {
    let movie = JSON.parse(localStorage.getItem(movieId));
    movie.rating = rating;
    localStorage.setItem(movieId, JSON.stringify(movie));
  }
  
  // Code to save a comment for a suggested movie to the database
  function saveMovieComment(movieId, comment) {
    let movie = JSON.parse(localStorage.getItem(movieId));
    movie.comments.push(comment);
    localStorage.setItem(movieId, JSON.stringify(movie));
  }
  
  $(document).ready(function () {
    // Code to check if the user has logged in before
    let loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      $("#loginForm").hide();
      $("#movieSuggestions").show();
      displayMovies();
    }
  
    // Code to handle the Login form submission
    $("#loginBtn").click(function (event) {
      event.preventDefault();
      let username = $("#username").val();
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
      let title = $("#movieTitle").val();
      let rating = 5;
      let user = localStorage.getItem("loggedInUser");
      if (title) {
        saveMovie(title, rating, user);
        $("#movieTitle").val("");
        displayMovies();
      }
    });
  
    // Code to handle the rating input change
    $(document).on("input", ".ratingInput", function () {
      let movieId = $(this).data("movie-id");
      let rating = $(this).val();
      $(this).siblings(".rating").text(rating);
      updateMovieRating(movieId, rating);
    });
  
    // Code to handle the comment form submission
    $(document).on("submit", ".commentForm", function (event) {
      event.preventDefault();
      let movieId = $(this).data("movie-id");
      let comment = $(this).find(".commentInput").val();
      if (comment) {
        saveMovieComment(movieId, comment);
        $(this)
          .siblings(".commentsList")
          .append("<li class='comment'>" + comment + "</li>");
        $(this).find(".commentInput").val("");
      }
    });
  });
  