import { parse } from 'parse5';

// Social search engine
// Top-level entity: page (html)
// Browse search results (pages) like they're social media posts
// Vote on a page
// Comment on a page
// domain: search.social (?)

// Below is alpha web crawler impl

try {
  const response = await fetch('https://google.com');

  if (!response.ok) {
    throw new Error('bad response:', response.status);
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    console.info('json parsing');
    console.log(JSON.parse(await response.text()));
  } else if (contentType?.includes('text/html')) {
    console.info('html parsing');
    const doc = parse(await response.text());
    const bodyNode = doc.childNodes
      .find((node) => node.tagName === 'html')
      .childNodes.find((node) => node.tagName === 'body');

    const anchors = [];
    const limit = process.env['SEARCH_DEPTH'] ?? Infinity;
    let count = 1;
    let childNodes = bodyNode.childNodes;
    let childNodeCount = childNodes.length;
    while (childNodeCount > 0 && count <= limit) {
      console.info(`level #${count}`);
      const grandChildNodes = [];
      for (const node of childNodes) {
        if (node.tagName === 'a') {
          anchors.push(node);
          console.log(node.attrs.find((attr) => attr.name === 'href').value);
        } else if (node.childNodes) {
          grandChildNodes.push(...node.childNodes);
        }
      }

      childNodes = grandChildNodes;
      childNodeCount = childNodes.length;
      count++;
    }

    // store html page
    // fork workers / async network req / parallel comp
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}
