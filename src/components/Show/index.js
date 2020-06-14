// Example usage:
//   <Show when={cycle && cycle.ordinal > 1}>
//     <SectionItem>
//       Question to only display only cycles after first cycle.
//     </SectionItem>
//   </Show>
//
// This allows us to eliminate all of the:
//   {cycle &&
//     cycle.ordinal > 1 && (
//       <SectionItem>
//         Question to only display only cycles after first cycle.
//       </SectionItem>
//   )}
//
// Not only is this more React-y, but it helps reduce some of the complexity
// that eslint will warn about.

const Show = ({ children, when }) => (when ? children : null);

export default Show;
