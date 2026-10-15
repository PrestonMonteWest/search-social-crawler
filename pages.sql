CREATE TABLE links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  href text UNIQUE NOT NULL,
  last_crawl timestamp,
  created_on timestamp NOT NULL DEFAULT now(),
  origin text
);
