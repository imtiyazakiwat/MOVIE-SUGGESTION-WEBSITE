function displayMovies() {
    let moviesList = $("#moviesList");
    moviesList.empty();
    let searchInput = $("<input>").attr("type", "text").attr("placeholder", "Search movies...").addClass("searchInput");
    moviesList.append(searchInput);
  
    for (let i = 0; i < localStorage.length; i++) {
      let movieId = localStorage.key(i);
      if (movieId.startsWith("movie")) {
        let movie = JSON.parse(localStorage.getItem(movieId));
        let movieDiv = $("<div>").addClass("movie");
        let title = $("<h3>").text(movie.title);
        let titleInput = $("<input>").attr("type", "text").val(movie.title).addClass("titleInput").data("movie-id", movieId);
        movieDiv.append(title).append(titleInput);
        let ratingDiv = $("<div>").addClass("rating");
        let ratingInput = $("<input>").attr("type", "range").attr("min", "1").attr("max", "10").attr("value", movie.rating).addClass("ratingInput").data("movie-id", movieId);
        let ratingLabel = $("<label>").text(movie.rating);
        ratingDiv.append(ratingInput).append(ratingLabel);
        movieDiv.append(ratingDiv);
        let poster = $("<img>").attr("src", movie.posterUrl).addClass("poster");
        let posterUrlInput = $("<input>").attr("type", "text").val(movie.posterUrl).addClass("posterUrlInput").data("movie-id", movieId);
        movieDiv.append(poster).append(posterUrlInput);
  
        if (movie.title === "Avengers") {
          // Code to create a download button for the Avengers movie
          let avengersDownloadDiv = $("<div>").addClass("download");
          let avengersDownloadButton = $("<a>").addClass("btn btn-primary").text("Download Avengers");
          avengersDownloadButton.attr("href", "https://drive.google.com/file/d/0B7c5Qj4MGUBgbzFYUkNUN0d4Wmc/edit?resourcekey=0-8L63v8MxBom32sYyaEvhXA");
          avengersDownloadButton.attr("download", "Avengers.mp4");
          avengersDownloadDiv.append(avengersDownloadButton);
          movieDiv.append(avengersDownloadDiv);
        }
  
        let commentsList = $("<ul>").addClass("commentsList");
        for (let j = 0; j < movie.comments.length; j++) {
          let comment = $("<li>").addClass("comment").attr("id", movie.comments[j].commentId);
          let commentHeader = $("<h4>").text(movie.comments[j].user);
          let commentBody = $("<p>").text(movie.comments[j].comment);
          comment.append(commentHeader).append(commentBody);
  
          if (localStorage.getItem("username") === movie.comments[j].user || localStorage.getItem("isAdmin") === "true") {
            let deleteButton = $("<button>").addClass("btn btn-danger deleteComment").text("Delete");
            deleteButton.data("movie-id", movieId);
            deleteButton.data("comment-id", movie.comments[j].commentId);
            comment.append(deleteButton);
          }
  
          commentsList.append(comment);
        }
        let commentForm = $("<form>").addClass("commentForm").data("movie-id", movieId);
        let commentInput = $("<input>").attr("type", "text").addClass("commentInput").attr("placeholder", "Add a comment...");
        let submitButton = $("<button>").addClass("btn btn-primary").text("Submit");
        commentForm.append(commentInput).append(submitButton);
  
        if (localStorage.getItem("username")) {
          movieDiv.append(commentsList).append(commentForm);
        }
  
        let summary = $("<p>").text(movie.summary);
        movieDiv.append(summary);
  
        let summaryInput = $("<textarea>").addClass("summaryInput").data("movie-id", movieId);
        movieDiv.append(summaryInput);
  
        moviesList.append(movieDiv);
      }
    }
  
    $(document).on("input", ".titleInput", function() {
      let movieId = $(this).data("movie-id");
      let movie = JSON.parse(localStorage.getItem(movieId));
      movie.title = $(this).val().trim();
      localStorage.setItem(movieId, JSON.stringify(movie));
      $(this).siblings("h3").text(movie.title);
    });
  
    $(document).on("input", ".summaryInput", function() {
      let movieId = $(this).data("movie-id");
      let movie = JSON.parse(localStorage.getItem(movieId));
      movie.summary = $(this).val().trim();
      localStorage.setItem(movieId, JSON.stringify(movie));
      $(this).siblings("p").text(movie.summary);
    });
  
    $(document).on("input", ".ratingInput", function() {
  let movieId = $(this).data("movie-id");
  let rating = $(this).val();
  let movie = JSON.parse(localStorage.getItem(movieId));
  movie.rating = rating;
  localStorage.setItem(movieId, JSON.stringify(movie));
  $(this).siblings("label").text(rating);
  });
  
  $(document).on("submit", ".commentForm", function(event) {
  event.preventDefault();
  let movieId = $(this).data("movie-id");
  let commentInput = $(this).find(".commentInput");
  let comment = commentInput.val().trim();
  if (comment) {
  let user = localStorage.getItem("username") || "Anonymous";
  let commentId = "comment" + Date.now();
  let movie = JSON.parse(localStorage.getItem(movieId));
  movie.comments.push({
  user: user,
  comment: comment,
  commentId: commentId
  });
  localStorage.setItem(movieId, JSON.stringify(movie));
  let commentLi = $("<li>").addClass("comment").attr("id", commentId);
  let commentHeader = $("<h4>").text(user);
  let commentBody = $("<p>").text(comment);
  commentLi.append(commentHeader).append(commentBody);
  
    if (localStorage.getItem("username") === user || localStorage.getItem("isAdmin") === "true") {
      let deleteButton = $("<button>").addClass("btn btn-danger deleteComment").text("Delete");
      deleteButton.data("movie-id", movieId);
      deleteButton.data("comment-id", commentId);
      commentLi.append(deleteButton);
    }
  
    $(this).siblings(".commentsList").append(commentLi);
    commentInput.val("");
  }
  });
  
  $(document).on("click", ".deleteComment", function() {
  let movieId = $(this).data("movie-id");
  let commentId = $(this).data("comment-id");
  let movie = JSON.parse(localStorage.getItem(movieId));
  for (let i = 0; i < movie.comments.length; i++) {
  if (movie.comments[i].commentId === commentId) {
  if (localStorage.getItem("username") === movie.comments[i].user || localStorage.getItem("isAdmin") === "true") {
  movie.comments.splice(i, 1);
  localStorage.setItem(movieId, JSON.stringify(movie));
  $("#" + commentId).remove();
  return;
  } else {
  alert("You are not authorized to delete this comment.");
  return;
  }
  }
  }
  });
  
  $(document).on("input", ".posterUrlInput", function() {
  let movieId = $(this).data("movie-id");
  let movie = JSON.parse(localStorage.getItem(movieId));
  movie.posterUrl = $(this).val().trim();
  localStorage.setItem(movieId, JSON.stringify(movie));
  $(this).siblings(".poster").attr("src", movie.posterUrl);
  });
  
  $(document).on("input", ".searchInput", function() {
  let searchTerm = $(this).val().trim().toLowerCase();
  $(".movie").each(function() {
  let movieTitle = $(this).find("h3").text().toLowerCase();
  if (movieTitle.includes(searchTerm)) {
  $(this).show();
  } else {
  $(this).hide();
  }
  });
  });
  }
  
  $(document).ready(function() {
  displayMovies();
  });
  
  
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
  