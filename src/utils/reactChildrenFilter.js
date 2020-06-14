import React from 'react';

const reactChildrenFilter = (children, fn) => {
  let childrenToReturn = [];

  React.Children.forEach(children, child => {
    if (fn(child)) {
      childrenToReturn.push(child);
    } else if (child.props && child.props.children) {
      childrenToReturn = childrenToReturn.concat(
        reactChildrenFilter(child.props.children, fn),
      );
    }
  });

  return childrenToReturn;
};

export default reactChildrenFilter;
