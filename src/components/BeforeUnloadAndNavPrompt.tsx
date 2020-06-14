import React from 'react';
import { Prompt } from 'react-router-dom';

const handleBeforeUnload = event => {
  // Cancel the event as stated by the standard.
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
  event.preventDefault();

  // FYI various browsers ignore the `returnValue` in beforeunload events,
  // displaying instead pre-defined text:
  //
  // * Firefox: "This page is asking you to confirm that you want to leave - data
  //   you have entered may not be saved."
  // * Chrome: "Reload site? Changes you made may not be saved."
  // * Safari: "Are you sure you want to leave this page?"
  //
  // So we don't bother trying to supply a message. Setting an empty string does
  // have the effect of triggering the alert-like popup on unload.
  event.returnValue = '';
};

type Props = {
  when: boolean;
  message?: string;
};

const BeforeUnloadAndNavPrompt: React.FC<Props> = ({ when, message }) => {
  if (when) {
    window.addEventListener('beforeunload', handleBeforeUnload);
  } else {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  }

  // Message should make sense for any of:
  // * in-app navigation
  // * reloading the page
  // * navigating off site
  const defaultMessage =
    'Are you sure you want to leave? Data you have entered may not be saved.';
  return <Prompt when={when} message={message || defaultMessage} />;
};

export default BeforeUnloadAndNavPrompt;
