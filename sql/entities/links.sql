CREATE TABLE links (
  originUrl text NOT NULL references urls(url),
  linkUrl text NOT NULL references urls(url),
  created_on timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (originUrl, linkUrl)
);
