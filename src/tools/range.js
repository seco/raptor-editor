/**
 * @fileOverview Range manipulation helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Expands a range to to surround all of the content from its start container
 * to its end container.
 *
 * @param {RangyRange} range The range to expand.
 */
function rangeExpandToParent(range) {
    // <strict>
    if (!typeIsRange(range)) {
        handleInvalidArgumentError('Parameter 1 to rangeExpandToParent is expected to be a range', range);
        return;
    }
    // </strict>
    range.setStartBefore(range.startContainer);
    range.setEndAfter(range.endContainer);
}

/**
 * Ensure range selects entire element.
 *
 * @param  {RangyRange} range
 * @param  {Element} element
 */
function rangeSelectElement(range, element) {
    // <strict>
    if (!typeIsRange(range)) {
        handleInvalidArgumentError('Parameter 1 to rangeSelectElement is expected to be a range', range);
        return;
    }
    if (!typeIsElement(element)) {
        handleInvalidArgumentError('Parameter 2 to rangeSelectElement is expected to be a jQuery element', element);
        return;
    }
    // </strict>
    range.selectNode($(element)[0]);
}

function rangeSelectElementContent(range, element) {
    // <strict>
    if (!typeIsRange(range)) {
        handleInvalidArgumentError('Parameter 1 to rangeSelectElementContent is expected to be a range', range);
        return;
    }
    if (!typeIsElement(element) && !typeIsNode(element)) {
        handleInvalidArgumentError('Parameter 2 to rangeSelectElementContent is expected to be a jQuery element or node', element);
        return;
    }
    // </strict>
    range.selectNodeContents($(element).get(0));
}

/**
 * Expand range to contain given elements.
 *
 * @param {RangyRange} range The range to expand.
 * @param {array} elements An array of elements to check the current range against.
 */
function rangeExpandTo(range, elements) {
    // <strict>
    if (!typeIsRange(range)) {
        handleInvalidArgumentError('Parameter 1 to rangeReplace is expected to be a range', range);
        return;
    }
    if (!typeIsArray(elements)) {
        handleInvalidArgumentError('Parameter 2 to rangeExpandTo is expected to be an array', elements);
        return;
    }
    // </strict>
    do {
        rangeExpandToParent(range);
        for (var i = 0, l = elements.length; i < l; i++) {
            if ($(range.commonAncestorContainer).is(elements[i])) {
                return;
            }
        }
    } while (range.commonAncestorContainer);
}

/**
 * Replaces the content of range with the given html.
 *
 * @param  {RangyRange} range The range to replace.
 * @param  {jQuery|String} html The html to use when replacing range.
 * @return {Node[]} Array of new nodes inserted.
 */
function rangeReplace(range, html) {
    // <strict>
    if (!typeIsRange(range)) {
        handleInvalidArgumentError('Parameter 1 to rangeReplace is expected to be a range', range);
        return;
    }
    if (!typeIsElement(html) && !typeIsString(html)) {
        handleInvalidArgumentError('Parameter 2 to rangeReplace is expected to be a string or jQuery element', html);
        return;
    }
    // </strict>

    var result = [],
        nodes = $('<div/>').append(html)[0].childNodes;
    range.deleteContents();
    if (nodes.length === undefined || nodes.length === 1) {
        range.insertNode(nodes[0].cloneNode(true));
    } else {
        $.each(nodes, function(i, node) {
            result.unshift(node.cloneNode(true));
            range.insertNodeAtEnd(result[0]);
        });
    }
    return result;
}

/**
 * Empties a supplied range of all the html tags.
 *
 * @param {RangyRange} range This is the range to remove tags from.
 * @returns {boolean} True if the range is empty.
 */
function rangeEmptyTag(range) {
    var contents = range.cloneContents();
    var html = fragmentToHtml(contents);
    if (typeof html === 'string') {
        html = html.replace(/([ #;&,.+*~\':"!^$[\]()=>|\/@])/g,'\\$1');
    }
    return elementIsEmpty(html);
}

/**
 * @param  {RangyRange} range
 * @return {Node} The range's start element.
 */
function rangeGetStartElement(range) {
    // <strict>
    if (!typeIsRange(range)) {
        handleInvalidArgumentError('Parameter 1 to rangeGetStartElement is expected to be a range', range);
    }
    // </strict>
    return nodeFindParent(range.startContainer);
}

/**
 * @param  {RangyRange} range
 * @return {Node} The range's end element.
 */
function rangeGetEndElement(range) {
    // <strict>
    if (!typeIsRange(range)) {
        handleInvalidArgumentError('Parameter 1 to rangeGetEndElement is expected to be a range', range);
    }
    // </strict>
    return nodeFindParent(range.endContainer);
}

/**
 * Returns a single selected range's common ancestor.
 * Works for single ranges only.
 *
 * @param {RangyRange} range
 * @return {Element} The range's common ancestor.
 */
function rangeGetCommonAncestor(range) {
    // <strict>
    if (!typeIsRange(range)) {
        handleInvalidArgumentError('Parameter 1 to rangeGetCommonAncestor is expected to be a range', range);
    }
    // </strict>
    return nodeFindParent(range.commonAncestorContainer);
}

/**
 * Returns true if the supplied range is empty (has a length of 0)
 *
 * @public @static
 * @param {RangyRange} range The range to check if it is empty
 */
function rangeIsEmpty(range) {
    // <strict>
    if (!typeIsRange(range)) {
        handleInvalidArgumentError('Parameter 1 to rangeGetCommonAncestor is expected to be a range', range);
    }
    // </strict>
    return range.startOffset === range.endOffset &&
           range.startContainer === range.endContainer;
}

/**
 * @param  {RangyRange} range
 * @param  {Node} node
 * @return {boolean} True if the range is entirely contained by the given node.
 */
function rangeIsContainedBy(range, node) {
    // <strict>
    if (!typeIsRange(range)) {
        handleInvalidArgumentError('Parameter 1 to rangeIsContainedBy is expected to be a range', range);
    }
    if (!typeIsNode(node)) {
        handleInvalidArgumentError('Parameter 1 to rangeIsContainedBy is expected to be a node', node);
    }
    // </strict>
    var nodeRange = range.cloneRange();
    nodeRange.selectNodeContents(node);
    return nodeRange.containsRange(range);
}

/**
 * @param  {RangyRange} range
 * @param  {Node} node
 * @return {Boolean} True if node is contained within the range, false otherwise.
 */
function rangeContainsNode(range, node) {
    // <strict>
    if (!typeIsRange(range)) {
        handleInvalidArgumentError('Parameter 1 to rangeContainsNode is expected to be a range', range);
    }
    if (!typeIsNode(node)) {
        handleInvalidArgumentError('Parameter 1 to rangeContainsNode is expected to be a node', node);
    }
    // </strict>
    return range.containsNode(node);
}

/**
 * Tests whether the range contains all of the text (within text nodes) contained
 * within node. This is to provide an intuitive means of checking whether a range
 * "contains" a node if you consider the range as just in terms of the text it
 * contains without having to worry about niggly details about range boundaries.
 *
 * @param  {RangyRange} range
 * @param  {Node} node
 * @return {Boolean}
 */
function rangeContainsNodeText(range, node) {
    // <strict>
    if (!typeIsRange(range)) {
        handleInvalidArgumentError('Parameter 1 to rangeContainsText is expected to be a range', range);
    }
    if (!typeIsNode(node)) {
        handleInvalidArgumentError('Parameter 1 to rangeContainsText is expected to be a node', node);
    }
    // </strict>
    return range.containsNodeText(node);
}

/**
 * Removes the white space at the start and the end of the range.
 *
 * @param {RangyRange} range This is the range of selected text.
 */
function rangeTrim(range) {
    // <strict>
    if (!typeIsRange(range)) {
        handleInvalidArgumentError('Parameter 1 to rangeTrim is expected to be a range', range);
    }
    // </strict>
    var selectedText = range.text();

    // Trim start
    var match = /^\s+/.exec(selectedText);
    if (match) {
        range.moveStart('character', match[0].length);
    }

    // Trim end
    match = /\s+$/.exec(selectedText);
    if (match) {
        range.moveEnd('character', -match[0].length);
    }
}

/**
 * Serializes supplied ranges.
 *
 * @param {RangyRange} ranges This is the set of ranges to be serialized.
 * @param {Node} rootNode
 * @returns {String} A string of the serialized ranges separated by '|'.
 */
function rangeSerialize(ranges, rootNode) {
    // <strict>
    if (!typeIsArray(ranges)) {
        handleInvalidArgumentError('Parameter 1 to rangeSerialize is expected to be an array', ranges);
    }
    if (!typeIsNode(rootNode)) {
        handleInvalidArgumentError('Parameter 1 to rangeSerialize is expected to be a node', rootNode);
    }
    // </strict>
    var serializedRanges = [];
    for (var i = 0, l = ranges.length; i < l; i++) {
        serializedRanges[i] = rangy.serializeRange(ranges[i], true);
    }
    return serializedRanges.join('|');
}

/**
 * Deseralizes supplied ranges.
 *
 * @param {string} serialized This is the already serailized range to be deserialized.
 * @returns {Array} An array of deserialized ranges.
 */
function rangeDeserialize(serialized) {
    // <strict>
    if (!typeIsString(serialized)) {
        handleInvalidArgumentError('Parameter 1 to rangeDeserialize is expected to be a string', serialized);
    }
    // </strict>
    var serializedRanges = serialized.split("|"),
        ranges = [];
    for (var i = 0, l = serializedRanges.length; i < l; i++) {
        ranges[i] = rangy.deserializeRange(serializedRanges[i]);
    }
    return ranges;
}

/**
 * Split the selection container and insert the given html between the two elements created.
 *
 * @param  {RangyRange}
 * @param  {jQuery|Element|string} html The html to replace selection with.
 */
function rangeReplaceSplitInvalidTags(range, html, wrapper, validTagNames) {
    // <strict>
    if (!typeIsRange(range)) {
        handleInvalidArgumentError('Parameter 1 to rangeReplaceSplitInvalidTags is expected to be a range', range);
    }
    // </strict>
    var commonAncestor = rangeGetCommonAncestor(range);

    if (!elementIsValid(commonAncestor, validTagNames)) {
        commonAncestor = elementFirstInvalidElementOfValidParent(commonAncestor, validTagNames, wrapper);
    }

    // Select from start of selected element to start of selection
    var startRange = rangy.createRange();
    startRange.setStartBefore(commonAncestor);
    startRange.setEnd(range.startContainer, range.startOffset);
    var startFragment = startRange.cloneContents();

    // Select from end of selected element to end of selection
    var endRange = rangy.createRange();
    endRange.setStart(range.endContainer, range.endOffset);
    endRange.setEndAfter(commonAncestor);
    var endFragment = endRange.cloneContents();

    // Replace the start element's html with the content that was not selected, append html & end element's html
    var replacement = elementOuterHtml($(fragmentToHtml(startFragment)));
    replacement += elementOuterHtml($(html).attr('data-replacement', true));
    replacement += elementOuterHtml($(fragmentToHtml(endFragment)));

    replacement = $(replacement);

    $(commonAncestor).replaceWith(replacement);
    replacement = replacement.parent().find('[data-replacement]').removeAttr('data-replacement');

    // Remove empty surrounding tags only if they're of the same type as the split element
    if (replacement.prev().is(commonAncestor.tagName.toLowerCase()) &&
        !replacement.prev().html().trim()) {
        replacement.prev().remove();
    }
    if (replacement.next().is(commonAncestor.tagName.toLowerCase()) &&
        !replacement.next().html().trim()) {
        replacement.next().remove();
    }
    return replacement;
}

/**
 * Replace the given range, splitting the parent elements such that the given html
 * is contained only by valid tags.
 *
 * @param  {RangyRange} range
 * @param  {string} html
 * @param  {Element} wrapper
 * @param  {string[]} validTagNames
 * @return {Element}
 */
function rangeReplaceWithinValidTags(range, html, wrapper, validTagNames) {
    var startElement = nodeFindParent(range.startContainer);
    var endElement = nodeFindParent(range.endContainer);
    var selectedElement = rangeGetCommonAncestor(range);

    var selectedElementValid = elementIsValid(selectedElement, validTagNames);
    var startElementValid = elementIsValid(startElement, validTagNames);
    var endElementValid = elementIsValid(endElement, validTagNames);

    // The html may be inserted within the selected element & selection start / end.
    if (selectedElementValid && startElementValid && endElementValid) {
        return rangeReplace(range, html);
    }

    // Context is invalid. Split containing element and insert list in between.
    return rangeReplaceSplitInvalidTags(range, html, wrapper, validTagNames);
}
