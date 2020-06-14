import React from 'react';
import Section from 'components/Section';
import SectionItem from 'components/SectionItem';

const ProgramNotFound = ({ label }) => (
  <Section title="Program Not Found">
    {label && (
      <SectionItem>
        <span>Sorry. The {label.toUpperCase()} program was not found.</span>
      </SectionItem>
    )}

    {!label && (
      <SectionItem>
        <span>Sorry. That program was not found.</span>
      </SectionItem>
    )}
  </Section>
);

export default ProgramNotFound;
