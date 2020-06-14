import toParams from './toParams';

describe('toParams', () => {
  it('should convert a uid to shortUid', () => {
    expect(toParams('Team_1a0f71db2372')).toEqual('1a0f71db2372');
    expect(toParams('Classroom_00058a3bc0d8')).toEqual('00058a3bc0d8');
    expect(toParams('User_4d6597a9e5a7')).toEqual('4d6597a9e5a7');
  });

  it('should leave shortUids alone', () => {
    expect(toParams('1a0f71db2372')).toEqual('1a0f71db2372');
    expect(toParams('00058a3bc0d8')).toEqual('00058a3bc0d8');
    expect(toParams('4d6597a9e5a7')).toEqual('4d6597a9e5a7');
  });
});
