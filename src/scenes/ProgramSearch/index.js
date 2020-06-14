import React from 'react';
import isEmpty from 'lodash/isEmpty';
import { bindActionCreators } from 'redux';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import fromParams from 'utils/fromParams';
import fromSearch from 'utils/fromSearch';
import sel from 'state/selectors';
import { search as searchCreator } from 'state/programs/actions';

import { withTermsContext } from 'components/TermsContext';
import Button from 'components/Button';
import ButtonContainer from 'components/Button/ButtonContainer';
import Card from 'components/Card';
import EmailSelectedForm from './EmailSelectedForm';
import Icon from 'components/Icon';
import InfoBox from 'components/InfoBox';
import Multicolumn from 'components/Multicolumn';
import SearchRowClassroom from './SearchRowClassroom';
import SearchRowOrganization from './SearchRowOrganization';
import SearchRowTeam from './SearchRowTeam';
import SearchRowUser from './SearchRowUser';
import Show from 'components/Show';
import SimpleList from 'components/SimpleList';

export const searchForm = 'programSearch';

class ProgramSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showModal: false };
  }

  componentDidMount() {
    const { isLoadingSearch } = this.props;
    if (!isLoadingSearch) {
      this.fetch();
    }
  }

  fetch() {
    const { search } = this.props.actions;
    const { programLabel } = fromParams(this.props);
    const { q } = fromSearch(this.props);

    if (q) {
      search(q, programLabel);
    }
  }

  componentDidUpdate(prevProps) {
    const { q: prevQ } = fromSearch(prevProps);
    const { q } = fromSearch(this.props);
    if (prevQ !== q) {
      this.fetch();
    }
  }

  openModal = () => this.setState({ showModal: true });

  closeModal = () => this.setState({ showModal: false });

  numSelected = () => Object.values(this.props.selected).filter(Boolean).length;

  setVisible = value => {
    const { change, visibleFields } = this.props;
    const fields = visibleFields ? Object.keys(visibleFields) : [];
    for (const field of fields) {
      change(field, value);
    }
  };

  render() {
    const {
      classrooms,
      isLoadingSearch,
      organizations,
      program = { label: undefined },
      teams,
      terms,
      users,
      visibleFields,
    } = this.props;
    const { showModal } = this.state;
    const { q } = fromSearch(this.props);
    const numSelected = this.numSelected();

    return (
      <>
        <Card>
          <Card.Content>
            <Multicolumn justifyContent="center">
              <div>Matches: {Object.keys(visibleFields || {}).length}</div>
              <div>Selected: {numSelected}</div>
            </Multicolumn>
            <ButtonContainer horizontal>
              <Button onClick={() => this.setVisible(true)}>
                Select Visible <Icon names="check-square-o" />
              </Button>
              <Button onClick={() => this.setVisible(false)}>
                Deselect Visible <Icon names="square-o" />
              </Button>
              <Button onClick={this.openModal} disabled={numSelected === 0}>
                Email Selected
              </Button>
            </ButtonContainer>
          </Card.Content>
        </Card>
        {q ? (
          <form onSubmit={event => event.preventDefault()}>
            <SimpleList
              data={teams}
              isEmpty={isEmpty(teams)}
              isLoading={isLoadingSearch}
              RowComponent={SearchRowTeam}
              title={`Matching ${terms.teams}`}
            />
            <SimpleList
              data={classrooms}
              isEmpty={isEmpty(classrooms)}
              isLoading={isLoadingSearch}
              RowComponent={SearchRowClassroom}
              title={`Matching ${terms.classrooms}`}
            />
            <SimpleList
              data={organizations}
              isEmpty={isEmpty(organizations)}
              isLoading={isLoadingSearch}
              RowComponent={SearchRowOrganization}
              title={`Matching ${terms.organizations}`}
            />
            <SimpleList
              data={users}
              isEmpty={isEmpty(users)}
              isLoading={isLoadingSearch}
              RowComponent={SearchRowUser}
              title="Matching Users"
            />
          </form>
        ) : (
          <InfoBox>Please specify a search.</InfoBox>
        )}
        <Show when={showModal}>
          <EmailSelectedForm
            closeModal={this.closeModal}
            program={program}
            searchForm={searchForm}
          />
        </Show>
      </>
    );
  }
}

ProgramSearch.defaultProps = {
  isLoadingSearch: false,
};

function mapStateToProps(state, props) {
  return {
    classrooms: sel.classrooms.queryResults.programSearch.list(state, props),
    isLoadingSearch: sel.loading.hoa(searchCreator())(state, props),
    organizations: sel.organizations.queryResults.programSearch.list(
      state,
      props,
    ),
    program: sel.program(state, props),
    visibleFields: sel.form.registeredFields(state, { form: searchForm }),
    selected: sel.form.values(state, { form: searchForm }),
    teams: sel.teams.queryResults.programSearch.list(state, props),
    users: sel.users.queryResults.programSearch.list(state, props),
  };
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ search: searchCreator }, dispatch),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withTermsContext,
  reduxForm({ form: searchForm }),
)(ProgramSearch);
