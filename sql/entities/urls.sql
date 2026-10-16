CREATE TABLE urls (
  url text PRIMARY KEY,
  created_on timestamp NOT NULL DEFAULT now(),
  crawled_on timestamp
);
