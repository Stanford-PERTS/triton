import React from 'react';
import { mount } from 'enzyme';
import withLoading from './withLoading';

describe('withLoading', () => {
  const WrapperComponent = ({ children }) => (
    <div className="Wrapper">{children}</div>
  );
  const WhenErrorComponent = () => (
    <div className="WhenErrorComponent">There is an error.</div>
  );
  const WhenIdleComponent = () => (
    <div className="WhenIdleComponent">
      This is the initial, pre-loading, state.
    </div>
  );
  const WhenLoadingComponent = () => (
    <div className="WhenLoadingComponent">This is the loading state...</div>
  );
  const WhenUpdatingComponent = () => (
    <div className="WhenUpdatingComponent">This is the updating state...</div>
  );
  const WhenEmptyComponent = () => (
    <div className="WhenEmptyComponent">There is no data, empty.</div>
  );
  const BaseComponent = () => (
    <div className="BaseComponent">
      This is the BaseComponent, which displays the loaded data.
    </div>
  );

  it('should display the idle state', () => {
    const WithLoadingComponent = withLoading({ WhenIdleComponent })(
      BaseComponent,
    );
    const wrap = mount(<WithLoadingComponent />);

    expect(wrap.find(WhenIdleComponent).length).toEqual(1);
  });

  it('should display the loading state', () => {
    const WithLoadingComponent = withLoading({
      WhenIdleComponent,
      WhenLoadingComponent,
    })(BaseComponent);
    const wrap = mount(<WithLoadingComponent />);
    wrap.setProps({ isLoading: true });

    // N.B. In enzyme v3.x, the wrapper is not exactly the same as what React
    // renders. Most enzymes functions (setProps, simulate) automatically
    // update the wrapper for you. But in this case, withLoading has extra
    // lifecycle logic that happens after setProps() which cause the wrapper
    // and React to get out of sync, specifically setIdleFalseWhenActive().
    // The solution is to explicitly update the wrapper here.
    wrap.update();

    expect(wrap.find(WhenLoadingComponent).length).toEqual(1);
  });

  it('should display the updating state', () => {
    const WithLoadingComponent = withLoading({
      WhenIdleComponent,
      WhenLoadingComponent,
      WhenUpdatingComponent,
    })(BaseComponent);
    const wrap = mount(<WithLoadingComponent />);
    wrap.setProps({ isUpdating: true });

    wrap.update();

    expect(wrap.find(WhenUpdatingComponent).length).toEqual(1);
  });

  it('should display the error state', () => {
    const WithLoadingComponent = withLoading({
      WhenIdleComponent,
      WhenLoadingComponent,
      WhenUpdatingComponent,
      WhenErrorComponent,
    })(BaseComponent);
    const wrap = mount(<WithLoadingComponent />);
    wrap.setProps({ isError: true });

    expect(wrap.find(WhenErrorComponent).length).toEqual(1);
  });

  it('should display the empty state', () => {
    const WithLoadingComponent = withLoading({
      WhenIdleComponent,
      WhenLoadingComponent,
      WhenUpdatingComponent,
      WhenEmptyComponent,
    })(BaseComponent);
    const wrap = mount(<WithLoadingComponent />);
    wrap.setProps({ isLoading: true });
    wrap.setProps({ isLoading: false });
    wrap.setProps({ isEmpty: true });

    expect(wrap.find(WhenEmptyComponent).length).toEqual(1);
  });

  it('should display the base component', () => {
    const WithLoadingComponent = withLoading({
      WhenIdleComponent,
      WhenLoadingComponent,
      WhenUpdatingComponent,
      WhenEmptyComponent,
    })(BaseComponent);
    const wrap = mount(<WithLoadingComponent />);
    wrap.setProps({ isLoading: true });
    wrap.setProps({ isLoading: false });
    wrap.setProps({ data: [1, 2, 3] });

    expect(wrap.find(BaseComponent).length).toEqual(1);
  });

  it('should display the wrapper component', () => {
    const WithLoadingComponent = withLoading({
      WrapperComponent,
    })(BaseComponent);
    const wrap = mount(<WithLoadingComponent />);

    expect(wrap.find(WrapperComponent).length).toEqual(1);
  });
});
