CREATE TABLE urls (
  url text PRIMARY KEY,
  created_on timestamp NOT NULL DEFAULT now(),
  crawled_on timestamp
);

CREATE TABLE links (
  originUrl text NOT NULL references urls(url),
  linkUrl text NOT NULL references urls(url),
  created_on timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (originUrl, linkUrl)
);

CREATE TABLE pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text UNIQUE NOT NULL references urls(url),
  created_on timestamp NOT NULL DEFAULT now(),
  updated_on timestamp,
  title text,
  description text
);

INSERT INTO urls (url) VALUES ('https://www.google.com'), ('https://stackoverflow.com');
