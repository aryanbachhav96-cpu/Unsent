import React from 'react';

const NON_TEXT_ELEMENTS = new Set([
  'input',
  'option',
  'script',
  'select',
  'style',
  'textarea',
]);

function createLetterReveal(text) {
  const letters = Array.from(text);
  const letterCount = letters.filter((letter) => !/\s/.test(letter)).length;
  const stagger = Math.min(35, 800 / Math.max(letterCount, 1));
  let letterIndex = 0;

  return (
    <span className="inline" role="text" aria-label={text} key={text}>
      <span aria-hidden="true">
        {letters.map((letter, index) => {
          if (/\s/.test(letter)) return letter;
          const delay = letterIndex * stagger;
          letterIndex += 1;

          return (
            <span
              key={`${index}-${letter}`}
              className="blur-reveal-letter inline-block"
              style={{ '--letter-delay': `${delay}ms` }}
            >
              {letter}
            </span>
          );
        })}
      </span>
    </span>
  );
}

function transformNode(node, key) {
  if (typeof node === 'string' || typeof node === 'number') {
    const text = String(node);
    if (!text.trim()) return text;
    return React.cloneElement(createLetterReveal(text), { key });
  }

  if (
    !React.isValidElement(node) ||
    node.props['aria-hidden'] === true ||
    node.props['data-skip-text-reveal']
  ) return node;

  const elementName = typeof node.type === 'string' ? node.type : null;
  if (elementName && NON_TEXT_ELEMENTS.has(elementName)) return node;

  const children = node.props.children;
  if (children === undefined || typeof children === 'function') return node;

  const transformedChildren = React.Children.map(children, transformNode);
  return React.cloneElement(node, undefined, transformedChildren);
}

export default function revealTextTree(node) {
  return transformNode(node);
}
