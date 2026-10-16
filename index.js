import { URL } from 'node:url';
import { parse as htmlParse } from 'parse5';
import { Pool } from 'pg';

// Social search engine
// Top-level entity: page (HTML)
// Browse search results (pages) like they're social media posts
// Vote on a page
// Comment on a page
// domain: search.social (?)

(await import('dotenv')).config();

const connectionString =
  process.env.PG_CONNECTION_STRING ||
  'postgresql://preston@localhost:5432/crawler';

const pool = new Pool({ connectionString });

const roundSize = +process.env.ROUND_SIZE || 5;
const roundLimit = +process.env.ROUND_LIMIT || Infinity;

for (let i = 0; i < roundLimit; i++) {
  const queryResult = await pool.query(
    'SELECT url FROM urls ORDER BY crawled_on ASC NULLS FIRST, created_on DESC LIMIT $1',
    [roundSize],
  );

  const urls = queryResult.rows.map((row) => row.url);
  for (const originUrl of urls) {
    try {
      const response = await fetch(originUrl);

      if (!response.ok) {
        console.error('bad response:', response.status);
        continue;
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        console.info('parsing JSON:', originUrl);
        console.log(JSON.parse(await response.text()));
        // Determine what to do with JSON data
      } else if (contentType?.includes('text/html')) {
        console.info('parsing HTML:', originUrl);
        const doc = htmlParse(await response.text());
        const bodyNode = doc.childNodes
          .find((node) => node.tagName === 'html')
          .childNodes.find((node) => node.tagName === 'body');

        const linkUrls = [];
        const searchDepth = process.env.PAGE_SEARCH_DEPTH ?? Infinity;
        let level = 1;
        let childNodes = bodyNode.childNodes;
        let childNodeCount = childNodes.length;
        while (childNodeCount > 0 && level <= searchDepth) {
          const grandChildNodes = [];
          for (const node of childNodes) {
            if (node.tagName === 'a') {
              const hrefValue = node.attrs.find(
                (attr) => attr.name === 'href',
              )?.value;
              if (hrefValue) {
                const href = URL.parse(hrefValue, originUrl).href;
                linkUrls.push(href);
              }
            } else if (node.childNodes) {
              grandChildNodes.push(...node.childNodes);
            }
          }

          childNodes = grandChildNodes;
          childNodeCount = childNodes.length;
          level++;
        }

        console.info('URLs found:', linkUrls.length);

        // Wrap in a transaction
        pool.query('UPDATE urls SET crawled_on = now() WHERE url = $1', [
          originUrl,
        ]);
        // Upsert into `pages` by `originUrl`
        // Delete `links` by `originUrl`
        // Insert `links` on `originUrl`
        // Insert new URLs into `urls`
      }
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }
}

pool.end();
