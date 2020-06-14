import React from 'react';

export default function reactRecursiveMap(children, fn) {
  function perform(child) {
    if (!React.isValidElement(child)) {
      return child;
    }

    if (child.props.children) {
      child = React.cloneElement(child, {
        children: reactRecursiveMap(child.props.children, fn),
      });
    }

    return fn(child);
  }

  return Array.isArray(children)
    ? React.Children.map(children, child => perform(child))
    : perform(children);
}
