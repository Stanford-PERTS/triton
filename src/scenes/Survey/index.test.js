import noop from 'lodash/noop';
import React from 'react';
// N.B. Not sure if using configureStore sets up sagas correctly.
import { configureStore } from 'state/store';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import mocks from 'mocks';

import SurveyFormComponent from './SurveyFormComponent';

const metrics = [
  {
    created: '2018-07-12T14:47:53Z',
    description:
      'Students are more motivated to learn when they see how ' +
      'class material relates to their lives outside of school.',
    label: 'meaningful-work',
    links: [
      {
        type: 'reading',
        url: 'https://perts.net/conditions#meaningful-work',
        text: 'Meaningful Work',
      },
    ],
    modified: '2018-07-12T14:47:53Z',
    name: 'Meaningful Work',
    short_uid: '1afa6e70a78c',
    uid: 'Metric_1afa6e70a78c',
  },
  {
    created: '2018-07-12T14:47:53Z',
    description:
      'Students engage more deeply in their work when they feel like their ' +
      'teacher likes them and cares about them.',
    label: 'teacher-caring',
    links: [
      {
        type: 'reading',
        url: 'https://perts.net/conditions#teacher-caring',
        text: 'Teacher Caring',
      },
    ],
    modified: '2018-07-12T14:47:53Z',
    name: 'Teacher Caring',
    short_uid: '7e5dd64bf622',
    uid: 'Metric_7e5dd64bf622',
  },
  {
    created: '2018-07-12T14:47:53Z',
    description:
      'Students learn more effectively when their teachers recognize and ' +
      'encourage progress and offer supportive, respectful critical feedback ' +
      'to help students improve.',
    label: 'feedback-for-growth',
    links: [
      {
        type: 'reading',
        url: 'https://perts.net/conditions#feedback-for-growth',
        text: 'Feedback for Growth',
      },
    ],
    modified: '2018-07-12T14:47:53Z',
    name: 'Feedback for Growth',
    short_uid: 'b980831fc300',
    uid: 'Metric_b980831fc300',
  },
];

describe('SurveyFormComponent', () => {
  it('renders without crashing', () => {
    const survey = mocks.createSurvey({});

    mount(
      <Provider store={configureStore()}>
        <MemoryRouter>
          <SurveyFormComponent
            metrics={metrics}
            survey={survey}
            onSubmit={noop}
            surveyPreviewUrl="https://www.example.com"
            toSurveyInstructions="/fake-survey-instructions"
          />
        </MemoryRouter>
      </Provider>,
    );
  });

  it('displays an error if no metrics are active', () => {
    const survey = mocks.createSurvey({});

    const wrapper = mount(
      <Provider store={configureStore()}>
        <MemoryRouter>
          <SurveyFormComponent
            activeMetrics={[]}
            metrics={metrics}
            survey={survey}
            onSubmit={noop}
            mayEdit={true}
            surveyPreviewUrl="https://www.example.com"
            toSurveyInstructions="/fake-survey-instructions"
          />
        </MemoryRouter>
      </Provider>,
    );

    expect(
      wrapper
        .find('.SubmitButton')
        .hostNodes()
        .prop('disabled'),
    ).toBe(true);
    expect(wrapper.find('.FieldError').length).toEqual(1);
  });

  it('only displays the metrics passed in', () => {
    const programMetrics = metrics.slice(0, 2); // exclude third metric
    const activeIds = programMetrics.map(m => m.uid);

    const survey = mocks.createSurvey({
      metrics: activeIds,
    });

    const wrapper = mount(
      <Provider store={configureStore()}>
        <MemoryRouter>
          <SurveyFormComponent
            activeMetrics={activeIds}
            activeOpenResponses={activeIds}
            metrics={programMetrics}
            survey={survey}
            onSubmit={noop}
            mayEdit={true}
            surveyPreviewUrl="https://www.example.com"
            toSurveyInstructions="/fake-survey-instructions"
          />
        </MemoryRouter>
      </Provider>,
    );

    // excludes third metric
    expect(wrapper.find('.metric').hostNodes().length).toBe(2);
  });

  it('disables open response toggles when metric disabled', () => {
    const activeLabel = 'feedback-for-growth';
    const inactiveLabel = 'meaningful-work';
    const activeIds = [metrics.find(m => m.label === activeLabel).uid];

    const survey = mocks.createSurvey({
      metrics: activeIds,
    });

    const wrapper = mount(
      <Provider store={configureStore()}>
        <MemoryRouter>
          <SurveyFormComponent
            activeMetrics={activeIds}
            activeOpenResponses={activeIds}
            metrics={metrics}
            survey={survey}
            onSubmit={noop}
            mayEdit={true}
            surveyPreviewUrl="https://www.example.com"
            toSurveyInstructions="/fake-survey-instructions"
          />
        </MemoryRouter>
      </Provider>,
    );

    expect(wrapper.find(`.${activeLabel} .metric input`).prop('value')).toBe(
      true,
    );
    expect(
      wrapper.find(`.${activeLabel} .open-responses input`).prop('disabled'),
    ).toBe(false);

    expect(wrapper.find(`.${inactiveLabel} .metric input`).prop('value')).toBe(
      false,
    );
    expect(
      wrapper.find(`.${inactiveLabel} .open-responses input`).prop('disabled'),
    ).toBe(true);
  });
});
