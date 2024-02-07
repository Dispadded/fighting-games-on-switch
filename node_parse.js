var { Eta } = require('eta');
var { marked } = require('marked');
var HTMLParser = require('node-html-parser');
var HTMLPrettify = require('pretty');
var fs = require('fs');

var jsonData = fs.readFileSync("json-data.js", 'utf-8')
    .split('\n'); // TODO: find a better, reliable way of excluding extra blank line at the end

// remove first and last line (used for client-side only)
jsonData.shift();
jsonData.pop();


const data = JSON.parse( jsonData.join('') );
// get template
const templateFile = fs.readFileSync("template.html", 'utf-8');
const htmlRoot = HTMLParser.parse( templateFile );
const template = htmlRoot.querySelector('#game-row-template')?.innerHTML ?? "";

// inline template variables
const eta_json = new Eta({ useWith: true, tags: ['{{', '}}'], parse: { interpolate: '' } });
data['etaJS_json'] = eta_json;
data['markdown'] = marked;

// run template engine
const eta = new Eta({ autoEscape: false }); // !autoEscape = disable XML-escaping (aka don't turn ' to &#39;)
const result = eta.renderString(template, data);
htmlRoot.querySelector('#table-body').set_content( result );

// remove unnecessary sections (marked with data-no-render attribute)
htmlRoot.querySelectorAll('[data-no-render]').forEach(el => el.remove());

// prettify HTML string
const fullHtml = htmlRoot.toString();
const prettifiedFullHtml = HTMLPrettify( fullHtml, { ocd: true } );

// write to file
fs.writeFileSync("output.html", prettifiedFullHtml);
