d3.csv("movies.csv", function(csv) {
    for (var i=0; i<csv.length; ++i) {
		csv[i].director = String(csv[i].director_name);
		csv[i].duration = Number(csv[i].duration);
		csv[i].directorLikes = Number(csv[i].director_facebook_likes);
		csv[i].actor1Likes = Number(csv[i].actor_1_facebook_likes);
        csv[i].actor2Likes = Number(csv[i].actor_2_facebook_likes);
        csv[i].actor3Likes = Number(csv[i].actor_3_facebook_likes);
        csv[i].movieLikes = Number(csv[i].movie_facebook_likes);
        csv[i].gross = Number(csv[i].gross);
        csv[i].budget = Number(csv[i].budget);
    }
});
