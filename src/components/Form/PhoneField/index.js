import React from 'react';

import TextField from 'components/Form/TextField';

// https://github.com/catamphetamine/react-phone-number-input
import Phone from 'react-phone-number-input';
import 'react-phone-number-input/rrui.css';
import 'react-phone-number-input/style.css';

const PhoneField = props => <TextField {...props} component={Phone} />;

export default PhoneField;
