import React from 'react';

import withReduxFormForResponses from 'utils/withReduxFormForResponses';

import BackButton from 'components/BackButton';
import Card from 'components/Card';
import Figure from 'components/Figure';
import Form from 'components/Form';
import Icon from 'components/Icon';
import IconButton from 'components/IconButton';
import Page from 'programs/Page';
import Pages from 'programs/Pages';

import collectionsAssociate from 'assets/programs/mset/collections_associate.png';
import collectionsCode from 'assets/programs/mset/collections_code.png';
import collectionsNew from 'assets/programs/mset/collections_new.png';
import collectionsReportSrc from 'assets/programs/mset/collections_report.jpg';

const MSETCompareArtifacts = props => {
  const {
    // response,
    toBack,
    // redux-form
    form,
    handleSubmit,
    onSubmit,
  } = props;

  return (
    <Form>
      <Card>
        <Card.Header dark left={<BackButton to={toBack} />}>
          Compare Artifacts
        </Card.Header>
        {/*
          The redux-form form name and handleSubmit must be passed down to the
          Pages component so it has access.
        */}
        <Pages
          showProgress
          form={form}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
        >
          <Page>
            <Card.Content>
              <div>
                <h2>Why Create a Collection?</h2>
                <p>
                  A &ldquo;collection&rdquo; is a group of
                  &ldquo;artifacts&rdquo; that can be associated and analyzed
                  together in a report to understand how they compare side by
                  side and over time.
                </p>
                <p>
                  For example, an educator may want to collect student feedback
                  on three versions of a syllabus to understand which version
                  best encourages and motivates students. Or, an educator may
                  decide to iterate on a syllabus and collect feedback after
                  each revision, leveraging &ldquo;collections&rdquo; to
                  understand how students&rsquo; interpretations changed (or
                  didn&rsquo;t) from one version to the next.
                </p>
              </div>
              <Figure horizontal>
                <img
                  src={collectionsReportSrc}
                  alt="Example collections report"
                />
                <figcaption>
                  Report excerpt demonstrates a comparison of various artifacts
                  along the Social Belonging construct.
                </figcaption>
              </Figure>
            </Card.Content>
          </Page>

          <Page>
            <Card.Content>
              <div>
                <h2>How to Set Up a Collection</h2>

                <p>To add artifacts to a collection, follow these steps:</p>

                <h3>
                  Create a &ldquo;collection&rdquo; from the Message IT
                  homepage, and retrieve its unique &ldquo;collection
                  code.&rdquo;
                </h3>
                <ol>
                  <li>Sign into Message IT</li>
                  <li>
                    Click the home icon:{' '}
                    <IconButton
                      onClick={e => e.preventDefault()}
                      pointer={false}
                    >
                      <Icon names="home" />
                    </IconButton>
                  </li>
                  <li>
                    Under <em>Your Collections</em>, click <em>Add</em>
                  </li>
                  <li>
                    Name the &ldquo;collection,&rdquo; click{' '}
                    <em>Save New Collection</em>
                  </li>
                  <li>Save or write down the &ldquo;collection code&rdquo;</li>
                </ol>

                <Figure horizontal>
                  <img
                    src={collectionsNew}
                    alt="Screenshot of Collections interface, highlighting how
                      to create a new collection."
                  />
                  <figcaption>Create new collection.</figcaption>
                </Figure>

                <Figure horizontal>
                  <img
                    src={collectionsCode}
                    alt="Screenshot of Collections interface, highlighting the
                      collection code."
                  />
                  <figcaption>Collection code.</figcaption>
                </Figure>

                <h3>
                  Associate relevant &ldquo;artifacts&rdquo; to a
                  &ldquo;collection&rdquo; by entering the unique
                  &ldquo;collection code&rdquo; in the settings page of each
                  &ldquo;artifact.&rdquo;
                </h3>
                <ol>
                  <li>Sign into Message IT</li>
                  <li>
                    Click the home icon{' '}
                    <IconButton
                      onClick={e => e.preventDefault()}
                      pointer={false}
                    >
                      <Icon names="home" />
                    </IconButton>
                  </li>
                  <li>
                    Click into the relevant &ldquo;artifact&rdquo; from the list
                    of <em>Your Artifacts</em>
                  </li>
                  <li>
                    Click <em>Settings</em>, then{' '}
                    <em>Associated Collections</em>, then <em>Add</em>
                  </li>
                  <li>
                    Enter the appropriate &ldquo;collection code,&rdquo; click{' '}
                    <em>Save Changes</em>
                  </li>
                </ol>

                <Figure horizontal>
                  <img
                    src={collectionsAssociate}
                    alt="Screenshot of Collections interface, highlighting how
                      associate an artifact."
                  />
                  <figcaption>Associate an artifact.</figcaption>
                </Figure>
              </div>
            </Card.Content>
          </Page>

          <Page>
            <Card.Content>
              <h2>Tips for Using Collections</h2>

              <ul>
                <li>
                  Collection reports are generated every Monday after students
                  complete a survey. They can be accessed from the sidebar on
                  the left when viewing a &ldquo;collection.&rdquo;
                </li>
                <li>
                  Administrator(s) of a &ldquo;collection&rdquo; have
                  permissions to access the reports and change the settings of
                  any &ldquo;artifacts&rdquo; associated with the
                  &ldquo;collection.&rdquo;
                </li>
                <li>
                  An &ldquo;artifact&rdquo; can be associated with up to 5
                  &ldquo;collections.&rdquo; This allows for data to be viewed
                  in many different ways.
                </li>
                <li>
                  Contact{' '}
                  <a href="mailto:copilot@perts.net">copilot@perts.net</a> for
                  support using this feature.
                </li>
              </ul>
            </Card.Content>
          </Page>
        </Pages>
      </Card>
    </Form>
  );
};

export default withReduxFormForResponses({
  form: 'MSETCompareArtifacts',
})(MSETCompareArtifacts);
