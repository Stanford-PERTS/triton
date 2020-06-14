import React from 'react';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _values from 'lodash/values';

import * as uploadsActions from 'state/uploads/actions';

import Icon from 'components/Icon';
import SceneTitle from 'components/SceneTitle';
import Section from 'components/Section';
import SectionItem from 'components/SectionItem';

import { uploadReport } from 'services/triton/reports';

import getKind from 'utils/getKind';

import './styles.css';

export const REPORT_UPLOADS_INSTRUCTIONS = (
  <div>
    <p>
      Drag and drop report files here, or click this box to select them from
      your computer. All files must be named with the either their Team or
      Classroom ID and date.
    </p>
    <p>For example:</p>
    <ul>
      <li>
        <code>Organization_ag9Z37ql.2017-06-06.html</code> for community-level
        reports.
      </li>
      <li>
        <code>Team_7c28af9c.2017-06-06.html</code> for team-level reports
      </li>
      <li>
        <code>Classroom_C9xfa038.2017-06-06.html</code> for class-level reports.
      </li>
    </ul>
  </div>
);
export const REPORT_UPLOADS_REJECT = (
  <div>
    <p>Uploads must be html or pdf files</p>
  </div>
);

class ReportsUpload extends React.Component {
  onDrop = acceptedFiles => {
    acceptedFiles.forEach(file => this.fileUpload(file));
  };

  fileUpload = file => {
    if (!file) {
      return;
    }

    const [contextId, date, extension] = file.name.split('.');

    const kind = getKind(contextId);
    let contextProperty;
    if (kind === 'Organization') {
      contextProperty = 'organization_id';
    } else if (kind === 'Team') {
      contextProperty = 'team_id';
    } else if (kind === 'Classroom') {
      contextProperty = 'classroom_id';
    } else {
      throw new Error(`Can't upload reports with this kind of ID: ${kind}.`);
    }

    // The File object is read-only, so we need to create a new object with the
    // properties we need in order to make some adjustments.
    const displayFile = {
      date,
      name: `${date}.${extension}`,
      displayName: file.name,
      preview: file.preview,
      size: file.size,
      type: file.type,
      [contextProperty]: contextId,
    };

    this.props.actions.uploadReport(file.preview, displayFile);

    uploadReport(contextProperty, contextId, displayFile.name, file)
      .then(() => {
        this.props.actions.uploadReportSuccess(file.preview);
      })
      .catch(error => {
        this.props.actions.uploadReportFailure(file.preview, error);
      });
  };

  render() {
    const { uploads } = this.props;

    return (
      <div>
        <SceneTitle title="Reports Upload" />

        <Section title="Upload Reports">
          <SectionItem>
            <Dropzone
              className="Dropzone"
              accept="application/pdf,text/html"
              activeClassName="active"
              rejectClassName="rejected"
              onDrop={this.onDrop}
            >
              {({ isDragReject }) =>
                isDragReject
                  ? REPORT_UPLOADS_REJECT
                  : REPORT_UPLOADS_INSTRUCTIONS
              }
            </Dropzone>
          </SectionItem>
          {uploads.map(upload => (
            <SectionItem key={upload.file.preview}>
              <div className="ReportsUploadItem">
                <div className="ReportsUploadItemDescription">
                  {upload.file.date} - {upload.file.displayName} -{' '}
                  {upload.file.size} bytes
                </div>
                <div className="ReportsUploadItemStatus">
                  {upload.loading && <Icon names="hourglass-half" />}
                  {upload.success && <Icon names="check" />}
                  {upload.error && <Icon names="exclamation-triangle" />}
                </div>
              </div>
            </SectionItem>
          ))}
        </Section>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    uploads: _values(state.uploadsData.reports),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(uploadsActions, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReportsUpload);
