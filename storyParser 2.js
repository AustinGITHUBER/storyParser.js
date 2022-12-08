// ! NOTE: This uses the fetch feature.
// uses strict mode
'use strict'
// fetches text from file
let fetchText = (path, _function) => fetch(path).then(resp => {
    // if file not found just return
    if (!resp.ok) return
    // else it will just call _function with the string argument it got
    resp.text().then(_function)
})
// parsedLine class which holds talk (boolean), name (any), line (string)
class parsedLine {
    // constructor
    constructor(talk = true, name = null, lines = '') {
        // this.talk is if it is a character
        this.talk = talk
        // this.name is its name or null if no name
        this.name = name
        // this.lines is its line
        this.lines = lines
    }
}
// creates image
let createImage = (parent = document.body, src = '', height = 100) => {
    // creates img element
    let img = document.createElement('img')
    // makes parent its parent
    parent.append(img)
    // fetches src while returning img
    fetch(src).then(resp => {
        // deletes image if source not found
        if (!resp.ok) return img.remove()
        // sets img src to src
        img.src = src
        // sets img height to height (px?)
        img.height = height
    })
    //  returns img as said above
    return img
}
// creates span
let createSpan = (parent = document.body, text = '') => {
    // creates span element
    let span = document.createElement('span')
    // sets span's text to text
    span.innerText = text
    // makes parent its parent
    parent.append(span)
    // returns span
    return span
}
// creates image span span if a character is talking and returns true, returns false otherwise
let createCharacterTalkingGui = (path = '.', parent = document.body, _parsedLine = new parsedLine()) => {
    // if narrator is talking then return false
    if (!_parsedLine.talk) return false
    // or create image with a parent parent and a src of where the img is supposed to be (also it's supposed to be a png image)
    createImage(parent, `${path}/../${_parsedLine.name}.png`)
    // creates span with parent parent and makes its text "name: "
    createSpan(parent, `${_parsedLine.name}: `)
    // creates span with parent parent like above but makes its text "line"
    createSpan(parent, _parsedLine.lines)
    // returns true
    return true
}
// creates "i" element
let createItalic = (parent = document.body, text = '') => {
    // creates i element
    let italic = document.createElement('i')
    // sets text to text
    italic.innerText = text
    // makes parent its parent
    parent.append(italic)
    // returns it
    return italic
}
// creates document fragment
let makeFragment = (...elems) => {
    // creates a document fragment
    let fragment = document.createDocumentFragment()
    // makes elems' elements its children
    fragment.append(...elems)
    // return the fragment
    return fragment
}
// finds last name in parsed lines
let findName = (ind = 0, parsedLines = []) => {
    // if ind is 0, return null since 0 - 1 is -1 which isn't an index of any array
    if (ind === 0) return null
    // if the previous line before parsedLines[ind] is not a continued line then return its name
    if (parsedLines[ind - 1].lines.indexOf('\\c') !== 0) return parsedLines[ind - 1].name
    // or loop back but with ind - 1
    return findName(ind - 1)
}
// return new parsedLine with talk being not [foundName is null] (so it can talk), name being null if not found last name and last name if found, lines being the part without \c
let forContinuedLines = (line = '\\c', i, _parsedLines = []) => {
    // does findName with ind i and parsedLines _parsedLines
    let foundName = findName(i, _parsedLines)
    // returns a new parsedLine with the values mentioned above
    return new parsedLine(!(foundName === null), foundName, line.slice(2).replace(/\\:/g, ':'))
}
// main function, takes story path (string)
var storyParser = (path = './stories/story/story.txt') => {
    // rest of the code
    let restOfCode = str => {
        // splits the string into lines
        let lines = str.split('\r\n')
        // creates variable parsedLine which is an array
        let parsedLines = []
        // for each line call a function with line and i,
        lines.forEach((line, i) => {
            // \c feature
            if (line.indexOf('\\c') === 0) return parsedLines.push(forContinuedLines(line, i, parsedLines))
            // create variable removedLine which is just line with no \:
            let removedLine = line.replace(/\\:/g, '')
            // if it includes : just return push new parsedLine in parsedLines with properties talk being true, name being the part before the first : that is not \: , \: replaced with : , and trimmed, lines being the part after the first : that is not \: , \: replaced with : aswell, and trimmed
            if (removedLine.includes(':')) return parsedLines.push(new parsedLine(true, line.replace(/\\:/g, '\n').split(':')[0].replace(/\n/g, ':').trim(), line.replace(/\\:/g, '\n').split(':')[1].replace(/\n/g, ':').trim()))
            // else return push new parsedLine in parsedLines with properties talk being false, name being null, lines being line but with the \: being replaced with : aswell
            return parsedLines.push(new parsedLine(false, null, line.replace(/\\:/g, ':')))
        })
        // creates an array named elems
        let elems = []
        // pushes divs in elems with the number of divs being parsedLines.length
        parsedLines.forEach(() => elems.push(document.createElement('div')))
        // having each elem undergo createCharacterTalkingGui with path path, parent elem (the current div), _parsedLine parsedLines[i] and if unsuccessful, creates i element with parent elem (the current div) and text parsedLines[i].lines (the current line)
        elems.forEach((elem, i) => createCharacterTalkingGui(path, elem, parsedLines[i]) ? undefined : createItalic(elem, parsedLines[i].lines))
        // creates parent div named _div
        let _div = document.createElement('div')
        // makes _div the parent of all of the elements in elems
        _div.append(...elems)
        // makes a document fragment with a child _div a child of document.body (the body element)
        document.body.append(makeFragment(_div))
    }
    // fetches file from path and if successful, calls restOfCode(str)
    fetchText(path, restOfCode)
}