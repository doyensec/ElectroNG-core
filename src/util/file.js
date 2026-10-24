import fs from 'fs';
import os from 'os';
import path from 'path';
import mdToHtml from './md2html/index';
import escape from 'markdown-escape'
import xlsx from 'node-xlsx'
import asar from 'asar';
const VER = require('../../package.json').version;


export function is_directory(input){
  return fs.statSync(input).isDirectory();
}

export function getSample(fileLines, index) {
    let sample = fileLines[index];
    // Also removes the \r leftover from split('\n') on Windows
    // Using split('\n') in checkers however is OK, because file ending depends on Git settings and *may* be just '\n' even on Windows
    sample = sample.trim();

    // Return a substring when the sample is too long. This avoids OOM exception when scanning large apps.
     if (sample.length > 100)
       return sample.substring(0,100) + "...";
 
    return sample;
  }

export function getRelativePath(targetFolder, filePath) { 
  if (filePath === "N/A")
    return filePath;
  if (is_directory(targetFolder))
    return path.relative(targetFolder, filePath);
  else //if (extension(targetFolder) === 'asar')
    return path.relative(path.dirname(targetFolder), filePath);
}

export function input_exists(input) {
  try {
    return fs.lstatSync(input);
  } catch (err) {
    return false;
  }
}

export function read_file(file) {
  if (file.includes('.asar' + path.sep)) { // it's an asar-packaged artifact
    var archiveRegex = path.sep === '/' ? /(.+\.asar)\/(.+)/i : /(.+\.asar)\\(.+)/i;
    var res = file.match(archiveRegex);
    if (res !== null && res.length != 2) {
      var archive = res[1];
      var filename = res[2];
      return asar.extractFile(archive, filename);
    } else return ""; //file included .asar, but the regex failed to parse archive && filename
  } else
    return fs.readFileSync(file, 'utf8');
}

export function extension(file) {
  return file.slice((file.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

export async function list_files(input){
  var files = [];
  try {
    files = await walk(input);
  } catch (e) {
        console.error(e);
  }

  files = files.filter(file => {
    // A file can be undefined when for example it's a symlink 
      if (file !== undefined)
        return file.indexOf('node_modules') === -1 && (['js', 'jsx', 'ts', 'tsx', 'html', 'htm', 'electrong'].includes(extension(file)) || file.toLowerCase().indexOf('package.json') > -1 || file.toLowerCase().indexOf('package-lock.json') > -1 || file.toLowerCase().indexOf('yarn.lock') > -1);
  });

  return files;
}

async function walk(dir) {
    var files = await fs.promises.readdir(dir);
    files = await Promise.all(files.map(async file => {
        const filePath = path.join(dir, file);
        // this try-catch is useful for some edge-case, i.e. a broken symlink throws an err with fs.promises.stat function (as in ipfs-desktop app)
        try {
          const stats = await fs.promises.stat(filePath);
          if (stats.isDirectory()) return walk(filePath);
          else if (stats.isFile()) return filePath;

          // we return undefined for everything that is not a file or a directory
          else {

            if (stats.isSymbolicLink()) {
              console.log("Found a SymLink " + filePath)
              // const resolvedSymlink = await fs.promises.realpath(filePath)
              // console.log(filePath + "FILE PATH is a SymLink resolved to " + resolvedSymlink)
              // const statsResolvedSymlink = await fs.promises.stat(resolvedSymlink);
              // if (statsResolvedSymlink.isDirectory()) return walk(resolvedSymlink);
              // else if(statsResolvedSymlink.isFile()) return resolvedSymlink
            }

            if (stats.isBlockDevice()) {
              console.log("Found a blockdevice " + filePath)
            }

            if (stats.isFIFO()) {
              console.log("Found a FIFO " + filePath)
            }
            if (stats.isSocket()) {
              console.log("Found a SOCKET " + filePath)
            }
            if (stats.isCharacterDevice()) {
              console.log("Found a CharacterDevice " + filePath)
            }

            return undefined
          }
        } catch (err) {
          console.log(err)
          return undefined
        }
    }));

    // filter undefined elements here as a safeguard for other methods that may call this. list_files function already filters undefined files.
    return files.filter(file => file !== undefined).reduce((all, folderContents) => all.concat(folderContents), []);
}

/**
 * Return the details for single the findings to be shown in the UI. 
 * This is (almost) a copy from a part of the compileHtmlOrPdf, with some differences: 
 * - no position of the findinds
 */
 export async function getHTMLDetailForFinding(result, outputOptions = {onlyShowRelativePath: false, showAuditorNotes: false, showPoCs: true}) {

  let content = '';

  content += CSS_TAILWIND_STYLE;

  // FIX to make the text in the UI a bit bigger
  content += `<style> body { font-size: medium} </style>\n`;

  let kbPath = normalizePath('kb');
  
  
  result.forEach((issue, index) => {
    
    var baseName = issue.file !== "N/A" ? EntitiesHtml(path.basename(issue.file)) : false;
    
    let title = (issue.title.trim());

    let completeTitle = ''

    if (baseName)
      completeTitle = `${title} In ${baseName}`;
    else
      completeTitle = `${title}`;

      // TODO: remove
      // if (typeof issue.location === 'undefined')
      // debugger


    let location = '';
    if (issue.file && issue.file !== "N/A") {
      if (outputOptions.onlyShowRelativePath)
        location = `${(issue.relativeFilePath)} (${issue.location.line}:${issue.location.column})`;
      else
        location = `${(issue.file)} (${issue.location.line}:${issue.location.column})`;
    }
    
    let sample = '';
    if (issue.sample && issue.sample.trim().length > 1)
      sample = `${(issue.sample.trim())}`;


    let notes = '';
    if (issue.notes && issue.notes.trim().length > 1 && outputOptions.showAuditorNotes)
      notes = `_${(issue.notes.trim())}_`;

    content += generateFindingDetailComponent('', completeTitle, issue, location, sample, notes);

    content += readMDFile(kbPath, issue.id);
      
    if (issue.id == "CSP_GLOBAL_CHECK" || issue.id == "LIMIT_NAVIGATION_GLOBAL_CHECK") {
      content += `### Vulnerability details` + '\n';
       if (issue.description.trim().endsWith('.'))
        content += issue.description  + '\n';
      else
        content += issue.description  + '.\n';
    }

    if (issue.id == "FRAMEWORK_VULNERABILITY_GLOBAL_CHECK"){
      content += `### Vulnerability details` + '\n';
      if (issue.description.trim().endsWith('.'))
        content += issue.description  + '\n';
      else
        content += issue.description  + '.\n';

      if (issue.properties.fixedOn)
        content += `\nThe issue was fixed on ${issue.properties.fixedOn}.`  + '\n';

      if ((issue.properties.PoC_A || issue.properties.PoC_B) && outputOptions.showPoCs) {
        content += "#### Proof Of Concept Code" + '\n';
        if (issue.properties.PoC_A) {
          content += "```" + '\n';
          content += issue.properties.PoC_A + '\n';
          content += "```" + '\n\n';
        }
        if (issue.properties.PoC_B) {
          content += "```" + '\n';
          content += issue.properties.PoC_B + '\n';
          content += "```" + '\n\n';
        }
      }
    }

    content += '<div class="page-break"></div>\n\n' // PAGE BREAK

  });

  
  // Need to add md to html parsing
  let out = await mdToHtml({ content: content },
    {
      as_html: true
    }).catch(console.error);
   
   return out;
}

export async function writeIssues(root, outputOptions, filename, result, outputFileFormat, projectLabel){
  switch(outputFileFormat) {
    case "sarif":
      compileSarif(root, outputOptions, filename, result);
      return true;
    break;

    case "csv":
      compileCsv(root, outputOptions, filename, result);
      return true;
    break;

    case "xlsx":
      compileXlsx(root, outputOptions, filename, result, projectLabel);
      return true;
    break;

    case "pdf":
      var htmlOutput = await compilePdfOrHtml(outputFileFormat, root, outputOptions, result, projectLabel);
      return htmlOutput;
    break;

    case "html":
      var htmlOutput = await compilePdfOrHtml(outputFileFormat, root, outputOptions, result, projectLabel);
      return htmlOutput;
    break;

    default:
      throw Error("Unsupported export format");
  }
}

  const CSS_TAILWIND_STYLE = `<style>
  body {
    zoom: 0.8;
  }
  .findingDetail.py-6 {
    padding-top: 0;
    padding-bottom: 0;
  }
  h1, h2, h3, h4, h5, h6 {
    font-size: initial;
    font-weight: bold;
  }
  table th, table td {
    border: none; 
  }      
  .informational {
    border-radius: 0.25rem;
    line-height: 1.25rem;
    font-weight: 600;
    padding-left: 0.625rem;
    padding-right: 0.625rem;
    padding-top: 0.125rem;
    padding-bottom: 0.125rem;
    --tw-text-opacity: 1;
    --tw-bg-opacity: 1;
    background-color: rgba(32, 113, 169, var(--tw-bg-opacity));
    color: white;
  }  
  .low {
    border-radius: 0.25rem;
    line-height: 1.25rem;
    font-weight: 600;
    padding-left: 0.625rem;
    padding-right: 0.625rem;
    padding-top: 0.125rem;
    padding-bottom: 0.125rem;
    --tw-text-opacity: 1;
    --tw-bg-opacity: 1;
    background-color: rgba(142, 185, 107, var(--tw-bg-opacity));
    color: white;
  }  
  .high {
    border-radius: 0.25rem;
    line-height: 1.25rem;
    font-weight: 600;
    padding-left: 0.625rem;
    padding-right: 0.625rem;
    padding-top: 0.125rem;
    padding-bottom: 0.125rem;
    --tw-text-opacity: 1;
    --tw-bg-opacity: 1;
    color: white;
    background-color: rgba(198, 66, 31, var(--tw-bg-opacity));
  }  
  .medium {
    border-radius: 0.25rem;
    line-height: 1.25rem;
    font-weight: 600;
    padding-left: 0.625rem;
    padding-right: 0.625rem;
    padding-top: 0.125rem;
    padding-bottom: 0.125rem;
    --tw-text-opacity: 1;
    --tw-bg-opacity: 1;
    background-color: rgb(199, 137, 47);
    color: white;
  }
  
  a {
    color:blue;
    text-decoration: underline;
    }
    .h-screen {
      height: 100vh;
    }
    
    .bg-no-repeat {
      background-repeat: no-repeat;
    }
    
    .bg-cover {
      background-size: cover;
    }
    
    .items-center {
      align-items: center;
    }
    
    .pt-6 {
      padding-top: 1.5rem; /* 24px */
    }
    
    .invisible {
      visibility: hidden;
    }
    
    .items-stretch {
      align-items: stretch;
    }
    
    .text-8xl {
      font-size: 6rem; /* 96px */
      line-height: 1;
    } 
    
    .text-right{
      text-align: right;
    } 
    
    .pr-10{
      padding-right: 2.5rem; /* 40px */
    } 
    
    .flex {
      display: flex;
    } 
    
    .justify-between{
      justify-content: space-between;
    }
    
    .px-6{
      padding-left: 1.5rem; /* 24px */
    padding-right: 1.5rem; /* 24px */
    } 
    
    .mt-10{
      margin-top: 2.5rem; /* 40px */
    } 
    
    .px-8{
      padding-left: 2rem; /* 32px */
    padding-right: 2rem; /* 32px */
    }
    
    .py-4{
      padding-top: 1rem; /* 16px */
    padding-bottom: 1rem; /* 16px */
    } 
    
    .text-2xl{
      font-size: 1.5rem; /* 24px */
    line-height: 2rem; /* 32px */
    } 
    
    .font-bold{
      font-weight: 700;
    } 
    
    
    .text-base{
      font-size: 1rem; /* 16px */
    line-height: 1.5rem; /* 24px */
    } 
    
    .justify-end{
      justify-content: flex-end;
    }
    
    
    .w-full{
      width: 100%;
    } 
    
    footer {
      /*insert css if needed */
    }

h1 code,
h2 code,
h3 code,
h4 code,
h5 code,
h6 code,
p code,
li code,
pre code {
  background-color: #f8f8f8;
  padding: 0.1em 0.375em;
  border: 1px solid #f8f8f8;
  border-radius: 0.25em;
  font-family: monospace;
  font-size: 1.2em;
}

pre {
  white-space: pre-wrap;
}

pre code {
  display: block;
  padding: 0.5em;
}

table th {
  font-weight: 600;
}

table tr:nth-child(2n) {
  background-color: whitesmoke;
}
              
              
.text-sm {
  font-size: 0.875rem; /* 14px */
  line-height: 1.25rem; /* 20px */
}
.text-left {
  text-align: left;
}
.text-gray-500 {
  color: rgb(107 114 128);
}
.text-xs {
  font-size: 0.75rem; /* 12px */
  line-height: 1rem; /* 16px */
}
.text-gray-700 {
  color: rgb(55 65 81);
}
.uppercase {
  text-transform: uppercase;
}
.bg-gray-50 {
  background-color: rgb(249 250 251);

}
.bg-blue-800 {
  background-color: rgb(30 64 175);
}
.text-white {
  color: rgb(255 255 255);
}
.py-3 {
  padding-top: 0.75rem; /* 12px */
padding-bottom: 0.75rem; /* 12px */
}
.font-medium {
  font-weight: 500;
}
.text-gray-900 {
 color: rgb(17 24 39);
}
.whitespace-nowrap {
  white-space: nowrap;
}
.py-2 {
  padding-top: 0.5rem; /* 8px */
  padding-bottom: 0.5rem; /* 8px */

}
.py-6 {
  padding-top: 1.5rem; /* 24px */
  padding-bottom: 1.5rem; /* 24px */
}
.p-8 {
  padding: 2rem; /* 32px */
}
.border-b {
  border-bottom-width: 1px;
  border-bottom-style: solid;
}
.border-gray-700 {
  border-color: rgb(55 65 81 / 30%)
}
.bg-blue-500 {
  background-color: rgb(59 130 246);
}
.mr-6 {
  margin-right: 1.5rem; /* 24px */
}
.pr-6 {
  padding-right: 1.5rem; /* 24px */
}
.w-1\\/4 {
  width: 25%;
}
.text-white {
  color: rgb(255 255 255);
}
.p-2  {
  padding: 0.5rem; /* 8px */
}
.w-3\\/4 {
  width: 75%;
}
.page-break {
  page-break-after: always;
}
table th,
table td {
  padding: 0.5em 1em;
  
}
table tr {
  background-color: white;
  border-top: 1px solid gainsboro;
}
table tr:nth-child(2n) {
  background-color: whitesmoke;
}
table th {
  font-weight: 600;
}
thead > tr {
  background-color: rgba(32, 113, 169);
  color: white;
}
.flex-col {
  flex-direction: column;
}
 

.pb-52 {
  padding-bottom: 13rem; /* 208px */
}

.pl-14 {
  padding-left: 3.5rem; /* 56px */
}

.text-6xl {
  font-size: 3.75rem; /* 60px */
  line-height: 1;
}
</style>\n`;


async function compilePdfOrHtml(format, root, outputOptions, result, projectLabel) {
  var destinationPath, content;
  var kbPath; 
  

  kbPath = normalizePath('kb')
  
  content = `<style>
              @font-face {
                font-family: 'Open Sans';
                font-style: normal;
                font-weight: 400;
                font-stretch: 100%;
                src: url(https://fonts.gstatic.com/s/opensans/v28/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVQUwaEQbjA.woff) format('woff');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
                }                
                body {
                  font-family: 'Open Sans';
                }
                code {
                    font-family: monospace;
                }
                table {
                    width: 100%;
                    display: table;
                }
            </style>\n`


  if (format === "html") {
    content += `<style>
                  body {
                    margin: 5em 20%;
                  }
                  </style>\n`                
  }

  content+= CSS_TAILWIND_STYLE;

  let escapedProjectLabel;
  if (projectLabel)
    escapedProjectLabel = `ElectroNG Report for ${projectLabel}`
  else
   escapedProjectLabel = `ElectroNG Report`

  
 content += `<div class="flex flex-col justify-between bg-blue-100 bg-no-repeat h-screen bg-cover" style="background-repeat: no-repeat; background-image:url('ELECTRONGFRONT')">

  <div id="intestazione" class="flex justify-between items-center pt-6">
    <div class="invisible items-stretch text-8xl">ElectroNG</div>
    <div class="text-right text-base pr-10">ElectroNG report generated on ${formattedDate()}</div>
  </div>
  
  <h1 class="pl-14 pb-52 text-6xl w-3/4">${escapedProjectLabel}</h1>

</div>
<div class="footer flex justify-between px-6 font-bold text-base mt-10">
    <div>https://doyensec.com/</div>
    <div>(v${VER})</div>
</div>` + '\n'
content += '<div class="page-break"></div>\n\n' // PAGE BREAK


  // Generates the Table of Content (a.k.a. Issues table)
  if (outputOptions.showTableSummary) {
    content += `<div id="intest_proj_findings" class="px-8 py-4" >
    <div class="text-2xl font-bold" style="color: rgb(73, 154, 166);">
        Project findings
    </div>
   <div class="text-base"> The table below lists the findings with their associated ID and severity. </div>
  </div>` + '\n\n'
    
    content += "<table><thead><tr><th>#</th><th>Title</th><th>Issue ID</th><th>Severity</th><th>Confidence</th></tr></thead>"
    result.forEach((issue, index) => {
      var position = index + 1;
      var baseName = issue.file !== "N/A" ? (path.basename(issue.file)) : false;
      let title = EntitiesHtml(issue.title.trim());

      
      if (baseName)
        content += `<tr style="cursor:pointer" onclick="location.href=location.href + '#${position}'" > <td><a href='#${position}'>${position}</a></td> <td> ${title} In ${baseName} </td><td> ${(issue.id)}</td><td> <div class="flex justify-end w-full"><div class="flex ${issue.severity.name.toLowerCase()}">${issue.severity.name}</div></div> </td><td> ${issue.confidence.name} </td></tr>`;
      else
        content += `<tr style="cursor:pointer" onclick="location.href=#${position}" ><td> <a href='#${position}'>${position}</a> </td><td> ${title} </td><td> ${(issue.id)} </td><td> <div class="flex justify-end w-full"><div class="flex ${issue.severity.name.toLowerCase()}">${issue.severity.name}</div></div> </td><td> ${issue.confidence.name} </td></tr>`;
    });


     content += '</table><div class="page-break"></div>\n\n'; // PAGE BREAK
  }

  // Generate the table with the details of the finding and include the related documentation
  if (outputOptions.showFindings) {
    
    // TAILWIND - finding details
    result.forEach((issue, index) => {
      
      var position = index+1;
      var baseName = issue.file !== "N/A" ? EntitiesHtml(path.basename(issue.file)) : false;
      
      let title = (issue.title.trim());

      let completeTitle = ''

      if (baseName)
        completeTitle = `${position} - ${title} In ${baseName}`;
      else
        completeTitle = `${position} - ${title}`;

      // TODO: remove
      // if (typeof issue.location === 'undefined')
      //   debugger
      let location = '';
      if (issue.file && issue.file !== "N/A") {
        if (outputOptions.onlyShowRelativePath)
          location = `${(issue.relativeFilePath)} (${issue.location.line}:${issue.location.column})`;
        else
          location = `${(issue.file)} (${issue.location.line}:${issue.location.column})`;
      }
      
      let sample = '';
      if (issue.sample && issue.sample.trim().length > 1)
        sample = `${(issue.sample.trim())}`;


      let notes = '';
      if (issue.notes && issue.notes.trim().length > 1 && outputOptions.showAuditorNotes)
        notes = `_${(issue.notes.trim())}_`;

      content += generateFindingDetailComponent(position, completeTitle, issue, location, sample, notes);

      content += readMDFile(kbPath, issue.id);
        
      // TODO: check table rendering result
      if (issue.id == "CSP_GLOBAL_CHECK" || issue.id == "LIMIT_NAVIGATION_GLOBAL_CHECK") {
        content += `### Vulnerability details` + '\n';
         if (issue.description.trim().endsWith('.'))
          content += issue.description  + '\n';
        else
          content += issue.description  + '.\n';
      }

      if (issue.id == "FRAMEWORK_VULNERABILITY_GLOBAL_CHECK"){
        content += `### Vulnerability details` + '\n';
        if (issue.description.trim().endsWith('.'))
          content += issue.description  + '\n';
        else
          content += issue.description  + '.\n';

        if (issue.properties.fixedOn)
          content += `\nThe issue was fixed on ${issue.properties.fixedOn}.`  + '\n';

        if ((issue.properties.PoC_A || issue.properties.PoC_B) && outputOptions.showPoCs) {
          content += "#### Proof Of Concept Code" + '\n';
          if (issue.properties.PoC_A) {
            content += "```" + '\n';
            content += issue.properties.PoC_A + '\n';
            content += "```" + '\n\n';
          }
          if (issue.properties.PoC_B) {
            content += "```" + '\n';
            content += issue.properties.PoC_B + '\n';
            content += "```" + '\n\n';
          }
        }
      }

      

      content += '<div class="page-break"></div>\n\n' // PAGE BREAK

    });


    let svgPath = normalizePath('assets');
    const svgEndPage = fs.readFileSync(svgPath + path.sep + 'backpage.svg');

    content +=`<div class='w-full'>${svgEndPage}</div>\n\n`

}

  var frontTitle = `ElectroNG report generated on <span class="date"></span>`;

  let out = await mdToHtml({ content: content },
    {
      as_html: format === "html" ? true : false,
      pdf_options: {
                        "format": "a4",
                        "margin": "30mm 20mm",
                        "printBackground": true,
                        "headerTemplate": `<style>
                                            @font-face {
                                                      font-family: 'Open Sans';
                                                      font-style: normal;
                                                      font-weight: 400;
                                                      src: url("https://github.com/googlefonts/opensans/raw/c071e9696751f2d69925d66f3b8c581f2dc041c2/fonts/ttf/OpenSans-Regular.ttf") format('ttf');
                                            }
                                            section {
                                              margin: 0 auto;
                                              font-size: 10px;
                                              font-family: 'Open Sans';
                                            }
                                          </style>
                                          <section>
                                            ${frontTitle}
                                          </section>`,
                        "footerTemplate": `<section>
                                            <div>
                                              Page <span class="pageNumber"></span>
                                              of <span class="totalPages"></span>
                                            </div>
                                          </section>`
                    }

   }).catch(console.error);


   // replace the placeholder with b64 encoded image.
   out = replaceWithB64Image(out, "ELECTRONGFRONT", 'electroNGFront.jpg')

  return out;
}


function replaceWithB64Image (src, placeholder, filename) {

  const result = `data:image/jpeg;base64,${imgTob64(filename)}`
  src = src.replace(placeholder, result)
  return src
}

function readMDFile(kbPath, issueId) {

  let content = '';
  try {
    content = fs.readFileSync(path.join(kbPath, `${issueId}.md`), "utf8");

  } catch (e) {
    console.error(e)
    content = "The documentation for this finding is still under construction. Update the application to see if it was introduced"
  }
  return content;
}

function imgTob64(name) {

  let imgPath = normalizePath('assets')

  var bitmap = fs.readFileSync(imgPath + path.sep + name);
  // convert binary data to base64 encoded string
  const out = Buffer.from(bitmap, 'binary').toString('base64');
  return out
}

/**
 * Returns the absolute path of the folder "toAppend" inside the ElectroNG-core. It's necessary to avoid wrong absolute path
 * when electroNG-core is used as a module.
 * @param {*} toAppend the folder inside electroNG-core to append
 */
export function normalizePath(toAppend) {
  // usually process.env.APP_PATH = /Users/<user>/Desktop/ElectroNG/release/mac/ElectroNG.app/Contents/Resources/app.asar or
  //                              = /Applications/ElectroNG.app/Contents/Resources/app.asar or
  //                              = /Users/<user>/Applications/ElectroNG.app/Contents/Resources/app.asar

  const paths = {
    "kb": {
      "electron":{
        "prod": "../ElectroNG-core/kb/",
        "dev":  "../ElectroNG-core/kb/"
      },
      "library":{
        "dev":  "../kb/"
      }
    },
    "assets": {
      "electron":{
        "prod": "../ElectroNG-core/dist/util/assets",
        "dev":  "../ElectroNG-core/dist/util/assets"
      },
      "library":{
        "dev":  "../dist/util/assets"
      }
    },
    "md2html-stylesheets": {
      "electron":{
        "prod": "../ElectroNG-core/dist/util/md2html/stylesheets",
        "dev":  "../ElectroNG-core/dist/util/md2html/stylesheets"
      },
      "library":{
        "dev":  "../src/util/md2html/stylesheets"
      }
    }
  };

  let normalizedPath = ''

  if (process.env.APP_PATH) { // library is called as a dependency by electron
    if (process.env.NODE_ENV === 'prod') { // library is used in electron in prod (webpack'd inside .app)
      normalizedPath = path.resolve(process.env.APP_PATH, paths[toAppend].electron.prod);
    } else { // library is used in electron in dev (local fs)
      normalizedPath = path.resolve(process.env.APP_PATH, paths[toAppend].electron.dev);
    }
  } else { // library is called bare (for dev or tests)
      normalizedPath = path.resolve('ElectroNG-core' + path.sep + paths[toAppend].library.dev);
  }

  return normalizedPath;

}

function formattedDate () {
  const date = new Date();
  const [month, day, year] = [date.getMonth() + 1, date.getDate(), date.getFullYear()];
  return month + "/" + day + "/" + year
}


function generateRowTable(position, titleAndBasename, issueId, severity, confidence) {

  
  const rowTemplate = `<tr class="border-b dark:bg-gray-800 dark:border-gray-700 odd:bg-white even:bg-gray-50 odd:dark:bg-gray-800 even:dark:bg-gray-700">
  <th scope="row" class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"> 
    ${position} 
  </th>
  <td class="py-2"> ${titleAndBasename} </td>
  <td class="py-2"> ${issueId} </td>
  <td>
      <div class="flex justify-end">
        <div class="${severity.toLowerCase()}"> ${severity} </div>
      </div>
  </td>
  <td class="py-2"> ${confidence} </td>
</tr>`

return rowTemplate;

}


function generateFindingDetailComponent(position, titleAndBasename, issue, location, sample, notes) {

  // It's important that the <div> streak of the table elements are toe to toe without too many spaced, otherwise marked will apply a <pre><code> tag automagically?
  // Because of this, don't change the getLocationRow / getSampleRow / getNotesRow / getFrameworkVulnRows at the bottom of the template, otherwise the formatting will break,
  // producing ugly tables
  const template = `<div id="${position}" class="findingDetail py-6 font-bold">
  <div class="findingTitle text-2xl font-bold" style="color: rgb(73, 154, 166);">
      ${titleAndBasename} 
  </div>
  <div id="findingTableDetails" class="w-full  p-8">
      <div class="flex border-b border-gray-700">
          <div class="bg-blue-500 mr-6 pr-6 w-1/4 text-white p-2">
              Issue ID 
          </div>
          <div class="p-2 w-3/4">
              ${issue.id}
          </div>
      </div>
      <div class="flex border-b border-gray-700">
          <div class="bg-blue-500 mr-6 pr-6 w-1/4 text-white p-2">
              Severity
          </div>
          <div class="p-2 w-3/4 flex">
              <div class="${issue.severity.name.toLowerCase()}">
              ${issue.severity.name}
              </div>
          </div>
      </div>
      <div class="flex border-b border-gray-700">
          <div class="bg-blue-500 mr-6 pr-6 w-1/4 text-white p-2">
              Confidence
          </div>
          <div class="p-2 w-3/4">
            ${issue.confidence.name}
          </div>
      </div>
      <div class="flex border-b border-gray-700">
          <div class="bg-blue-500 mr-6 pr-6 w-1/4 text-white p-2">
              Manual review
          </div>
          <div class="p-2 w-3/4">
          ${issue.manualReview}
          </div>
      </div>
      ${ location ? getLocationRow(location) : '' }${ sample ? getSampleRow(sample) : '' }${ notes ? getNotesRow(notes) : '' }${ (issue.id == "FRAMEWORK_VULNERABILITY_GLOBAL_CHECK") ? getFrameworkVulnsRows(issue.properties) : ''}
  </div>
</div>` + '\n\n'

return template;
}

function getFrameworkVulnsRows(issueProps) {
    let content = "";
  // TODO: check escape vs EntitiesHTML
    if (issueProps.CVE)
      content += getOptionalRowFindingDetail("CVEs", EntitiesHtml(issueProps.CVE.split('\n').join(', ')));
    if (issueProps.affectedVersions)
      content += getOptionalRowFindingDetail("Affected Versions", EntitiesHtml(issueProps.affectedVersions));
  
  return content;
}

function getLocationRow(location) {
  return getOptionalRowFindingDetail('Location', location)
}

function getSampleRow(sample) {
  return getOptionalRowFindingDetail('Affected Line', '<pre><code class="font-normal" style="width: 100%; overflow: auto">'+/*escape*/EntitiesHtml(sample)+'</code></pre>')
}

function getNotesRow(notes) {
  return getOptionalRowFindingDetail('Notes', notes)
}

// some tag are interpreted by the browser (ex "<meta" ) making all the rendering wrong
function EntitiesHtml(string) {
  return String(string).replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}


function getOptionalRowFindingDetail(key, value) {
  return `<div class="flex border-b border-gray-700">
  <div class="bg-blue-500 mr-6 pr-6 w-1/4 text-white p-2">
      ${key}
  </div>
  <div class="p-2 w-3/4" style="overflow: auto">
  ${value}
  </div>
</div>`  
}

function compileSarif(root, outputOptions, filename, result){
  const fileFlag = 'w';
  let issues =
    {
      $schema: "http://json.schemastore.org/sarif-2.1.0",
      version: "2.1.0",
      runs: [
        {
          tool: {
            driver: {
              version: `${VER}`,
              informationUri: "https://github.com/doyensec/electronegativity",
              name: "Electronegativity",
              fullName: "Electronegativity is a tool to identify misconfigurations and security anti-patterns in Electron applications",
              rules: []
            }
          },
          results: []
        }
      ]
    };

      issues.runs[0].invocations = [
        {
          workingDirectory: {
            uri: `file:///${root}`
          },
          executionSuccessful: true
        },
      ];

    result.forEach(issue => {
      if (issues.runs[0].tool.driver.rules[issue.id] === undefined) {
        issues.runs[0].tool.driver.rules.push({
          id: issue.id,
          fullDescription: {
            text: issue.description
          },
          properties: {
            category: "Security"
          },
          helpUri: `https://github.com/doyensec/electronegativity/wiki/${issue.id}`,
          help: {
            text: `https://github.com/doyensec/electronegativity/wiki/${issue.id}`
          }
        });
        issues.runs[0].tool.driver.rules[issue.id] = true;
      }

      let result = {
        ruleId: issue.id,
        level: `${issue.manualReview ? 'note' : 'warning'}`,
        message: {
          text: issue.description
        }
      };

      var location;
      if (outputOptions.onlyShowRelativePath)
        location = issue.relativeFilePath;
      else
        location = issue.file;

      result.locations = [
        {
          physicalLocation: {
            artifactLocation: {
              uri: location !== "N/A" ? location : "file:///"
            },
            region: {
              startLine: issue.location && issue.location.line !== undefined ? (issue.location.line === 0 ? 1 : issue.location.line) : 1, // This is odd, VS and VS Code highlight the line correctly, but min value is 1
              startColumn: issue.location && issue.location.column !== undefined ? issue.location.column + 1 : 1, // sarif columns start from 1
              charLength: issue.sample ? issue.sample.length : 0
            }
          }
        }
      ];

      issues.runs[0].results.push(result);
    });

    const output = JSON.stringify(issues, null, 2);

    fs.writeFile(filename, output, { flag: fileFlag }, (err) => {
      if(err) throw err;
    });
}

function compileCsv(root, outputOptions, filename, result){
  let output = '';
  let fileFlag = 'w';
  writeCsvHeader(filename);
    fileFlag = 'a';
    result.forEach(issue => {
      output += [
        issue.id,
        escapeCsv(issue.severity.name),
        escapeCsv(issue.confidence.name),
        outputOptions.onlyShowRelativePath ? escapeCsv(issue.relativeFilePath) : escapeCsv(issue.file),
        escapeCsv(`${issue.location.line}:${issue.location.column}`),
        escapeCsv(issue.sample),
        escapeCsv(issue.description),
        `https://github.com/doyensec/electronegativity/wiki/${issue.id}`
      ].toString();
      output += os.EOL;
    });

    fs.writeFile(filename, output, { flag: fileFlag }, (err) => {
      if(err) throw err;
    });
}


function compileXlsx(root, outputOptions, filename, result, projectLabel){

  let fileFlag = 'w';
  var dataSheet = [["Issue","Severity","Confidence","Filename","Location","Sample","Description"]];
  var lengths = {
    id: Math.max(...result.map(r => r.id.split('\n')[0].length)),
    file: Math.max(...result.map(r => r.file.split('\n')[0].length)),
    sample: Math.max(...result.map(r => r.sample ? r.sample.split('\n')[0].length : 0)),
    description: Math.max(...result.map(r => r.description ? r.description.split('\n')[0].length : 0))
  }
  result.forEach(issue => {
    dataSheet.push([
      issue.id,
      issue.severity.name,
      issue.confidence.name,
      outputOptions.onlyShowRelativePath ? issue.relativeFilePath : issue.file,
      `${issue.location.line}:${issue.location.column}`,
      issue.sample,
      issue.description
    ]);
  });

  let title;
  if (projectLabel)
    title = `${projectLabel} ElectroNG Scan`;
  else
    title = `ElectroNG Scan`;

  const options = {'!cols':  [{ wch: lengths.id > 80 ? 80 : lengths.id },
                              { wch: 13 }, { wch: 10 },
                              { wch: lengths.file > 80 ? 80 : lengths.file },
                              { wch: 8 },
                              { wch: lengths.sample > 80 ? 80 : lengths.sample },
                              { wch: lengths.description > 80 ? 80 : lengths.description }
                              ]};

  var buffer = xlsx.build([{name: title, data: dataSheet}], options); // Returns a buffer

  fs.writeFile(filename, buffer, { flag: fileFlag }, (err) => {
      if(err) throw err;
  });
}

function escapeCsv(val) {
  return val != null ? '"' + val.replace(/"/g, '""') + '"' : "N/A";
}

export function writeCsvHeader(filename){
  let header = `issue, severity, confidence, filename, location, sample, description, url${os.EOL}`;

  fs.writeFile(filename, header, (err) => {
    if(err) throw err;
  });
}


