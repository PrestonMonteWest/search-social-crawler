import { URL } from 'node:url';
import { parse as htmlParse } from 'parse5';
import { Pool } from 'pg';
(await import('dotenv')).config();

const connectionString =
  process.env.PG_CONNECTION_STRING ||
  'postgresql://preston@localhost:5432/crawler';

const pool = new Pool({ connectionString });
const queryResult = await pool.query(
  'SELECT href FROM pages ORDER BY last_crawl ASC NULLS FIRST, origin NULLS FIRST, created_on DESC LIMIT 5',
);

const pageUrls = queryResult.rows.map((row) => row.href);

// Social search engine
// Top-level entity: page (html)
// Browse search results (pages) like they're social media posts
// Vote on a page
// Comment on a page
// domain: search.social (?)

// Below is alpha web crawler impl

const pageUrl = pageUrls[0];
try {
  const response = await fetch(pageUrl);

  if (!response.ok) {
    throw new Error('bad response:', response.status);
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    console.info('parsing JSON:', pageUrl);
    console.log(JSON.parse(await response.text()));
  } else if (contentType?.includes('text/html')) {
    console.info('parsing HTML:', pageUrl);
    const doc = htmlParse(await response.text());
    const bodyNode = doc.childNodes
      .find((node) => node.tagName === 'html')
      .childNodes.find((node) => node.tagName === 'body');

    const urls = [];
    const searchDepth = process.env['PAGE_SEARCH_DEPTH'] ?? Infinity;
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
            const href = URL.parse(hrefValue, pageUrl).href;
            urls.push(href);
          }
        } else if (node.childNodes) {
          grandChildNodes.push(...node.childNodes);
        }
      }

      childNodes = grandChildNodes;
      childNodeCount = childNodes.length;
      level++;
    }

    console.info('URLs found:', urls.length);

    // Update last_crawl timestamp
    // Store found URLs
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}
