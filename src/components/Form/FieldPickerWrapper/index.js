// Wrapper component for Field*Picker components so we can share common styles.
import React from 'react';
import './styles.css';
const FieldPickerWrapper = ({ children }) => (
  <div className="FieldPicker">{children}</div>
);
export default FieldPickerWrapper;
