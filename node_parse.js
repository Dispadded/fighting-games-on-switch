var { Eta } = require('eta');
var HTMLParser = require('node-html-parser');
var HTMLPrettify = require('pretty');
var fs = require('fs');

var jsonData = fs.readFileSync("json-data.js", 'utf-8')
    .split('\n');

// remove first and last line (used for client-side only)
jsonData.shift();
jsonData.pop();


const data = JSON.parse( jsonData.join('') );
// get template
const templateFile = fs.readFileSync("template.html", 'utf-8');
const htmlRoot = HTMLParser.parse( templateFile );
const template = htmlRoot.querySelector('#game-row-template')?.innerHTML ?? "";

// remove unnecessary sections (marked with data-no-render attribute)
htmlRoot.querySelectorAll('[data-no-render]').forEach(el => el.remove());

// run template engine
const eta = new Eta({ escapeFunction: (str) => str }); // disable XML-escaping (aka don't turn ' to &#39;)
const result = eta.renderString(template, data);
htmlRoot.querySelector('#table-body').set_content( result );

// prettify HTML string
const fullHtml = htmlRoot.toString();
const prettifiedFullHtml = HTMLPrettify( fullHtml, { ocd: true } );

// write to file
fs.writeFileSync("output.html", prettifiedFullHtml);