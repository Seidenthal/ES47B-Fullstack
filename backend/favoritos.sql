CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,           
  movie_tmdb_id INTEGER NOT NULL,     
  title TEXT NOT NULL,                
  poster_url TEXT,                   
  
  UNIQUE(user_id, movie_tmdb_id) 
);