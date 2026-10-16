CREATE TABLE pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text UNIQUE NOT NULL references urls(url),
  created_on timestamp NOT NULL DEFAULT now(),
  updated_on timestamp,
  title text,
  description text
);
